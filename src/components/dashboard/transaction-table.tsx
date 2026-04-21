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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import type { Transaction, Pagination as PaginationType } from "@/lib/types"
import { formatRupiah, formatDate } from "@/lib/format"

function createColumns(
    onDelete?: (id: number) => void
): ColumnDef<Transaction>[] {
    return [
        {
            accessorKey: "date",
            header: "Tanggal",
            cell: ({ row }) => formatDate(row.original.date),
        },
        {
            accessorKey: "description",
            header: "Keterangan",
        },
        {
            accessorKey: "category",
            header: "Kategori",
            cell: ({ row }) => (
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                    {row.original.category?.name ?? "-"}
                </span>
            ),
        },
        {
            accessorKey: "type",
            header: "Tipe",
            cell: ({ row }) => {
                const type = row.original.type
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                            type === "pemasukan"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                    >
                        {type === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
                    </span>
                )
            },
        },
        {
            accessorKey: "total",
            header: "Jumlah",
            cell: ({ row }) => {
                const type = row.original.type
                return (
                    <div
                        className={`font-semibold text-xs ${
                            type === "pemasukan"
                                ? "text-emerald-600"
                                : "text-red-600"
                        }`}
                    >
                        {type === "pemasukan" ? "+" : "-"}{" "}
                        {formatRupiah(row.original.total)}
                    </div>
                )
            },
        },
        ...(onDelete
            ? [
                  {
                      id: "actions",
                      header: "",
                      cell: ({ row }: { row: { original: Transaction } }) => (
                          <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => onDelete(row.original.id)}
                          >
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      ),
                  } as ColumnDef<Transaction>,
              ]
            : []),
    ]
}

interface DataTableProps {
    columns: ColumnDef<Transaction>[]
    data: Transaction[]
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
                                className="h-24 text-center"
                            >
                                Belum ada data transaksi.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

interface TransactionTableProps {
    transactions: Transaction[]
    loading: boolean
    pagination?: PaginationType | null
    onPageChange?: (page: number) => void
    onDelete?: (id: number) => void
}

export function TransactionTable({
    transactions,
    loading,
    pagination,
    onPageChange,
    onDelete,
}: TransactionTableProps) {
    const columns = createColumns(onDelete)

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">
                    Memuat transaksi...
                </span>
            </div>
        )
    }

    const currentPage = pagination?.page || 1
    const totalPages = pagination?.total_pages || 1

    return (
        <div className="w-full space-y-3">
            <h2 className="text-sm font-bold mx-1 text-foreground uppercase tracking-wider opacity-80">
                Riwayat Transaksi
            </h2>
            <DataTable columns={columns} data={transactions} />
            
            {totalPages > 1 && onPageChange && (
                <div className="flex justify-center mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage > 1) onPageChange(currentPage - 1)
                                    }}
                                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink 
                                        href="#" 
                                        isActive={page === currentPage}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            onPageChange(page)
                                        }}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage < totalPages) onPageChange(currentPage + 1)
                                    }}
                                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}
