import { SignalItem } from '@/lib/redis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Cpu, GitPullRequest } from 'lucide-react';

export function ModelForge({ items }: { items: SignalItem[] }) {
    // Filter to only HF or GitHub items
    const modelItems = items.filter(
        (item) => item.source === 'github' || item.source === 'huggingface'
    );

    return (
        <Card className="col-span-1 border-zinc-800 bg-zinc-950/50 backdrop-blur-md h-[300px] lg:h-[600px]">
            <CardHeader className="border-b border-zinc-800 pb-4">
                <CardTitle className="flex items-center gap-2 text-zinc-100">
                    <Cpu className="h-5 w-5 text-indigo-400" />
                    Model Forge
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[220px] lg:h-[520px]">
                    <div className="flex flex-col">
                        {modelItems.length === 0 ? (
                            <div className="p-8 text-center text-sm text-zinc-500">
                                Awaiting new models...
                            </div>
                        ) : null}

                        {modelItems.map((item) => (
                            <div
                                key={item.id}
                                className="group border-b border-zinc-800/60 p-4 hover:bg-zinc-900/50 transition-colors"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {item.source === 'github' && <GitPullRequest className="h-4 w-4 text-zinc-400" />}
                                        <Badge variant="outline" className="text-xs uppercase bg-zinc-900 border-zinc-700 text-zinc-300">
                                            {item.source}
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-zinc-500 font-mono">
                                        Top {item.score}
                                    </span>
                                </div>
                                <h3 className="mb-1 text-sm font-medium text-zinc-100 leading-snug">
                                    {item.title}
                                </h3>
                                <p className="mb-2 text-xs text-zinc-400 line-clamp-2">
                                    {item.bottomLine}
                                </p>
                                <a
                                    href={item.originalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors uppercase tracking-wider font-semibold"
                                >
                                    View Repository <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
