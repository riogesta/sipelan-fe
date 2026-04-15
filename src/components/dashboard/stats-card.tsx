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
            <CardHeader className="flex flex-row items-center p-0 pb-2">
                <div className="grid flex-1 gap-1 text-left">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <div className="flex flex-col gap-1 border-l px-4 text-left">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold leading-none">
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
