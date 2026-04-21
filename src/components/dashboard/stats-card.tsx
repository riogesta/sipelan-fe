import type { ReactNode } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string
    description: string
    value?: string | number
    chart?: ReactNode
    action?: ReactNode
    className?: string
}

export function StatsCard({
    title,
    description,
    value = "Rp 0",
    chart,
    action,
    className,
}: StatsCardProps) {
    return (
        <Card className={cn("p-4 flex flex-col h-full", className)}>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 p-0 pb-2">
                <div className="grid flex-1 gap-0.5 text-left">
                    <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs leading-tight">{description}</CardDescription>
                </div>
                <div className="flex flex-col gap-0.5 sm:border-l sm:px-4 text-left">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest opacity-70">Total</span>
                    <span className="text-lg sm:text-xl font-bold leading-none tracking-tight">
                        {value}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1">
                {chart && <div className="my-5 flex-1 w-full min-h-[180px] block">{chart}</div>}
                <div className="mt-auto pt-2 w-full">
                    {action}
                </div>
            </CardContent>
        </Card>
    )
}
