import { useCallback, useEffect, useState } from "react"
import {
    getCategories,
    getMonthlySummary,
    getSummary,
    getTransactions,
    getChartData,
    getBudgetSummary,
    setBudget as apiSetBudget,
    createTransaction as apiCreateTransaction,
    updateTransaction as apiUpdateTransaction,
    deleteTransaction as apiDeleteTransaction,
    createCategory as apiCreateCategory,
    updateCategory as apiUpdateCategory,
    deleteCategory as apiDeleteCategory,
} from "@/lib/api"
import type {
    Category,
    CategoryInput,
    MonthlySummary,
    OverallSummary,
    Pagination,
    ChartData,
    BudgetUsage,
    Transaction,
    TransactionInput,
} from "@/lib/types"

// ─── useSummary ──────────────────────────────────────────────

export function useSummary(token?: string | null) {
    const [summary, setSummary] = useState<OverallSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchSummary = useCallback(async () => {
        if (!token) return
        try {
            setLoading(true)
            setError(null)
            const res = await getSummary()
            setSummary(res.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch summary")
        } finally {
            setLoading(false)
        }
    }, [token])

    useEffect(() => {
        fetchSummary()
    }, [fetchSummary])

    return { summary, loading, error, refetch: fetchSummary }
}

// ─── useMonthlySummary ──────────────────────────────────────

export function useMonthlySummary(year?: number, token?: string | null) {
    const [data, setData] = useState<MonthlySummary[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        if (!token) return
        try {
            setLoading(true)
            setError(null)
            const res = await getMonthlySummary(year)
            setData(res.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch chart data")
        } finally {
            setLoading(false)
        }
    }, [year, token])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { data, loading, error, refetch: fetchData }
}

// ─── useChartData ───────────────────────────────────────────

export function useChartData(
    view: "daily" | "weekly" | "monthly",
    year?: number,
    token?: string | null
) {
    const [data, setData] = useState<ChartData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        if (!token) return
        try {
            setLoading(true)
            setError(null)
            const res = await getChartData(view, year)
            setData(res.data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch chart data")
        } finally {
            setLoading(false)
        }
    }, [view, year, token])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { data, loading, error, refetch: fetchData }
}

// ─── useBudgets ─────────────────────────────────────────────

export function useBudgets(month?: number, year?: number, token?: string | null) {
    const [budgets, setBudgets] = useState<BudgetUsage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchBudgets = useCallback(async () => {
        if (!token) return
        try {
            setLoading(true)
            setError(null)
            const res = await getBudgetSummary(month, year)
            setBudgets(res.data ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch budgets")
        } finally {
            setLoading(false)
        }
    }, [month, year, token])

    useEffect(() => {
        fetchBudgets()
    }, [fetchBudgets])

    const updateBudget = async (categoryId: number, amount: number) => {
        await apiSetBudget({ category_id: categoryId, amount })
        await fetchBudgets()
    }

    return { budgets, loading, error, refetch: fetchBudgets, updateBudget }
}

// ─── useTransactions ─────────────────────────────────────────

export function useTransactions(
    page = 1,
    limit = 10,
    type?: "pemasukan" | "pengeluaran",
    token?: string | null
) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTransactions = useCallback(async () => {
        if (!token) return
        try {
            setLoading(true)
            setError(null)
            const res = await getTransactions(page, limit, type)
            setTransactions(res.data ?? [])
            setPagination(res.pagination)
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch transactions"
            )
        } finally {
            setLoading(false)
        }
    }, [page, limit, type, token])

    useEffect(() => {
        fetchTransactions()
    }, [fetchTransactions])

    const addTransaction = async (input: TransactionInput) => {
        const res = await apiCreateTransaction(input)
        await fetchTransactions()
        return res.data
    }

    const editTransaction = async (id: number, input: TransactionInput) => {
        const res = await apiUpdateTransaction(id, input)
        await fetchTransactions()
        return res.data
    }

    const removeTransaction = async (id: number) => {
        await apiDeleteTransaction(id)
        await fetchTransactions()
    }

    return {
        transactions,
        pagination,
        loading,
        error,
        refetch: fetchTransactions,
        addTransaction,
        editTransaction,
        removeTransaction,
    }
}

// ─── useCategories ───────────────────────────────────────────

export function useCategories(page = 1, limit = 100, token?: string | null) {
    const [categories, setCategories] = useState<Category[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCategories = useCallback(async () => {
        if (!token) return
        try {
            setLoading(true)
            setError(null)
            const res = await getCategories(page, limit)
            setCategories(res.data ?? [])
            setPagination(res.pagination)
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch categories"
            )
        } finally {
            setLoading(false)
        }
    }, [page, limit, token])

    useEffect(() => {
        fetchCategories()
    }, [fetchCategories])

    const addCategory = async (input: CategoryInput) => {
        const res = await apiCreateCategory(input)
        await fetchCategories()
        return res.data
    }

    const editCategory = async (id: number, input: CategoryInput) => {
        const res = await apiUpdateCategory(id, input)
        await fetchCategories()
        return res.data
    }

    const removeCategory = async (id: number) => {
        await apiDeleteCategory(id)
        await fetchCategories()
    }

    return {
        categories,
        pagination,
        loading,
        error,
        refetch: fetchCategories,
        addCategory,
        editCategory,
        removeCategory,
    }
}
