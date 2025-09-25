'use client'

import { useState, useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Mail,
  User,
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  orderCount: number
  totalSpent: number
  joinDate: string
  lastOrderAt: string | null
}

interface CustomerTableProps {
  customers: Customer[]
  loading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  onPageChange: (page: number) => void
  onRefresh: () => void
  onSortingChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

const columnHelper = createColumnHelper<Customer>()

export function CustomerTable({
  customers,
  loading,
  pagination,
  onPageChange,
  onRefresh,
  onSortingChange,
}: CustomerTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const getCustomerTypeBadge = (orderCount: number) => {
    if (orderCount >= 10) return { label: 'VIP', variant: 'default' as const }
    if (orderCount >= 3) return { label: 'Regular', variant: 'secondary' as const }
    if (orderCount >= 1) return { label: 'Customer', variant: 'outline' as const }
    return { label: 'New', variant: 'outline' as const }
  }

  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      // Customer Info
      columnHelper.accessor('name', {
        header: 'Customer',
        cell: ({ row }) => {
          const customer = row.original
          return (
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {customer.name || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">{customer.email}</div>
              </div>
            </div>
          )
        },
      }),
      // Customer Type
      columnHelper.accessor('orderCount', {
        header: 'Type',
        cell: ({ getValue }) => {
          const badge = getCustomerTypeBadge(getValue())
          return <Badge variant={badge.variant}>{badge.label}</Badge>
        },
      }),
      // Order Count
      columnHelper.accessor('orderCount', {
        id: 'orders',
        header: 'Orders',
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()}</span>
        ),
      }),
      // Total Spent
      columnHelper.accessor('totalSpent', {
        header: 'Total Spent',
        cell: ({ getValue }) => (
          <span className="font-medium">${getValue().toLocaleString()}</span>
        ),
      }),
      // Join Date
      columnHelper.accessor('joinDate', {
        header: 'Joined',
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600">
            {new Date(getValue()).toLocaleDateString()}
          </span>
        ),
      }),
      // Last Order
      columnHelper.accessor('lastOrderAt', {
        header: 'Last Order',
        cell: ({ getValue }) => {
          const lastOrder = getValue()
          return (
            <span className="text-sm text-gray-600">
              {lastOrder ? new Date(lastOrder).toLocaleDateString() : 'Never'}
            </span>
          )
        },
      }),
      // Actions
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const customer = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    // View customer details - could open a modal or navigate to detail page
                    console.log('View customer details:', customer.id)
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    // Open email client or send email
                    window.open(`mailto:${customer.email}`, '_blank')
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
      },
    ],
    [customers]
  )

  const table = useReactTable({
    data: customers,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  })

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-6 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex} className="px-6 py-4">
                      <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <User className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">No customers found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} customers
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={page === pagination.page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  disabled={loading}
                >
                  {page}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext || loading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}