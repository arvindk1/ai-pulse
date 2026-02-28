import { NextResponse } from "next/server";
import { fetchGithubTrending } from "@/lib/scrapers/github";
import { fetchHuggingFaceTrending } from "@/lib/scrapers/huggingface";
import { snapshotMetrics } from "@/lib/redis";

// Vercel CRON Edge Function
export const runtime = "edge";

export async function GET(req: Request) {
    // Optional: Protect cron route 
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        console.log("[CRON] Starting metrics snapshot...");

        // Fetch raw data to snapshot current metrics
        const [github, hf] = await Promise.all([
            fetchGithubTrending(),
            fetchHuggingFaceTrending(),
        ]);

        const allSignals = [...github, ...hf];
        let snapshotCount = 0;

        // Take snapshot of any signal that has metrics
        await Promise.allSettled(allSignals.map(async (signal) => {
            if (signal.metrics && Object.keys(signal.metrics).length > 0) {
                await snapshotMetrics(signal.id, signal.metrics);
                snapshotCount++;
            }
        }));

        console.log(`[CRON] Snapshot complete. Saved ${snapshotCount} metrics.`);
        return NextResponse.json({ success: true, snapshots: snapshotCount });
    } catch (error: any) {
        console.error("[CRON] Error during snapshot:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
