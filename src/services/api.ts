import type {
    ApiResponse,
    Budget,
    BudgetUsage,
    Category,
    CategoryInput,
    ChartData,
    CategorySummary,
    MonthlySummary,
    OverallSummary,
    PaginatedResponse,
    Transaction,
    TransactionInput,
} from "@/lib/types"

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8081").replace(/\/$/, "")
const API_BASE = "/api"

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem("sipelan-token")?.trim()
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
    }

    const res = await fetch(`${API_URL}${API_BASE}${endpoint}`, {
        ...options,
        headers,
    })

    if (res.status === 401) {
        localStorage.removeItem("sipelan-is-logged-in")
        localStorage.removeItem("sipelan-token")
        window.location.reload()
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
): Promise<ApiResponse<{ token: string; person_id: number; username: string }>> {
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

export async function register(
    username: string,
    password: string
): Promise<ApiResponse<null>> {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
        const error = await res
            .json()
            .catch(() => ({ message: "Registration failed" }))
        throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
}

export async function logout(): Promise<ApiResponse<null>> {
    // Just clear local state for dev simplicity
    localStorage.removeItem("sipelan-is-logged-in")
    localStorage.removeItem("sipelan-token")
    window.location.reload()
    return { status: 200, message: "Logged out", data: null }
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
    filters?: {
        type?: "pemasukan" | "pengeluaran"
        start_date?: string
        end_date?: string
        search?: string
        category_id?: number
    }
): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    })
    if (filters?.type) params.set("type", filters.type)
    if (filters?.start_date) params.set("start_date", filters.start_date)
    if (filters?.end_date) params.set("end_date", filters.end_date)
    if (filters?.search) params.set("search", filters.search)
    if (filters?.category_id) params.set("category_id", String(filters.category_id))

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

// ─── Upload ──────────────────────────────────────────────────

export async function uploadFile(
    file: File
): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData()
    formData.append("file", file)

    const token = localStorage.getItem("sipelan-token")?.trim()
    const res = await fetch(`${API_URL}${API_BASE}/upload`, {
        method: "POST",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    })

    if (res.status === 401) {
        localStorage.removeItem("sipelan-is-logged-in")
        localStorage.removeItem("sipelan-token")
        window.location.reload()
        throw new Error("Session expired. Please login again.")
    }

    if (!res.ok) {
        const error = await res
            .json()
            .catch(() => ({ message: "Upload failed" }))
        throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
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

export async function getChartData(
    view: "daily" | "weekly" | "monthly",
    year?: number
): Promise<ApiResponse<ChartData[]>> {
    const params = new URLSearchParams({ view })
    if (year) params.append("year", year.toString())
    return request(`/summary/chart?${params.toString()}`)
}

export async function getCategorySummary(): Promise<ApiResponse<CategorySummary[]>> {
    return request("/summary/categories")
}

// ─── Budgets ──────────────────────────────────────────────────

export async function setBudget(input: {
    category_id: number
    amount: number
    month?: number
    year?: number
}): Promise<ApiResponse<Budget>> {
    return request("/budgets", {
        method: "POST",
        body: JSON.stringify(input),
    })
}

export async function getBudgetSummary(
    month?: number,
    year?: number
): Promise<ApiResponse<BudgetUsage[]>> {
    const params = new URLSearchParams()
    if (month) params.append("month", month.toString())
    if (year) params.append("year", year.toString())
    return request(`/summary/budget?${params.toString()}`)
}
