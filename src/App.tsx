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
import { MonthlyTargetCard } from "@/features/dashboard/monthly-target-card"
import { CategoryDistributionCards } from "@/features/dashboard/category-distribution-cards"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DashboardFilterBar } from "@/features/dashboard/dashboard-filter-bar"
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
import { formatPrivacy } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { openTransactionDialog, openCategoryDialog, useUIStore } from "@/store/ui-store"

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem("sipelan-is-logged-in"))
    const [currentView, setCurrentView] = useState<ViewType>("dashboard")
    
    const [txPage, setTxPage] = useState(1)
    const currentYear = new Date().getFullYear()

    const { privacyMode, dashboardFilter } = useUIStore()
    const { view, startDate, endDate } = dashboardFilter

    // Queries
    const { data: summary } = useSummary(startDate, endDate, isLoggedIn)
    const { data: categorySummary, isLoading: categorySummaryLoading } = useCategorySummary(isLoggedIn)
    const { data: chartData, isLoading: chartLoading } = useChartData(view, startDate, endDate, currentYear, isLoggedIn)
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

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => {},
    })

    const handleDeleteTransaction = (id: number) => {
        setConfirmDialog({
            isOpen: true,
            title: "Hapus Transaksi",
            description: "Apakah anda yakin ingin menghapus transaksi ini?",
            onConfirm: async () => {
                await removeTransaction.mutateAsync(id)
                setConfirmDialog((s) => ({ ...s, isOpen: false }))
            }
        })
    }

    const handleDeleteCategory = (id: number) => {
        setConfirmDialog({
            isOpen: true,
            title: "Hapus Kategori",
            description: "Menghapus kategori mungkin akan berdampak pada data transaksi yang menggunakan kategori ini. Lanjutkan?",
            onConfirm: async () => {
                await removeCategory.mutateAsync(id)
                setConfirmDialog((s) => ({ ...s, isOpen: false }))
            }
        })
    }

    const renderDashboard = () => (
        <>
            <PageHeader 
                title="Dashboard Overview"
                description="Analisa data keuangan anda dalam satu tampilan"
            />

            <DashboardFilterBar />

            <BalanceCard 
                totalIncome={summary?.total_pemasukan ?? 0}
                totalExpense={summary?.total_pengeluaran ?? 0}
                className="mb-6 shadow-emerald-500/10"
            />

            <div className="mb-6">
                <MonthlyTargetCard totalExpense={summary?.total_pengeluaran ?? 0} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard
                    title="Pemasukan"
                    description="Kelola data pemasukan anda"
                    value={formatPrivacy(summary?.total_pemasukan ?? 0, privacyMode)}
                    chart={<OverviewChart type="pemasukan" data={chartData ?? []} loading={chartLoading} viewLabel={view === 'daily' ? 'Harian' : view === 'weekly' ? 'Mingguan' : view === 'monthly' ? 'Bulanan' : 'Kustom'} />}
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
                    value={formatPrivacy(summary?.total_pengeluaran ?? 0, privacyMode)}
                    chart={<OverviewChart type="pengeluaran" data={chartData ?? []} loading={chartLoading} viewLabel={view === 'daily' ? 'Harian' : view === 'weekly' ? 'Mingguan' : view === 'monthly' ? 'Bulanan' : 'Kustom'} />}
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

            <div className="mt-6">
                <BudgetTracker budgets={budgets ?? []} loading={budgetsLoading} />
            </div>

            <div className="mt-6">
                <CategoryDistributionCards data={categorySummary ?? []} loading={categorySummaryLoading} />
            </div>

            <div className="mt-6">
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
                
                <ConfirmDialog
                    open={confirmDialog.isOpen}
                    title={confirmDialog.title}
                    description={confirmDialog.description}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog((s) => ({ ...s, isOpen: false }))}
                    variant="destructive"
                />
            </div>
        </div>
    )
}

export default App
