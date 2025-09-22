'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, CreditCard } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { Button } from '@/components/ui/button'

export function CheckoutClient() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: items.map(item => ({
            productId: item.product.id,
            variantId: item.variant?.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      })

      const result = await response.json()

      if (result.success) {
        clearCart()
        router.push(`/order-confirmation/${result.data.orderId}`)
      } else {
        throw new Error(result.error || 'Checkout failed')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('There was an error processing your order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-gray-900">
            Cart
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-900">Checkout</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="mt-2 text-gray-600">
                Review your order and provide shipping information
              </p>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center">
            <Lock className="mr-3 h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Secure Checkout
              </p>
              <p className="text-sm text-green-600">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>

        {/* Checkout Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-textile-navy text-sm font-medium text-white">
                1
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                Shipping
              </span>
            </div>
            <div className="h-px w-16 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600">
                2
              </div>
              <span className="ml-3 text-sm font-medium text-gray-500">
                Payment
              </span>
            </div>
            <div className="h-px w-16 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600">
                3
              </div>
              <span className="ml-3 text-sm font-medium text-gray-500">
                Review
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Checkout Form */}
          <div className="lg:col-span-1">
            <CheckoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OrderSummary items={items} />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-sm text-gray-500">We accept</p>
          <div className="flex items-center justify-center space-x-6">
            <CreditCard className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500">Visa</span>
            <span className="text-sm text-gray-500">Mastercard</span>
            <span className="text-sm text-gray-500">PayPal</span>
          </div>
        </div>
      </div>
    </div>
  )
}
