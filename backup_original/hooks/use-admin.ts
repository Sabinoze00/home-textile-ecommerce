'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import {
  AdminMetrics,
  AdminProductTableRow,
  AdminOrderTableRow,
  AdminFilters,
} from '@/types'

// Admin Products Hook
export function useAdminProducts(
  filters: AdminFilters = {},
  pagination = { page: 1, limit: 20 }
) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['admin', 'products', filters, pagination],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
      })

      const response = await fetch(`/api/admin/products?${searchParams}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch products')
      }
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const createProduct = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create product')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update product')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete product')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })

  return {
    products: query.data?.data || [],
    pagination: query.data?.pagination,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createProduct,
    updateProduct,
    deleteProduct,
  }
}

// Admin Orders Hook
export function useAdminOrders(
  filters: AdminFilters = {},
  pagination = { page: 1, limit: 20 }
) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['admin', 'orders', filters, pagination],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.orderStatus && { orderStatus: filters.orderStatus }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
      })

      const response = await fetch(`/api/admin/orders?${searchParams}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch orders')
      }
      return response.json()
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  const updateOrder = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update order')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const bulkUpdateOrders = useMutation({
    mutationFn: async ({ orderIds, action, data }: any) => {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds, action, data }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to perform bulk action')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  return {
    orders: query.data?.data || [],
    analytics: query.data?.analytics,
    pagination: query.data?.pagination,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateOrder,
    bulkUpdateOrders,
  }
}

// Admin Analytics Hook
export function useAdminAnalytics(
  dateRange?: string,
  startDate?: string,
  endDate?: string
) {
  const query = useQuery({
    queryKey: ['admin', 'analytics', dateRange, startDate, endDate],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        ...(dateRange && { dateRange }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      })

      const response = await fetch(`/api/admin/analytics?${searchParams}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch analytics')
      }
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  })

  return {
    metrics: query.data?.data as AdminMetrics | undefined,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

// Admin Auth Hook
export function useAdminAuth() {
  const { data: session, status } = useSession()

  const isAdmin = session?.user?.role === 'ADMIN'
  const loading = status === 'loading'

  return {
    isAdmin,
    loading,
    session,
  }
}

// Admin Filters Hook
export function useAdminFilters<T extends AdminFilters>(initialFilters: T) {
  const [filters, setFilters] = useState<T>(initialFilters)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  })

  const updateFilters = useCallback((newFilters: Partial<T>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }, [])

  const updatePagination = useCallback(
    (newPagination: Partial<typeof pagination>) => {
      setPagination(prev => ({ ...prev, ...newPagination }))
    },
    []
  )

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    setPagination({ page: 1, limit: 20 })
  }, [initialFilters])

  return {
    filters,
    pagination,
    updateFilters,
    updatePagination,
    resetFilters,
  }
}

// Admin Bulk Actions Hook
export function useAdminBulkActions() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const toggleItem = useCallback((itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }, [])

  const toggleAll = useCallback((itemIds: string[], isSelected: boolean) => {
    setSelectedItems(isSelected ? itemIds : [])
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedItems([])
  }, [])

  const isSelected = useCallback(
    (itemId: string) => {
      return selectedItems.includes(itemId)
    },
    [selectedItems]
  )

  const isAllSelected = useCallback(
    (itemIds: string[]) => {
      return (
        itemIds.length > 0 && itemIds.every(id => selectedItems.includes(id))
      )
    },
    [selectedItems]
  )

  return {
    selectedItems,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    selectedCount: selectedItems.length,
  }
}

// Admin Notifications Hook
export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])

  const addNotification = useCallback((notification: any) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { ...notification, id }])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
  }
}

// Admin Export Hook
export function useAdminExport() {
  const [exporting, setExporting] = useState(false)

  const exportData = useCallback(
    async (
      endpoint: string,
      filename: string,
      filters: Record<string, any> = {}
    ) => {
      try {
        setExporting(true)

        const searchParams = new URLSearchParams({
          ...filters,
          export: 'true',
        })

        const response = await fetch(`${endpoint}?${searchParams}`)
        if (!response.ok) {
          throw new Error('Export failed')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Export error:', error)
        throw error
      } finally {
        setExporting(false)
      }
    },
    []
  )

  return {
    exportData,
    exporting,
  }
}
