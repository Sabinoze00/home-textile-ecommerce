'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Product, ProductFilters, PaginatedResponse } from '@/types'
import { buildSearchParams } from '@/lib/utils'

interface UseProductsOptions {
  filters?: ProductFilters
  initialData?: PaginatedResponse<Product>
  enabled?: boolean
}

interface UseProductsReturn {
  products: Product[]
  pagination: PaginatedResponse<Product>['pagination'] | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
  updateFilters: (newFilters: ProductFilters) => void
  resetFilters: () => void
  filters: ProductFilters
}

const defaultFilters: ProductFilters = {
  sortBy: 'name',
  sortOrder: 'asc'
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { filters: initialFilters = defaultFilters, initialData, enabled = true } = options
  const [filters, setFilters] = useState<ProductFilters>(initialFilters)
  const queryClient = useQueryClient()

  // Build query key from filters
  const queryKey = ['products', filters]

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: queryRefetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = buildSearchParams(filters)
      const response = await fetch(`/api/products?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      return response.json() as Promise<PaginatedResponse<Product>>
    },
    initialData,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })

  const updateFilters = useCallback((newFilters: ProductFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset page when filters change
      page: newFilters.page || 1
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const refetch = useCallback(() => {
    queryRefetch()
  }, [queryRefetch])

  // Prefetch next page if available
  useEffect(() => {
    if (data?.pagination?.hasNext) {
      const nextPageFilters = { ...filters, page: (filters.page || 1) + 1 }
      const nextQueryKey = ['products', nextPageFilters]

      queryClient.prefetchQuery({
        queryKey: nextQueryKey,
        queryFn: async () => {
          const params = buildSearchParams(nextPageFilters)
          const response = await fetch(`/api/products?${params}`)
          if (!response.ok) throw new Error('Failed to fetch products')
          return response.json()
        },
        staleTime: 5 * 60 * 1000,
      })
    }
  }, [data?.pagination, filters, queryClient])

  return {
    products: data?.data || [],
    pagination: data?.pagination || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    updateFilters,
    resetFilters,
    filters
  }
}

// Hook for fetching a single product
export function useProduct(slug: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await fetch(`/api/products/${slug}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found')
        }
        throw new Error('Failed to fetch product')
      }

      return response.json() as Promise<Product>
    },
    enabled: enabled && !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Hook for fetching featured/best-selling products
export function useFeaturedProducts(options: {
  type?: 'featured' | 'bestseller' | 'new'
  limit?: number
  category?: string
} = {}) {
  const { type = 'featured', limit = 8, category } = options

  const filters: ProductFilters = {
    [type]: true,
    limit,
    ...(category && { categories: [category] })
  }

  return useQuery({
    queryKey: ['featured-products', type, limit, category],
    queryFn: async () => {
      const params = buildSearchParams(filters)
      const response = await fetch(`/api/products?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch featured products')
      }

      const data = await response.json()
      return data.data as Product[]
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Hook for product recommendations
export function useRelatedProducts(productId: string, categoryId?: string) {
  return useQuery({
    queryKey: ['related-products', productId, categoryId],
    queryFn: async () => {
      // For now, we'll get products from the same category
      // In a real app, you might have a dedicated recommendations API
      const filters: ProductFilters = {
        ...(categoryId && { categories: [categoryId] }),
        limit: 4
      }

      const params = buildSearchParams(filters)
      const response = await fetch(`/api/products?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch related products')
      }

      const data = await response.json()
      // Filter out the current product
      return (data.data as Product[]).filter(p => p.id !== productId)
    },
    enabled: !!productId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  })
}

// Hook for product filtering with debounced updates
export function useProductFilters(initialFilters: ProductFilters = defaultFilters) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters)
  const [debouncedFilters, setDebouncedFilters] = useState<ProductFilters>(initialFilters)

  // Debounce filter updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 500)

    return () => clearTimeout(timer)
  }, [filters])

  const updateFilter = useCallback((key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filter changes
    }))
  }, [])

  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const removeFilter = useCallback((key: keyof ProductFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  return {
    filters,
    debouncedFilters,
    updateFilter,
    updateFilters,
    resetFilters,
    removeFilter,
    hasActiveFilters: Object.keys(filters).some(key =>
      key !== 'sortBy' && key !== 'sortOrder' && filters[key as keyof ProductFilters] !== undefined
    )
  }
}