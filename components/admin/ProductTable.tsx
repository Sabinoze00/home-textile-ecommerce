'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  ToggleLeft,
  ToggleRight,
  Package,
} from 'lucide-react'
import { AdminProductTableRow } from '@/types'

interface ProductTableProps {
  products: AdminProductTableRow[]
  loading: boolean
  selectedProducts: string[]
  onSelectionChange: (selectedIds: string[]) => void
  onBulkAction: (action: string, productIds: string[], additionalData?: any) => Promise<void>
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
}

const columnHelper = createColumnHelper<AdminProductTableRow>()

export function ProductTable({
  products,
  loading,
  selectedProducts,
  onSelectionChange,
  onBulkAction,
  pagination,
  onPageChange,
  onRefresh,
}: ProductTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [editingProduct, setEditingProduct] = useState<AdminProductTableRow | null>(null)
  const [editForm, setEditForm] = useState<Partial<AdminProductTableRow>>({})

  const columns = useMemo<ColumnDef<AdminProductTableRow>[]>(
    () => [
      // Selection column
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value)
              if (value) {
                onSelectionChange(products.map(p => p.id))
              } else {
                onSelectionChange([])
              }
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedProducts.includes(row.original.id)}
            onCheckedChange={(value) => {
              const productId = row.original.id
              if (value) {
                onSelectionChange([...selectedProducts, productId])
              } else {
                onSelectionChange(selectedProducts.filter(id => id !== productId))
              }
            }}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      // Product column with image and name
      columnHelper.accessor('name', {
        header: 'Product',
        cell: ({ row }) => {
          const product = row.original
          return (
            <div className="flex items-center space-x-3">
              <div className="relative h-10 w-10 flex-shrink-0">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-gray-900">
                  {editingProduct?.id === product.id ? (
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="h-6 text-sm"
                    />
                  ) : (
                    product.name
                  )}
                </div>
                <div className="truncate text-sm text-gray-500">
                  SKU: {product.sku}
                </div>
              </div>
            </div>
          )
        },
      }),
      // Category column
      columnHelper.accessor('category', {
        header: 'Category',
        cell: ({ getValue }) => (
          <Badge variant="secondary">{getValue()}</Badge>
        ),
      }),
      // Price column
      columnHelper.accessor('price', {
        header: 'Price',
        cell: ({ row }) => {
          const product = row.original
          return (
            <div className="text-right">
              {editingProduct?.id === product.id ? (
                <Input
                  type="number"
                  value={editForm.price || 0}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className="h-6 w-20 text-sm"
                />
              ) : (
                <span className="font-medium">${product.price.toFixed(2)}</span>
              )}
            </div>
          )
        },
      }),
      // Stock column
      columnHelper.accessor('stockQuantity', {
        header: 'Stock',
        cell: ({ row }) => {
          const product = row.original
          const isLowStock = product.stockQuantity < 10
          return (
            <div className="text-right">
              {editingProduct?.id === product.id ? (
                <Input
                  type="number"
                  value={editForm.stockQuantity || 0}
                  onChange={(e) => setEditForm(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) }))}
                  className="h-6 w-16 text-sm"
                />
              ) : (
                <Badge variant={isLowStock ? "destructive" : "secondary"}>
                  {product.stockQuantity}
                </Badge>
              )}
            </div>
          )
        },
      }),
      // Status column
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const product = row.original
          const isActive = product.status === 'active'
          return (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          )
        },
      }),
      // Sales column
      columnHelper.accessor('sales', {
        header: 'Sales',
        cell: ({ getValue }) => (
          <div className="text-right font-medium">
            {getValue()}
          </div>
        ),
      }),
      // Revenue column
      columnHelper.accessor('revenue', {
        header: 'Revenue',
        cell: ({ getValue }) => (
          <div className="text-right font-medium">
            ${getValue().toLocaleString()}
          </div>
        ),
      }),
      // Actions column
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const product = row.original
          const isEditing = editingProduct?.id === product.id

          if (isEditing) {
            return (
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      // Call update API
                      const response = await fetch('/api/admin/products', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          id: product.id,
                          ...editForm
                        })
                      })

                      if (response.ok) {
                        setEditingProduct(null)
                        setEditForm({})
                        onRefresh()
                      }
                    } catch (error) {
                      console.error('Update error:', error)
                    }
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingProduct(null)
                    setEditForm({})
                  }}
                >
                  Cancel
                </Button>
              </div>
            )
          }

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
                    setEditingProduct(product)
                    setEditForm(product)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onBulkAction('duplicate', [product.id])}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onBulkAction(
                    product.status === 'active' ? 'deactivate' : 'activate',
                    [product.id]
                  )}
                >
                  {product.status === 'active' ? (
                    <>
                      <ToggleLeft className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleRight className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        product "{product.name}" from the database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onBulkAction('delete', [product.id])}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
      },
    ],
    [products, selectedProducts, onSelectionChange, editingProduct, editForm, onBulkAction, onRefresh]
  )

  const table = useReactTable({
    data: products,
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

  // Bulk actions handler
  const handleBulkAction = (action: string) => {
    if (selectedProducts.length === 0) return
    onBulkAction(action, selectedProducts)
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
          <span className="text-sm font-medium text-blue-900">
            {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('activate')}
            >
              Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('deactivate')}
            >
              Deactivate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('duplicate')}
            >
              Duplicate
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedProducts.length} products?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    selected products from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleBulkAction('delete')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Products
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

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
                <TableRow
                  key={row.id}
                  data-state={selectedProducts.includes(row.original.id) && "selected"}
                  className="hover:bg-gray-50"
                >
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
                    <Package className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">No products found.</p>
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
            {pagination.total} products
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