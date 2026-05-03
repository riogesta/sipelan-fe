import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
    getCategories,
    getMonthlySummary,
    getSummary,
    getTransactions,
    getChartData,
    getCategorySummary,
    getBudgetSummary,
    setBudget as apiSetBudget,
    createTransaction as apiCreateTransaction,
    updateTransaction as apiUpdateTransaction,
    deleteTransaction as apiDeleteTransaction,
    createCategory as apiCreateCategory,
    updateCategory as apiUpdateCategory,
    deleteCategory as apiDeleteCategory,
    uploadFile as apiUploadFile,
} from "@/services/api"
import type {
    CategoryInput,
    TransactionInput,
} from "@/lib/types"

// ─── useSummary ──────────────────────────────────────────────

export function useSummary(enabled = true) {
    return useQuery({
        queryKey: ["summary"],
        queryFn: async () => {
            const res = await getSummary()
            return res.data
        },
        enabled,
    })
}

// ─── useMonthlySummary ──────────────────────────────────────

export function useMonthlySummary(year?: number, enabled = true) {
    return useQuery({
        queryKey: ["summary", "monthly", year],
        queryFn: async () => {
            const res = await getMonthlySummary(year)
            return res.data
        },
        enabled,
    })
}

// ─── useChartData ───────────────────────────────────────────

export function useChartData(
    view: "daily" | "weekly" | "monthly",
    year?: number,
    enabled = true
) {
    return useQuery({
        queryKey: ["summary", "chart", view, year],
        queryFn: async () => {
            const res = await getChartData(view, year)
            return res.data
        },
        enabled,
    })
}

// ─── useCategorySummary ─────────────────────────────────────

export function useCategorySummary(enabled = true) {
    return useQuery({
        queryKey: ["summary", "categories"],
        queryFn: async () => {
            const res = await getCategorySummary()
            return res.data ?? []
        },
        enabled,
    })
}

// ─── useBudgets ─────────────────────────────────────────────

export function useBudgets(month?: number, year?: number, enabled = true) {
    return useQuery({
        queryKey: ["summary", "budget", month, year],
        queryFn: async () => {
            const res = await getBudgetSummary(month, year)
            return res.data ?? []
        },
        enabled,
    })
}

// ─── useTransactions ─────────────────────────────────────────

export function useTransactions(
    page = 1,
    limit = 10,
    filters?: {
        type?: "pemasukan" | "pengeluaran"
        start_date?: string
        end_date?: string
        search?: string
        category_id?: number
    },
    enabled = true
) {
    return useQuery({
        queryKey: ["transactions", page, limit, filters],
        queryFn: async () => {
            const res = await getTransactions(page, limit, filters)
            return {
                data: res.data ?? [],
                pagination: res.pagination,
            }
        },
        enabled,
    })
}

// ─── useCategories ───────────────────────────────────────────

export function useCategories(page = 1, limit = 100, enabled = true) {
    return useQuery({
        queryKey: ["categories", page, limit],
        queryFn: async () => {
            const res = await getCategories(page, limit)
            return {
                data: res.data ?? [],
                pagination: res.pagination,
            }
        },
        enabled,
    })
}

// ─── Mutations ──────────────────────────────────────────────

export function useTransactionMutations() {
    const queryClient = useQueryClient()

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] })
        queryClient.invalidateQueries({ queryKey: ["summary"] })
    }

    const addTransaction = useMutation({
        mutationFn: apiCreateTransaction,
        onSuccess: () => {
            invalidateAll()
            toast.success("Transaksi berhasil ditambahkan")
        },
        onError: (err: Error) => {
            toast.error("Gagal menambahkan transaksi: " + err.message)
        },
    })

    const editTransaction = useMutation({
        mutationFn: ({ id, input }: { id: number; input: TransactionInput }) =>
            apiUpdateTransaction(id, input),
        onSuccess: () => {
            invalidateAll()
            toast.success("Transaksi berhasil diperbarui")
        },
        onError: (err: Error) => {
            toast.error("Gagal memperbarui transaksi: " + err.message)
        },
    })

    const removeTransaction = useMutation({
        mutationFn: apiDeleteTransaction,
        onSuccess: () => {
            invalidateAll()
            toast.success("Transaksi berhasil dihapus")
        },
        onError: (err: Error) => {
            toast.error("Gagal menghapus transaksi: " + err.message)
        },
    })

    return { addTransaction, editTransaction, removeTransaction }
}

export function useCategoryMutations() {
    const queryClient = useQueryClient()

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ["categories"] })
        queryClient.invalidateQueries({ queryKey: ["summary"] })
        queryClient.invalidateQueries({ queryKey: ["transactions"] })
    }

    const addCategory = useMutation({
        mutationFn: apiCreateCategory,
        onSuccess: () => {
            invalidateAll()
            toast.success("Kategori berhasil ditambahkan")
        },
        onError: (err: Error) => {
            toast.error("Gagal menambahkan kategori: " + err.message)
        },
    })

    const editCategory = useMutation({
        mutationFn: ({ id, input }: { id: number; input: CategoryInput }) =>
            apiUpdateCategory(id, input),
        onSuccess: () => {
            invalidateAll()
            toast.success("Kategori berhasil diperbarui")
        },
        onError: (err: Error) => {
            toast.error("Gagal memperbarui kategori: " + err.message)
        },
    })

    const removeCategory = useMutation({
        mutationFn: apiDeleteCategory,
        onSuccess: () => {
            invalidateAll()
            toast.success("Kategori berhasil dihapus")
        },
        onError: (err: Error) => {
            toast.error("Gagal menghapus kategori: " + err.message)
        },
    })

    return { addCategory, editCategory, removeCategory }
}

export function useBudgetMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: apiSetBudget,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["summary", "budget"] })
            toast.success("Budget berhasil diperbarui")
        },
        onError: (err: Error) => {
            toast.error("Gagal memperbarui budget: " + err.message)
        },
    })
}

export function useUploadMutation() {
    return useMutation({
        mutationFn: apiUploadFile,
        onSuccess: () => {
            toast.success("File berhasil diunggah")
        },
        onError: (err: Error) => {
            toast.error("Gagal mengunggah file: " + err.message)
        },
    })
}
