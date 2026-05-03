import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"
import { formatRupiah, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

interface TransactionCardProps {
    transaction: Transaction
    onEdit?: (transaction: Transaction) => void
    onDelete?: (id: number) => void
}

export function TransactionCard({
    transaction,
    onEdit,
    onDelete,
}: TransactionCardProps) {
    const isIncome = transaction.type === "pemasukan"

    return (
        <Card className="overflow-hidden border-none shadow-sm bg-card hover:bg-accent/5 transition-colors">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-2.5 rounded-2xl shrink-0",
                        isIncome ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-rose-100 text-rose-600 dark:bg-rose-900/30"
                    )}>
                        {isIncome ? (
                            <ArrowUpCircle className="h-5 w-5" />
                        ) : (
                            <ArrowDownCircle className="h-5 w-5" />
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                            <p className="font-bold text-sm truncate leading-tight">
                                {transaction.description}
                            </p>
                            <p className={cn(
                                "font-bold text-sm whitespace-nowrap",
                                isIncome ? "text-emerald-600" : "text-rose-600"
                            )}>
                                {isIncome ? "+" : "-"} {formatRupiah(transaction.total)}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            <span>{formatDate(transaction.date)}</span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span className="px-1.5 py-0.5 rounded-lg bg-muted text-[9px]">
                                {transaction.category?.name || "No Category"}
                            </span>
                        </div>
                    </div>
                </div>

                {(onEdit || onDelete) && (
                    <div className="mt-3 pt-3 border-t flex justify-end gap-1">
                        {onEdit && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5"
                                onClick={() => onEdit(transaction)}
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                onClick={() => onDelete(transaction.id)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Hapus
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
