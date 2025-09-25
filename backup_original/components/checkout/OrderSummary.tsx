'use client'

import Image from 'next/image'
import { calculateCartTotals } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/types'

interface OrderSummaryProps {
  items: CartItem[]
}

export function OrderSummary({ items }: OrderSummaryProps) {
  const { subtotal, tax, shipping, total, qualifiesForFreeShipping } =
    calculateCartTotals(items)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Order Summary
      </h2>

      {/* Items */}
      <div className="mb-6 space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex space-x-4">
            {/* Product Image */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
              {item.product.images?.[0] ? (
                <Image
                  src={item.product.images[0].url}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <span className="text-xs text-gray-400">No image</span>
                </div>
              )}
              {item.quantity > 1 && (
                <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
                  {item.quantity}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-medium text-gray-900">
                {item.product.name}
              </h4>
              {item.variant && (
                <p className="text-sm text-gray-500">
                  {item.variant.type}: {item.variant.value}
                </p>
              )}
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Qty: {item.quantity}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Totals */}
      <div className="space-y-3 border-t pt-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="text-gray-900">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">{formatPrice(tax)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shipping === 0 ? (
              <span className="font-medium text-green-600">Free</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>

        {qualifiesForFreeShipping && (
          <div className="flex items-center text-sm text-green-600">
            <span className="mr-1">🎉</span>
            <span>You qualified for free shipping!</span>
          </div>
        )}

        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Estimated Delivery */}
      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">🚚</span>
          <div>
            <p className="font-medium">Estimated Delivery</p>
            <p>3-5 business days</p>
          </div>
        </div>
      </div>
    </div>
  )
}
