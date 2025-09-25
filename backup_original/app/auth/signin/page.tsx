import { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { SignInForm } from '@/components/auth/SignInForm'

export const metadata: Metadata = {
  title: 'Sign In | Home Textile Store',
  description:
    'Sign in to your account to access your orders, wishlist, and more.',
}

export default async function SignInPage({
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
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account to continue shopping
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <SignInForm redirectTo={searchParams.callbackUrl} />
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
