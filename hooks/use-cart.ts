'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product, ProductVariant, CartItem } from '@/types'
import { calculateCartTotals, CART_CONSTANTS } from '@/lib/utils'

interface CartStore {
  items: CartItem[]
  itemCount: number
  subtotal: number
  total: number

  // Actions
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getItem: (productId: string, variantId?: string) => CartItem | undefined
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      subtotal: 0,
      total: 0,

      addItem: (product: Product, variant?: ProductVariant, quantity = 1) => {
        const existingItem = get().getItem(product.id.toString(), variant?.id.toString())

        if (existingItem) {
          // Update quantity of existing item
          get().updateQuantity(existingItem.id, existingItem.quantity + quantity)
        } else {
          // Add new item
          const newItem: CartItem = {
            id: `${product.id}-${variant?.id || 'default'}-${Date.now()}`,
            product,
            variant,
            quantity,
            price: variant?.price || product.price,
            addedAt: new Date(),
          }

          set((state) => {
            const newItems = [...state.items, newItem]
            const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
            const { subtotal, total } = calculateCartTotals(newItems)

            return {
              items: newItems,
              itemCount,
              subtotal,
              total,
            }
          })
        }
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const newItems = state.items.filter(item => item.id !== itemId)
          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const { subtotal, total } = calculateCartTotals(newItems)

          return {
            items: newItems,
            itemCount,
            subtotal,
            total,
          }
        })
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        set((state) => {
          const newItems = state.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const { subtotal, total } = calculateCartTotals(newItems)

          return {
            items: newItems,
            itemCount,
            subtotal,
            total,
          }
        })
      },

      clearCart: () => {
        set({
          items: [],
          itemCount: 0,
          subtotal: 0,
          total: 0,
        })
      },

      getItem: (productId: string, variantId?: string) => {
        const items = get().items
        return items.find(item =>
          item.product.id.toString() === productId &&
          item.variant?.id.toString() === variantId
        )
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist items array, recalculate totals on hydration
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Recalculate totals after hydration
          const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
          const { subtotal, total } = calculateCartTotals(state.items)

          state.subtotal = subtotal
          state.itemCount = itemCount
          state.total = total
        }
      },
    }
  )
)