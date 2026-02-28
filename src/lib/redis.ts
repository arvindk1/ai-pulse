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

// ─── Time-Series Velocity Tracking ──────────────────────────────────────────

const METRICS_PREFIX = 'pulse:metrics:';
const VELOCITY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function snapshotMetrics(id: string, metrics: { stars?: number, downloads?: number, likes?: number }) {
    if (!redis) return;
    const now = Date.now();
    const key = `${METRICS_PREFIX}${id}`;

    // Store simple serialized JSON string with timestamp score in a sorted set
    const data = JSON.stringify({ t: now, ...metrics });

    const pipeline = redis.pipeline();
    // Add current snapshot
    pipeline.zadd(key, { score: now, member: data });
    // Keep only the last 3 days of snapshots to prevent infinite growth
    const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
    pipeline.zremrangebyscore(key, 0, threeDaysAgo);
    await pipeline.exec();
}

export async function getVelocity(id: string): Promise<{ stars?: number, downloads?: number, likes?: number }> {
    if (!redis) return {};
    const key = `${METRICS_PREFIX}${id}`;
    const now = Date.now();
    const windowStart = now - VELOCITY_WINDOW_MS;

    // Get all snapshots in the last 24h
    const snapshots = await redis.zrange(key, windowStart, now, { byScore: true });

    if (!snapshots || snapshots.length < 2) {
        return {}; // Need at least 2 points to calculate velocity
    }

    try {
        // Zrange returns strings from Upstash
        const oldest = typeof snapshots[0] === 'string' ? JSON.parse(snapshots[0]) : snapshots[0] as any;
        const newest = typeof snapshots[snapshots.length - 1] === 'string' ? JSON.parse(snapshots[snapshots.length - 1]) : snapshots[snapshots.length - 1] as any;

        const velocity: any = {};
        if (typeof newest.stars === 'number' && typeof oldest.stars === 'number') {
            velocity.stars = newest.stars - oldest.stars;
        }
        if (typeof newest.downloads === 'number' && typeof oldest.downloads === 'number') {
            velocity.downloads = newest.downloads - oldest.downloads;
        }
        if (typeof newest.likes === 'number' && typeof oldest.likes === 'number') {
            velocity.likes = newest.likes - oldest.likes;
        }

        return velocity;
    } catch (e) {
        console.error(`Failed to parse velocity for ${id}`, e);
        return {};
    }
}
