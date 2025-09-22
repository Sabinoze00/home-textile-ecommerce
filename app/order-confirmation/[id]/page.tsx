'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Truck, Package, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

interface OrderConfirmationPageProps {
  params: {
    id: string
  }
}

export default function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        const result = await response.json()

        if (result.success) {
          setOrder(result.data)
        } else {
          setError(result.error || 'Order not found')
        }
      } catch (err) {
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [session, params.id, router])

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-textile-navy"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Order Not Found
          </h1>
          <p className="mb-8 text-gray-600">{error}</p>
          <Button asChild>
            <Link href="/account/orders">View All Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="mb-12 text-center">
          <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" />
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Order Confirmed!
          </h1>
          <p className="mb-4 text-lg text-gray-600">
            Thank you for your order. We'll send you a confirmation email
            shortly.
          </p>
          <div className="inline-block rounded-lg bg-white p-4">
            <p className="mb-1 text-sm text-gray-500">Order Number</p>
            <p className="text-xl font-bold text-gray-900">
              {order.orderNumber}
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Order Items */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex space-x-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {item.productName}
                    </h4>
                    {item.variantName && item.variantValue && (
                      <p className="text-sm text-gray-500">
                        {item.variantName}: {item.variantValue}
                      </p>
                    )}
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPrice(Number(item.total))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  {formatPrice(Number(order.subtotal))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">
                  {formatPrice(Number(order.tax))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {Number(order.shipping) === 0
                    ? 'Free'
                    : formatPrice(Number(order.shipping))}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(Number(order.total))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Shipping Address
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-medium text-gray-900">
                {order.shippingAddress.firstName}{' '}
                {order.shippingAddress.lastName}
              </p>
              {order.shippingAddress.company && (
                <p>{order.shippingAddress.company}</p>
              )}
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p>{order.shippingAddress.phone}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Estimated Delivery
            </h3>
            <div className="mb-4 flex items-center text-sm text-gray-600">
              <Truck className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Standard Shipping</p>
                <p>3-5 business days</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Order Date</p>
                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 text-center">
          <div className="space-x-4">
            <Button asChild>
              <Link href="/account/orders">View All Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <Link href="/contact" className="text-textile-navy hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
