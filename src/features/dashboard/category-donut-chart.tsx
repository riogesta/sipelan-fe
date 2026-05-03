import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { formatRupiah } from "@/lib/format"
import { Skeleton } from "@/components/shared/skeleton"
import type { CategorySummary } from "@/lib/types"

interface CategoryDonutChartProps {
    data: CategorySummary[]
    loading?: boolean
}

const COLORS = [
    "#10b981", // emerald-500
    "#3b82f6", // blue-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#06b6d4", // cyan-500
    "#f97316", // orange-500
]

export function CategoryDonutChart({ data, loading }: CategoryDonutChartProps) {
    if (loading) {
        return (
            <Card className="rounded-xl border-none shadow-sm">
                <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent className="flex justify-center items-center h-[250px]">
                    <Skeleton className="h-40 w-40 rounded-full" />
                </CardContent>
            </Card>
        )
    }

    if (!data || data.length === 0) {
        return (
            <Card className="rounded-xl border-none shadow-sm h-full">
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

    return (
        <Card className="rounded-xl border-none shadow-sm h-full flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">
                    Distribusi Pengeluaran
                </CardTitle>
                <CardDescription className="text-xs">
                    Analisa alokasi dana per kategori bulan ini
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-6">
                <div className="h-[200px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((_, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={COLORS[index % COLORS.length]} 
                                        stroke="transparent"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const point = payload[0].payload
                                        return (
                                            <div className="bg-background/95 backdrop-blur-sm border rounded-xl shadow-xl p-3 text-xs">
                                                <p className="font-bold mb-1">{point.name}</p>
                                                <p className="text-primary font-mono font-medium">
                                                    {formatRupiah(point.value)}
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 px-2">
                    {data.slice(0, 4).map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2 min-w-0">
                            <div 
                                className="h-2 w-2 rounded-full shrink-0" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-[10px] font-medium truncate flex-1">{item.name}</span>
                            <span className="text-[10px] font-bold opacity-60">
                                {Math.round((item.value / totalExpense) * 100)}%
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
