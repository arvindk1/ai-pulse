import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { RawSignal, ProcessedSignal } from "../types";

const ScoreSchema = z.object({
    impactScore: z.number().min(1).max(10).describe("Industry impact score 1-10. Score 8+ for genuine breakthroughs, model releases, or major research. Score 5-7 for interesting but incremental news. Score below 5 for noise."),
    bottomLine: z.string().describe("One crisp sentence: what it is and why it matters to an AI practitioner."),
});

async function scoreSignal(signal: RawSignal): Promise<ProcessedSignal> {
    try {
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"), // GA stable as of June 2025; replaces deprecated gemini-2.0-flash
            schema: ScoreSchema,
            prompt: `You are an expert AI industry analyst. Evaluate this item for an AI researcher's daily briefing.
Source: ${signal.type} | Author: ${signal.author || "N/A"}
Title/Repo: ${signal.title}
Content: ${signal.content}
Metrics: ${JSON.stringify(signal.metrics || {})}

Score its industry impact 1-10 and write a single bottom-line sentence.`,
        });

        // Threshold: 5+ to widen the net while still filtering noise
        if (object.impactScore >= 5) {
            return { ...signal, impactScore: object.impactScore, bottomLine: object.bottomLine };
        }
        // Below threshold — return with low score so caller can decide
        return { ...signal, impactScore: object.impactScore, bottomLine: object.bottomLine };
    } catch (err) {
        console.error(`Filter error [${signal.id}]:`, err);
        // On error, pass through with fallback score so the card still renders
        return {
            ...signal,
            impactScore: 7,
            bottomLine: signal.content.substring(0, 150) + (signal.content.length > 150 ? "..." : ""),
        };
    }
}

export async function filterNoise(signals: RawSignal[]): Promise<ProcessedSignal[]> {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.warn("No GOOGLE_GENERATIVE_AI_API_KEY — returning signals with mock scores.");
        return signals.map((s, i) => ({
            ...s,
            impactScore: 8 + (i % 3),
            bottomLine: s.content.substring(0, 120) + "...",
        })) as ProcessedSignal[];
    }

    // Score all signals concurrently — no artificial batch cap
    const results = await Promise.allSettled(signals.map(scoreSignal));

    const processed: ProcessedSignal[] = [];
    for (const result of results) {
        if (result.status === "fulfilled") {
            processed.push(result.value);
        }
    }

    return processed.sort((a, b) => b.impactScore - a.impactScore);
}
