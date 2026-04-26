import { useState } from "react"
import "./index.css"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { StatsCard } from "@/components/dashboard/stats-card"
import { TransactionDialog } from "@/components/dashboard/transaction-dialog"
import { TransactionTable } from "@/components/dashboard/transaction-table"
import { CategoryTable } from "@/components/dashboard/category-table"
import { CategoryDialog } from "@/components/dashboard/category-dialog"
import { BudgetTracker } from "@/components/dashboard/budget-tracker"
import { AuthPage } from "@/components/dashboard/login"
import { Navbar, type ViewType } from "@/components/dashboard/navbar"
import { useSummary, useTransactions, useCategories, useChartData, useBudgets } from "@/hooks/use-api"
import { formatRupiah } from "@/lib/format"
import { type Category } from "@/lib/types"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem("sipelan-is-logged-in"))
    const [currentView, setCurrentView] = useState<ViewType>("dashboard")
    const [chartView, setChartView] = useState<"daily" | "weekly" | "monthly">("monthly")
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined)
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
    const [txPage, setTxPage] = useState(1)
    const currentYear = new Date().getFullYear()

    // Pass isLoggedIn as a string to hooks to maintain compatibility with existing hook logic
    const authFlag = isLoggedIn ? "true" : null

    const { summary, refetch: refetchSummary } = useSummary(authFlag)
    const { data: chartData, loading: chartLoading, refetch: refetchChartData } = useChartData(chartView, currentYear, authFlag)
    const { budgets, loading: budgetsLoading, refetch: refetchBudgets } = useBudgets(undefined, undefined, authFlag)
    
    const {
        transactions,
        pagination: txPagination,
        loading: txLoading,
        refetch: refetchTransactions,
        addTransaction,
        removeTransaction,
    } = useTransactions(txPage, 10, undefined, authFlag)
    
    const { 
        categories, 
        loading: catLoading, 
        refetch: refetchCategories,
        addCategory,
        editCategory,
        removeCategory 
    } = useCategories(1, 100, authFlag)

    const handleTransactionCreated = async () => {
        await refetchTransactions()
        await refetchSummary()
        await refetchChartData()
        await refetchBudgets()
    }

    const handleCategoryChanged = async () => {
        await refetchCategories()
        await refetchBudgets()
        await refetchTransactions()
        await refetchSummary()
        await refetchChartData()
    }

    const handleDeleteTransaction = async (id: number) => {
        if (confirm("Apakah anda yakin ingin menghapus transaksi ini?")) {
            await removeTransaction(id)
            await refetchTransactions()
            await refetchSummary()
            await refetchChartData()
            await refetchBudgets()
        }
    }

    const handleDeleteCategory = async (id: number) => {
        if (confirm("Menghapus kategori mungkin akan berdampak pada data transaksi yang menggunakan kategori ini. Lanjutkan?")) {
            await removeCategory(id)
            await refetchCategories()
            await refetchTransactions()
            await refetchSummary()
            await refetchChartData()
            await refetchBudgets()
        }
    }

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category)
        setIsCategoryDialogOpen(true)
    }

    const renderDashboard = () => (
        <>
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="space-y-0.5">
                    <h2 className="text-xl font-bold tracking-tight">Dashboard Overview</h2>
                    <p className="text-xs text-muted-foreground">Analisa data keuangan anda dalam satu tampilan</p>
                </div>
                
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2">
                            <Settings2 className="h-3.5 w-3.5" />
                            <span>Tampilan: {chartView === 'daily' ? 'Harian' : chartView === 'weekly' ? 'Mingguan' : 'Bulanan'}</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Pengaturan Chart</DialogTitle>
                            <DialogDescription>Pilih bagaimana data chart ditampilkan.</DialogDescription>
                        </DialogHeader>
                        <div className="p-8 pt-2 pb-8">
                            <Select 
                                value={chartView} 
                                onValueChange={(v: any) => setChartView(v)}
                            >
                                <SelectTrigger className="h-11 rounded-xl shadow-none">
                                    <SelectValue placeholder="Pilih Tampilan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Harian (Bulan Ini)</SelectItem>
                                    <SelectItem value="weekly">Mingguan (7 Hari Terakhir)</SelectItem>
                                    <SelectItem value="monthly">Bulanan ({currentYear})</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="default" className="rounded-xl px-8">
                                    Selesai
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatsCard
                    title="Pemasukan"
                    description="Kelola data pemasukan anda"
                    value={formatRupiah(summary?.total_pemasukan ?? 0)}
                    chart={<OverviewChart type="pemasukan" data={chartData} loading={chartLoading} year={currentYear} viewLabel={chartView === 'daily' ? 'Harian' : chartView === 'weekly' ? 'Mingguan' : 'Bulanan'} />}
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
                    chart={<OverviewChart type="pengeluaran" data={chartData} loading={chartLoading} year={currentYear} viewLabel={chartView === 'daily' ? 'Harian' : chartView === 'weekly' ? 'Mingguan' : 'Bulanan'} />}
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

            <BudgetTracker budgets={budgets} loading={budgetsLoading} />

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
                        onCreated={handleCategoryChanged}
                    />
                </div>
                </div>

                <CategoryTable 
                categories={categories} 
                budgets={budgets}
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
                onCreated={handleCategoryChanged}
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

    if (!isLoggedIn) {
        return <AuthPage onLoginSuccess={() => setIsLoggedIn(true)} />
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
