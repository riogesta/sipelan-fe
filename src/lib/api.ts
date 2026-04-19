import type {
    ApiResponse,
    Category,
    CategoryInput,
    MonthlySummary,
    OverallSummary,
    PaginatedResponse,
    Transaction,
    TransactionInput,
} from "./types"

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8081").replace(/\/$/, "")
const API_BASE = `${API_URL}/api`

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem("sipelan-token")?.trim()
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    })

    if (res.status === 401) {
        const hadToken = !!localStorage.getItem("sipelan-token")
        localStorage.removeItem("sipelan-token")
        if (hadToken) {
            window.location.reload()
        }
        throw new Error("Session expired. Please login again.")
    }

    if (!res.ok) {
        const error = await res
            .json()
            .catch(() => ({ message: "Request failed" }))
        throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
}

// ─── Auth ────────────────────────────────────────────────────

export async function login(
    username: string,
    password: string
): Promise<ApiResponse<{ token: string }>> {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
        const error = await res
            .json()
            .catch(() => ({ message: "Login failed" }))
        throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
}

// ─── Categories ──────────────────────────────────────────────

export async function getCategories(
    page = 1,
    limit = 100
): Promise<PaginatedResponse<Category>> {
    return request(`/categories?page=${page}&limit=${limit}`)
}

export async function getCategoryById(
    id: number
): Promise<ApiResponse<Category>> {
    return request(`/categories/${id}`)
}

export async function createCategory(
    input: CategoryInput
): Promise<ApiResponse<Category>> {
    return request("/categories", {
        method: "POST",
        body: JSON.stringify(input),
    })
}

export async function updateCategory(
    id: number,
    input: CategoryInput
): Promise<ApiResponse<Category>> {
    return request(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
    })
}

export async function deleteCategory(id: number): Promise<ApiResponse<null>> {
    return request(`/categories/${id}`, {
        method: "DELETE",
    })
}

// ─── Transactions ────────────────────────────────────────────

export async function getTransactions(
    page = 1,
    limit = 10,
    type?: "pemasukan" | "pengeluaran"
): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    })
    if (type) params.set("type", type)
    return request(`/transactions?${params}`)
}

export async function getTransactionById(
    id: number
): Promise<ApiResponse<Transaction>> {
    return request(`/transactions/${id}`)
}

export async function createTransaction(
    input: TransactionInput
): Promise<ApiResponse<Transaction>> {
    return request("/transactions", {
        method: "POST",
        body: JSON.stringify(input),
    })
}

export async function updateTransaction(
    id: number,
    input: TransactionInput
): Promise<ApiResponse<Transaction>> {
    return request(`/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
    })
}

export async function deleteTransaction(
    id: number
): Promise<ApiResponse<null>> {
    return request(`/transactions/${id}`, {
        method: "DELETE",
    })
}

// ─── Summary / Dashboard ────────────────────────────────────

export async function getSummary(): Promise<ApiResponse<OverallSummary>> {
    return request("/summary")
}

export async function getMonthlySummary(
    year?: number
): Promise<ApiResponse<MonthlySummary[]>> {
    const params = year ? `?year=${year}` : ""
    return request(`/summary/monthly${params}`)
}
