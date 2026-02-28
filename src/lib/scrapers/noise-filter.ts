import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { RawSignal, ProcessedSignal } from "../types";

const BATCH_SIZE = 30; // 3 parallel batches of 30 instead of 1 giant batch of 90

// Schema for a single batch — smaller schema = faster Gemini response
const BatchScoreSchema = z.object({
    signals: z.array(z.object({
        id: z.string(),
        impactScore: z.number().min(1).max(10),
        bottomLine: z.string(),
        marketSignal: z.enum(["Bullish", "Neutral", "Risk"]),
        targetAudience: z.array(z.enum(["Infra", "Dev", "Investor"])),
        theme: z.string(),
    })),
});

async function synthesizeBatch(
    batch: { id: string; type: string; title: string; content: string }[],
    batchIndex: number
): Promise<Map<string, any>> {
    const t = Date.now();
    try {
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: BatchScoreSchema,
            prompt: `You are an elite AI industry analyst. Analyze this batch of ${batch.length} AI developments and for each:
1. Impact score 1-10 (8+ for major releases, <5 for noise)
2. One crisp bottom-line sentence
3. Market signal: Bullish/Neutral/Risk
4. Target audience: Infra/Dev/Investor (1-3 tags)
5. Theme: group related items under the same name (e.g. "Agentic Workflows")

Batch JSON:
${JSON.stringify(batch)}`,
            maxOutputTokens: 4000,
            providerOptions: { google: { structuredOutputs: true } },
        });

        console.log(`[PERF] Gemini batch ${batchIndex}: ${Date.now() - t}ms (${batch.length} items)`);
        const typedSignals: any[] = object.signals as any;
        return new Map<string, any>(typedSignals.map((s: any) => [s.id, s]));
    } catch (err) {
        console.error(`Gemini batch ${batchIndex} failed:`, err);
        return new Map();
    }
}

export async function filterNoise(signals: RawSignal[]): Promise<ProcessedSignal[]> {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.warn("No GOOGLE_GENERATIVE_AI_API_KEY — returning mock clustering.");
        return signals.map((s, i) => ({
            ...s,
            impactScore: 8 + (i % 3),
            bottomLine: s.content.substring(0, 120) + "...",
            marketSignal: "Neutral" as const,
            targetAudience: ["Dev"] as ("Dev" | "Infra" | "Investor")[],
            theme: "General AI"
        })) as ProcessedSignal[];
    }

    if (signals.length === 0) return [];

    // Trim content to 300 chars (was 600) — cuts input tokens in half
    const payload = signals.map(s => ({
        id: s.id,
        type: s.type,
        title: s.title,
        content: s.content.substring(0, 300),
    }));

    // Split into parallel batches
    const batches: typeof payload[] = [];
    for (let i = 0; i < payload.length; i += BATCH_SIZE) {
        batches.push(payload.slice(i, i + BATCH_SIZE));
    }

    const tAll = Date.now();
    console.log(`[Batch Synthesis] ${signals.length} signals → ${batches.length} parallel batches of ~${BATCH_SIZE}`);

    // Fire all batches concurrently
    const batchMaps = await Promise.all(batches.map((b, i) => synthesizeBatch(b, i)));

    // Merge all result maps
    const aiMap = new Map<string, any>();
    for (const m of batchMaps) {
        for (const [k, v] of m) aiMap.set(k, v);
    }
    console.log(`[PERF] All Gemini batches done: ${Date.now() - tAll}ms`);

    // Merge AI results back with original signals
    const processed: ProcessedSignal[] = [];
    for (const signal of signals) {
        const aiData = aiMap.get(signal.id);
        if (!aiData || typeof aiData.impactScore !== 'number' || aiData.impactScore < 5) continue;
        processed.push({
            ...signal,
            impactScore: aiData.impactScore,
            bottomLine: aiData.bottomLine,
            marketSignal: aiData.marketSignal,
            targetAudience: aiData.targetAudience,
            theme: aiData.theme,
        });
    }

    console.log(`[Batch Synthesis] Returned ${processed.length} high-signal items.`);
    return processed.sort((a, b) => b.impactScore - a.impactScore);
}
