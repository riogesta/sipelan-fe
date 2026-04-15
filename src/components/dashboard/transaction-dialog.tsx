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
        ? "Masukan detail pemasukan baru anda di sini. Klik simpan jika sudah selesai."
        : "Masukan detail pengeluaran baru anda di sini. Klik simpan jika sudah selesai."
    const buttonText = isIncome ? "Tambah Pemasukan" : "Tambah Pengeluaran"

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState("")
    const [desc, setDesc] = useState("")
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [categoryId, setCategoryId] = useState<number>(0)
    const [error, setError] = useState<string | null>(null)

    const resetForm = () => {
        setAmount("")
        setDesc("")
        setDate(new Date())
        setCategoryId(0)
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const total = parseFloat(amount)
        if (!total || total <= 0) {
            setError("Jumlah harus lebih dari 0")
            return
        }

        if (!desc.trim()) {
            setError("Keterangan tidak boleh kosong")
            return
        }

        if (!categoryId) {
            setError("Pilih kategori terlebih dahulu")
            return
        }

        if (!date) {
            setError("Pilih tanggal terlebih dahulu")
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
                <Button variant="default" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            className="text-right text-sm font-medium"
                        >
                            Tanggal
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "col-span-3 justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? (
                                        format(date, "PPP", { locale: id })
                                    ) : (
                                        <span>Pilih tanggal</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    locale={id}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="category"
                            className="text-right text-sm font-medium"
                        >
                            Kategori
                        </label>
                        <select
                            id="category"
                            value={categoryId}
                            onChange={(e) =>
                                setCategoryId(Number(e.target.value))
                            }
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value={0}>Pilih kategori...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="amount"
                            className="text-right text-sm font-medium"
                        >
                            Jumlah
                        </label>
                        <input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Rp 0"
                            min="1"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="description"
                            className="text-right text-sm font-medium content-start"
                        >
                            Keterangan
                        </label>
                        <Textarea
                            className="col-span-3"
                            id="description"
                            placeholder="Contoh: Gaji Bulanan"
                            rows={4}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>
                    <DialogFooter className="mt-5">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={loading}
                            >
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
