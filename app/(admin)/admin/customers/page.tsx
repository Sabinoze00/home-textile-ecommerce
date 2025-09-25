'use client'

import { useState, useEffect, useCallback } from 'react'
import { CustomerTable } from '@/components/admin/CustomerTable'
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Customer {
  id: string
  name: string
  email: string
  orderCount: number
  totalSpent: number
  joinDate: string
  lastOrderAt: string | null
}

interface CustomersResponse {
  success: boolean
  data: {
    customers: Customer[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
    analytics: {
      totalCustomers: number
      customersWithOrders: number
      totalRevenue: number
      avgCustomerValue: number
      topCustomers: {
        id: string
        name: string
        email: string
        totalSpent: number
      }[]
    }
  }
}

interface CustomerFilters {
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<CustomersResponse['data']['analytics'] | null>(null)

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Debounced search to avoid too many API calls
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchCustomers = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })

      const response = await fetch(`/api/admin/customers?${params}`)
      const data: CustomersResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch customers')
      }

      setCustomers(data.data.customers)
      setPagination(data.data.pagination)
      setAnalytics(data.data.analytics)

    } catch (error) {
      console.error('Error fetching customers:', error)
      setError(error instanceof Error ? error.message : 'Failed to load customers')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, filters, pagination.limit])

  // Fetch customers when filters change
  useEffect(() => {
    fetchCustomers(1)
  }, [fetchCustomers])

  const handlePageChange = (page: number) => {
    fetchCustomers(page)
  }

  const handleRefresh = () => {
    fetchCustomers(pagination.page)
  }

  const handleFilterChange = (key: keyof CustomerFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSortingChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder }))
  }

  if (loading && customers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
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
          <h3 className="font-medium text-red-800">Error Loading Customers</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-gray-600">
            Manage customer accounts and analyze customer behavior
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 rounded-lg bg-blue-100 p-2 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalCustomers.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 rounded-lg bg-green-100 p-2 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.customersWithOrders.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 rounded-lg bg-purple-100 p-2 text-purple-600" />
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
                <TrendingUp className="h-8 w-8 rounded-lg bg-orange-100 p-2 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg Customer Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${analytics.avgCustomerValue.toFixed(2)}
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
            <CardTitle>Customer Management</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="createdAt">Join Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Order:</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Top Customers Section */}
          {analytics && analytics.topCustomers.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-medium text-gray-900">Top Customers</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                {analytics.topCustomers.map((customer, index) => (
                  <div key={customer.id} className="rounded-lg border p-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${customer.totalSpent.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Table */}
          <CustomerTable
            customers={customers}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
            onSortingChange={handleSortingChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}