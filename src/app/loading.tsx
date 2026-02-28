import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <main className="container mx-auto p-4 md:p-8 relative min-h-screen">
            <div className="absolute top-0 w-full h-[500px] bg-zinc-900/30 blur-[100px] -z-10 rounded-full pointer-events-none" />
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-50 mb-2">AI Pulse</h1>
                    <p className="text-zinc-400">The Top 1% of AI Signal, aggregated in real-time.</p>
                </div>
            </header>

            <BentoGrid className="h-full grid-rows-3 md:grid-rows-1">
                {[1, 2, 3].map((i) => (
                    <BentoGridItem
                        key={i}
                        className="md:col-span-1"
                        title={<Skeleton className="h-6 w-3/4 bg-zinc-800" />}
                        description={<Skeleton className="h-4 w-full bg-zinc-800" />}
                        header={
                            <div className="space-y-4 pt-4 px-2 w-full h-full">
                                {[1, 2, 3, 4].map((j) => (
                                    <div key={j} className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/50 space-y-3 w-full">
                                        <div className="flex justify-between items-center pb-2">
                                            <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                                            <Skeleton className="h-4 w-12 bg-zinc-800" />
                                        </div>
                                        <Skeleton className="h-3 w-full bg-zinc-800" />
                                        <Skeleton className="h-3 w-5/6 bg-zinc-800" />
                                    </div>
                                ))}
                            </div>
                        }
                    />
                ))}
            </BentoGrid>
        </main>
    );
}
