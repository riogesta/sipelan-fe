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
export interface CategoryInput {
    name: string
    description: string
}


export interface TransactionInput {
    date: string
    category_id: number
    description: string
    total: number
    type: "pemasukan" | "pengeluaran"
    attachment?: string
}
