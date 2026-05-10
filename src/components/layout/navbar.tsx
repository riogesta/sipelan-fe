import { LayoutDashboard, ArrowRightLeft, Settings, Database, LogOut, Menu, Eye, EyeOff } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { logout } from "@/services/api"
import { useUIStore } from "@/store/ui-store"

export type ViewType = "dashboard" | "transactions" | "categories" | "settings"

interface NavLinkProps {
    active?: boolean
    onClick: () => void
    children: React.ReactNode
    className?: string
}

function NavLink({
    active,
    onClick,
    children,
    className
}: NavLinkProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "inline-flex h-9 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                active 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                className
            )}
        >
            {children}
        </button>
    )
}

interface NavbarProps {
    activeView: ViewType
    onViewChange: (view: ViewType) => void
}

export function Navbar({ activeView, onViewChange }: NavbarProps) {
    const [open, setOpen] = useState(false)
    const { privacyMode, togglePrivacyMode } = useUIStore()

    const handleViewChange = (view: ViewType) => {
        onViewChange(view)
        setOpen(false)
    }

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "categories", label: "Kategori", icon: Database },
        { id: "transactions", label: "Transaksi", icon: ArrowRightLeft },
        { id: "settings", label: "Pengaturan", icon: Settings },
    ] as const

    return (
        <nav className="sticky top-0 z-50 flex h-16 items-center justify-between rounded-2xl border border-white/20 bg-card/60 backdrop-blur-xl px-5 mb-8 shadow-lg shadow-black/5 dark:shadow-white/5">
            <div className="flex items-center gap-4">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                <SheetContent side="left" className="w-[240px] sm:w-[280px] p-4 rounded-r-xl">
                        <SheetHeader className="mb-4">
                            <SheetTitle className="text-left text-base">Sipelan Menu</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.id}
                                    active={activeView === item.id}
                                    onClick={() => handleViewChange(item.id)}
                                    className="justify-start px-3 h-10 text-sm"
                                >
                                    <item.icon className="mr-2.5 h-4 w-4" />
                                    {item.label}
                                </NavLink>
                            ))}
                            <div className="my-2 h-px bg-border" />
                            <button
                                onClick={togglePrivacyMode}
                                className="inline-flex h-10 items-center justify-start rounded-xl px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-foreground/80 cursor-pointer"
                            >
                                {privacyMode ? (
                                    <EyeOff className="mr-2.5 h-4 w-4" />
                                ) : (
                                    <Eye className="mr-2.5 h-4 w-4" />
                                )}
                                {privacyMode ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
                            </button>
                            <button
                                onClick={() => logout()}
                                className="inline-flex h-10 items-center justify-start rounded-xl px-3 text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive text-foreground/80 cursor-pointer"
                            >
                                <LogOut className="mr-2.5 h-4 w-4" />
                                Keluar
                            </button>
                        </div>
                    </SheetContent>
                </Sheet>

                <h1 className="text-lg font-bold tracking-tight text-foreground">
                    Sipelan
                </h1>
            </div>

            <div className="flex items-center gap-1">
                <div className="hidden md:flex items-center gap-1 mr-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.id}
                            active={activeView === item.id}
                            onClick={() => onViewChange(item.id)}
                        >
                            <item.icon className="mr-1.5 h-4 w-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div className="hidden md:block mx-1 h-5 w-px bg-border" />

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePrivacyMode}
                    className="h-9 w-9 rounded-xl text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                    title={privacyMode ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
                >
                    {privacyMode ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </Button>

                <ThemeToggle />
                
                <button
                    onClick={() => logout()}
                    className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ml-1"
                    title="Logout"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </nav>
    )
}
