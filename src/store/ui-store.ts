import { create } from "zustand"
import type { Category, Transaction } from "@/lib/types"

interface DialogState<T> {
    isOpen: boolean
    data?: T
    open: (data?: T) => void
    close: () => void
}

interface UIStore {
    transactionDialog: DialogState<Transaction> & { type: "pemasukan" | "pengeluaran" | "income" | "expense" }
    categoryDialog: DialogState<Category>
}

export const useUIStore = create<UIStore>((set) => ({
    transactionDialog: {
        isOpen: false,
        type: "expense",
        open: (data) => 
            set((state) => ({ 
                transactionDialog: { ...state.transactionDialog, isOpen: true, data } 
            })),
        setType: (type: "pemasukan" | "pengeluaran" | "income" | "expense") => 
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
    }
}))

// Helper to access setters more easily
export const openTransactionDialog = (type: "pemasukan" | "pengeluaran" | "income" | "expense" = "expense", data?: Transaction) => {
    useUIStore.setState((state) => ({
        transactionDialog: { ...state.transactionDialog, isOpen: true, data, type }
    }))
}

export const openCategoryDialog = (data?: Category) => {
    useUIStore.setState((state) => ({
        categoryDialog: { ...state.categoryDialog, isOpen: true, data }
    }))
}
