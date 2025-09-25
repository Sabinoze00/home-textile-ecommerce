'use client'

import { ArrowLeft, ShoppingCart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { CartItem } from '@/components/cart/CartItem'
import { Button } from '@/components/ui/button'
import { calculateCartTotals, CART_CONSTANTS } from '@/lib/utils'

export default function CartPage() {
  const { items, itemCount, subtotal, total, clearCart } = useCart()

  const { tax, shipping, freeShippingRemaining, qualifiesForFreeShipping } =
    calculateCartTotals(items)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-gray-900">Shopping Cart</span>
          </nav>

          {/* Empty Cart */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="rounded-lg bg-white p-12 shadow-sm">
              <ShoppingCart className="mx-auto mb-6 h-16 w-16 text-gray-400" />
              <h1 className="mb-4 text-2xl font-bold text-gray-900">
                Your cart is empty
              </h1>
              <p className="mb-8 text-gray-600">
                Looks like you haven't added anything to your cart yet. Start
                shopping to fill it up!
              </p>
              <Button asChild size="lg">
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-900">Shopping Cart</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <Button
            variant="ghost"
            onClick={clearCart}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
              {/* Free Shipping Progress */}
              {subtotal > 0 && !qualifiesForFreeShipping && (
                <div className="border-b bg-green-50 p-6">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-green-800">
                      Add ${freeShippingRemaining.toFixed(2)} more for free
                      shipping!
                    </span>
                    <span className="text-green-600">
                      ${subtotal.toFixed(2)} / $
                      {CART_CONSTANTS.SHIPPING_THRESHOLD.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-green-200">
                    <div
                      className="h-2 rounded-full bg-green-600 transition-all"
                      style={{
                        width: `${Math.min((subtotal / CART_CONSTANTS.SHIPPING_THRESHOLD) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {qualifiesForFreeShipping && (
                <div className="border-b bg-green-100 p-6">
                  <p className="flex items-center font-medium text-green-800">
                    <span className="mr-2">🎉</span>
                    You qualified for free shipping!
                  </p>
                </div>
              )}

              {/* Items List */}
              <div className="divide-y divide-gray-200">
                {items.map(item => (
                  <div key={item.id} className="p-6">
                    <CartItem item={item} />
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Button variant="outline" asChild>
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-4">
                {/* Summary Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}
                      )
                    </span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                {/* Security Notice */}
                <div className="text-center text-xs text-gray-500">
                  <p>🔒 Secure checkout with SSL encryption</p>
                </div>

                {/* Payment Methods */}
                <div className="border-t pt-4">
                  <p className="mb-2 text-sm text-gray-600">We accept:</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className="rounded bg-gray-100 px-2 py-1">Visa</span>
                    <span className="rounded bg-gray-100 px-2 py-1">
                      Mastercard
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-1">
                      PayPal
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-1">
                      Apple Pay
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
