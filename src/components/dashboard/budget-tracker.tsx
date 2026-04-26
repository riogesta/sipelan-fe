import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useBudgets } from "@/hooks/use-api"
import { formatRupiah } from "@/lib/format"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, TrendingUp, Info } from "lucide-react"
import type { BudgetUsage } from "@/lib/types"
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
    if (loading) return <div className="p-4 text-center text-xs text-muted-foreground">Memuat data anggaran...</div>
    
    // Filter only categories with a set budget amount
    const activeBudgets = budgets.filter(b => b.amount > 0)

    if (activeBudgets.length === 0) return null

    return (
        <Card className="p-4 flex flex-col h-full mt-6 shadow-none">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 p-0 pb-4 border-b">
                <div className="flex-1 grid gap-0.5 text-left">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm sm:text-base font-bold">Pantauan Anggaran Bulanan</CardTitle>
                    </div>
                    <CardDescription className="text-[10px] sm:text-xs leading-tight">
                        Kelola pengeluaran berdasarkan target kategori yang sudah kamu tentukan.
                    </CardDescription>
                </div>
                <div className="flex items-center justify-end sm:border-l sm:pl-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help text-muted-foreground hover:text-foreground transition-colors">
                                    <Info className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-medium uppercase tracking-widest opacity-70">Info Sesi</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Data dihitung berdasarkan transaksi bulan ini.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardHeader>
            <CardContent className="p-0 pt-6 grid gap-6">
                {activeBudgets.map((budget) => {
                    const isOver = budget.percentage > 100
                    const isWarning = budget.percentage > 75 && !isOver

                    return (
                        <div key={budget.id} className="space-y-2.5">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold flex items-center gap-2">
                                        {budget.category?.name}
                                        
                                        <TooltipProvider>
                                            {isOver && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <AlertCircle className="h-3.5 w-3.5 text-destructive cursor-help animate-pulse" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Anggaran terlampaui!</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                            {budget.percentage < 50 && budget.percentage > 0 && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Sangat Aman: Penggunaan di bawah 50%</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </TooltipProvider>
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <span className="font-medium text-foreground">{formatRupiah(budget.used)}</span>
                                        <span>/</span>
                                        <span>{formatRupiah(budget.amount)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={cn(
                                        "text-xs font-mono font-bold px-2 py-0.5 rounded-md",
                                        isOver ? "bg-destructive/10 text-destructive" : 
                                        isWarning ? "bg-orange-500/10 text-orange-600" : 
                                        "bg-primary/10 text-primary"
                                    )}>
                                        {Math.round(budget.percentage)}%
                                    </span>
                                </div>
                            </div>
                            <div className="relative">
                                <Progress 
                                    value={Math.min(budget.percentage, 100)} 
                                    className={cn(
                                        "h-2 rounded-full bg-muted",
                                        isOver ? "[&>div]:bg-destructive" : isWarning ? "[&>div]:bg-orange-500" : "[&>div]:bg-primary"
                                    )}
                                />
                            </div>
                            {isOver && (
                                <div className="flex items-center gap-1.5 text-[10px] text-destructive bg-destructive/5 p-2 rounded-lg border border-destructive/10">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>Melebihi anggaran sebesar <strong>{formatRupiah(budget.used - budget.amount)}</strong></span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
