import { useEffect, useState } from "react"
import { Plus, Loader2 } from "lucide-react"
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
import type { Category, CategoryInput } from "@/lib/types"

interface CategoryDialogProps {
    category?: Category
    onCreated?: () => void
    addCategory: (input: CategoryInput) => Promise<Category>
    editCategory: (id: number, input: CategoryInput) => Promise<Category>
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
        ? "Perbarui detail kategori di sini. Klik simpan jika sudah selesai."
        : "Masukan detail kategori baru anda di sini. Klik simpan jika sudah selesai."

    const [internalOpen, setInternalOpen] = useState(false)
    const open = externalOpen !== undefined ? externalOpen : internalOpen
    const setOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen

    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [descriptionText, setDescriptionText] = useState("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (category) {
            setName(category.name)
            setDescriptionText(category.description || "")
        } else {
            resetForm()
        }
    }, [category, open])

    const resetForm = () => {
        setName("")
        setDescriptionText("")
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!name.trim()) {
            setError("Nama kategori tidak boleh kosong")
            return
        }

        try {
            setLoading(true)
            const input: CategoryInput = {
                name: name.trim(),
                description: descriptionText.trim(),
            }

            if (isEditing && category) {
                await editCategory(category.id, input)
            } else {
                await addCategory(input)
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
                            htmlFor="name"
                            className="text-right text-sm font-medium"
                        >
                            Nama
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Contoh: Makanan, Transportasi"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="description"
                            className="text-right text-sm font-medium content-start"
                        >
                            Deskripsi
                        </label>
                        <Textarea
                            className="col-span-3"
                            id="description"
                            placeholder="Keterangan tambahan (opsional)"
                            rows={4}
                            value={descriptionText}
                            onChange={(e) => setDescriptionText(e.target.value)}
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
