export type SignalType = "github" | "huggingface" | "twitter";

export interface RawSignal {
    id: string;
    type: SignalType;
    title: string;
    url: string;
    content: string;
    author?: string;
    metrics?: {
        stars?: number;
        downloads?: number;
        likes?: number;
        retweets?: number;
    };
    velocity?: {
        stars?: number;     // e.g. +3400 starts in 24h
        downloads?: number;
        likes?: number;
    };
    createdAt: string;
}

export interface ProcessedSignal extends RawSignal {
    impactScore: number;
    bottomLine: string;
    // Phase 6 Structured Intelligence
    marketSignal?: "Bullish" | "Neutral" | "Risk";
    targetAudience?: ("Infra" | "Dev" | "Investor")[];
    theme?: string;
}
