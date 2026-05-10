/**
 * Format a number as Indonesian Rupiah currency string.
 */
export function formatRupiah(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

/**
 * Format a value for privacy mode.
 */
export function formatPrivacy(value: number, isPrivacy: boolean): string {
    if (isPrivacy) return "Rp ••••••"
    return formatRupiah(value)
}

/**
 * Format a date string (ISO) to a localized Indonesian date.
 */
export function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(date)
}

/**
 * Get today's date in ISO format for input[type=date] default.
 */
export function todayISO(): string {
    return new Date().toISOString().slice(0, 10)
}
