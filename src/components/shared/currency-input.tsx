import * as React from "react"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    value: string | number
    onChange: (value: string) => void
    label?: string
    error?: boolean
}

export function CurrencyInput({
    value,
    onChange,
    className,
    error,
    ...props
}: CurrencyInputProps) {
    const formatDisplay = (val: string | number) => {
        if (!val) return ""
        const num = val.toString().replace(/\D/g, "")
        return new Intl.NumberFormat("id-ID").format(Number(num))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, "")
        onChange(rawValue)
    }

    return (
        <div className="relative w-full group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium border-r pr-2 h-4 flex items-center group-focus-within:text-primary transition-colors">
                Rp
            </div>
            <input
                {...props}
                type="text"
                value={formatDisplay(value)}
                onChange={handleChange}
                className={cn(
                    "flex h-11 w-full rounded-xl border border-input bg-muted/40 pl-12 pr-3 py-2 text-sm ring-offset-background transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-none",
                    error && "border-destructive text-destructive bg-destructive/5",
                    className
                )}
            />
        </div>
    )
}
