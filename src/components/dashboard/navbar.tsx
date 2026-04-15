import { LayoutDashboard, ArrowRightLeft, Settings, Database, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export type ViewType = "dashboard" | "transactions" | "categories" | "settings"

interface NavLinkProps {
    active?: boolean
    onClick: () => void
    children: React.ReactNode
}

function NavLink({
    active,
    onClick,
    children,
}: NavLinkProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "inline-flex h-9 items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                active 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
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
    return (
        <nav className="sticky top-0 z-50 flex h-14 items-center justify-between rounded-lg border bg-card/80 backdrop-blur-md px-4 mb-6 shadow-sm">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
                Sipelan
            </h1>

            <div className="flex items-center gap-1">
                <NavLink 
                    active={activeView === "dashboard"} 
                    onClick={() => onViewChange("dashboard")}
                >
                    <LayoutDashboard className="mr-1.5 h-4 w-4" />
                    Dashboard
                </NavLink>
                <NavLink 
                    active={activeView === "categories"} 
                    onClick={() => onViewChange("categories")}
                >
                    <Database className="mr-1.5 h-4 w-4" />
                    Kategori
                </NavLink>
                <NavLink 
                    active={activeView === "transactions"} 
                    onClick={() => onViewChange("transactions")}
                >
                    <ArrowRightLeft className="mr-1.5 h-4 w-4" />
                    Transaksi
                </NavLink>
                <NavLink 
                    active={activeView === "settings"} 
                    onClick={() => onViewChange("settings")}
                >
                    <Settings className="mr-1.5 h-4 w-4" />
                    Pengaturan
                </NavLink>

                <div className="mx-1 h-5 w-px bg-border" />

                <ThemeToggle />
                
                <button
                    onClick={() => {
                        localStorage.removeItem("sipelan-token")
                        window.location.reload()
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ml-1"
                    title="Logout"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </nav>
    )
}
