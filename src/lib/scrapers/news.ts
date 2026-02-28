import { RawSignal } from "../types";

// ─── AI News RSS feeds (free, no API key needed) ──────────────────────────────
// These capture product announcements, funding news, and policy stories
// that GitHub/HuggingFace/Twitter won't surface.
const NEWS_FEEDS = [
    {
        url: "https://techcrunch.com/category/artificial-intelligence/feed/",
        source: "TechCrunch AI",
    },
    {
        url: "https://the-decoder.com/feed/",
        source: "The Decoder",
    },
    {
        url: "https://venturebeat.com/category/ai/feed/",
        source: "VentureBeat AI",
    },
    {
        url: "https://www.axios.com/feeds/feed.rss",
        source: "Axios",
    },
    {
        url: "https://bensbites.beehiiv.com/feed",
        source: "Ben's Bites",   // daily AI newsletter — investment, tools, research
    },
];

interface RssItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    creator?: string;
}

async function fetchRssFeed(feedUrl: string, sourceName: string): Promise<RawSignal[]> {
    try {
        const res = await fetch(feedUrl, { next: { revalidate: 1800 } }); // 30 min cache
        if (!res.ok) return [];

        const xml = await res.text();
        const items = parseRss(xml);

        return items.slice(0, 8).map((item, i) => ({
            id: `news-${sourceName.replace(/\s/g, "-").toLowerCase()}-${i}-${Date.now()}`,
            type: "twitter" as const, // Displayed in News Pulse column
            title: item.title,
            author: sourceName,
            url: item.link,
            content: stripHtml(item.description).slice(0, 300),
            metrics: {},
            createdAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        }));
    } catch (err) {
        console.error(`RSS fetch error [${sourceName}]:`, err);
        return [];
    }
}

function parseRss(xml: string): RssItem[] {
    const items: RssItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
        const block = match[1];
        items.push({
            title: extractTag(block, "title"),
            link: extractTag(block, "link"),
            description: extractTag(block, "description"),
            pubDate: extractTag(block, "pubDate"),
            creator: extractTag(block, "dc:creator"),
        });
    }
    return items;
}

function extractTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i");
    return xml.match(regex)?.[1]?.trim() || "";
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function fetchNewsFeeds(): Promise<RawSignal[]> {
    const results = await Promise.allSettled(
        NEWS_FEEDS.map(({ url, source }) => fetchRssFeed(url, source))
    );

    const all: RawSignal[] = [];
    for (const result of results) {
        if (result.status === "fulfilled") all.push(...result.value);
    }

    // Sort by newest first
    return all.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}
