import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
    title: string
    description: string
    confirmText?: string
    variant?: "default" | "destructive"
}

export function ConfirmDialog({
    open,
    onConfirm,
    onCancel,
    title,
    description,
    confirmText = "Konfirmasi",
    variant = "default",
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Batal
                    </Button>
                    <Button 
                        variant={variant} 
                        onClick={() => {
                            onConfirm()
                        }}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
