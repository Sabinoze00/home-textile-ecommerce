'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductFilters } from '@/components/product/ProductFilters'
import { FilterPanel } from '@/components/product/FilterPanel'
import { ProductSort } from '@/components/product/ProductSort'
import { ProductGrid } from '@/components/product/ProductGrid'
import {
  ProductFilters as ProductFiltersType,
  Product,
  PaginatedResponse,
} from '@/types'
import { parseSearchParams, buildSearchParams } from '@/lib/utils'

interface ProductsPageClientProps {
  initialData: PaginatedResponse<Product>
  initialSearchParams: Record<string, any>
}

export function ProductsPageClient({
  initialData,
  initialSearchParams,
}: ProductsPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  // Helper function to handle URL params that can be string or array
  const parseArrayParam = (
    param: string | string[] | undefined
  ): string[] | undefined => {
    if (!param) return undefined
    if (Array.isArray(param)) return param
    return typeof param === 'string' ? param.split(',') : undefined
  }

  const parseStringParam = (
    param: string | string[] | undefined
  ): string | undefined => {
    if (!param) return undefined
    return Array.isArray(param) ? param[0] : param
  }

  // Parse current URL search params into filters
  const currentFilters: ProductFiltersType = {
    categories: initialSearchParams.category
      ? ([parseStringParam(initialSearchParams.category)].filter(
          Boolean
        ) as string[])
      : undefined,
    priceRange:
      initialSearchParams.minPrice || initialSearchParams.maxPrice
        ? {
            min: initialSearchParams.minPrice
              ? parseInt(parseStringParam(initialSearchParams.minPrice) || '0')
              : 0,
            max: initialSearchParams.maxPrice
              ? parseInt(
                  parseStringParam(initialSearchParams.maxPrice) || '500'
                )
              : 500,
          }
        : undefined,
    colors: parseArrayParam(initialSearchParams.colors),
    sizes: parseArrayParam(initialSearchParams.sizes),
    materials: parseArrayParam(initialSearchParams.materials),
    ratings: initialSearchParams.rating
      ? [parseInt(parseStringParam(initialSearchParams.rating) || '0')]
      : undefined,
    inStock:
      parseStringParam(initialSearchParams.inStock) === 'true'
        ? true
        : parseStringParam(initialSearchParams.inStock) === 'false'
          ? false
          : undefined,
    onSale:
      parseStringParam(initialSearchParams.onSale) === 'true'
        ? true
        : parseStringParam(initialSearchParams.onSale) === 'false'
          ? false
          : undefined,
    sortBy: parseStringParam(initialSearchParams.sortBy) || 'name',
    sortOrder:
      (parseStringParam(initialSearchParams.sortOrder) as 'asc' | 'desc') ||
      'asc',
  }

  // Mock available filters - in a real app, these would come from an API
  const availableFilters = {
    categories: [
      { id: 'sheets', name: 'Sheets', value: 'sheets', count: 12 },
      {
        id: 'duvet-covers',
        name: 'Duvet Covers',
        value: 'duvet-covers',
        count: 8,
      },
      {
        id: 'quilts-coverlets',
        name: 'Quilts & Coverlets',
        value: 'quilts-coverlets',
        count: 6,
      },
      { id: 'comforters', name: 'Comforters', value: 'comforters', count: 10 },
      { id: 'bath', name: 'Bath', value: 'bath', count: 15 },
      {
        id: 'blankets-throws',
        name: 'Blankets & Throws',
        value: 'blankets-throws',
        count: 9,
      },
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
      {
        id: 'california-king',
        name: 'California King',
        value: 'California King',
        count: 8,
      },
    ],
    materials: [
      { id: 'cotton', name: 'Cotton', value: 'Cotton', count: 35 },
      { id: 'linen', name: 'Linen', value: 'Linen', count: 12 },
      { id: 'bamboo', name: 'Bamboo', value: 'Bamboo', count: 8 },
      { id: 'microfiber', name: 'Microfiber', value: 'Microfiber', count: 10 },
      { id: 'silk', name: 'Silk', value: 'Silk', count: 5 },
    ],
    priceRange: { min: 0, max: 500 },
  }

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen)
  }

  const closeFilterPanel = () => {
    setIsFilterPanelOpen(false)
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
      const firstCategory = newFilters.categories[0]
      if (firstCategory) {
        urlParams.set('category', firstCategory)
      }
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

    // Navigate to updated URL
    const newUrl = `/products${urlParams.toString() ? `?${urlParams.toString()}` : ''}`
    router.push(newUrl)
  }

  // Handle scroll detection for compact sticky state
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 100
      setIsScrolled(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSortChange = (sort: {
    sortBy?: ProductFiltersType['sortBy']
    sortOrder?: ProductFiltersType['sortOrder']
  }) => {
    // Build new URL with updated sort parameters
    const urlParams = new URLSearchParams(searchParams.toString())

    if (sort.sortBy && sort.sortBy !== 'name') {
      urlParams.set('sortBy', sort.sortBy)
    } else {
      urlParams.delete('sortBy')
    }

    if (sort.sortOrder && sort.sortOrder !== 'asc') {
      urlParams.set('sortOrder', sort.sortOrder)
    } else {
      urlParams.delete('sortOrder')
    }

    // Navigate to updated URL
    const newUrl = `/products${urlParams.toString() ? `?${urlParams.toString()}` : ''}`
    router.push(newUrl)
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
      {/* Filter Panel - rendered outside sticky container */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={closeFilterPanel}
        onFiltersChange={handleFiltersChange}
        availableFilters={availableFilters}
        initialFilters={currentFilters}
      />

      <div className="mb-4">
        <h1 className="text-[28px] font-bold text-textile-navy">
          All Products
        </h1>
      </div>

      {/* Subtitle moved below title */}
      <div className="mb-3">
        <p className="text-xs text-gray-600">
          Discover our complete collection of premium home textiles
        </p>
      </div>

      {/* Sticky Filters and Sort Row - Full width */}
      <div
        className={`sticky left-0 right-0 top-0 z-30 mb-4 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm transition-all duration-300 ${isScrolled ? 'py-1' : 'py-2'} ml-[calc(-50vw+50%)] w-screen`}
      >
        <div className="flex w-full items-center justify-center gap-4 px-4">
          <ProductFilters
            onFilterToggle={toggleFilterPanel}
            initialFilters={currentFilters}
            className="min-w-[120px]"
          />
          <div className="hidden h-6 w-px bg-gray-300 md:block" />
          <ProductSort
            onSortChange={handleSortChange}
            className="min-w-[120px]"
          />
        </div>
      </div>

      {/* Product Count - Below filters */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          Showing {initialData.data.length} of {initialData.pagination.total}{' '}
          products
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
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </a>
            )}

            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              Page {initialData.pagination.page} of{' '}
              {initialData.pagination.totalPages}
            </span>

            {initialData.pagination.hasNext && (
              <a
                href={`/products?${new URLSearchParams({ ...initialSearchParams, page: String(initialData.pagination.page + 1) }).toString()}`}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
