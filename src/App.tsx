import { useState } from "react"
import "./index.css"
import { OverviewChart } from "@/features/dashboard/overview-chart"
import { StatsCard } from "@/features/dashboard/stats-card"
import { TransactionDialog } from "@/features/transactions/transaction-dialog"
import { TransactionTable } from "@/features/transactions/transaction-table"
import { CategoryTable } from "@/features/categories/category-table"
import { CategoryDialog } from "@/features/categories/category-dialog"
import { BudgetTracker } from "@/features/dashboard/budget-tracker"
import { AuthPage } from "@/features/auth/login"
import { Navbar, type ViewType } from "@/components/layout/navbar"
import { PageHeader } from "@/components/layout/page-header"
import { BalanceCard } from "@/features/dashboard/balance-card"
import { CategoryDonutChart } from "@/features/dashboard/category-donut-chart"
import { motion, AnimatePresence } from "framer-motion"
import { 
    useSummary, 
    useTransactions, 
    useCategories, 
    useChartData, 
    useCategorySummary,
    useBudgets,
    useTransactionMutations,
    useCategoryMutations
} from "@/services/query-hooks"
import { formatRupiah } from "@/lib/format"
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
import { openTransactionDialog, openCategoryDialog } from "@/store/ui-store"

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem("sipelan-is-logged-in"))
    const [currentView, setCurrentView] = useState<ViewType>("dashboard")
    const [chartView, setChartView] = useState<"daily" | "weekly" | "monthly">("monthly")
    
    const [txPage, setTxPage] = useState(1)
    const currentYear = new Date().getFullYear()

    // Queries
    const { data: summary } = useSummary(isLoggedIn)
    const { data: categorySummary, isLoading: categorySummaryLoading } = useCategorySummary(isLoggedIn)
    const { data: chartData, isLoading: chartLoading } = useChartData(chartView, currentYear, isLoggedIn)
    const { data: budgets, isLoading: budgetsLoading } = useBudgets(undefined, undefined, isLoggedIn)
    
    const {
        data: txData,
        isLoading: txLoading,
    } = useTransactions(txPage, 10, undefined, isLoggedIn)
    
    const transactions = txData?.data ?? []
    const txPagination = txData?.pagination
    
    const { 
        data: catData, 
        isLoading: catLoading, 
    } = useCategories(1, 100, isLoggedIn)
    
    const categories = catData?.data ?? []

    // Mutations
    const { removeTransaction } = useTransactionMutations()
    const { removeCategory } = useCategoryMutations()

    const handleDeleteTransaction = async (id: number) => {
        if (confirm("Apakah anda yakin ingin menghapus transaksi ini?")) {
            await removeTransaction.mutateAsync(id)
        }
    }

    const handleDeleteCategory = async (id: number) => {
        if (confirm("Menghapus kategori mungkin akan berdampak pada data transaksi yang menggunakan kategori ini. Lanjutkan?")) {
            await removeCategory.mutateAsync(id)
        }
    }

    const renderDashboard = () => (
        <>
            <PageHeader 
                title="Dashboard Overview"
                description="Analisa data keuangan anda dalam satu tampilan"
                action={
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2">
                                <Settings2 className="h-3.5 w-3.5" />
                                <span>Tampilan: {chartView === 'daily' ? 'Harian' : chartView === 'weekly' ? 'Mingguan' : 'Bulanan'}</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px] rounded-xl">
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
                                    <Button variant="default" className="px-8">
                                        Selesai
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
            />

            <BalanceCard 
                totalIncome={summary?.total_pemasukan ?? 0}
                totalExpense={summary?.total_pengeluaran ?? 0}
                className="mb-6 shadow-emerald-500/10"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatsCard
                    title="Pemasukan"
                    description="Kelola data pemasukan anda"
                    value={formatRupiah(summary?.total_pemasukan ?? 0)}
                    chart={<OverviewChart type="pemasukan" data={chartData ?? []} loading={chartLoading} viewLabel={chartView === 'daily' ? 'Harian' : chartView === 'weekly' ? 'Mingguan' : 'Bulanan'} />}
                    action={
                        <Button 
                            variant="default" 
                            size="lg" 
                            className="w-full"
                            onClick={() => openTransactionDialog("pemasukan")}
                        >
                            Tambah Pemasukan
                        </Button>
                    }
                />

                <StatsCard
                    title="Pengeluaran"
                    description="Kelola data pengeluaran anda"
                    value={formatRupiah(summary?.total_pengeluaran ?? 0)}
                    chart={<OverviewChart type="pengeluaran" data={chartData ?? []} loading={chartLoading} viewLabel={chartView === 'daily' ? 'Harian' : chartView === 'weekly' ? 'Mingguan' : 'Bulanan'} />}
                    action={
                        <Button 
                            variant="default" 
                            size="lg" 
                            className="w-full"
                            onClick={() => openTransactionDialog("pengeluaran")}
                        >
                            Tambah Pengeluaran
                        </Button>
                    }
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="md:col-span-2">
                    <BudgetTracker budgets={budgets ?? []} loading={budgetsLoading} />
                </div>
                <div>
                    <CategoryDonutChart data={categorySummary ?? []} loading={categorySummaryLoading} />
                </div>
            </div>

            <div className="mt-8">
                <TransactionTable
                    transactions={transactions}
                    loading={txLoading}
                    pagination={txPagination ?? null}
                    onPageChange={setTxPage}
                    onEdit={(tx) => openTransactionDialog(tx.type as any, tx)}
                    onDelete={handleDeleteTransaction}
                />
            </div>
        </>
    )

    const renderCategories = () => (
        <div className="space-y-6">
            <PageHeader 
                title="Master Data Kategori"
                description="Kelola pengelompokan transaksi anda"
                action={
                    <Button 
                        variant="default" 
                        size="lg" 
                        className="w-full"
                        onClick={() => openCategoryDialog()}
                    >
                        Tambah Kategori
                    </Button>
                }
            />

            <CategoryTable 
                categories={categories} 
                budgets={budgets ?? []}
                loading={catLoading} 
                onDelete={handleDeleteCategory}
                onEdit={(cat) => openCategoryDialog(cat)}
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
                            pagination={txPagination ?? null}
                            onPageChange={setTxPage}
                            onEdit={(tx) => openTransactionDialog(tx.type as any, tx)}
                            onDelete={handleDeleteTransaction}
                        />
                    </div>
                )
            case "settings":
                return (
                    <div className="flex items-center justify-center py-20 bg-card rounded-xl border border-dashed">
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
                
                <main>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentView}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Unified Global Dialogs */}
                <TransactionDialog categories={categories} />
                <CategoryDialog />
            </div>
        </div>
    )
}

export default App
