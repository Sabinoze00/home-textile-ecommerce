import { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { SignUpForm } from '@/components/auth/SignUpForm'

export const metadata: Metadata = {
  title: 'Sign Up | Home Textile Store',
  description:
    'Create your account to start shopping for premium home textiles.',
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  const session = await getServerSession(authOptions)

  // Redirect if already signed in
  if (session) {
    redirect(searchParams.callbackUrl || '/')
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link href="/" className="flex justify-center">
          <div className="text-2xl font-bold text-textile-navy">
            Home Textiles
          </div>
        </Link>

        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join thousands of customers who love our premium textiles
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <SignUpForm redirectTo={searchParams.callbackUrl} />
        </div>

        {/* Benefits */}
        <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-medium text-gray-900">
            Why create an account?
          </h3>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Track your orders and delivery status</li>
            <li>• Save your favorite items to wishlist</li>
            <li>• Faster checkout with saved addresses</li>
            <li>• Exclusive member discounts and early access</li>
            <li>• Personalized product recommendations</li>
          </ul>
        </div>

        {/* Help Links */}
        <div className="mt-6 text-center text-sm">
          <div className="space-x-1">
            <Link
              href="/help"
              className="text-gray-500 underline hover:text-gray-700"
            >
              Need help?
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/contact"
              className="text-gray-500 underline hover:text-gray-700"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
