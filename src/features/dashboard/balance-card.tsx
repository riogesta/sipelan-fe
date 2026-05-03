import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatRupiah } from "@/lib/format"
import { cn } from "@/lib/utils"

interface BalanceCardProps {
    totalIncome: number
    totalExpense: number
    loading?: boolean
    className?: string
}

export function BalanceCard({
    totalIncome,
    totalExpense,
    loading,
    className,
}: BalanceCardProps) {
    const balance = totalIncome - totalExpense
    const isPositive = balance >= 0

    if (loading) {
        return (
            <div className={cn("h-32 w-full rounded-xl bg-muted animate-pulse", className)} />
        )
    }

    return (
        <Card className={cn(
            "overflow-hidden border-none shadow-2xl relative group",
            isPositive 
                ? "bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-500/20" 
                : "bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-rose-500/20",
            className
        )}>
            {/* Background pattern/glow */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
            
            <CardContent className="relative z-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-white/70 text-xs font-medium uppercase tracking-widest flex items-center gap-1.5">
                            <Wallet className="h-3 w-3" />
                            Total Saldo
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            {formatRupiah(balance)}
                        </h2>
                    </div>
                    
                    <div className={cn(
                        "p-2 rounded-xl backdrop-blur-md bg-white/20 border border-white/30 shadow-inner",
                        isPositive ? "text-white" : "text-white"
                    )}>
                        {isPositive ? (
                            <TrendingUp className="h-5 w-5" />
                        ) : (
                            <TrendingDown className="h-5 w-5" />
                        )}
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-4 text-xs font-medium">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-white/60">Pemasukan</span>
                        <span className="text-sm font-bold">{formatRupiah(totalIncome)}</span>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div className="flex flex-col gap-0.5">
                        <span className="text-white/60">Pengeluaran</span>
                        <span className="text-sm font-bold">{formatRupiah(totalExpense)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
