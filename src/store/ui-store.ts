import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Category, Transaction } from "@/lib/types"
import { startOfMonth, endOfMonth, format } from "date-fns"

interface DialogState<T> {
    isOpen: boolean
    data?: T
    open: (data?: T) => void
    close: () => void
}

interface TransactionDialogState extends DialogState<Transaction> {
    type: "pemasukan" | "pengeluaran"
    setType: (type: "pemasukan" | "pengeluaran") => void
}

export type ChartView = "daily" | "weekly" | "monthly" | "custom"

interface DashboardFilter {
    view: ChartView
    startDate: string
    endDate: string
}

interface UIStore {
    transactionDialog: TransactionDialogState
    categoryDialog: DialogState<Category>
    privacyMode: boolean
    togglePrivacyMode: () => void
    dashboardFilter: DashboardFilter
    setDashboardFilter: (filter: Partial<DashboardFilter>) => void
    resetDashboardFilter: () => void
}

const getDefaultFilter = (): DashboardFilter => {
    const now = new Date()
    return {
        view: "monthly",
        startDate: format(startOfMonth(now), "yyyy-MM-dd"),
        endDate: format(endOfMonth(now), "yyyy-MM-dd"),
    }
}

export const useUIStore = create<UIStore>()(
    persist(
        (set) => ({
            transactionDialog: {
                isOpen: false,
                type: "pengeluaran",
                open: (data) => 
                    set((state) => ({ 
                        transactionDialog: { ...state.transactionDialog, isOpen: true, data } 
                    })),
                setType: (type: "pemasukan" | "pengeluaran") => 
                    set((state) => ({ 
                        transactionDialog: { ...state.transactionDialog, type } 
                    })),
                close: () => 
                    set((state) => ({ 
                        transactionDialog: { ...state.transactionDialog, isOpen: false, data: undefined } 
                    })),
            },
            categoryDialog: {
                isOpen: false,
                open: (data) => 
                    set((state) => ({ 
                        categoryDialog: { ...state.categoryDialog, isOpen: true, data } 
                    })),
                close: () => 
                    set((state) => ({ 
                        categoryDialog: { ...state.categoryDialog, isOpen: false, data: undefined } 
                    })),
            },
            privacyMode: false,
            togglePrivacyMode: () => set((state) => ({ privacyMode: !state.privacyMode })),
            dashboardFilter: getDefaultFilter(),
            setDashboardFilter: (filter) => set((state) => ({
                dashboardFilter: { ...state.dashboardFilter, ...filter }
            })),
            resetDashboardFilter: () => set({ dashboardFilter: getDefaultFilter() }),
        }),
        {
            name: "sipelan-ui-storage",
            partialize: (state) => ({ 
                privacyMode: state.privacyMode,
                dashboardFilter: state.dashboardFilter
            }),
        }
    )
)

// Helper to access setters more easily
export const openTransactionDialog = (type: "pemasukan" | "pengeluaran" = "pengeluaran", data?: Transaction) => {
    useUIStore.setState((state) => ({
        transactionDialog: { ...state.transactionDialog, isOpen: true, data, type }
    }))
}

export const openCategoryDialog = (data?: Category) => {
    useUIStore.setState((state) => ({
        categoryDialog: { ...state.categoryDialog, isOpen: true, data }
    }))
}

export const togglePrivacyMode = () => {
    useUIStore.getState().togglePrivacyMode()
}

export const setDashboardFilter = (filter: Partial<DashboardFilter>) => {
    useUIStore.getState().setDashboardFilter(filter)
}
