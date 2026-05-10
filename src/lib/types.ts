import { z } from "zod"

// Types matching the Go backend models

export interface Category {
    id: number
    created_at: string
    updated_at: string
    deleted_at: string | null
    name: string
    description: string
}

export interface Transaction {
    id: number
    created_at: string
    updated_at: string
    deleted_at: string | null
    date: string
    category_id: number
    category: Category
    description: string
    total: number
    type: "pemasukan" | "pengeluaran"
    attachment: string
}

export interface OverallSummary {
    total_pemasukan: number
    total_pengeluaran: number
    balance: number
}

export interface MonthlySummary {
    month: string
    year: number
    pemasukan: number
    pengeluaran: number
}

export interface CategorySummary {
    name: string
    value: number
}

export interface ChartData {
    label: string
    pemasukan: number
    pengeluaran: number
}

export interface Budget {
    id: number
    category_id: number
    category?: Category
    amount: number
    month: number
    year: number
}

export interface BudgetUsage extends Budget {
    used: number
    percentage: number
}

export interface MonthlyTarget {
    id: number
    amount: number
    month: number
    year: number
}

export interface Pagination {
    page: number
    limit: number
    total_items: number
    total_pages: number
}

export interface ApiResponse<T> {
    status: number
    message: string
    data: T
}

export interface PaginatedResponse<T> {
    status: number
    message: string
    data: T[]
    pagination: Pagination
}

// Input types for creating/updating
export const categorySchema = z.object({
    name: z.string().min(1, "Nama kategori wajib diisi"),
    description: z.string(),
})

export type CategoryInput = z.infer<typeof categorySchema>

export const transactionSchema = z.object({
    date: z.string().min(1, "Tanggal wajib diisi"),
    category_id: z.number().min(1, "Kategori wajib dipilih"),
    description: z.string().min(1, "Deskripsi wajib diisi"),
    total: z.number().gt(0, "Total harus lebih dari 0"),
    type: z.enum(["pemasukan", "pengeluaran"]),
    attachment: z.string(),
})

export type TransactionInput = z.infer<typeof transactionSchema>
