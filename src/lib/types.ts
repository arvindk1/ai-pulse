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
    createdAt: string;
}

export interface ProcessedSignal extends RawSignal {
    impactScore: number;
    bottomLine: string;
}
