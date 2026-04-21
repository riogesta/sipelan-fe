import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, Edit2 } from "lucide-react"
import type { Category } from "@/lib/types"
import { formatDate } from "@/lib/format"

function createColumns(
    onEdit?: (category: Category) => void,
    onDelete?: (id: number) => void
): ColumnDef<Category>[] {
    return [
        {
            accessorKey: "name",
            header: "Nama Kategori",
            cell: ({ row }) => (
                <div className="font-semibold text-xs text-foreground">
                    {row.original.name}
                </div>
            ),
        },
        {
            accessorKey: "description",
            header: "Deskripsi",
            cell: ({ row }) => (
                <div className="text-muted-foreground text-[11px] max-w-[300px] truncate">
                    {row.original.description || "-"}
                </div>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Dibuat Pada",
            cell: ({ row }) => formatDate(row.original.created_at),
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: Category } }) => (
                <div className="flex justify-end gap-2">
                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => onEdit(row.original)}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete(row.original.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ]
}

interface DataTableProps {
    columns: ColumnDef<Category>[]
    data: Category[]
}

function DataTable({ columns, data }: DataTableProps) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className="font-bold text-foreground text-sm px-4"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="px-4">
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center text-muted-foreground"
                            >
                                Belum ada data kategori.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

interface CategoryTableProps {
    categories: Category[]
    loading: boolean
    onEdit?: (category: Category) => void
    onDelete?: (id: number) => void
}

export function CategoryTable({
    categories,
    loading,
    onEdit,
    onDelete,
}: CategoryTableProps) {
    const columns = createColumns(onEdit, onDelete)

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                    Memuat kategori...
                </span>
            </div>
        )
    }

    return (
        <div className="w-full space-y-3">
            <h2 className="text-sm font-bold mb-3 mx-1 text-foreground uppercase tracking-wider opacity-80">
                Master Data Kategori
            </h2>
            <DataTable columns={columns} data={categories} />
        </div>
    )
}
