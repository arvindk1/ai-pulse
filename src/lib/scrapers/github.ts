/* eslint-disable @typescript-eslint/no-explicit-any */
import { RawSignal } from "../types";

// ─── Topic-based search queries (recently active high-star repos) ──────────────
const TOPIC_QUERIES = [
    { q: `topic:llm pushed:>3days stars:>50`, n: 5 },
    { q: `topic:ai-agent pushed:>3days stars:>30`, n: 5 },
    { q: `topic:machine-learning pushed:>3days stars:>100`, n: 5 },
];

// ─── Curated always-check repos (specific high-signal frameworks) ──────────────
// These don't always show in topic searches but are always relevant to track.
const CURATED_REPOS = [
    // Multi-agent & orchestration
    "microsoft/autogen",
    "crewAIInc/crewAI",
    "run-llama/llama_index",
    "microsoft/semantic-kernel",
    "griptape-ai/griptape",
    // Developer productivity & coding AI
    "continuedev/continue",           // AI coding assistant (open source Cursor alt)
    "all-hands-ai/OpenHands",         // AI software engineer
    "paul-gauthier/aider",            // AI pair programming in terminal
    // Inference & local model tooling
    "ggerganov/llama.cpp",
    "vllm-project/vllm",
    "lm-sys/FastChat",
    // Multimodal & vision
    "THUDM/CogVideoX",
    "Lightricks/LTX-Video",           // LTX-2 mentioned by user
];

async function fetchTopicRepos(token?: string): Promise<RawSignal[]> {
    const allItems: RawSignal[] = [];
    const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    for (const { q, n } of TOPIC_QUERIES) {
        try {
            const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=${n}`;
            const res = await fetch(url, { next: { revalidate: 3600 }, headers });
            if (!res.ok) continue;
            const data = await res.json();
            allItems.push(...mapRepos(data.items || []));
        } catch (err) {
            console.error("GitHub topic query error:", err);
        }
    }
    return allItems;
}

async function fetchCuratedRepos(token?: string): Promise<RawSignal[]> {
    const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    const results = await Promise.allSettled(
        CURATED_REPOS.map(async (repoPath) => {
            try {
                const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
                    next: { revalidate: 3600 },
                    headers,
                });
                if (!res.ok) return null;
                const repo = await res.json();
                return mapRepo(repo);
            } catch {
                return null;
            }
        })
    );

    return results
        .filter(r => r.status === "fulfilled" && r.value !== null)
        .map(r => (r as PromiseFulfilledResult<RawSignal>).value);
}

function mapRepo(repo: any): RawSignal {
    return {
        id: `gh-${repo.id}`,
        type: "github" as const,
        title: repo.full_name,
        url: repo.html_url,
        content: repo.description || repo.full_name,
        author: repo.owner?.login,
        metrics: { stars: repo.stargazers_count },
        createdAt: repo.pushed_at || repo.updated_at || repo.created_at,
    };
}

function mapRepos(items: any[]): RawSignal[] {
    return items.map(mapRepo);
}

export async function fetchGithubTrending(): Promise<RawSignal[]> {
    const token = process.env.GITHUB_TOKEN;

    const [topicRepos, curatedRepos] = await Promise.all([
        fetchTopicRepos(token),
        fetchCuratedRepos(token),
    ]);

    const combined = [...topicRepos, ...curatedRepos];

    // Deduplicate by repo ID
    const seen = new Set<string>();
    return combined.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
}
