'use client'

import { ShoppingCart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { CartItem } from './CartItem'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface CartDrawerProps {
  children?: React.ReactNode
  className?: string
}

export function CartDrawer({ children, className }: CartDrawerProps) {
  const { items, itemCount, subtotal, total, clearCart } = useCart()

  const TAX_RATE = 0.08
  const SHIPPING_THRESHOLD = 75
  const SHIPPING_COST = 9.99

  const tax = subtotal * TAX_RATE
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const freeShippingRemaining = SHIPPING_THRESHOLD - subtotal

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className={cn("relative", className)}>
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some items to get started</p>
            <DialogTrigger asChild>
              <Button asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </DialogTrigger>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress */}
            {subtotal > 0 && subtotal < SHIPPING_THRESHOLD && (
              <div className="px-6 py-4 bg-green-50 border-b">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-800">
                    Add ${freeShippingRemaining.toFixed(2)} more for free shipping!
                  </span>
                </div>
                <div className="mt-2 bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {subtotal >= SHIPPING_THRESHOLD && (
              <div className="px-6 py-3 bg-green-100 border-b">
                <p className="text-sm text-green-800 font-medium">
                  🎉 You qualified for free shipping!
                </p>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} compact />
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="border-t bg-gray-50 p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <DialogTrigger asChild>
                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout">
                      Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </DialogTrigger>

                <div className="flex space-x-2">
                  <DialogTrigger asChild>
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/cart">View Cart</Link>
                    </Button>
                  </DialogTrigger>

                  <Button
                    variant="ghost"
                    className="flex-1"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>

                <DialogTrigger asChild>
                  <Button variant="ghost" asChild className="w-full">
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </DialogTrigger>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}