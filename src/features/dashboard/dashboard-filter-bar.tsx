import { format, startOfMonth, endOfMonth, subDays, startOfYear, endOfYear } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarIcon, RotateCcw } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useUIStore, type ChartView } from "@/store/ui-store"

export function DashboardFilterBar() {
    const { dashboardFilter, setDashboardFilter, resetDashboardFilter } = useUIStore()
    const { view, startDate, endDate } = dashboardFilter

    const date = {
        from: new Date(startDate),
        to: new Date(endDate),
    }

    const handleViewChange = (newView: ChartView) => {
        const now = new Date()
        let newStart = startDate
        let newEnd = endDate

        if (newView === "daily") {
            newStart = format(startOfMonth(now), "yyyy-MM-dd")
            newEnd = format(endOfMonth(now), "yyyy-MM-dd")
        } else if (newView === "weekly") {
            newStart = format(subDays(now, 6), "yyyy-MM-dd")
            newEnd = format(now, "yyyy-MM-dd")
        } else if (newView === "monthly") {
            newStart = format(startOfYear(now), "yyyy-MM-dd")
            newEnd = format(endOfYear(now), "yyyy-MM-dd")
        }

        setDashboardFilter({ view: newView, startDate: newStart, endDate: newEnd })
    }

    const handleDateChange = (range: DateRange | undefined) => {
        if (range?.from && range?.to) {
            setDashboardFilter({
                view: "custom",
                startDate: format(range.from, "yyyy-MM-dd"),
                endDate: format(range.to, "yyyy-MM-dd"),
            })
        } else if (range?.from) {
             setDashboardFilter({
                view: "custom",
                startDate: format(range.from, "yyyy-MM-dd"),
                endDate: format(range.from, "yyyy-MM-dd"),
            })
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6 bg-card p-2 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={view} onValueChange={(v: any) => handleViewChange(v)}>
                    <SelectTrigger className="h-9 w-[130px] rounded-lg border-none shadow-none bg-muted/50 font-medium">
                        <SelectValue placeholder="Pilih Tampilan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Harian</SelectItem>
                        <SelectItem value="weekly">Mingguan</SelectItem>
                        <SelectItem value="monthly">Bulanan</SelectItem>
                        <SelectItem value="custom">Kustom</SelectItem>
                    </SelectContent>
                </Select>

                <div className="h-4 w-[1px] bg-border hidden sm:block mx-1" />

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-9 justify-start text-left font-normal px-2 hover:bg-muted/50 rounded-lg",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            <span className="text-xs font-medium">
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "dd MMM yyyy", { locale: id })} -{" "}
                                            {format(date.to, "dd MMM yyyy", { locale: id })}
                                        </>
                                    ) : (
                                        format(date.from, "dd MMM yyyy", { locale: id })
                                    )
                                ) : (
                                    <span>Pilih Tanggal</span>
                                )}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleDateChange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex-1" />

            <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1.5 text-xs rounded-lg"
                onClick={() => resetDashboardFilter()}
            >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
            </Button>
        </div>
    )
}
