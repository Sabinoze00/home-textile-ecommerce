'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table'
import { AdminOrderTableRow } from '@/types'
import {
  MoreHorizontal,
  Eye,
  Package,
  Truck,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  onSortingChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

const columnHelper = createColumnHelper<AdminOrderTableRow>()

export function OrderTable({
  orders,
  loading,
  pagination,
  onPageChange,
  onRefresh,
  onSortingChange,
}: OrderTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [showStatusModal, setShowStatusModal] = useState<{
    orderId: string
    currentStatus: string
  } | null>(null)
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false)

  // Handle sorting changes
  useEffect(() => {
    if (sorting.length > 0 && onSortingChange) {
      const sort = sorting[0]
      onSortingChange(sort.id, sort.desc ? 'desc' : 'asc')
    }
  }, [sorting, onSortingChange])

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const columns = [
    // Selection column
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      size: 40,
    }),

    // Order Number
    columnHelper.accessor('orderNumber', {
      header: 'Order',
      cell: ({ getValue, row }) => (
        <div>
          <p
            className="cursor-pointer font-medium text-blue-600 hover:text-blue-800"
            onClick={() => viewOrderDetails(row.original)}
          >
            {getValue()}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </p>
        </div>
      ),
      size: 120,
    }),

    // Customer
    columnHelper.accessor('customerName', {
      header: 'Customer',
      cell: ({ getValue, row }) => (
        <div>
          <p className="font-medium text-gray-900">{getValue()}</p>
          <p className="max-w-[200px] truncate text-sm text-gray-500">
            {row.original.customerEmail}
          </p>
        </div>
      ),
      size: 200,
    }),

    // Status
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue, row }) => (
        <div className="space-y-1">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(getValue())}`}
          >
            {getValue()}
          </span>
          <div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentStatusColor(row.original.paymentStatus)}`}
            >
              {row.original.paymentStatus}
            </span>
          </div>
        </div>
      ),
      size: 140,
    }),

    // Items
    columnHelper.accessor('itemCount', {
      header: 'Items',
      cell: ({ getValue }) => (
        <span className="font-medium text-gray-900">{getValue()}</span>
      ),
      size: 80,
    }),

    // Total
    columnHelper.accessor('total', {
      header: 'Total',
      cell: ({ getValue }) => (
        <span className="font-medium text-gray-900">
          ${getValue().toFixed(2)}
        </span>
      ),
      size: 100,
    }),

    // Payment Provider
    columnHelper.accessor('paymentProvider', {
      header: 'Payment',
      cell: ({ getValue }) => {
        const provider = getValue()
        if (!provider) return <span className="text-gray-400">-</span>

        return (
          <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
            {provider === 'STRIPE' ? 'Stripe' : 'PayPal'}
          </span>
        )
      },
      size: 100,
    }),

    // Actions
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => viewOrderDetails(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateOrderStatus(row.original)}
          >
            <Package className="h-4 w-4" />
          </Button>
          <div className="relative">
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ),
      size: 150,
    }),
  ]

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
  })

  const viewOrderDetails = (order: AdminOrderTableRow) => {
    router.push(`/admin/orders/${order.id}`)
  }

  const updateOrderStatus = async (order: AdminOrderTableRow) => {
    setShowStatusModal({ orderId: order.id, currentStatus: order.status })
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update order status')
      }

      setShowStatusModal(null)
      onRefresh()
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const selectedOrderIds = table
    .getSelectedRowModel()
    .flatRows.map(row => row.original.id)

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedOrderIds.length === 0) return

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderIds: selectedOrderIds,
          action,
          data,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to perform bulk action')
      }

      setRowSelection({})
      onRefresh()
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  const handleBulkExport = async () => {
    if (selectedOrderIds.length === 0) return

    try {
      const searchParams = new URLSearchParams({
        export: 'true',
        ids: selectedOrderIds.join(','),
      })

      const response = await fetch(`/api/admin/orders?${searchParams}`)
      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-selected-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const handleBulkStatusUpdate = async (newStatus: string) => {
    await handleBulkAction('updateStatus', { status: newStatus })
    setShowBulkStatusModal(false)
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 w-4 rounded bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/6 rounded bg-gray-200"></div>
                </div>
                <div className="h-6 w-20 rounded bg-gray-200"></div>
                <div className="h-4 w-12 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Bulk Actions */}
        {selectedOrderIds.length > 0 && (
          <div className="border-b border-gray-200 bg-blue-50 px-6 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedOrderIds.length} order
                {selectedOrderIds.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowBulkStatusModal(true)}
                >
                  Update Status
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkExport()}
                >
                  Export Selected
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-gray-200">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center space-x-1 ${
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <div className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No orders found
            </h3>
            <p className="mb-6 text-gray-500">
              Orders will appear here when customers make purchases.
            </p>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Update Order Status
            </h3>
            <div className="space-y-3">
              {[
                'CONFIRMED',
                'PROCESSING',
                'SHIPPED',
                'DELIVERED',
                'CANCELLED',
              ].map(status => (
                <button
                  key={status}
                  onClick={() =>
                    handleStatusUpdate(showStatusModal.orderId, status)
                  }
                  className={`w-full rounded-md border px-3 py-2 text-left ${
                    status === showStatusModal.currentStatus
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowStatusModal(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Update Modal */}
      {showBulkStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Update Status for {selectedOrderIds.length} Orders
            </h3>
            <div className="space-y-3">
              {[
                'CONFIRMED',
                'PROCESSING',
                'SHIPPED',
                'DELIVERED',
                'CANCELLED',
              ].map(status => (
                <button
                  key={status}
                  onClick={() => handleBulkStatusUpdate(status)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-left hover:bg-gray-50"
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowBulkStatusModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
