'use client'

import { useState, useEffect } from 'react'
import { OrderTable } from '@/components/admin/OrderTable'
import { AdminOrderTableRow, AdminFilters } from '@/types'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrdersResponse {
  data: AdminOrderTableRow[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  analytics: {
    totalRevenue: number
    averageOrderValue: number
    statusDistribution: { status: string; count: number }[]
    paymentStatusDistribution: { status: string; count: number }[]
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderTableRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<
    OrdersResponse['analytics'] | null
  >(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  const [filters, setFilters] = useState<AdminFilters>({
    search: '',
    orderStatus: '',
    paymentStatus: '',
  })

  const [sorting, setSorting] = useState({
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  })

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, pagination.limit, filters, sorting])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.orderStatus && { orderStatus: filters.orderStatus }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
      })

      const response = await fetch(`/api/admin/orders?${searchParams}`)
      const data: OrdersResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders')
      }

      setOrders(data.data)
      setPagination(data.pagination)
      setAnalytics(data.analytics)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError(error instanceof Error ? error.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (newFilters: Partial<AdminFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
  }

  const handleSortingChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    // Map client column IDs to server-supported values
    const sortByMapping: { [key: string]: string } = {
      customerName: 'customer',
      // Keep these as-is since they match server expectations
      // orderNumber: 'orderNumber',
      // total: 'total',
      // createdAt: 'createdAt'
    }

    const mappedSortBy = sortByMapping[sortBy] || sortBy
    setSorting({ sortBy: mappedSortBy, sortOrder })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleExport = async () => {
    try {
      const searchParams = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.orderStatus && { orderStatus: filters.orderStatus }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        export: 'true',
      })

      const response = await fetch(`/api/admin/orders?${searchParams}`)
      const data = await response.blob()

      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting orders:', error)
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
          <h3 className="font-medium text-red-800">Error Loading Orders</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <Button onClick={fetchOrders} className="mt-4" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-gray-600">
            Manage customer orders and track fulfillment
          </p>
        </div>
        <div className="mt-4 flex items-center space-x-3 sm:mt-0">
          <Button onClick={handleExport} variant="outline" disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 rounded-lg bg-green-100 p-2 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analytics.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center">
              <Package className="h-8 w-8 rounded-lg bg-blue-100 p-2 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analytics.averageOrderValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center">
              <Clock className="h-8 w-8 rounded-lg bg-orange-100 p-2 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Pending Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.statusDistribution.find(
                    s => s.status === 'PENDING'
                  )?.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 rounded-lg bg-green-100 p-2 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.statusDistribution.find(
                    s => s.status === 'DELIVERED'
                  )?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by number, customer, or email..."
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-blue-500"
              value={filters.search}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'border-blue-300 bg-blue-50' : ''}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>

          {/* Refresh */}
          <Button variant="outline" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Order Status
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={filters.orderStatus}
                  onChange={e =>
                    handleFilterChange({ orderStatus: e.target.value })
                  }
                >
                  <option value="">All Orders</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Payment Status
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={filters.paymentStatus}
                  onChange={e =>
                    handleFilterChange({ paymentStatus: e.target.value })
                  }
                >
                  <option value="">All Payments</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      search: '',
                      orderStatus: '',
                      paymentStatus: '',
                    })
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} orders
        </div>
        <div className="flex items-center space-x-2">
          <span>Show:</span>
          <select
            className="rounded border border-gray-300 px-2 py-1 text-sm"
            value={pagination.limit}
            onChange={e => handleLimitChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>per page</span>
        </div>
      </div>

      {/* Orders Table */}
      <OrderTable
        orders={orders}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRefresh={fetchOrders}
        onSortingChange={handleSortingChange}
      />
    </div>
  )
}
