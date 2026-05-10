import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import type { ChartData } from "@/lib/types"
import { formatRupiah } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui-store"

const chartConfig = {
    pemasukan: {
        label: "Pemasukan",
        color: "#10b981", // Emerald 500
    },
    pengeluaran: {
        label: "Pengeluaran",
        color: "#ef4444", // Red 500
    },
} satisfies ChartConfig

interface OverviewChartProps {
    type: "pemasukan" | "pengeluaran"
    data: ChartData[]
    loading: boolean
    viewLabel?: string
    className?: string
}

import { Skeleton } from "@/components/shared/skeleton"

export function OverviewChart({ type, data, loading, viewLabel, className }: OverviewChartProps) {
    const { privacyMode } = useUIStore()
    if (loading) {
        return (
            <div className={cn("h-[180px] w-full flex flex-col gap-3 p-4 justify-end mt-4", className)}>
                <div className="flex items-end gap-2 h-full">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton 
                            key={i} 
                            className="flex-1 rounded-t-sm" 
                            style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }} 
                        />
                    ))}
                </div>
                <div className="flex justify-between border-t pt-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-3 w-8" />
                    ))}
                </div>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className={cn("h-[180px] w-full flex items-center justify-center text-xs text-muted-foreground", className)}>
                Belum ada data {viewLabel?.toLowerCase() || "chart"}
            </div>
        )
    }

    // Periksa apakah semua nilai untuk tipe ini (pemasukan / pengeluaran) adalah 0
    const hasData = data.some((item) => Number(item[type]) > 0)

    if (!hasData) {
        return (
            <div className={cn("h-[180px] w-full flex flex-col gap-2 items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg mt-4 px-4 text-center", className)}>
                <p className="font-medium">Belum ada transaksi {type}</p>
                <p className="text-xs opacity-60 italic">Tampilan: {viewLabel || "Bulanan"}</p>
            </div>
        )
    }

    // Sanitize data for Recharts (ensure no undefined/null values)
    const chartData = data.map(item => ({
        label: item.label || "",
        pemasukan: Number(item.pemasukan) || 0,
        pengeluaran: Number(item.pengeluaran) || 0,
    }))

    return (
        <ChartContainer config={chartConfig} className={cn("h-[200px] w-full mt-4", className)}>
            <AreaChart
                data={chartData}
                margin={{
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 0,
                }}
            >
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => value}
                    style={{ fontSize: '11px', fontWeight: 500, fill: 'var(--color-muted-foreground)' }}
                />
                {!privacyMode && (
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        width={65}
                        tickFormatter={(value) =>
                            new Intl.NumberFormat("id-ID", {
                                notation: "compact",
                                compactDisplay: "short",
                                maximumFractionDigits: 1,
                            }).format(value)
                        }
                        style={{ fontSize: '11px', fontWeight: 500, fill: 'var(--color-muted-foreground)' }}
                    />
                )}
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent 
                            indicator="dot" 
                            labelFormatter={(label) => `${label}`}
                            formatter={(value, name, item) => (
                                <>
                                    <div
                                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                        style={{ backgroundColor: item.color || item.payload?.fill }}
                                    />
                                    <div className="flex flex-1 justify-between leading-none items-center gap-4">
                                        <span className="text-muted-foreground capitalize">
                                            {name}
                                        </span>
                                        <span className="text-foreground font-mono font-medium">
                                            {privacyMode ? "Rp ••••••" : formatRupiah(Number(value))}
                                        </span>
                                    </div>
                                </>
                            )}
                        />
                    }
                />
                <Area
                    dataKey={type}
                    type="monotone"
                    fill={`var(--color-${type})`}
                    fillOpacity={0.3}
                    stroke={`var(--color-${type})`}
                    strokeWidth={3}
                />
            </AreaChart>
        </ChartContainer>
    )
}
