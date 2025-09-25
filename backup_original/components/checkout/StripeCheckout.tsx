'use client'

import { useState } from 'react'
import { Loader2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StripeCheckoutProps {
  orderId: string
  amount: number
  disabled?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function StripeCheckout({
  orderId,
  amount,
  disabled = false,
  onSuccess,
  onError,
}: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStripeCheckout = async () => {
    if (!orderId) {
      const errorMsg = 'Order ID is required'
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/stripe/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      console.error('Stripe checkout error:', err)
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="mb-3 flex items-center space-x-3">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">Stripe Checkout</h3>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          You'll be redirected to Stripe's secure payment page to complete your
          purchase.
        </p>

        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <span>Total Amount:</span>
          <span className="font-medium text-gray-900">
            ${amount.toFixed(2)}
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <Button
          onClick={handleStripeCheckout}
          disabled={disabled || isLoading}
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating secure checkout...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay with Stripe
            </>
          )}
        </Button>

        <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-gray-500">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Secured by Stripe SSL encryption</span>
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-500">
        <p>• Your payment is processed securely by Stripe</p>
        <p>• We don't store your card information</p>
        <p>• You can cancel anytime before completing payment</p>
      </div>
    </div>
  )
}
