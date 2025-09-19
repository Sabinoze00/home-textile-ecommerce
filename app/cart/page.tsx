'use client'

import { ArrowLeft, ShoppingCart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { CartItem } from '@/components/cart/CartItem'
import { Button } from '@/components/ui/button'

export default function CartPage() {
  const { items, itemCount, subtotal, total, clearCart } = useCart()

  const TAX_RATE = 0.08
  const SHIPPING_THRESHOLD = 75
  const SHIPPING_COST = 9.99

  const tax = subtotal * TAX_RATE
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const freeShippingRemaining = SHIPPING_THRESHOLD - subtotal

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Shopping Cart</span>
          </nav>

          {/* Empty Cart */}
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
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
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Shopping Cart</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <Button
            variant="ghost"
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Free Shipping Progress */}
              {subtotal > 0 && subtotal < SHIPPING_THRESHOLD && (
                <div className="p-6 bg-green-50 border-b">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-green-800 font-medium">
                      Add ${freeShippingRemaining.toFixed(2)} more for free shipping!
                    </span>
                    <span className="text-green-600">
                      ${subtotal.toFixed(2)} / ${SHIPPING_THRESHOLD.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {subtotal >= SHIPPING_THRESHOLD && (
                <div className="p-6 bg-green-100 border-b">
                  <p className="text-green-800 font-medium flex items-center">
                    <span className="mr-2">🎉</span>
                    You qualified for free shipping!
                  </p>
                </div>
              )}

              {/* Items List */}
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
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
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4">
                {/* Summary Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
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
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
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
                <div className="text-xs text-gray-500 text-center">
                  <p>🔒 Secure checkout with SSL encryption</p>
                </div>

                {/* Payment Methods */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">We accept:</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">Visa</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">Mastercard</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">PayPal</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">Apple Pay</span>
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