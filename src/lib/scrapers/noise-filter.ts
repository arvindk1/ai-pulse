import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { RawSignal, ProcessedSignal } from "../types";

// Schema for an entire batch of signals to enforce macro-clustering
const BatchScoreSchema = z.object({
    signals: z.array(z.object({
        id: z.string().describe("The exact original signal ID provided in the payload."),
        impactScore: z.number().min(1).max(10).describe("Industry impact score 1-10. 8+ for breakthroughs/releases. Below 5 for noise."),
        bottomLine: z.string().describe("One crisp sentence: what this is and why it matters."),
        marketSignal: z.enum(["Bullish", "Neutral", "Risk"]).describe("Is this momentum positive, neutral, or representing a risk/challenge?"),
        targetAudience: z.array(z.enum(["Infra", "Dev", "Investor"])).describe("Who should care about this? Pick 1-3."),
        theme: z.string().describe("Macro cluster theme name grouping related signals together (e.g., 'Agentic Workflows', 'Model Training', 'Regulation')."),
    })).describe("The processed array of intelligence signals. You MUST return an entry for every ID provided."),
});

export async function filterNoise(signals: RawSignal[]): Promise<ProcessedSignal[]> {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.warn("No GOOGLE_GENERATIVE_AI_API_KEY — returning mock clustering.");
        return signals.map((s, i) => ({
            ...s,
            impactScore: 8 + (i % 3),
            bottomLine: s.content.substring(0, 120) + "...",
            marketSignal: "Neutral",
            targetAudience: ["Dev"],
            theme: "General AI"
        })) as ProcessedSignal[];
    }

    if (signals.length === 0) return [];

    // Strip payload down to essential text to minimize input tokens and noise
    const payload = signals.map(s => ({
        id: s.id,
        type: s.type,
        title: s.title,
        content: s.content.substring(0, 600), // trim raw HTML/text
    }));

    try {
        console.log(`[Batch Synthesis] Sending ${signals.length} items to Gemini...`);
        const { object } = await generateObject({
            model: google("gemini-2.5-flash", { structuredOutputs: true }),
            schema: BatchScoreSchema,
            prompt: `You are an elite AI industry analyst building an intelligence console.
Analyze this massive batch of ${payload.length} recent AI developments. 
1. Score their industry impact (1-10).
2. Write a crisp bottom-line that cuts through the hype.
3. Classify their market signal (Bullish/Neutral/Risk).
4. Tag the target audience (Infra/Dev/Investor).
5. CLUSTER THEM: Assign the exact same 'theme' string to related items (e.g., if two items are about robots, theme them both 'Robotics & Embodied AI').

Batch Data (JSON):
${JSON.stringify(payload)}`,
            maxTokens: 8000,
        });

        // Merge AI clustered results back with the original raw objects
        const typedSignals: any[] = object.signals as any;
        const aiMap = new Map<string, any>(typedSignals.map((s: any) => [s.id, s]));

        const processed: ProcessedSignal[] = [];

        for (const signal of signals) {
            const aiData = aiMap.get(signal.id);
            // Drop signals Gemini ignored or scored strictly below our noise threshold of 5
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

    } catch (err) {
        console.error("Batch synthesis failed:", err);
        // Fallback gracefully on timeout/length limit issues
        return signals.map((s, i) => ({
            ...s,
            impactScore: 7,
            bottomLine: s.content.substring(0, 150) + (s.content.length > 150 ? "..." : ""),
            marketSignal: "Bullish",
            targetAudience: ["Dev", "Investor"],
            theme: "Uncategorized",
        })) as ProcessedSignal[];
    }
}
