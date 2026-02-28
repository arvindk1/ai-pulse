import { SignalItem } from '@/lib/redis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, Twitter } from 'lucide-react';

export function NewsPulse({ items }: { items: SignalItem[] }) {
    // Filter to only X/Twitter items if we only want tweets here,
    // or keep all. Since it's "News Pulse", let's keep all high impact news.

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 h-[600px] border-zinc-800 bg-zinc-950/50 backdrop-blur-md">
            <CardHeader className="border-b border-zinc-800 pb-4">
                <CardTitle className="flex items-center gap-2 text-zinc-100">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Live Pulse
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[520px]">
                    <div className="flex flex-col">
                        {items.length === 0 ? (
                            <div className="p-8 text-center text-sm text-zinc-500">
                                Unearthing signals...
                            </div>
                        ) : null}

                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="group border-b border-zinc-800/60 p-5 hover:bg-zinc-900/50 transition-colors"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {item.source === 'x' && <Twitter className="h-4 w-4 text-blue-400" />}
                                        {/* Simple badging for source */}
                                        <Badge variant="outline" className="text-xs uppercase bg-zinc-900 border-zinc-700 text-zinc-300">
                                            {item.source}
                                        </Badge>
                                        <span className="text-sm font-medium text-zinc-300">@{item.author}</span>
                                    </div>
                                    <span className="text-xs text-zinc-500 font-mono">
                                        Score: {item.score}
                                    </span>
                                </div>
                                <h3 className="mb-2 text-base font-medium text-zinc-100 leading-snug">
                                    {item.title}
                                </h3>
                                <p className="mb-3 text-sm text-zinc-400 leading-relaxed">
                                    <span className="font-semibold text-zinc-300">Bottom Line:</span> {item.bottomLine}
                                </p>
                                <a
                                    href={item.originalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-400 transition-colors"
                                >
                                    Read Source <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
