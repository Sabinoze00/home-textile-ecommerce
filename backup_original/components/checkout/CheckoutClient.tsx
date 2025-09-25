'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, CreditCard } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { PaymentMethods } from '@/components/checkout/PaymentMethods'
import { StripeCheckout } from '@/components/checkout/StripeCheckout'
import { PayPalCheckout } from '@/components/checkout/PayPalCheckout'
import { Button } from '@/components/ui/button'
import { PaymentProviderKey } from '@/types'

export function CheckoutClient() {
  const router = useRouter()
  const { items, clearCart, totals } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingData, setShippingData] = useState<any>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentProviderKey | null>(null)

  const handleShippingSubmit = async (formData: any) => {
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
        setShippingData(formData)
        setOrderId(result.data.orderId)
        setCurrentStep(2)
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

  const handlePaymentSuccess = () => {
    clearCart()
    if (orderId) router.push(`/checkout/success?order_id=${orderId}`)
    else router.push('/checkout/success')
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    alert(`Payment failed: ${error}`)
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
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep >= 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
              <span
                className={`ml-3 text-sm font-medium ${
                  currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                Shipping
              </span>
            </div>
            <div
              className={`h-px w-16 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}
            ></div>
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep >= 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <span
                className={`ml-3 text-sm font-medium ${
                  currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                Payment
              </span>
            </div>
            <div
              className={`h-px w-16 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}
            ></div>
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep >= 3
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                3
              </div>
              <span
                className={`ml-3 text-sm font-medium ${
                  currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                Complete
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - Forms */}
          <div className="lg:col-span-1">
            {currentStep === 1 && (
              <div>
                <h2 className="mb-6 text-xl font-semibold text-gray-900">
                  Shipping Information
                </h2>
                <CheckoutForm
                  onSubmit={handleShippingSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Payment Method
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                      className="text-sm"
                    >
                      Edit Shipping
                    </Button>
                  </div>

                  <PaymentMethods
                    selectedMethod={selectedPaymentMethod}
                    onMethodSelect={setSelectedPaymentMethod}
                    disabled={!orderId}
                  />
                </div>

                {selectedPaymentMethod && orderId && (
                  <div className="mt-6">
                    {selectedPaymentMethod === 'stripe' && (
                      <StripeCheckout
                        orderId={orderId}
                        amount={totals?.total || 0}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    )}

                    {selectedPaymentMethod === 'paypal' && (
                      <PayPalCheckout
                        orderId={orderId}
                        amount={totals?.total || 0}
                        orderCurrency="USD"
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OrderSummary items={items} />

              {currentStep === 2 && shippingData && (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="mb-3 font-medium text-gray-900">
                    Shipping Address
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      {shippingData.shippingAddress?.firstName}{' '}
                      {shippingData.shippingAddress?.lastName}
                    </p>
                    <p>{shippingData.shippingAddress?.street}</p>
                    <p>
                      {shippingData.shippingAddress?.city},{' '}
                      {shippingData.shippingAddress?.state}{' '}
                      {shippingData.shippingAddress?.postalCode}
                    </p>
                    <p>{shippingData.shippingAddress?.country}</p>
                  </div>
                </div>
              )}
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
