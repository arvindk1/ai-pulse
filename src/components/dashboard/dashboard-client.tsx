"use client";

import { ProcessedSignal } from "@/lib/types";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Github, Twitter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, Variants } from "framer-motion";

export function DashboardClient({ initialData }: { initialData: ProcessedSignal[] }) {
    const twitterSignals = initialData.filter(s => s.type === "twitter");
    const githubSignals = initialData.filter(s => s.type === "github");
    const hfSignals = initialData.filter(s => s.type === "huggingface");

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
                        <>⭐ {signal.metrics?.stars || 0}</>
                    ) : signal.type === 'huggingface' ? (
                        <><Activity className="h-3 w-3 mr-1 text-amber-500 inline" /> {signal.impactScore}/10</>
                    ) : (
                        <>{signal.impactScore}/10 Impact</>
                    )}
                </Badge>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">{signal.bottomLine}</p>
            {signal.author && <p className="text-[10px] text-zinc-500 mt-3 flex items-center gap-1 font-mono uppercase tracking-wider">BY @{signal.author}</p>}
        </motion.a>
    );

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
            <BentoGrid className="h-full grid-rows-3 md:grid-rows-1">
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
