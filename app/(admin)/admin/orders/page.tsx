'use client'

import { useState, useEffect, useCallback } from 'react'
import { OrderTable } from '@/components/admin/OrderTable'
import { AdminOrderTableRow } from '@/types'
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
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface OrdersResponse {
  success: boolean
  data: {
    orders: AdminOrderTableRow[]
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
}

interface OrderFilters {
  search: string
  orderStatus: string
  paymentStatus: string
  dateFrom?: string
  dateTo?: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrderTableRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<OrdersResponse['data']['analytics'] | null>(null)

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    orderStatus: 'all',
    paymentStatus: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const [showFilters, setShowFilters] = useState(false)

  // Debounced search to avoid too many API calls
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filters.orderStatus !== 'all' && { orderStatus: filters.orderStatus }),
        ...(filters.paymentStatus !== 'all' && { paymentStatus: filters.paymentStatus }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })

      const response = await fetch(`/api/admin/orders?${params}`)
      const data: OrdersResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders')
      }

      setOrders(data.data.orders)
      setPagination(data.data.pagination)
      setAnalytics(data.data.analytics)

    } catch (error) {
      console.error('Error fetching orders:', error)
      setError(error instanceof Error ? error.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, filters, pagination.limit])

  // Fetch orders when filters change
  useEffect(() => {
    fetchOrders(1)
  }, [fetchOrders])

  const handlePageChange = (page: number) => {
    fetchOrders(page)
  }

  const handleRefresh = () => {
    fetchOrders(pagination.page)
  }

  const handleFilterChange = (key: keyof OrderFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSortingChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder }))
  }

  const handleBulkAction = async (action: string, orderIds: string[], additionalData?: any) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          orderIds,
          ...additionalData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Bulk action failed')
      }

      // Refresh orders after bulk action
      handleRefresh()

      // Show success message
      console.log(data.message)

    } catch (error) {
      console.error('Bulk action error:', error)
      // Handle error (show toast notification)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filters.orderStatus !== 'all' && { orderStatus: filters.orderStatus }),
        ...(filters.paymentStatus !== 'all' && { paymentStatus: filters.paymentStatus }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        export: 'true',
      })

      const response = await fetch(`/api/admin/orders?${params}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Export error:', error)
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="mt-2 h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
          <h3 className="font-medium text-red-800">Error Loading Orders</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <Button onClick={handleRefresh} className="mt-4" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-gray-600">
            Manage customer orders and track fulfillment
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 rounded-lg bg-green-100 p-2 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${analytics.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 rounded-lg bg-blue-100 p-2 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${analytics.averageOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 rounded-lg bg-orange-100 p-2 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.statusDistribution.find(s => s.status === 'PENDING')?.count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 rounded-lg bg-green-100 p-2 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.statusDistribution.find(s => s.status === 'DELIVERED')?.count || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Management</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search orders by number, customer, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Order Status
                </label>
                <select
                  value={filters.orderStatus}
                  onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Orders</option>
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
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Status
                </label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Payments</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="orderNumber">Order Number</option>
                  <option value="customer">Customer</option>
                  <option value="total">Total</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Sort Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          )}

          {/* Orders Table */}
          <OrderTable
            orders={orders}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
            onSortingChange={handleSortingChange}
            onBulkAction={handleBulkAction}
          />
        </CardContent>
      </Card>
    </div>
  )
}