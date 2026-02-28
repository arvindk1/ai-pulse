import { fetchGithubTrending } from "@/lib/scrapers/github";
import { fetchHuggingFaceTrending } from "@/lib/scrapers/huggingface";
import { fetchTwitterPulse } from "@/lib/scrapers/twitter";
import { fetchNewsFeeds } from "@/lib/scrapers/news";
import { filterNoise } from "@/lib/scrapers/noise-filter";
import { redis, getVelocity, snapshotMetrics } from "@/lib/redis";
import { ProcessedSignal } from "@/lib/types";

const CACHE_KEY = "ai-pulse-data-v3";
const CACHE_TTL = 1800;           // 30 min hard TTL
const STALE_TTL_KEY = "ai-pulse-ts-v3";
const STALE_AFTER_MS = 15 * 60 * 1000; // 15 min — trigger background refresh

let isRefreshing = false;

// In-process memory cache — works even without Redis configured
let memCache: { data: ProcessedSignal[]; fetchedAt: number } | null = null;


async function buildFreshData(): Promise<ProcessedSignal[]> {
    const t1 = Date.now();
    const [github, hf, twitter, news] = await Promise.all([
        fetchGithubTrending().then(r => { console.log(`[PERF] GitHub: ${Date.now() - t1}ms (${r.length})`); return r; }),
        fetchHuggingFaceTrending().then(r => { console.log(`[PERF] HuggingFace: ${Date.now() - t1}ms (${r.length})`); return r; }),
        fetchTwitterPulse().then(r => { console.log(`[PERF] Twitter: ${Date.now() - t1}ms (${r.length})`); return r; }),
        fetchNewsFeeds().then(r => { console.log(`[PERF] News RSS: ${Date.now() - t1}ms (${r.length})`); return r; }),
    ]);
    console.log(`[PERF] All scrapers: ${Date.now() - t1}ms`);

    const rawSignals = [...twitter, ...news, ...hf, ...github];

    if (redis) {
        const tv = Date.now();
        await Promise.all(rawSignals.map(async (signal) => {
            if (signal.metrics && Object.keys(signal.metrics).length > 0) {
                snapshotMetrics(signal.id, signal.metrics).catch(() => { });
                const velocity = await getVelocity(signal.id);
                if (Object.keys(velocity).length > 0) signal.velocity = velocity;
            }
        }));
        console.log(`[PERF] Velocity lookups: ${Date.now() - tv}ms`);
    }

    const tg = Date.now();
    const processedSignals = await filterNoise(rawSignals);
    console.log(`[PERF] Gemini synthesis: ${Date.now() - tg}ms (${rawSignals.length} → ${processedSignals.length})`);

    return processedSignals;
}

export async function getPulseData(): Promise<ProcessedSignal[]> {
    const t0 = Date.now();
    try {
        // Layer 1: in-process memory cache (fastest — zero network, always available)
        if (memCache) {
            const ageMs = Date.now() - memCache.fetchedAt;
            console.log(`[PERF] memCache hit in ${Date.now() - t0}ms (age: ${Math.round(ageMs / 1000)}s)`);
            if (ageMs < STALE_AFTER_MS) {
                return memCache.data; // fresh — return instantly
            }
            // Stale — kick off background refresh and return stale data now
            if (!isRefreshing) {
                isRefreshing = true;
                console.log(`[PERF] memCache stale — serving stale data, refreshing in background`);
                buildFreshData()
                    .then(async (fresh) => {
                        memCache = { data: fresh, fetchedAt: Date.now() };
                        if (redis && fresh.length > 0) {
                            await Promise.all([
                                redis.set(CACHE_KEY, fresh, { ex: CACHE_TTL }),
                                redis.set(STALE_TTL_KEY, Date.now().toString(), { ex: CACHE_TTL }),
                            ]);
                        }
                        console.log(`[PERF] Background refresh complete`);
                    })
                    .catch(err => console.error("Background refresh failed:", err))
                    .finally(() => { isRefreshing = false; });
            }
            return memCache.data;
        }

        // Layer 2: Redis cache (survives server restarts when Redis is configured)
        if (redis) {
            const [cached, lastFetchedStr] = await Promise.all([
                redis.get<ProcessedSignal[]>(CACHE_KEY),
                redis.get<string>(STALE_TTL_KEY),
            ]);
            console.log(`[PERF] Redis check: ${Date.now() - t0}ms (hit: ${!!cached})`);
            if (cached) {
                const fetchedAt = lastFetchedStr ? parseInt(lastFetchedStr) : Date.now();
                memCache = { data: cached, fetchedAt }; // warm memory cache from Redis
                return cached;
            }
        }

        // Layer 3: Cold start — run the full pipeline
        console.log(`[PERF] Cold start — building fresh data`);
        const processedSignals = await buildFreshData();

        // Populate both caches
        memCache = { data: processedSignals, fetchedAt: Date.now() };
        if (redis && processedSignals.length > 0) {
            await Promise.all([
                redis.set(CACHE_KEY, processedSignals, { ex: CACHE_TTL }),
                redis.set(STALE_TTL_KEY, Date.now().toString(), { ex: CACHE_TTL }),
            ]);
        }

        console.log(`[PERF] ═══ Total cold pipeline: ${Date.now() - t0}ms ═══`);
        return processedSignals;
    } catch (error) {
        console.error("Pulse Service Error:", error);
        return [];
    }
}

