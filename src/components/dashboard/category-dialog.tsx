import { useEffect, useState } from "react"
import { Plus, Loader2, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/ui/currency-input"
import type { Category, CategoryInput } from "@/lib/types"
import { cn } from "@/lib/utils"
import { setBudget, getBudgetSummary } from "@/lib/api"

interface CategoryDialogProps {
    category?: Category
    onCreated?: () => void
    addCategory: (input: CategoryInput) => Promise<any>
    editCategory: (id: number, input: CategoryInput) => Promise<any>
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CategoryDialog({
    category,
    onCreated,
    addCategory,
    editCategory,
    trigger,
    open: externalOpen,
    onOpenChange: externalOnOpenChange,
}: CategoryDialogProps) {
    const isEditing = !!category
    const title = isEditing ? "Edit Kategori" : "Tambah Kategori"
    const description = isEditing
        ? "Perbarui detail kategori dan anggaran di sini."
        : "Masukan detail kategori baru dan anggaran bulanan anda."

    const [internalOpen, setInternalOpen] = useState(false)
    const open = externalOpen !== undefined ? externalOpen : internalOpen
    const setOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen

    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [descriptionText, setDescriptionText] = useState("")
    const [budgetAmount, setBudgetAmount] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [errorFields, setErrorFields] = useState<string[]>([])

    useEffect(() => {
        const fetchCurrentBudget = async () => {
            if (category && open) {
                setName(category.name)
                setDescriptionText(category.description || "")
                
                try {
                    const res = await getBudgetSummary()
                    const currentBudget = res.data?.find(b => b.category_id === category.id)
                    if (currentBudget) {
                        setBudgetAmount(currentBudget.amount.toString())
                    }
                } catch (err) {
                    console.error("Failed to fetch budget", err)
                }
            } else if (!open) {
                resetForm()
            }
        }
        
        fetchCurrentBudget()
    }, [category, open])

    const resetForm = () => {
        setName("")
        setDescriptionText("")
        setBudgetAmount("")
        setError(null)
        setErrorFields([])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setErrorFields([])

        if (!name.trim()) {
            setError("Nama kategori tidak boleh kosong")
            setErrorFields(["name"])
            return
        }

        try {
            setLoading(true)
            const input: CategoryInput = {
                name: name.trim(),
                description: descriptionText.trim(),
            }

            let categoryId = category?.id

            if (isEditing && category) {
                await editCategory(category.id, input)
            } else {
                const res = await addCategory(input)
                categoryId = res?.id
            }

            // Handle Budget
            if (categoryId && budgetAmount) {
                await setBudget({
                    category_id: categoryId,
                    amount: parseFloat(budgetAmount)
                })
            }

            resetForm()
            setOpen(false)
            onCreated?.()
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Gagal menyimpan kategori"
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v)
                if (!v && !isEditing) resetForm()
            }}
        >
            {trigger ? (
                <DialogTrigger asChild>{trigger}</DialogTrigger>
            ) : !isEditing ? (
                <DialogTrigger asChild>
                    <Button variant="default" className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
                    </Button>
                </DialogTrigger>
            ) : null}
            <DialogContent className="sm:max-w-[480px]" showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="p-8 pt-2 pb-8 grid gap-6">
                        {error && (
                            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20 font-medium">
                                {error}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-4 items-center gap-6">
                            <label
                                htmlFor="name"
                                className={cn(
                                    "text-right text-sm font-semibold text-muted-foreground",
                                    errorFields.includes("name") && "text-destructive"
                                )}
                            >
                                Nama
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    if (e.target.value.trim()) setErrorFields(prev => prev.filter(f => f !== "name"))
                                }}
                                className={cn(
                                    "col-span-3 flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-none",
                                    errorFields.includes("name") && "border-destructive text-destructive bg-destructive/5"
                                )}
                                placeholder="Contoh: Makanan, Transportasi"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-6">
                            <label
                                htmlFor="budget"
                                className="text-right text-sm font-semibold text-muted-foreground"
                            >
                                Budget
                            </label>
                            <div className="col-span-3">
                                <CurrencyInput
                                    id="budget"
                                    value={budgetAmount}
                                    onChange={setBudgetAmount}
                                    placeholder="Target bulanan"
                                    className="h-11 rounded-xl shadow-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-start gap-6">
                            <label
                                htmlFor="description"
                                className="text-right text-sm font-semibold text-muted-foreground pt-3"
                            >
                                Deskripsi
                            </label>
                            <Textarea
                                className="col-span-3 rounded-xl border-input shadow-none min-h-[100px]"
                                id="description"
                                placeholder="Keterangan tambahan (opsional)"
                                value={descriptionText}
                                onChange={(e) => setDescriptionText(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={loading}
                                className="rounded-xl px-6"
                            >
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading} className="rounded-xl px-8 min-w-[120px]">
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Simpan"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
