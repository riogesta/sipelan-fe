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
import { Trash2, Edit2 } from "lucide-react"
import type { Transaction, Pagination as PaginationType } from "@/lib/types"
import { formatRupiah, formatDate } from "@/lib/format"

function createColumns(
    onEdit?: (transaction: Transaction) => void,
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
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
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
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
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
                        className={`font-semibold text-sm ${
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
        ...(onEdit || onDelete
            ? [
                  {
                      id: "actions",
                      header: "",
                      cell: ({ row }: { row: { original: Transaction } }) => (
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
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
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
    onEdit?: (transaction: Transaction) => void
    onDelete?: (id: number) => void
}

import { Skeleton } from "@/components/shared/skeleton"

import { TransactionCard } from "./transaction-card"

export function TransactionTable({
    transactions,
    loading,
    pagination,
    onPageChange,
    onEdit,
    onDelete,
}: TransactionTableProps) {
    const columns = createColumns(onEdit, onDelete)

    if (loading) {
        return (
            <div className="w-full space-y-3">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-32 mx-1" />
                </div>
                {/* Skeleton for Desktop */}
                <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
                    <div className="h-10 bg-muted/50 border-b flex items-center px-4 gap-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 flex-1" />
                        ))}
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-14 border-b flex items-center px-4 gap-4">
                            {Array.from({ length: 5 }).map((_, j) => (
                                <Skeleton key={j} className="h-4 flex-1" />
                            ))}
                        </div>
                    ))}
                </div>
                {/* Skeleton for Mobile */}
                <div className="md:hidden space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-card p-4 rounded-xl border-none shadow-sm space-y-3">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-2xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const currentPage = pagination?.page || 1
    const totalPages = pagination?.total_pages || 1

    return (
        <div className="w-full space-y-3">
            <h2 className="text-xs font-bold mx-1 text-muted-foreground uppercase tracking-widest opacity-80">
                Riwayat Transaksi
            </h2>
            
            {/* Desktop View */}
            <div className="hidden md:block">
                <DataTable columns={columns} data={transactions} />
            </div>

            {/* Mobile View */}
            <div className="md:hidden flex flex-col gap-3">
                {transactions.length > 0 ? (
                    transactions.map((tx) => (
                        <TransactionCard 
                            key={tx.id} 
                            transaction={tx} 
                            onEdit={onEdit} 
                            onDelete={onDelete} 
                        />
                    ))
                ) : (
                    <div className="bg-card border-2 border-dashed rounded-xl p-8 text-center text-sm text-muted-foreground">
                        Belum ada data transaksi.
                    </div>
                )}
            </div>
            
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
