import { useState } from "react"
import { Plus, Loader2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/ui/currency-input"
import type { Category, Transaction, TransactionInput } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TransactionDialogProps {
    type: "income" | "expense"
    categories: Category[]
    onCreated?: () => void
    addTransaction: (input: TransactionInput) => Promise<Transaction>
}

export function TransactionDialog({
    type,
    categories,
    onCreated,
    addTransaction,
}: TransactionDialogProps) {
    const isIncome = type === "income"
    const title = isIncome ? "Tambah Pemasukan" : "Tambah Pengeluaran"
    const description = isIncome
        ? "Masukan detail pemasukan baru anda di sini."
        : "Masukan detail pengeluaran baru anda di sini."
    const buttonText = isIncome ? "Tambah Pemasukan" : "Tambah Pengeluaran"

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState("")
    const [desc, setDesc] = useState("")
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [categoryId, setCategoryId] = useState<number>(0)
    const [error, setError] = useState<string | null>(null)
    const [errorFields, setErrorFields] = useState<string[]>([])

    const resetForm = () => {
        setAmount("")
        setDesc("")
        setDate(new Date())
        setCategoryId(0)
        setError(null)
        setErrorFields([])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setErrorFields([])
        const newErrorFields: string[] = []

        const total = parseFloat(amount)
        if (!total || total <= 0) {
            setError("Jumlah harus lebih dari 0")
            newErrorFields.push("amount")
            setErrorFields(newErrorFields)
            return
        }

        if (!desc.trim()) {
            setError("Keterangan tidak boleh kosong")
            newErrorFields.push("description")
            setErrorFields(newErrorFields)
            return
        }

        if (!categoryId) {
            setError("Pilih kategori terlebih dahulu")
            newErrorFields.push("category")
            setErrorFields(newErrorFields)
            return
        }

        if (!date) {
            setError("Pilih tanggal terlebih dahulu")
            newErrorFields.push("date")
            setErrorFields(newErrorFields)
            return
        }

        try {
            setLoading(true)
            await addTransaction({
                date: date.toISOString(),
                category_id: categoryId,
                description: desc.trim(),
                total,
                type: isIncome ? "pemasukan" : "pengeluaran",
            })
            resetForm()
            setOpen(false)
            onCreated?.()
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Gagal menyimpan transaksi"
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
                if (!v) resetForm()
            }}
        >
            <DialogTrigger asChild>
                <Button variant="default" className="w-full h-10 rounded-xl">
                    <Plus className="mr-2 h-4 w-4" /> {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]" showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                    <div className="p-8 pt-4 pb-10 grid gap-6 bg-background">
                        {error && (
                            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20 font-medium animate-in fade-in zoom-in-95 duration-200">
                                {error}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-4 items-center gap-6">
                            <label className="text-right text-sm font-semibold text-muted-foreground">
                                Tanggal
                            </label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "col-span-3 justify-start text-left font-normal h-11 rounded-xl shadow-none bg-muted/40 border-input hover:bg-muted/60 transition-colors",
                                            !date && "text-muted-foreground",
                                            errorFields.includes("date") && "border-destructive text-destructive bg-destructive/5"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                        {date ? (
                                            format(date, "PPP", { locale: id })
                                        ) : (
                                            <span>Pilih tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => {
                                            setDate(d)
                                            if (d) setErrorFields(prev => prev.filter(f => f !== "date"))
                                        }}
                                        initialFocus
                                        locale={id}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-6">
                            <label
                                htmlFor="category"
                                className={cn(
                                    "text-right text-sm font-semibold text-muted-foreground",
                                    errorFields.includes("category") && "text-destructive"
                                )}
                            >
                                Kategori
                            </label>
                            <select
                                id="category"
                                value={categoryId}
                                onChange={(e) => {
                                    const val = Number(e.target.value)
                                    setCategoryId(val)
                                    if (val !== 0) setErrorFields(prev => prev.filter(f => f !== "category"))
                                }}
                                className={cn(
                                    "col-span-3 flex h-11 w-full rounded-xl border border-input bg-muted/40 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none transition-all shadow-none",
                                    errorFields.includes("category") && "border-destructive text-destructive bg-destructive/5"
                                )}
                            >
                                <option value={0}>Pilih kategori...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-6">
                            <label
                                htmlFor="amount"
                                className={cn(
                                    "text-right text-sm font-semibold text-muted-foreground",
                                    errorFields.includes("amount") && "text-destructive"
                                )}
                            >
                                Jumlah
                            </label>
                            <div className="col-span-3">
                                <CurrencyInput
                                    id="amount"
                                    value={amount}
                                    onChange={(val) => {
                                        setAmount(val)
                                        if (parseFloat(val) > 0) setErrorFields(prev => prev.filter(f => f !== "amount"))
                                    }}
                                    error={errorFields.includes("amount")}
                                    placeholder="0"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-start gap-6">
                            <label
                                htmlFor="description"
                                className={cn(
                                    "text-right text-sm font-semibold text-muted-foreground pt-3",
                                    errorFields.includes("description") && "text-destructive"
                                )}
                            >
                                Keterangan
                            </label>
                            <Textarea
                                className={cn(
                                    "col-span-3 rounded-xl border-input shadow-none min-h-[100px] bg-muted/40 transition-all",
                                    errorFields.includes("description") && "border-destructive text-destructive bg-destructive/5"
                                )}
                                id="description"
                                placeholder="Tulis catatan di sini..."
                                value={desc}
                                onChange={(e) => {
                                    setDesc(e.target.value)
                                    if (e.target.value.trim()) setErrorFields(prev => prev.filter(f => f !== "description"))
                                }}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={loading}
                                className="rounded-xl px-6 h-10"
                            >
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading} className="rounded-xl px-8 min-w-[120px] h-10 shadow-md">
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
