import { Redis } from '@upstash/redis';

// Export Redis client, or null if credentials are not provided (allows graceful degradation for MVP)
export const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? Redis.fromEnv()
    : null;

export interface SignalItem {
    id: string;
    source: 'x' | 'github' | 'huggingface';
    originalUrl: string;
    author: string;
    title: string;
    content: string;
    bottomLine: string;
    score: number;
    metadata?: Record<string, unknown>;
    timestamp: string;
}

const FEED_KEY = 'pulse:current_feed';

export async function setFeedItems(items: SignalItem[]) {
    if (!redis) return;
    await redis.set(FEED_KEY, JSON.stringify(items));
}

export async function getFeedItems(): Promise<SignalItem[]> {
    if (!redis) return [];
    const data = await redis.get<SignalItem[]>(FEED_KEY);
    return data || [];
}
