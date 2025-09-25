'use client'

import { useState, useEffect } from 'react'
import { ProductTable } from '@/components/admin/ProductTable'
import { ProductForm } from '@/components/admin/ProductForm'
import { AdminProductTableRow, AdminFilters } from '@/types'
import {
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductsResponse {
  data: AdminProductTableRow[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  error?: string
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductTableRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
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
    status: '',
    category: '',
  })

  const [sorting, setSorting] = useState({
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  })

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [pagination.page, pagination.limit, filters, sorting])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
      })

      const response = await fetch(`/api/admin/products?${searchParams}`)
      const data: ProductsResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products')
      }

      setProducts(data.data)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to load products'
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()

      if (response.ok && data.success) {
        setCategories(data.data)
      } else {
        console.error('Failed to fetch categories:', data.error)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
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
      stockQuantity: 'stock',
      // Keep these as-is since they match server expectations
      // price: 'price',
      // name: 'name',
      // createdAt: 'createdAt',
      // sales: 'sales',
      // revenue: 'revenue'
    }

    const mappedSortBy = sortByMapping[sortBy] || sortBy
    setSorting({ sortBy: mappedSortBy, sortOrder })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleExport = async () => {
    try {
      const searchParams = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        export: 'true',
      })

      const response = await fetch(`/api/admin/products?${searchParams}`)
      const data = await response.blob()

      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `products-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting products:', error)
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
          <h3 className="font-medium text-red-800">Error Loading Products</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <Button onClick={fetchProducts} className="mt-4" variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-gray-600">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="mt-4 flex items-center space-x-3 sm:mt-0">
          <Button onClick={handleExport} variant="outline" disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowProductForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or description..."
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
          <Button variant="outline" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={filters.status}
                  onChange={e => handleFilterChange({ status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                  value={filters.category}
                  onChange={e =>
                    handleFilterChange({ category: e.target.value })
                  }
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({ search: '', status: '', category: '' })
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
          {pagination.total} products
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

      {/* Products Table */}
      <ProductTable
        products={products}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRefresh={fetchProducts}
        onSortingChange={handleSortingChange}
      />

      {/* Product Form Modal */}
      <ProductForm
        open={showProductForm}
        onOpenChange={setShowProductForm}
        onSuccess={fetchProducts}
      />
    </div>
  )
}
