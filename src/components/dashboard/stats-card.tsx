import React, { type ReactNode } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Maximize2 } from "lucide-react"
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
        <Card className={cn("p-4 flex flex-col h-full relative group", className)}>
            {chart && (
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-7 w-7 bg-background/80 backdrop-blur shadow-sm">
                                <Maximize2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Full screen</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] w-full sm:max-w-[900px] h-auto max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle className="text-xl">Analisa {title}</DialogTitle>
                                <DialogDescription>Tampilan mendalam grafik {title.toLowerCase()}.</DialogDescription>
                            </DialogHeader>
                            <div className="p-8 pt-2 pb-8 w-full">
                                <div className="h-[450px] w-full bg-accent/5 rounded-xl p-4 border border-dashed">
                                    {/* Override chart height when in dialog */}
                                    {React.isValidElement(chart) 
                                        ? React.cloneElement(chart as React.ReactElement<any>, { className: "h-[400px] w-full mt-0" }) 
                                        : chart
                                    }
                                </div>
                            </div>
                            <DialogFooter>
                                <div className="flex w-full justify-between items-end">
                                    <div className="flex flex-col gap-1 text-left">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Total Akumulasi</span>
                                        <span className="text-3xl font-bold tracking-tight">{value}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="secondary" onClick={() => window.print()} className="hidden sm:flex rounded-xl px-6">
                                            Cetak Laporan
                                        </Button>
                                        <DialogClose asChild>
                                            <Button variant="default" className="rounded-xl px-8">Tutup</Button>
                                        </DialogClose>
                                    </div>
                                </div>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 p-0 pb-2">
                <div className="grid flex-1 gap-0.5 text-left">
                    <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs leading-tight">{description}</CardDescription>
                </div>
                <div className="flex flex-col gap-0.5 sm:border-l sm:px-4 text-left mr-8 sm:mr-0">
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
