import { Metadata } from 'next'
import {
  XCircle,
  RefreshCw,
  HelpCircle,
  ArrowLeft,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Payment Cancelled - Home Textile Store',
  description:
    'Your payment was cancelled. You can try again or choose a different payment method.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600">
            Your payment was cancelled or encountered an issue. Don't worry -
            your items are still in your cart.
          </p>
        </div>

        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            What happened?
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></div>
              <p>You cancelled the payment process</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></div>
              <p>Your payment method was declined</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></div>
              <p>There was a technical issue with the payment processor</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400"></div>
              <p>Your session expired due to inactivity</p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-3 flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Try Again</h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              Your cart is preserved. You can retry payment with the same or
              different method.
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/checkout">Return to Checkout</Link>
            </Button>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-3 flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-gray-900">
                Different Payment Method
              </h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              Try using a different payment method like PayPal or another card.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/checkout">Choose Payment Method</Link>
            </Button>
          </div>
        </div>

        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start space-x-3">
            <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-2 font-medium text-blue-900">
                Common Payment Issues & Solutions
              </h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div>
                  <strong>Card Declined:</strong> Check your card details,
                  available balance, or try a different card.
                </div>
                <div>
                  <strong>Expired Card:</strong> Make sure your card hasn't
                  expired and the expiry date is correct.
                </div>
                <div>
                  <strong>Insufficient Funds:</strong> Ensure you have enough
                  available credit or funds.
                </div>
                <div>
                  <strong>Security Verification:</strong> Your bank may require
                  additional verification for online purchases.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/cart">
                <ArrowLeft className="mr-2 h-4 w-4" />
                View Cart
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>

          <p className="text-sm text-gray-600">
            Your cart items are saved for 24 hours. Complete your purchase
            anytime before they expire.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-2 font-medium text-gray-900">Need Help?</h3>
          <p className="mb-3 text-sm text-gray-600">
            If you continue to experience payment issues, our customer support
            team is here to help.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="sm" asChild>
              <Link href="/support">Contact Support</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/support/faq">View FAQ</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
