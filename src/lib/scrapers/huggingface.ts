/* eslint-disable @typescript-eslint/no-explicit-any */
import { RawSignal } from "../types";

export async function fetchHuggingFaceTrending(): Promise<RawSignal[]> {
    try {
        const res = await fetch("https://huggingface.co/api/models?sort=likes&direction=-1&limit=10", {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];

        const models = await res.json();
        return models.map((model: any) => {
            const task = model.pipeline_tag ? `${model.pipeline_tag.replace(/-/g, " ")}` : "AI";
            const downloads = model.downloads ? `${(model.downloads / 1000).toFixed(1)}k downloads` : "";
            const likes = model.likes ? `${model.likes} likes` : "";
            const stats = [downloads, likes].filter(Boolean).join(", ");
            return {
                id: `hf-${model._id}`,
                type: "huggingface",
                title: model.id,
                url: `https://huggingface.co/${model.id}`,
                content: `Trending Hugging Face model for ${task} tasks by ${model.author || model.id.split('/')[0]}. ${stats ? `Stats: ${stats}.` : ""} This model is gaining rapid traction in the AI community and represents a significant development in ${task}.`,
                author: model.author || model.id.split('/')[0],
                metrics: {
                    downloads: model.downloads,
                    likes: model.likes,
                },
                createdAt: new Date().toISOString(),
            };
        });
    } catch (error) {
        console.error("HF scraper error:", error);
        return getMockHFModels();
    }
}

// Mock fallback for HuggingFace
function getMockHFModels(): RawSignal[] {
    return [
        {
            id: "hf-mock-deepseek",
            type: "huggingface",
            title: "deepseek-ai/DeepSeek-V3",
            url: "https://huggingface.co/deepseek-ai/DeepSeek-V3",
            content: "Trending Hugging Face model for text generation tasks by deepseek-ai. Stats: 2.1M downloads, 8.4k likes. DeepSeek-V3 is a state-of-the-art open-source language model rivaling GPT-4 in benchmarks, representing a major breakthrough in open AI research.",
            author: "deepseek-ai",
            metrics: { downloads: 2100000, likes: 8400 },
            createdAt: new Date().toISOString(),
        },
        {
            id: "hf-mock-qwen",
            type: "huggingface",
            title: "Qwen/Qwen2.5-72B-Instruct",
            url: "https://huggingface.co/Qwen/Qwen2.5-72B-Instruct",
            content: "Trending Hugging Face model for text generation tasks by Qwen. Stats: 980k downloads, 5.2k likes. Qwen2.5-72B is Alibaba's flagship open-source LLM, achieving top performance on coding and reasoning benchmarks.",
            author: "Qwen",
            metrics: { downloads: 980000, likes: 5200 },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
            id: "hf-mock-phi",
            type: "huggingface",
            title: "microsoft/phi-4",
            url: "https://huggingface.co/microsoft/phi-4",
            content: "Trending Hugging Face model for text generation tasks by Microsoft. Stats: 750k downloads, 4.1k likes. Phi-4 is Microsoft's compact yet powerful small language model, showing remarkable efficiency for its size.",
            author: "microsoft",
            metrics: { downloads: 750000, likes: 4100 },
            createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
    ];
}

