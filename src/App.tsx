import { useState } from "react"
import "./index.css"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { StatsCard } from "@/components/dashboard/stats-card"
import { TransactionDialog } from "@/components/dashboard/transaction-dialog"
import { TransactionTable } from "@/components/dashboard/transaction-table"
import { CategoryTable } from "@/components/dashboard/category-table"
import { CategoryDialog } from "@/components/dashboard/category-dialog"
import { Login } from "@/components/dashboard/login"
import { Navbar, type ViewType } from "@/components/dashboard/navbar"
import { useSummary, useTransactions, useCategories, useMonthlySummary } from "@/hooks/use-api"
import { formatRupiah } from "@/lib/format"
import { type Category } from "@/lib/types"

function App() {
    const [token, setToken] = useState<string | null>(localStorage.getItem("sipelan-token"))
    const [currentView, setCurrentView] = useState<ViewType>("dashboard")
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [txPage, setTxPage] = useState(1)
    const currentYear = new Date().getFullYear()

    const { summary, refetch: refetchSummary } = useSummary(token)
    const { data: monthlyData, loading: monthlyLoading, refetch: refetchMonthlySummary } = useMonthlySummary(currentYear, token)
    
    const {
        transactions,
        pagination: txPagination,
        loading: txLoading,
        refetch: refetchTransactions,
        addTransaction,
        removeTransaction,
    } = useTransactions(txPage, 10, undefined, token)
    
    const { 
        categories, 
        loading: catLoading, 
        refetch: refetchCategories,
        addCategory,
        editCategory,
        removeCategory 
    } = useCategories(1, 100, token)

    const handleTransactionCreated = async () => {
        await refetchTransactions()
        await refetchSummary()
        await refetchMonthlySummary()
    }

    const handleDeleteTransaction = async (id: number) => {
        if (confirm("Apakah anda yakin ingin menghapus transaksi ini?")) {
            await removeTransaction(id)
            await refetchSummary()
            await refetchMonthlySummary()
        }
    }

    const handleDeleteCategory = async (id: number) => {
        if (confirm("Menghapus kategori mungkin akan berdampak pada data transaksi yang menggunakan kategori ini. Lanjutkan?")) {
            await removeCategory(id)
            await refetchTransactions()
            await refetchSummary()
            await refetchMonthlySummary()
        }
    }

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category)
        setIsCategoryDialogOpen(true)
    }

    const renderDashboard = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatsCard
                    title="Pemasukan"
                    description="Kelola data pemasukan anda"
                    value={formatRupiah(summary?.total_pemasukan ?? 0)}
                    chart={<OverviewChart type="pemasukan" data={monthlyData} loading={monthlyLoading} year={currentYear} />}
                    action={
                        <TransactionDialog
                            type="income"
                            categories={categories}
                            onCreated={handleTransactionCreated}
                            addTransaction={addTransaction}
                        />
                    }
                />

                <StatsCard
                    title="Pengeluaran"
                    description="Kelola data pengeluaran anda"
                    value={formatRupiah(summary?.total_pengeluaran ?? 0)}
                    chart={<OverviewChart type="pengeluaran" data={monthlyData} loading={monthlyLoading} year={currentYear} />}
                    action={
                        <TransactionDialog
                            type="expense"
                            categories={categories}
                            onCreated={handleTransactionCreated}
                            addTransaction={addTransaction}
                        />
                    }
                />
            </div>

            <div className="mt-8">
                <TransactionTable
                    transactions={transactions}
                    loading={txLoading}
                    pagination={txPagination}
                    onPageChange={setTxPage}
                    onDelete={handleDeleteTransaction}
                />
            </div>
        </>
    )

    const renderCategories = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="space-y-0.5">
                    <h2 className="text-base font-bold tracking-tight">Master Data Kategori</h2>
                    <p className="text-[11px] text-muted-foreground">Kelola pengelompokan transaksi anda</p>
                </div>
                <div className="w-40">
                    <CategoryDialog 
                        addCategory={addCategory} 
                        editCategory={editCategory}
                        onCreated={refetchCategories}
                    />
                </div>
            </div>
            
            <CategoryTable 
                categories={categories} 
                loading={catLoading} 
                onDelete={handleDeleteCategory}
                onEdit={handleEditCategory}
            />

            <CategoryDialog 
                open={isCategoryDialogOpen}
                onOpenChange={(open) => {
                    setIsCategoryDialogOpen(open)
                    if (!open) setEditingCategory(undefined)
                }}
                category={editingCategory}
                addCategory={addCategory}
                editCategory={editCategory}
                onCreated={refetchCategories}
            />
        </div>
    )

    const renderContent = () => {
        switch (currentView) {
            case "dashboard":
                return renderDashboard()
            case "categories":
                return renderCategories()
            case "transactions":
                return (
                    <div className="mt-4">
                        <TransactionTable
                            transactions={transactions}
                            loading={txLoading}
                            pagination={txPagination}
                            onPageChange={setTxPage}
                            onDelete={handleDeleteTransaction}
                        />
                    </div>
                )
            case "settings":
                return (
                    <div className="flex items-center justify-center py-20 bg-card rounded-lg border border-dashed">
                        <p className="text-muted-foreground italic">Fitur pengaturan segera hadir.</p>
                    </div>
                )
            default:
                return renderDashboard()
        }
    }

    if (!token) {
        return <Login onLoginSuccess={() => setToken(localStorage.getItem("sipelan-token"))} />
    }

    return (
        <div className="flex justify-center">
            <div className="w-full px-4 py-6 sm:px-8 md:w-4/5 md:px-0 lg:w-3/5 xl:w-1/2 md:py-10">
                <Navbar activeView={currentView} onViewChange={setCurrentView} />
                
                <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {renderContent()}
                </main>
            </div>
        </div>
    )
}

export default App
