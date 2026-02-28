import { fetchGithubTrending } from "@/lib/scrapers/github";
import { fetchHuggingFaceTrending } from "@/lib/scrapers/huggingface";
import { fetchTwitterPulse } from "@/lib/scrapers/twitter";
import { fetchNewsFeeds } from "@/lib/scrapers/news";
import { filterNoise } from "@/lib/scrapers/noise-filter";
import { redis, getVelocity, snapshotMetrics } from "@/lib/redis";
import { ProcessedSignal } from "@/lib/types";

const CACHE_KEY = "ai-pulse-data-v3"; // bumped for velocity fields
const CACHE_TTL = 1800; // 30 min — news moves fast

export async function getPulseData(): Promise<ProcessedSignal[]> {
    try {
        if (redis) {
            const cached = await redis.get<ProcessedSignal[]>(CACHE_KEY);
            if (cached) return cached;
        }

        // All 4 sources run concurrently
        const [github, hf, twitter, news] = await Promise.all([
            fetchGithubTrending(),
            fetchHuggingFaceTrending(),
            fetchTwitterPulse(),
            fetchNewsFeeds(),
        ]);

        // Combine: Twitter + News → News Pulse | HF → Model Forge | GitHub → Tool Lab
        const rawSignals = [...twitter, ...news, ...hf, ...github];

        // Attach time-series velocity and snapshot current metrics
        if (redis) {
            await Promise.all(rawSignals.map(async (signal) => {
                if (signal.metrics && Object.keys(signal.metrics).length > 0) {
                    // Fire-and-forget snapshotting so the cache is fresh
                    snapshotMetrics(signal.id, signal.metrics).catch(() => { });

                    // Retrieve 24h delta
                    const velocity = await getVelocity(signal.id);
                    if (Object.keys(velocity).length > 0) {
                        signal.velocity = velocity;
                    }
                }
            }));
        }

        const processedSignals = await filterNoise(rawSignals);

        if (redis && processedSignals.length > 0) {
            await redis.set(CACHE_KEY, processedSignals, { ex: CACHE_TTL });
        }

        return processedSignals;
    } catch (error) {
        console.error("Pulse Service Error:", error);
        return [];
    }
}
