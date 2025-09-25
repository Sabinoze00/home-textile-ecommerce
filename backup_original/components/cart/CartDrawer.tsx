'use client'

import { ShoppingCart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { CartItem } from './CartItem'
import { Button } from '@/components/ui/button'
import { calculateCartTotals, CART_CONSTANTS } from '@/lib/utils'
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

  const { tax, shipping, freeShippingRemaining, qualifiesForFreeShipping } =
    calculateCartTotals(items)

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className={cn('relative', className)}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="flex h-[90vh] flex-col p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <ShoppingCart className="mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Your cart is empty
            </h3>
            <p className="mb-6 text-gray-500">Add some items to get started</p>
            <DialogTrigger asChild>
              <Button asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </DialogTrigger>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress */}
            {subtotal > 0 && !qualifiesForFreeShipping && (
              <div className="border-b bg-green-50 px-6 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-800">
                    Add ${freeShippingRemaining.toFixed(2)} more for free
                    shipping!
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-green-200">
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
              <div className="border-b bg-green-100 px-6 py-3">
                <p className="text-sm font-medium text-green-800">
                  🎉 You qualified for free shipping!
                </p>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6">
                {items.map(item => (
                  <CartItem key={item.id} item={item} compact />
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="space-y-4 border-t bg-gray-50 p-6">
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
                      <span className="font-medium text-green-600">Free</span>
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
