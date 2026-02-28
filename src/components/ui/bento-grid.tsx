import { cn } from "@/lib/utils";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] lg:auto-rows-[24rem] h-full grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-xl group/bento hover:shadow-2xl transition duration-500 shadow-input dark:shadow-none p-4 bg-zinc-900 border border-zinc-800 justify-between flex flex-col space-y-4 hover:bg-zinc-900/50 hover:border-zinc-700",
                className
            )}
        >
            <div className="flex-1 overflow-hidden">{header}</div>
            <div className="group-hover/bento:translate-x-2 transition duration-200 mt-4">
                <div className="flex items-center space-x-2">
                    {icon}
                    <div className="font-sans font-bold text-slate-100 tracking-tight">
                        {title}
                    </div>
                </div>
                <div className="font-sans font-normal text-zinc-400 text-sm mt-1">
                    {description}
                </div>
            </div>
        </div>
    );
};
