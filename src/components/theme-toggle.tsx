import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    const cycleTheme = () => {
        if (theme === "light") setTheme("dark")
        else if (theme === "dark") setTheme("system")
        else setTheme("light")
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className="h-9 w-9 rounded-md"
            title={
                theme === "light"
                    ? "Mode Terang"
                    : theme === "dark"
                      ? "Mode Gelap"
                      : "Ikuti Sistem"
            }
        >
            {theme === "light" && (
                <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
            )}
            {theme === "dark" && (
                <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
            )}
            {theme === "system" && (
                <Monitor className="h-[1.2rem] w-[1.2rem] transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
