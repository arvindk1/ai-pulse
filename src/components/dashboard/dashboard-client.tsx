"use client";

import { useState } from "react";
import { ProcessedSignal } from "@/lib/types";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Github, Twitter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, Variants } from "framer-motion";

export function DashboardClient({ initialData }: { initialData: ProcessedSignal[] }) {
    const [profile, setProfile] = useState<"All" | "Dev" | "Investor" | "Infra">("All");

    const filteredData = profile === "All"
        ? initialData
        : initialData.filter(s => s.targetAudience?.includes(profile));

    const twitterSignals = filteredData.filter(s => s.type === "twitter");
    const githubSignals = filteredData.filter(s => s.type === "github");
    const hfSignals = filteredData.filter(s => s.type === "huggingface");

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    const renderCard = (signal: ProcessedSignal) => (
        <motion.a
            key={signal.id}
            variants={itemVariants}
            href={signal.url}
            target="_blank"
            rel="noreferrer"
            className="block p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/50 hover:bg-zinc-900 hover:border-zinc-700 transition-colors active:scale-95 duration-200"
        >
            <div className="flex items-start justify-between mb-3 gap-2">
                <span className="text-sm font-semibold text-slate-200 truncate pr-2" title={signal.title}>{signal.title}</span>
                <Badge variant="outline" className="text-[10px] bg-zinc-900 text-zinc-300 border-zinc-700 px-2 py-0.5 shrink-0 flex items-center shadow-sm">
                    {signal.type === 'github' ? (
                        <>
                            ⭐ {signal.metrics?.stars?.toLocaleString() || 0}
                            {signal.velocity?.stars ? (
                                <span className={`ml-1 font-medium ${signal.velocity.stars > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                    {signal.velocity.stars > 0 ? "↑" : "↓"}{Math.abs(signal.velocity.stars).toLocaleString()} (24h)
                                </span>
                            ) : null}
                        </>
                    ) : signal.type === 'huggingface' ? (
                        <>
                            <Activity className="h-3 w-3 mr-1 text-amber-500 inline" /> {signal.impactScore}/10
                            {signal.velocity?.downloads ? (
                                <span className={`ml-1 font-medium ${signal.velocity.downloads > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                    {signal.velocity.downloads > 0 ? "↑" : "↓"}{(Math.abs(signal.velocity.downloads) / 1000).toFixed(1)}k dl (24h)
                                </span>
                            ) : null}
                        </>
                    ) : (
                        <>{signal.impactScore}/10 Impact</>
                    )}
                </Badge>
            </div>

            {(signal.theme || signal.marketSignal) && (
                <div className="flex items-center gap-2 mb-2">
                    {signal.theme && (
                        <Badge variant="secondary" className="bg-zinc-800/40 text-[9px] text-zinc-400 border-zinc-800/50 hover:bg-zinc-800/60 uppercase tracking-wider backdrop-blur-sm">
                            {signal.theme}
                        </Badge>
                    )}
                    {signal.marketSignal && (
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${signal.marketSignal === 'Bullish' ? 'text-emerald-500' : signal.marketSignal === 'Risk' ? 'text-rose-500' : 'text-zinc-500'}`}>
                            {signal.marketSignal}
                        </span>
                    )}
                </div>
            )}

            <p className="text-xs text-zinc-400 leading-relaxed font-medium">{signal.bottomLine}</p>
            {signal.author && <p className="text-[10px] text-zinc-500 mt-3 flex items-center gap-1 font-mono uppercase tracking-wider">BY @{signal.author}</p>}
        </motion.a>
    );

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col h-full space-y-4">

            <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
                {(["All", "Dev", "Investor", "Infra"] as const).map(p => (
                    <button
                        key={p}
                        onClick={() => setProfile(p)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${profile === p
                            ? "bg-zinc-100 text-zinc-900 border-zinc-200 shadow-sm"
                            : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900"
                            }`}
                    >
                        {p === "All" ? "Global Overview" : p === "Dev" ? "Builder Console" : p === "Investor" ? "Capital & Markets" : "Enterprise Infra"}
                    </button>
                ))}
            </div>

            <BentoGrid className="flex-1 min-h-0 grid-rows-3 md:grid-rows-1">
                <BentoGridItem
                    className="md:col-span-1"
                    title="News Pulse"
                    description="High impact signal from God-tier AI researchers."
                    header={
                        <ScrollArea className="h-full w-full pr-4 pb-4">
                            <div className="space-y-3 pb-8">
                                {twitterSignals.map(renderCard)}
                                {twitterSignals.length === 0 && <p className="text-sm text-zinc-500 italic p-4 text-center">No high-impact pulse today.</p>}
                            </div>
                        </ScrollArea>
                    }
                    icon={<Twitter className="h-4 w-4 text-zinc-400 group-hover/bento:text-zinc-100 transition-colors" />}
                />
                <BentoGridItem
                    className="md:col-span-1"
                    title="Model Forge"
                    description="Trending model weights and releases."
                    header={
                        <ScrollArea className="h-full w-full pr-4 pb-4">
                            <div className="space-y-3 pb-8">
                                {hfSignals.map(renderCard)}
                                {hfSignals.length === 0 && <p className="text-sm text-zinc-500 italic p-4 text-center">No new models trending.</p>}
                            </div>
                        </ScrollArea>
                    }
                    icon={<Activity className="h-4 w-4 text-zinc-400 group-hover/bento:text-zinc-100 transition-colors" />}
                />
                <BentoGridItem
                    className="md:col-span-1"
                    title="Tool Lab"
                    description="Latest frameworks and repositories."
                    header={
                        <ScrollArea className="h-full w-full pr-4 pb-4">
                            <div className="space-y-3 pb-8">
                                {githubSignals.map(renderCard)}
                                {githubSignals.length === 0 && <p className="text-sm text-zinc-500 italic p-4 text-center">No new tools discovered.</p>}
                            </div>
                        </ScrollArea>
                    }
                    icon={<Github className="h-4 w-4 text-zinc-400 group-hover/bento:text-zinc-100 transition-colors" />}
                />
            </BentoGrid>
        </motion.div>
    );
}
