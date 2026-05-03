import { cn } from "@/lib/utils"

interface PageHeaderProps {
    title: string
    description: string
    action?: React.ReactNode
    className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
    return (
        <div className={cn("flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm mb-6", className)}>
            <div className="space-y-0.5">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">{title}</h2>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            {action && (
                <div className="flex items-center gap-2">
                    {action}
                </div>
            )}
        </div>
    )
}
