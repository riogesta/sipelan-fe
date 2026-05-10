import { useEffect, useRef } from "react"
import { Loader2, CalendarIcon, Upload, FileText, X } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useForm, Controller } from "react-hook-form"
import type { SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/shared/currency-input"
import { type Category, type TransactionInput, transactionSchema } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useUploadMutation, useTransactionMutations } from "@/services/query-hooks"
import { useUIStore } from "@/store/ui-store"

interface TransactionDialogProps {
    categories: Category[]
}

const formSchema = transactionSchema.omit({ total: true }).extend({
    total_str: z.string().min(1, "Jumlah wajib diisi").refine((val) => parseFloat(val) > 0, {
        message: "Jumlah harus lebih dari 0",
    }),
})

type FormValues = z.infer<typeof formSchema>

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
}

export function TransactionDialog({ categories }: TransactionDialogProps) {
    const { isOpen, data: transaction, type: propType, close } = useUIStore((state) => state.transactionDialog)
    const { addTransaction, editTransaction } = useTransactionMutations()
    
    const isEditing = !!transaction
    const currentType = isEditing ? transaction?.type : (propType || "pengeluaran")
    const isIncome = currentType === "pemasukan"
    const title = isEditing ? "Edit Transaksi" : (isIncome ? "Tambah Pemasukan" : "Tambah Pengeluaran")
    const description = isEditing 
        ? "Perbarui detail transaksi anda di sini."
        : (isIncome ? "Masukan detail pemasukan baru anda di sini." : "Masukan detail pengeluaran baru anda di sini.")

    const fileInputRef = useRef<HTMLInputElement>(null)
    const uploadMutation = useUploadMutation()

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString(),
            description: "",
            total_str: "",
            type: isIncome ? "pemasukan" : "pengeluaran",
            category_id: 0,
            attachment: "",
        },
    })

    const attachmentUrl = watch("attachment")

    useEffect(() => {
        if (isOpen) {
            if (isEditing && transaction) {
                reset({
                    date: transaction.date,
                    description: transaction.description,
                    total_str: transaction.total.toString(),
                    type: transaction.type,
                    category_id: transaction.category_id,
                    attachment: transaction.attachment || "",
                })
            } else {
                reset({
                    date: new Date().toISOString(),
                    description: "",
                    total_str: "",
                    type: isIncome ? "pemasukan" : "pengeluaran",
                    category_id: 0,
                    attachment: "",
                })
            }
        }
    }, [isOpen, isEditing, transaction, reset, isIncome])

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            const input: TransactionInput = {
                date: data.date,
                category_id: Number(data.category_id),
                description: data.description.trim(),
                total: parseFloat(data.total_str),
                type: isIncome ? "pemasukan" : "pengeluaran",
                attachment: data.attachment || "",
            }

            if (isEditing && transaction) {
                await editTransaction.mutateAsync({ id: transaction.id, input })
            } else {
                await addTransaction.mutateAsync(input)
            }

            reset()
            close()
        } catch (err) {
            console.error("Failed to save transaction", err)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const res = await uploadMutation.mutateAsync(file)
            setValue("attachment", res.data.url)
        } catch (err) {
            console.error("Upload failed", err)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
            <DialogContent className="sm:max-w-[480px] rounded-xl" showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    <motion.div 
                        className="p-8 pt-4 pb-10 grid gap-6 bg-background overflow-y-auto max-h-[70vh]"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div className="grid grid-cols-4 items-center gap-6" variants={itemVariants}>
                            <label className={cn(
                                "text-right text-sm font-semibold text-muted-foreground",
                                errors.date && "text-destructive"
                            )}>
                                Tanggal
                            </label>
                            <div className="col-span-3">
                                <Controller
                                    name="date"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal h-11 rounded-xl shadow-none bg-muted/40 border-input hover:bg-muted/60 transition-colors",
                                                        !field.value && "text-muted-foreground",
                                                        errors.date && "border-destructive text-destructive bg-destructive/5"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                                    {field.value ? (
                                                        format(new Date(field.value), "PPP", { locale: id })
                                                    ) : (
                                                        <span>Pilih tanggal</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(d) => field.onChange(d?.toISOString())}
                                                    initialFocus
                                                    locale={id}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.date && (
                                    <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div className="grid grid-cols-4 items-center gap-6" variants={itemVariants}>
                            <label
                                htmlFor="category"
                                className={cn(
                                    "text-right text-sm font-semibold text-muted-foreground",
                                    errors.category_id && "text-destructive"
                                )}
                            >
                                Kategori
                            </label>
                            <div className="col-span-3">
                                <select
                                    id="category"
                                    {...register("category_id", { valueAsNumber: true })}
                                    className={cn(
                                        "flex h-11 w-full rounded-xl border border-input bg-muted/40 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 appearance-none transition-all shadow-none",
                                        errors.category_id && "border-destructive text-destructive bg-destructive/5"
                                    )}
                                >
                                    <option value={0}>Pilih kategori...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <p className="mt-1 text-xs text-destructive">{errors.category_id.message}</p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div className="grid grid-cols-4 items-center gap-6" variants={itemVariants}>
                            <label
                                htmlFor="amount"
                                className={cn(
                                    "text-right text-sm font-semibold text-muted-foreground",
                                    errors.total_str && "text-destructive"
                                )}
                            >
                                Jumlah
                            </label>
                            <div className="col-span-3">
                                <Controller
                                    name="total_str"
                                    control={control}
                                    render={({ field }) => (
                                        <CurrencyInput
                                            id="amount"
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={!!errors.total_str}
                                            placeholder="0"
                                            className="h-11 rounded-xl"
                                        />
                                    )}
                                />
                                {errors.total_str && (
                                    <p className="mt-1 text-xs text-destructive">{errors.total_str.message}</p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div className="grid grid-cols-4 items-start gap-6" variants={itemVariants}>
                            <label
                                htmlFor="description"
                                className={cn(
                                    "text-right text-sm font-semibold text-muted-foreground pt-3",
                                    errors.description && "text-destructive"
                                )}
                            >
                                Keterangan
                            </label>
                            <div className="col-span-3">
                                <Textarea
                                    className={cn(
                                        "w-full rounded-xl border-input shadow-none min-h-[80px] bg-muted/40 transition-all",
                                        errors.description && "border-destructive text-destructive bg-destructive/5"
                                    )}
                                    id="description"
                                    placeholder="Tulis catatan di sini..."
                                    {...register("description")}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div className="grid grid-cols-4 items-center gap-6" variants={itemVariants}>
                            <label className="text-right text-sm font-semibold text-muted-foreground">
                                Bukti
                            </label>
                            <div className="col-span-3">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                />
                                {attachmentUrl ? (
                                    <div className="flex items-center gap-2 p-2 rounded-xl bg-primary/5 border border-primary/20 text-sm">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <span className="flex-1 truncate text-xs font-medium">{attachmentUrl.split('/').pop()}</span>
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 rounded-full"
                                            onClick={() => setValue("attachment", "")}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-11 rounded-xl border-dashed border-2 hover:border-primary hover:text-primary transition-all bg-muted/20"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadMutation.isPending}
                                    >
                                        {uploadMutation.isPending ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Upload className="mr-2 h-4 w-4" />
                                        )}
                                        {uploadMutation.isPending ? "Mengunggah..." : "Unggah Bukti"}
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                disabled={isSubmitting}
                                className="px-6"
                            >
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" size="lg" disabled={isSubmitting} className="px-8 min-w-[120px] shadow-md">
                            {isSubmitting ? (
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
