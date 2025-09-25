'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { Loader2 } from 'lucide-react'

interface PayPalCheckoutProps {
  orderId: string
  amount: number
  orderCurrency?: string
  disabled?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function PayPalCheckout({
  orderId,
  amount,
  orderCurrency = 'USD',
  disabled = false,
  onSuccess,
  onError,
}: PayPalCheckoutProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const environment =
    process.env.PAYPAL_ENVIRONMENT === 'live' ? 'production' : 'sandbox'

  if (!clientId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">
          PayPal is not configured properly
        </p>
      </div>
    )
  }

  const createOrder = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/paypal/create-order', {
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
        throw new Error(data.error || 'Failed to create PayPal order')
      }

      setPaypalOrderId(data.orderId)
      return data.orderId
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create PayPal order'
      console.error('PayPal order creation error:', err)
      setError(errorMessage)
      onError?.(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const onApprove = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/paypal/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paypalOrderId: data.orderID,
          orderId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to capture PayPal payment')
      }

      if (onSuccess) onSuccess()
      else router.push(`/checkout/success?order_id=${orderId}`)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to capture PayPal payment'
      console.error('PayPal capture error:', err)
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const onErrorHandler = (err: any) => {
    console.error('PayPal error:', err)
    const errorMessage = 'PayPal payment failed. Please try again.'
    setError(errorMessage)
    onError?.(errorMessage)
  }

  const onCancel = () => {
    setError('PayPal payment was cancelled')
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="mb-3 flex items-center space-x-3">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600">
            <span className="text-xs font-bold text-white">PP</span>
          </div>
          <h3 className="font-medium text-gray-900">PayPal Checkout</h3>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          Pay securely with your PayPal account or credit card.
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

        {isLoading && (
          <div className="mb-4 flex items-center justify-center py-4">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Processing payment...</span>
          </div>
        )}

        <PayPalScriptProvider
          options={{
            'client-id': clientId,
            currency: orderCurrency,
            intent: 'capture',
            'data-client-token': undefined,
            'disable-funding': 'credit',
            components: 'buttons',
          }}
        >
          <PayPalButtons
            disabled={disabled || isLoading}
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'paypal',
              height: 45,
            }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onErrorHandler}
            onCancel={onCancel}
            forceReRender={[orderId, amount]}
          />
        </PayPalScriptProvider>

        <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-gray-500">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Secured by PayPal</span>
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-500">
        <p>• Your payment is processed securely by PayPal</p>
        <p>• You can pay with your PayPal balance or linked cards</p>
        <p>• PayPal Buyer Protection included</p>
      </div>
    </div>
  )
}
