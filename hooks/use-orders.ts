'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  subtotal: number
  tax: number
  shipping: number
  total: number
  notes?: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
}

export interface OrderItem {
  id: string
  quantity: number
  price: number
  total: number
  productId: string
  variantId?: string
  productName: string
  productSlug: string
  productImage: string
  variantName?: string
  variantValue?: string
}

export interface Address {
  id: string
  firstName: string
  lastName: string
  company?: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  type: 'shipping' | 'billing'
}

const ORDERS_QUERY_KEY = 'orders'
const ORDER_QUERY_KEY = 'order'

// Fetch all orders for the current user
export function useOrders() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: [ORDERS_QUERY_KEY],
    queryFn: async (): Promise<Order[]> => {
      const response = await fetch('/api/orders')
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch orders')
      }

      return result.data
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Fetch a specific order by ID
export function useOrder(orderId: string) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: [ORDER_QUERY_KEY, orderId],
    queryFn: async (): Promise<Order> => {
      const response = await fetch(`/api/orders/${orderId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch order')
      }

      return result.data
    },
    enabled: !!session && !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Cancel an order (only if status is PENDING)
export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string): Promise<Order> => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel order')
      }

      return result.data
    },
    onSuccess: (updatedOrder) => {
      // Update the specific order in the cache
      queryClient.setQueryData([ORDER_QUERY_KEY, updatedOrder.id], updatedOrder)

      // Update the order in the orders list cache
      queryClient.setQueryData([ORDERS_QUERY_KEY], (oldOrders: Order[] | undefined) => {
        if (!oldOrders) return oldOrders
        return oldOrders.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      })
    },
    onError: (error) => {
      console.error('Failed to cancel order:', error)
    },
  })
}

// Create a new order (checkout)
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderData: any): Promise<{ orderId: string; order: Order }> => {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create order')
      }

      return result.data
    },
    onSuccess: () => {
      // Invalidate orders query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] })
    },
    onError: (error) => {
      console.error('Failed to create order:', error)
    },
  })
}

// Prefetch order data
export function usePrefetchOrder() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return (orderId: string) => {
    if (!session || !orderId) return

    queryClient.prefetchQuery({
      queryKey: [ORDER_QUERY_KEY, orderId],
      queryFn: async (): Promise<Order> => {
        const response = await fetch(`/api/orders/${orderId}`)
        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch order')
        }

        return result.data
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }
}

// Get order status display information
export function getOrderStatusInfo(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Your order is being processed',
      }
    case 'processing':
      return {
        label: 'Processing',
        color: 'bg-blue-100 text-blue-800',
        description: 'Your order is being prepared',
      }
    case 'shipped':
      return {
        label: 'Shipped',
        color: 'bg-purple-100 text-purple-800',
        description: 'Your order is on its way',
      }
    case 'delivered':
      return {
        label: 'Delivered',
        color: 'bg-green-100 text-green-800',
        description: 'Your order has been delivered',
      }
    case 'cancelled':
      return {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800',
        description: 'Your order has been cancelled',
      }
    default:
      return {
        label: 'Unknown',
        color: 'bg-gray-100 text-gray-800',
        description: 'Status unknown',
      }
  }
}