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
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Eye,
  Package,
  Truck,
  Ban,
  RotateCcw,
  ExternalLink,
} from 'lucide-react'
import { AdminOrderTableRow } from '@/types'

interface OrderTableProps {
  orders: AdminOrderTableRow[]
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
  onBulkAction: (action: string, orderIds: string[], additionalData?: any) => Promise<void>
}

interface OrderDetailsModalProps {
  order: AdminOrderTableRow | null
  isOpen: boolean
  onClose: () => void
}

function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details - {order.orderNumber}</span>
            <Badge
              variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}
            >
              {order.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Order placed on {new Date(order.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {order.customerName}</p>
              <p><span className="font-medium">Email:</span> {order.customerEmail}</p>
            </div>
          </div>

          {/* Order Info */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Order Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Status:</span>
                <Badge className="ml-2" variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}>
                  {order.status}
                </Badge>
              </p>
              <p><span className="font-medium">Payment:</span>
                <Badge className="ml-2" variant={order.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                  {order.paymentStatus}
                </Badge>
              </p>
              <p><span className="font-medium">Total:</span> ${order.total.toFixed(2)}</p>
              {order.trackingNumber && (
                <p><span className="font-medium">Tracking:</span> {order.trackingNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {item.productImage ? (
                          <div className="relative h-10 w-10 flex-shrink-0">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="rounded object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium">{item.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>${item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const columnHelper = createColumnHelper<AdminOrderTableRow>()

export function OrderTable({
  orders,
  loading,
  pagination,
  onPageChange,
  onRefresh,
  onSortingChange,
  onBulkAction,
}: OrderTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [editingOrder, setEditingOrder] = useState<AdminOrderTableRow | null>(null)
  const [editForm, setEditForm] = useState<Partial<AdminOrderTableRow>>({})
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderTableRow | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'default'
      case 'SHIPPED':
        return 'secondary'
      case 'CANCELLED':
      case 'REFUNDED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'default'
      case 'FAILED':
      case 'REFUNDED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const columns = useMemo<ColumnDef<AdminOrderTableRow>[]>(
    () => [
      // Order Number
      columnHelper.accessor('orderNumber', {
        header: 'Order #',
        cell: ({ row }) => {
          const order = row.original
          return (
            <div className="font-mono text-sm">
              <button
                onClick={() => {
                  setSelectedOrder(order)
                  setShowOrderModal(true)
                }}
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                {order.orderNumber}
              </button>
            </div>
          )
        },
      }),
      // Customer
      columnHelper.accessor('customerName', {
        header: 'Customer',
        cell: ({ row }) => {
          const order = row.original
          return (
            <div>
              <div className="font-medium text-gray-900">{order.customerName}</div>
              <div className="text-sm text-gray-500">{order.customerEmail}</div>
            </div>
          )
        },
      }),
      // Status
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ getValue }) => (
          <Badge variant={getStatusBadgeVariant(getValue())}>
            {getValue()}
          </Badge>
        ),
      }),
      // Payment Status
      columnHelper.accessor('paymentStatus', {
        header: 'Payment',
        cell: ({ getValue }) => (
          <Badge variant={getPaymentStatusBadgeVariant(getValue())}>
            {getValue()}
          </Badge>
        ),
      }),
      // Items
      columnHelper.accessor('itemCount', {
        header: 'Items',
        cell: ({ getValue }) => (
          <span className="text-sm font-medium">
            {getValue()} {getValue() === 1 ? 'item' : 'items'}
          </span>
        ),
      }),
      // Total
      columnHelper.accessor('total', {
        header: 'Total',
        cell: ({ getValue }) => (
          <span className="font-medium">${getValue().toFixed(2)}</span>
        ),
      }),
      // Date
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600">
            {new Date(getValue()).toLocaleDateString()}
          </span>
        ),
      }),
      // Actions
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const order = row.original
          const isEditing = editingOrder?.id === order.id

          if (isEditing) {
            return (
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/admin/orders', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          id: order.id,
                          ...editForm
                        })
                      })

                      if (response.ok) {
                        setEditingOrder(null)
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
                    setEditingOrder(null)
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
                    setSelectedOrder(order)
                    setShowOrderModal(true)
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setEditingOrder(order)
                    setEditForm(order)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Order
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && (
                  <DropdownMenuItem
                    onClick={() => onBulkAction('updateStatus', [order.id], { status: 'SHIPPED' })}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Mark as Shipped
                  </DropdownMenuItem>
                )}
                {order.status !== 'DELIVERED' && order.status === 'SHIPPED' && (
                  <DropdownMenuItem
                    onClick={() => onBulkAction('updateStatus', [order.id], { status: 'DELIVERED' })}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Mark as Delivered
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {!['CANCELLED', 'REFUNDED', 'DELIVERED'].includes(order.status) && (
                  <DropdownMenuItem
                    onClick={() => onBulkAction('cancel', [order.id], { reason: 'Cancelled by admin' })}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Cancel Order
                  </DropdownMenuItem>
                )}
                {order.paymentStatus === 'PAID' && !['REFUNDED'].includes(order.status) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-red-600 focus:text-red-600"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Refund Order
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Refund Order?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will refund order {order.orderNumber} for ${order.total.toFixed(2)}.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onBulkAction('refund', [order.id], { reason: 'Refunded by admin' })}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Refund Order
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
      },
    ],
    [orders, editingOrder, editForm, onBulkAction, onRefresh]
  )

  const table = useReactTable({
    data: orders,
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
    <>
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
                      <Package className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">No orders found.</p>
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
              {pagination.total} orders
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

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false)
          setSelectedOrder(null)
        }}
      />
    </>
  )
}