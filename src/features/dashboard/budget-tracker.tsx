import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatPrivacy } from "@/lib/format"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, TrendingUp, Info } from "lucide-react"
import type { BudgetUsage } from "@/lib/types"
import { useUIStore } from "@/store/ui-store"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface BudgetTrackerProps {
    budgets: BudgetUsage[]
    loading: boolean
}

export function BudgetTracker({ budgets, loading }: BudgetTrackerProps) {
    const { privacyMode } = useUIStore()
    if (loading) return <div className="p-4 text-center text-xs text-muted-foreground">Memuat data anggaran...</div>
    
    // Filter only categories with a set budget amount
    const activeBudgets = budgets.filter(b => b.amount > 0)

    if (activeBudgets.length === 0) return null

    return (
        <Card className="p-5 flex flex-col h-full shadow-sm rounded-xl border-none bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 p-0 pb-5 border-b border-border/50">
                <div className="flex-1 grid gap-0.5 text-left">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-sm sm:text-base font-bold tracking-tight">Pantauan Anggaran</CardTitle>
                    </div>
                    <CardDescription className="text-xs leading-tight opacity-70">
                        Monitoring penggunaan dana per kategori bulan ini.
                    </CardDescription>
                </div>
                <div className="flex items-center justify-end sm:border-l sm:pl-4 border-border/50">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help text-muted-foreground hover:text-foreground transition-colors group">
                                    <Info className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Info Sesi</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="rounded-xl">
                                <p className="text-xs">Data otomatis ter-update berdasarkan transaksi terbaru.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent className="p-0 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    {activeBudgets.map((budget) => {
                        const isOver = budget.percentage > 100
                        const isWarning = budget.percentage > 75 && !isOver
                        const remaining = Math.max(0, budget.amount - budget.used)

                        return (
                            <div key={budget.id} className="space-y-3 group/item">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-bold flex items-center gap-2 group-hover/item:text-primary transition-colors">
                                            {budget.category?.name}
                                            
                                            <TooltipProvider>
                                                {isOver && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <AlertCircle className="h-3.5 w-3.5 text-destructive cursor-help animate-pulse" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="rounded-lg bg-destructive text-destructive-foreground">
                                                            <p className="text-xs font-bold">Melebihi batas!</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {budget.percentage < 50 && budget.percentage > 0 && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="rounded-lg bg-emerald-500 text-white">
                                                            <p className="text-xs font-bold">Penggunaan aman</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </TooltipProvider>
                                        </span>
                                        <div className="flex flex-col text-[10px]">
                                            <div className="flex items-center gap-1 text-muted-foreground font-medium">
                                                <span className="text-foreground/80">{formatPrivacy(budget.used, privacyMode)}</span>
                                                <span className="opacity-40">/</span>
                                                <span>{formatPrivacy(budget.amount, privacyMode)}</span>
                                            </div>
                                            {!isOver && (
                                                <span className="text-emerald-600 font-bold mt-0.5">
                                                    Sisa: {formatPrivacy(remaining, privacyMode)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className={cn(
                                            "text-[10px] font-mono font-black px-2 py-0.5 rounded-full",
                                            isOver ? "bg-destructive text-destructive-foreground" : 
                                            isWarning ? "bg-orange-500 text-white" : 
                                            "bg-secondary text-secondary-foreground"
                                        )}>
                                            {Math.round(budget.percentage)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Progress 
                                        value={Math.min(budget.percentage, 100)} 
                                        className={cn(
                                            "h-2 rounded-full bg-muted/50 border border-border/5",
                                            isOver ? "[&>div]:bg-destructive" : isWarning ? "[&>div]:bg-orange-500" : "[&>div]:bg-primary"
                                        )}
                                    />
                                </div>
                                {isOver && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-destructive bg-destructive/5 p-2 rounded-xl border border-destructive/10 leading-tight">
                                        <AlertCircle className="h-3 w-3 shrink-0" />
                                        <span>Over budget <strong>{formatPrivacy(budget.used - budget.amount, privacyMode)}</strong></span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
