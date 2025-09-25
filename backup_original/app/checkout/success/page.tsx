import { Suspense } from 'react'
import { Metadata } from 'next'
import {
  CheckCircle,
  Package,
  CreditCard,
  Truck,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { retrieveCheckoutSession } from '@/lib/stripe'

export const metadata: Metadata = {
  title: 'Payment Successful - Home Textile Store',
  description: 'Your payment has been processed successfully.',
  robots: {
    index: false,
    follow: false,
  },
}

interface SuccessPageProps {
  searchParams: {
    session_id?: string
    order_id?: string
  }
}

async function getOrderData(sessionId?: string, orderId?: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  let order = null

  // If we have a Stripe session ID, verify it and get the order
  if (sessionId) {
    try {
      const stripeSession = await retrieveCheckoutSession(sessionId)
      const orderIdFromStripe = stripeSession.metadata?.orderId

      if (orderIdFromStripe) {
        order = await prisma.order.findFirst({
          where: {
            id: orderIdFromStripe,
            userId: session.user.id,
          },
          include: {
            items: true,
            shippingAddress: true,
            billingAddress: true,
          },
        })
      }
    } catch (error) {
      console.error('Error retrieving Stripe session:', error)
    }
  }

  // If no order found via Stripe session, try with order ID
  if (!order && orderId) {
    order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    })
  }

  // If still no order, try to find the most recent PAID order
  if (!order) {
    order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        paymentStatus: 'PAID',
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    })
  }

  return order
}

function OrderSummary({ order }: { order: any }) {
  if (!order) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-yellow-800">
          We're having trouble finding your order details. Please check your
          email for confirmation or contact support.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center space-x-3">
        <Package className="h-5 w-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-sm text-gray-600">Order Number</span>
          <span className="font-medium">{order.orderNumber}</span>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-sm text-gray-600">Payment Status</span>
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            {order.paymentStatus}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <span className="text-sm text-gray-600">Payment Method</span>
          <span className="font-medium capitalize">
            {order.paymentProvider === 'STRIPE' ? 'Credit Card' : 'PayPal'}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Items Ordered</h3>
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {item.productName}
                </p>
                {item.variantName && (
                  <p className="text-xs text-gray-600">
                    {item.variantName}: {item.variantValue}
                  </p>
                )}
                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm font-medium">
                ${Number(item.total).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>${Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span>${Number(order.shipping).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span>${Number(order.tax).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-semibold">
            <span>Total</span>
            <span>${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {order.shippingAddress && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h3 className="mb-2 font-medium text-gray-900">Shipping Address</h3>
            <div className="text-sm text-gray-600">
              <p>
                {order.shippingAddress.firstName}{' '}
                {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const order = await getOrderData(
    searchParams.session_id,
    searchParams.order_id
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your order. We've received your payment and will
            process your order shortly.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
          }
        >
          <OrderSummary order={order} />
        </Suspense>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-start space-x-3 rounded-lg border border-gray-200 bg-white p-4">
            <CreditCard className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Payment Confirmed</h3>
              <p className="mt-1 text-sm text-gray-600">
                Your payment has been processed securely.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border border-gray-200 bg-white p-4">
            <Package className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Order Processing</h3>
              <p className="mt-1 text-sm text-gray-600">
                We'll prepare your items for shipping.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border border-gray-200 bg-white p-4">
            <Truck className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">Shipping Updates</h3>
              <p className="mt-1 text-sm text-gray-600">
                You'll receive tracking information via email.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4 text-center">
          <p className="text-sm text-gray-600">
            A confirmation email has been sent to your email address with your
            order details.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/account/orders">
                View Order History
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 font-medium text-blue-900">Need Help?</h3>
          <p className="text-sm text-blue-800">
            If you have any questions about your order, please contact our
            customer support team.
          </p>
        </div>
      </div>
    </div>
  )
}
