/* eslint-disable @typescript-eslint/no-explicit-any */
import { RawSignal } from "../types";

// ─── Whitelist of "God-tier" AI researchers & insiders ────────────────────────
const WHITELIST_ACCOUNTS = [
    // Frontier lab founders / executives
    "sama",           // Sam Altman — OpenAI CEO
    "gdb",            // Greg Brockman — OpenAI President
    "karensimonyan",  // Karen Simonyan — Google DeepMind
    "demishassabis",  // Demis Hassabis — Google DeepMind CEO
    "ylecun",         // Yann LeCun — Meta Chief AI Scientist
    "ilyasut",        // Ilya Sutskever — SSI
    // Core researchers
    "karpathy",       // Andrej Karpathy — former OpenAI/Tesla
    "fchollet",       // François Chollet — ARC-AGI, Keras creator
    "goodfellow_ian", // Ian Goodfellow — GANs
    "hardmaru",       // David Ha — Google DeepMind Research Director
    "AndrewYNg",      // Andrew Ng — AI educator & investor
    "GaryMarcus",     // Gary Marcus — AI critic / policy voice
    // Policy, safety & governance
    "ai_regulation",  // AI regulatory coverage
    "leopoldasch",    // Leopold Aschenbrenner — AI safety
    "mmitchell_ai",   // Dr. Margaret Mitchell — AI ethics
    // Enterprise / business signal
    "benedictevans",  // Benedict Evans — tech analyst
    "EMostaque",      // Emad Mostaque — Stability AI founder
    // Model releases & benchmarks
    "ClementDelangue",// Hugging Face CEO
    "reach_vb",       // Swyx — AI engineer / Latent Space
    "timnitGebru",    // Timnit Gebru — AI ethics & bias
];


async function fetchFromWhitelist(token: string): Promise<RawSignal[]> {
    // Twitter v2 URL length limit: batch accounts into groups of 5 to stay safe
    const BATCH_SIZE = 5;
    const batches: string[][] = [];
    for (let i = 0; i < WHITELIST_ACCOUNTS.length; i += BATCH_SIZE) {
        batches.push(WHITELIST_ACCOUNTS.slice(i, i + BATCH_SIZE));
    }

    const batchResults = await Promise.all(batches.map(async (batch) => {
        const fromQuery = batch.map(u => `from:${u}`).join(" OR ");
        const query = encodeURIComponent(`(${fromQuery}) -is:retweet lang:en`);
        const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=10&tweet.fields=author_id,created_at,public_metrics,text&expansions=author_id&user.fields=username,name`;

        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
                next: { revalidate: 1800 },
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.warn(`Twitter batch failed (${res.status}):`, JSON.stringify(err).slice(0, 200));
                return [];
            }
            const data = await res.json();
            return mapTweetsToSignals(data);
        } catch (err) {
            console.error("Twitter batch error:", err);
            return [];
        }
    }));

    return batchResults.flat();
}

// ─── Map Twitter API response to RawSignal format ─────────────────────────────
function mapTweetsToSignals(data: any): RawSignal[] {
    if (!data.data?.length) return [];

    const userMap: Record<string, { username: string; name: string }> = {};
    for (const user of data.includes?.users || []) {
        userMap[user.id] = { username: user.username, name: user.name };
    }

    return data.data.map((tweet: any) => {
        const user = userMap[tweet.author_id] || { username: "unknown", name: "Unknown" };
        return {
            id: `tw-${tweet.id}`,
            type: "twitter" as const,
            title: user.name,
            author: user.username,
            url: `https://x.com/${user.username}/status/${tweet.id}`,
            content: tweet.text,
            metrics: {
                likes: tweet.public_metrics?.like_count || 0,
                retweets: tweet.public_metrics?.retweet_count || 0,
            },
            createdAt: tweet.created_at || new Date().toISOString(),
        };
    });
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function fetchTwitterPulse(): Promise<RawSignal[]> {
    const token = process.env.TWITTER_BEARER_TOKEN;

    if (!token) {
        console.warn("No TWITTER_BEARER_TOKEN — using mock tweet data.");
        return getMockTweets();
    }

    try {
        // NOTE: Complex boolean keyword queries (funding, agents, policy) require
        // Twitter API Pro tier ($5k/month). Basic bearer token supports from: queries only.
        // The expanded 20-account whitelist covers the key voices for those themes.
        const results = await fetchFromWhitelist(token);
        if (results.length === 0) {
            console.warn("Twitter whitelist returned 0 results — API may be rate-limited. Using mocks.");
            return getMockTweets();
        }
        return results;
    } catch (err) {
        console.error("Twitter API error:", err);
        return getMockTweets();
    }
}

// ─── Mock fallback (no API key configured) ────────────────────────────────────
function getMockTweets(): RawSignal[] {
    return [
        {
            id: "tw-mock-openai-raise",
            type: "twitter",
            title: "Sam Altman",
            author: "sama",
            url: "https://x.com/sama",
            content: "Excited to announce OpenAI has closed a new funding round led by Amazon, Nvidia, and SoftBank, valuing the company at over $800B. We're just getting started.",
            metrics: { likes: 120000, retweets: 22000 },
            createdAt: new Date().toISOString(),
        },
        {
            id: "tw-mock-agents",
            type: "twitter",
            title: "Andrej Karpathy",
            author: "karpathy",
            url: "https://x.com/karpathy",
            content: "The agentic AI era is here. Not chatbots. Actual autonomous agents that plan, use tools, execute multi-step workflows with minimal oversight.",
            metrics: { likes: 55000, retweets: 9800 },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
            id: "tw-mock-policy",
            type: "twitter",
            title: "Gary Marcus",
            author: "GaryMarcus",
            url: "https://x.com/GaryMarcus",
            content: "The Pentagon dropping Anthropic is a canary in the coal mine. When governments start treating AI companies as supply-chain risks, the entire enterprise stack needs to rethink its AI vendor strategy.",
            metrics: { likes: 18000, retweets: 4200 },
            createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
    ];
}
