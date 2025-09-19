'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ProductFilters } from '@/components/product/ProductFilters'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilters as ProductFiltersType, Product, PaginatedResponse } from '@/types'
import { parseSearchParams, buildSearchParams } from '@/lib/utils'

interface ProductsPageClientProps {
  initialData: PaginatedResponse<Product>
  initialSearchParams: Record<string, any>
}

export function ProductsPageClient({ initialData, initialSearchParams }: ProductsPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse current URL search params into filters
  const currentFilters: ProductFiltersType = {
    categories: initialSearchParams.category ? [initialSearchParams.category] : undefined,
    priceRange: (initialSearchParams.minPrice || initialSearchParams.maxPrice) ? {
      min: initialSearchParams.minPrice ? parseInt(initialSearchParams.minPrice) : 0,
      max: initialSearchParams.maxPrice ? parseInt(initialSearchParams.maxPrice) : 500
    } : undefined,
    colors: initialSearchParams.colors ? initialSearchParams.colors.split(',') : undefined,
    sizes: initialSearchParams.sizes ? initialSearchParams.sizes.split(',') : undefined,
    materials: initialSearchParams.materials ? initialSearchParams.materials.split(',') : undefined,
    ratings: initialSearchParams.rating ? [parseInt(initialSearchParams.rating)] : undefined,
    inStock: initialSearchParams.inStock === 'true' ? true : initialSearchParams.inStock === 'false' ? false : undefined,
    onSale: initialSearchParams.onSale === 'true' ? true : initialSearchParams.onSale === 'false' ? false : undefined,
    sortBy: initialSearchParams.sortBy || 'name',
    sortOrder: initialSearchParams.sortOrder || 'asc',
  }

  // Mock available filters - in a real app, these would come from an API
  const availableFilters = {
    categories: [
      { id: 'sheets', name: 'Sheets', value: 'sheets', count: 12 },
      { id: 'duvet-covers', name: 'Duvet Covers', value: 'duvet-covers', count: 8 },
      { id: 'quilts-coverlets', name: 'Quilts & Coverlets', value: 'quilts-coverlets', count: 6 },
      { id: 'comforters', name: 'Comforters', value: 'comforters', count: 10 },
      { id: 'bath', name: 'Bath', value: 'bath', count: 15 },
      { id: 'blankets-throws', name: 'Blankets & Throws', value: 'blankets-throws', count: 9 },
      { id: 'kids', name: 'Kids', value: 'kids', count: 7 },
      { id: 'home-decor', name: 'Home Decor', value: 'home-decor', count: 5 },
    ],
    colors: [
      { id: 'white', name: 'White', value: 'White', count: 25 },
      { id: 'navy', name: 'Navy', value: 'Navy', count: 15 },
      { id: 'sage', name: 'Sage', value: 'Sage', count: 12 },
      { id: 'terracotta', name: 'Terracotta', value: 'Terracotta', count: 8 },
      { id: 'cream', name: 'Cream', value: 'Cream', count: 18 },
      { id: 'grey', name: 'Grey', value: 'Grey', count: 14 },
      { id: 'natural', name: 'Natural', value: 'Natural', count: 10 },
    ],
    sizes: [
      { id: 'twin', name: 'Twin', value: 'Twin', count: 20 },
      { id: 'full', name: 'Full', value: 'Full', count: 15 },
      { id: 'queen', name: 'Queen', value: 'Queen', count: 30 },
      { id: 'king', name: 'King', value: 'King', count: 25 },
      { id: 'california-king', name: 'California King', value: 'California King', count: 8 },
    ],
    materials: [
      { id: 'cotton', name: 'Cotton', value: 'Cotton', count: 35 },
      { id: 'linen', name: 'Linen', value: 'Linen', count: 12 },
      { id: 'bamboo', name: 'Bamboo', value: 'Bamboo', count: 8 },
      { id: 'microfiber', name: 'Microfiber', value: 'Microfiber', count: 10 },
      { id: 'silk', name: 'Silk', value: 'Silk', count: 5 },
    ],
    priceRange: { min: 0, max: 500 }
  }

  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    // Build new URL with updated filters
    const urlParams = new URLSearchParams()

    // Add current search query if exists
    const currentQuery = searchParams.get('q')
    if (currentQuery) {
      urlParams.set('q', currentQuery)
    }

    // Add filter parameters
    if (newFilters.categories?.length) {
      urlParams.set('category', newFilters.categories[0])
    }

    if (newFilters.priceRange) {
      if (newFilters.priceRange.min > 0) {
        urlParams.set('minPrice', newFilters.priceRange.min.toString())
      }
      if (newFilters.priceRange.max < 500) {
        urlParams.set('maxPrice', newFilters.priceRange.max.toString())
      }
    }

    if (newFilters.colors?.length) {
      urlParams.set('colors', newFilters.colors.join(','))
    }

    if (newFilters.sizes?.length) {
      urlParams.set('sizes', newFilters.sizes.join(','))
    }

    if (newFilters.materials?.length) {
      urlParams.set('materials', newFilters.materials.join(','))
    }

    if (newFilters.ratings?.length) {
      urlParams.set('rating', newFilters.ratings[0].toString())
    }

    if (newFilters.inStock !== undefined) {
      urlParams.set('inStock', newFilters.inStock.toString())
    }

    if (newFilters.onSale !== undefined) {
      urlParams.set('onSale', newFilters.onSale.toString())
    }

    if (newFilters.sortBy && newFilters.sortBy !== 'name') {
      urlParams.set('sortBy', newFilters.sortBy)
    }

    if (newFilters.sortOrder && newFilters.sortOrder !== 'asc') {
      urlParams.set('sortOrder', newFilters.sortOrder)
    }

    // Navigate to updated URL
    const newUrl = `/products${urlParams.toString() ? `?${urlParams.toString()}` : ''}`
    router.push(newUrl)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-textile-navy mb-4">
          All Products
        </h1>
        <p className="text-lg text-gray-600">
          Discover our complete collection of premium home textiles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters
            onFiltersChange={handleFiltersChange}
            availableFilters={availableFilters}
            initialFilters={currentFilters}
          />
        </div>

        {/* Products Content */}
        <div className="lg:col-span-3">
          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {initialData.data.length} of {initialData.pagination.total} products
            </p>
          </div>

          {/* Products Grid */}
          <ProductGrid products={initialData.data} />

          {/* Pagination */}
          {initialData.pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex items-center gap-2">
                {initialData.pagination.hasPrev && (
                  <a
                    href={`/products?${new URLSearchParams({ ...initialSearchParams, page: String(initialData.pagination.page - 1) }).toString()}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Previous
                  </a>
                )}

                <span className="px-4 py-2 text-sm font-medium text-gray-700">
                  Page {initialData.pagination.page} of {initialData.pagination.totalPages}
                </span>

                {initialData.pagination.hasNext && (
                  <a
                    href={`/products?${new URLSearchParams({ ...initialSearchParams, page: String(initialData.pagination.page + 1) }).toString()}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}