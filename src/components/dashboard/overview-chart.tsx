import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import type { MonthlySummary } from "@/lib/types"
import { formatRupiah } from "@/lib/format"

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
    data: MonthlySummary[]
    loading: boolean
    year?: number
}

export function OverviewChart({ type, data, loading, year }: OverviewChartProps) {
    if (loading) {
        return (
            <div className="h-[180px] w-full flex items-center justify-center text-xs text-muted-foreground">
                Memuat chart...
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-[180px] w-full flex items-center justify-center text-xs text-muted-foreground">
                Belum ada data bulanan
            </div>
        )
    }

    // Periksa apakah semua nilai untuk tipe ini (pemasukan / pengeluaran) adalah 0 di semua bulan
    const hasData = data.some((item) => item[type] > 0)

    if (!hasData) {
        return (
            <div className="h-[180px] w-full flex flex-col gap-2 items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-lg mt-4">
                <p>Belum ada transaksi {type}</p>
                <p className="text-xs opacity-60">di tahun {year}</p>
            </div>
        )
    }

    return (
        <ChartContainer config={chartConfig} className="h-[180px] w-full mt-4">
            <AreaChart
                data={data}
                margin={{
                    left: 0,
                    right: 15,
                    top: 10,
                    bottom: 0,
                }}
            >
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => value.slice(0, 3)}
                    style={{ fontSize: '11px', fill: 'var(--color-muted-foreground)' }}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={50}
                    tickFormatter={(value) =>
                        new Intl.NumberFormat("id-ID", {
                            notation: "compact",
                            maximumFractionDigits: 1,
                        }).format(value)
                    }
                    style={{ fontSize: '11px', fill: 'var(--color-muted-foreground)' }}
                    domain={[0, (dataMax: number) => (dataMax === 0 ? 1000 : dataMax)]}
                />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent 
                            indicator="dot" 
                            labelFormatter={(label) => `${label} ${year || ""}`}
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
                                            {formatRupiah(Number(value))}
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
