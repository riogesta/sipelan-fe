import { useEffect } from "react"
import { Loader2, Target } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/shared/currency-input"
import { type CategoryInput, categorySchema } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useBudgets, useBudgetMutation, useCategoryMutations } from "@/services/query-hooks"
import { useUIStore } from "@/store/ui-store"

const formSchema = categorySchema.extend({
    budget_amount: z.string(),
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

export function CategoryDialog() {
    const { isOpen, data: category, close } = useUIStore((state) => state.categoryDialog)
    const { addCategory, editCategory } = useCategoryMutations()
    
    const isEditing = !!category
    const title = isEditing ? "Edit Kategori" : "Tambah Kategori"
    const description = isEditing
        ? "Perbarui detail kategori dan anggaran di sini."
        : "Masukan detail kategori baru dan anggaran bulanan anda."

    const { data: budgetData } = useBudgets(undefined, undefined, isOpen && isEditing)
    const budgetMutation = useBudgetMutation()

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            budget_amount: "",
        },
    })

    useEffect(() => {
        if (isOpen) {
            if (category) {
                reset({
                    name: category.name,
                    description: category.description || "",
                    budget_amount: "",
                })
                
                if (budgetData) {
                    const currentBudget = budgetData.find(b => b.category_id === category.id)
                    if (currentBudget) {
                        setValue("budget_amount", currentBudget.amount.toString())
                    }
                }
            } else {
                reset({
                    name: "",
                    description: "",
                    budget_amount: "",
                })
            }
        }
    }, [isOpen, category, budgetData, reset, setValue])

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            const input: CategoryInput = {
                name: data.name.trim(),
                description: data.description?.trim() || "",
            }

            let categoryId = category?.id

            if (isEditing && category) {
                await editCategory.mutateAsync({ id: category.id, input })
            } else {
                const res = await addCategory.mutateAsync(input)
                categoryId = res?.data?.id
            }

            // Handle Budget
            if (categoryId) {
                await budgetMutation.mutateAsync({ 
                    category_id: categoryId,
                    amount: data.budget_amount ? parseFloat(data.budget_amount) : 0
                })
            }

            reset()
            close()
        } catch (err) {
            console.error("Failed to save category", err)
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
                        className="p-8 pt-2 pb-8 grid gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div className="grid grid-cols-4 items-center gap-6" variants={itemVariants}>
                            <label
                                htmlFor="name"
                                className={cn(
                                    "text-right text-sm font-semibold text-muted-foreground",
                                    errors.name && "text-destructive"
                                )}
                            >
                                Nama
                            </label>
                            <div className="col-span-3">
                                <input
                                    id="name"
                                    type="text"
                                    {...register("name")}
                                    className={cn(
                                        "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-none",
                                        errors.name && "border-destructive text-destructive bg-destructive/5"
                                    )}
                                    placeholder="Contoh: Makanan, Transportasi"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div className="grid grid-cols-4 items-center gap-6" variants={itemVariants}>
                            <label
                                htmlFor="budget_amount"
                                className="text-right text-sm font-semibold text-muted-foreground"
                            >
                                <Target className="inline-block mr-1 h-3.5 w-3.5" /> Budget
                            </label>
                            <div className="col-span-3">
                                <Controller
                                    name="budget_amount"
                                    control={control}
                                    render={({ field }) => (
                                        <CurrencyInput
                                            id="budget_amount"
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Target bulanan"
                                            className="h-11 rounded-xl shadow-none"
                                        />
                                    )}
                                />
                            </div>
                        </motion.div>

                        <motion.div className="grid grid-cols-4 items-start gap-6" variants={itemVariants}>
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
                                {...register("description")}
                            />
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
                        <Button type="submit" size="lg" disabled={isSubmitting} className="px-8 min-w-[120px]">
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
