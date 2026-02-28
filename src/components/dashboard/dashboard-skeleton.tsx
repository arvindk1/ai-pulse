// Skeleton loader shown instantly via Suspense while the pipeline fetches data
export function DashboardSkeleton() {
    const cards = Array.from({ length: 5 });
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[75vh]">
            {[0, 1, 2].map((col) => (
                <div key={col} className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 flex flex-col gap-3 animate-pulse">
                    <div className="flex gap-3 items-center mb-2">
                        <div className="h-4 w-4 rounded-full bg-zinc-700" />
                        <div className="h-4 w-24 rounded bg-zinc-700" />
                    </div>
                    {cards.map((_, i) => (
                        <div key={i} className="rounded-xl border border-zinc-800/40 bg-zinc-950/50 p-4 space-y-2">
                            <div className="flex justify-between gap-2">
                                <div className="h-3.5 w-3/4 rounded bg-zinc-700" />
                                <div className="h-3.5 w-12 rounded bg-zinc-800" />
                            </div>
                            <div className="h-2.5 w-full rounded bg-zinc-800" />
                            <div className="h-2.5 w-4/5 rounded bg-zinc-800" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
