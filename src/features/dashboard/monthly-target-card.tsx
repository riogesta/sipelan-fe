import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import {
    Card,
    CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { CurrencyInput } from "@/components/shared/currency-input"
import { formatPrivacy } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Target, Edit2 } from "lucide-react"
import { useMonthlyTarget, useMonthlyTargetMutation } from "@/services/query-hooks"
import { useUIStore } from "@/store/ui-store"

interface MonthlyTargetCardProps {
    totalExpense: number
    month?: number
    year?: number
}

export function MonthlyTargetCard({
    totalExpense,
    month = new Date().getMonth() + 1,
    year = new Date().getFullYear(),
}: MonthlyTargetCardProps) {
    const { data: target, isLoading } = useMonthlyTarget(month, year)
    const mutation = useMonthlyTargetMutation()
    const { privacyMode } = useUIStore()
    
    const [inputValue, setInputValue] = useState("")

    useEffect(() => {
        if (target) {
            setInputValue(target.amount.toString())
        }
    }, [target])

    const handleSave = async () => {
        const amount = parseFloat(inputValue)
        if (!isNaN(amount)) {
            await mutation.mutateAsync({
                amount,
                month,
                year,
            })
        }
    }

    if (isLoading) {
        return (
            <Card className="p-4 animate-pulse bg-muted h-28 rounded-xl border-none" />
        )
    }

    const amount = target?.amount ?? 0
    const percentage = amount > 0 ? (totalExpense / amount) * 100 : 0
    const isOver = percentage > 100
    const isWarning = percentage > 80 && !isOver

    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]

    // Logic for Daily Allowance
    const getDaysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate()
    const today = new Date()
    const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year
    
    const daysRemaining = isCurrentMonth 
        ? getDaysInMonth(month, year) - today.getDate() + 1 
        : getDaysInMonth(month, year)

    const remainingBudget = Math.max(0, amount - totalExpense)
    const dailyAllowance = remainingBudget / Math.max(1, daysRemaining)

    return (
        <Card className="overflow-hidden shadow-sm bg-card rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Anggaran {monthNames[month - 1]} {year}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                        isOver ? "bg-destructive/10 text-destructive" : 
                        isWarning ? "bg-orange-500/10 text-orange-600" : 
                        "bg-emerald-500/10 text-emerald-600"
                    )}>
                        {Math.round(percentage)}%
                    </div>
                    
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md opacity-60 hover:opacity-100">
                                <Edit2 className="h-3 w-3" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px] rounded-xl">
                            <DialogHeader>
                                <DialogTitle>Set Target Bulanan</DialogTitle>
                                <CardDescription>
                                    Atur batas maksimal pengeluaran anda untuk bulan {monthNames[month - 1]} {year}.
                                </CardDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none" htmlFor="amount">Nominal Target (Rp)</label>
                                    <CurrencyInput
                                        id="amount"
                                        value={inputValue}
                                        onChange={(val) => setInputValue(val)}
                                        placeholder="Contoh: 5000000"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="default" className="w-full h-11 rounded-xl" onClick={handleSave}>
                                        Simpan Target
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {amount === 0 ? (
                <div className="text-center py-2">
                    <Dialog>
                         <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full rounded-xl gap-2 text-xs h-9 border-dashed">
                                <Target className="h-3 w-3" />
                                Set Target Sekarang
                            </Button>
                         </DialogTrigger>
                         <DialogContent className="sm:max-w-[400px] rounded-xl">
                            <DialogHeader>
                                <DialogTitle>Set Target Bulanan</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <CurrencyInput
                                    value={inputValue}
                                    onChange={(val) => setInputValue(val)}
                                    placeholder="Contoh: 5000000"
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="default" className="w-full h-11 rounded-xl" onClick={handleSave}>
                                        Simpan Target
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Sisa Jatah Bulan Ini</span>
                        <h3 className={cn(
                            "text-2xl font-bold tracking-tight",
                            isOver ? "text-destructive" : "text-foreground"
                        )}>
                            {isOver ? "-" : ""} {formatPrivacy(remainingBudget, privacyMode)}
                        </h3>
                    </div>

                    <div className="space-y-1.5">
                        <Progress 
                            value={Math.min(percentage, 100)} 
                            className={cn(
                                "h-1.5 bg-muted rounded-full overflow-hidden",
                                isOver ? "[&>div]:bg-destructive" : isWarning ? "[&>div]:bg-orange-500" : "[&>div]:bg-primary"
                            )}
                        />
                        <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground">
                            <span>{formatPrivacy(totalExpense, privacyMode)} terpakai</span>
                            <span>Target: {formatPrivacy(amount, privacyMode)}</span>
                        </div>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                        <div className="flex-1 bg-muted/50 rounded-lg p-2 flex flex-col gap-0.5 border border-border/50">
                            <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Jatah Harian</span>
                            <span className="text-sm font-bold text-primary">
                                {formatPrivacy(dailyAllowance, privacyMode)}
                            </span>
                        </div>
                        <div className="flex-1 bg-muted/50 rounded-lg p-2 flex flex-col gap-0.5 border border-border/50">
                            <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">Sisa Hari</span>
                            <span className="text-sm font-bold text-foreground">
                                {daysRemaining} Hari
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    )
}
