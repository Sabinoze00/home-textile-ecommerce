'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product, ProductVariant, CartItem } from '@/types'

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

const TAX_RATE = 0.08 // 8% tax rate
const SHIPPING_THRESHOLD = 75 // Free shipping over $75
const SHIPPING_COST = 9.99

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
            const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
            const tax = subtotal * TAX_RATE
            const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
            const total = subtotal + tax + shipping

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
          const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const tax = subtotal * TAX_RATE
          const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
          const total = subtotal + tax + shipping

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
          const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
          const tax = subtotal * TAX_RATE
          const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
          const total = subtotal + tax + shipping

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
          const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
          const tax = subtotal * TAX_RATE
          const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
          const total = subtotal + tax + shipping

          state.subtotal = subtotal
          state.itemCount = itemCount
          state.total = total
        }
      },
    }
  )
)