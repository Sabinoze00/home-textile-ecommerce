'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Plus, Search, Filter, RefreshCw, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminProductTableRow, AdminFilters } from '@/types'
import { ProductTable } from '@/components/admin/ProductTable'

interface ProductsPageState {
  products: AdminProductTableRow[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface ProductFilters extends AdminFilters {
  categoryId?: string
  subcategoryId?: string
  priceMin?: string
  priceMax?: string
  stockMin?: string
  stockMax?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export default function ProductsPage() {
  const [state, setState] = useState<ProductsPageState>({
    products: [],
    loading: true,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    }
  })

  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
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

  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const params = new URLSearchParams({
        page: page.toString(),
        limit: state.pagination.limit.toString(),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.subcategoryId && { subcategoryId: filters.subcategoryId }),
        ...(filters.priceMin && { priceMin: filters.priceMin }),
        ...(filters.priceMax && { priceMax: filters.priceMax }),
        ...(filters.stockMin && { stockMin: filters.stockMin }),
        ...(filters.stockMax && { stockMax: filters.stockMax }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      })

      const response = await fetch(`/api/admin/products?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products')
      }

      const transformedProducts: AdminProductTableRow[] = data.data.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        sku: product.sku || 'N/A',
        price: product.price,
        stockQuantity: product.stock || 0,
        category: product.category?.name || 'Uncategorized',
        status: product.isActive ? 'active' : 'inactive',
        image: product.images?.[0] || null,
        reviewCount: product.reviewCount || 0,
        sales: product.totalSales || 0,
        revenue: (product.totalSales || 0) * product.price,
        createdAt: new Date(product.createdAt).toISOString(),
        updatedAt: new Date(product.updatedAt).toISOString(),
      }))

      setState(prev => ({
        ...prev,
        products: transformedProducts,
        pagination: data.data.pagination,
        loading: false,
      }))

    } catch (error) {
      console.error('Error fetching products:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load products',
        loading: false,
      }))
    }
  }, [debouncedSearchTerm, filters, state.pagination.limit])

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts(1)
  }, [fetchProducts])

  const handlePageChange = (page: number) => {
    fetchProducts(page)
  }

  const handleRefresh = () => {
    fetchProducts(state.pagination.page)
  }

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleBulkAction = async (action: string, productIds: string[], additionalData?: any) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          productIds,
          ...additionalData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Bulk action failed')
      }

      // Refresh products after bulk action
      handleRefresh()
      setSelectedProducts([])

      // Show success message (you might want to use a toast notification)
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
        ...(filters.status !== 'all' && { status: filters.status }),
        format: 'csv'
      })

      const response = await fetch(`/api/admin/products/export?${params}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `products-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const stats = useMemo(() => ({
    total: state.pagination.total,
    active: state.products.filter(p => p.status === 'active').length,
    inactive: state.products.filter(p => p.status === 'inactive').length,
    lowStock: state.products.filter(p => p.stockQuantity < 10).length,
  }), [state.products, state.pagination.total])

  if (state.loading && state.products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-gray-600">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={state.loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Management</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
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
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Products</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                  <option value="category">Category</option>
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

          {state.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-2 text-sm text-red-700">{state.error}</p>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ProductTable
              products={state.products}
              loading={state.loading}
              selectedProducts={selectedProducts}
              onSelectionChange={setSelectedProducts}
              onBulkAction={handleBulkAction}
              pagination={state.pagination}
              onPageChange={handlePageChange}
              onRefresh={handleRefresh}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}