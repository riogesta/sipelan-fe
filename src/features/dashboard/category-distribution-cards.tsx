import { TrendingUp, Utensils, Car, Home, ShoppingBag, Zap, Heart, Gift, Package } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatPrivacy } from "@/lib/format"
import { Skeleton } from "@/components/shared/skeleton"
import type { CategorySummary } from "@/lib/types"
import { useUIStore } from "@/store/ui-store"
import { cn } from "@/lib/utils"

interface CategoryDistributionCardsProps {
    data: CategorySummary[]
    loading?: boolean
}

const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("makan") || lowerName.includes("minum") || lowerName.includes("food")) return Utensils
    if (lowerName.includes("transport") || lowerName.includes("bensin") || lowerName.includes("parkir") || lowerName.includes("ojek")) return Car
    if (lowerName.includes("rumah") || lowerName.includes("kost") || lowerName.includes("sewa")) return Home
    if (lowerName.includes("belanja") || lowerName.includes("shopping") || lowerName.includes("mall")) return ShoppingBag
    if (lowerName.includes("listrik") || lowerName.includes("air") || lowerName.includes("internet") || lowerName.includes("utilitas")) return Zap
    if (lowerName.includes("kesehatan") || lowerName.includes("obat") || lowerName.includes("rs")) return Heart
    if (lowerName.includes("hiburan") || lowerName.includes("nonton") || lowerName.includes("game")) return Gift
    return Package
}

const COLOR_CLASSES = [
    "[&>div]:bg-emerald-500",
    "[&>div]:bg-blue-500",
    "[&>div]:bg-amber-500",
    "[&>div]:bg-red-500",
    "[&>div]:bg-violet-500",
    "[&>div]:bg-pink-500",
    "[&>div]:bg-cyan-500",
    "[&>div]:bg-orange-500",
]

export function CategoryDistributionCards({ data, loading }: CategoryDistributionCardsProps) {
    const { privacyMode } = useUIStore()

    if (loading) {
        return (
            <Card className="rounded-xl border-none shadow-sm h-full bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card className="rounded-xl border-none shadow-sm h-full bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold">Distribusi Pengeluaran</CardTitle>
                    <CardDescription className="text-xs">Berdasarkan kategori transaksi bulan ini</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-center px-6">
                    <p className="text-sm font-medium">Belum ada data pengeluaran</p>
                    <p className="text-[10px] opacity-60">Tambahkan transaksi pengeluaran untuk melihat analisa</p>
                </CardContent>
            </Card>
        )
    }

    const totalExpense = data.reduce((acc, curr) => acc + curr.value, 0)
    const sortedData = [...data].sort((a, b) => b.value - a.value)
    const topCategories = sortedData.slice(0, 6)
    
    // Adaptive grid logic
    const isSingle = topCategories.length === 1

    return (
        <Card className="p-0 flex flex-col h-full shadow-sm rounded-xl border-none bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-0 px-5 pt-5">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </div>
                        <CardTitle className="text-sm sm:text-base font-bold tracking-tight">
                            Distribusi Pengeluaran
                        </CardTitle>
                    </div>
                    <div className="text-right">
                         <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest leading-none mb-1">Total Bulan Ini</p>
                         <p className="text-xs font-bold text-primary">{formatPrivacy(totalExpense, privacyMode)}</p>
                    </div>
                </div>
                <CardDescription className="text-xs leading-tight opacity-70">
                    Analisa alokasi dana per kategori bulan ini
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 px-5 pb-6">
                <div className={cn(
                    "grid gap-4 mt-6",
                    isSingle ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
                )}>
                    {topCategories.map((item, index) => {
                        const Icon = getCategoryIcon(item.name)
                        const percentage = Math.round((item.value / totalExpense) * 100)
                        const colorClass = COLOR_CLASSES[index % COLOR_CLASSES.length]

                        return (
                            <div 
                                key={item.name} 
                                className={cn(
                                    "group relative overflow-hidden rounded-2xl border border-border/5 bg-background/50 p-4 transition-all hover:bg-background hover:shadow-md",
                                    isSingle && "flex items-center justify-between p-6"
                                )}
                            >
                                <div className={cn("flex items-center gap-3", isSingle && "flex-1")}>
                                    <div className={cn("p-2.5 rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors")}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{item.name}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground tabular-nums">
                                            {formatPrivacy(item.value, privacyMode)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className={cn("mt-3 space-y-1.5", isSingle && "mt-0 flex-1 text-right ml-6")}>
                                    <div className={cn("flex justify-between items-center text-[10px] font-bold", isSingle && "justify-end gap-3")}>
                                        <span className="opacity-40 uppercase tracking-tighter">Proporsi</span>
                                        <span className={cn("text-primary tabular-nums", isSingle && "text-xl font-black")}>{percentage}%</span>
                                    </div>
                                    <Progress 
                                        value={percentage} 
                                        className={cn("h-1.5 rounded-full bg-muted/30 [&>div]:transition-all", isSingle && "h-2 w-full mt-2", colorClass)}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
                {sortedData.length > 6 && (
                    <div className="mt-4 px-2 text-center">
                        <p className="text-[10px] text-muted-foreground italic">
                            + {sortedData.length - 6} kategori lainnya tidak ditampilkan
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
