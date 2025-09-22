'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin?callbackUrl=/account')
      return
    }
  }, [session, status, router])

  if (status === 'loading' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-textile-navy"></div>
      </div>
    )
  }

  const accountSections = [
    {
      title: 'Profile',
      description: 'Manage your personal information',
      icon: User,
      href: '/account/profile',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Orders',
      description: 'View your order history and track deliveries',
      icon: Package,
      href: '/account/orders',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Addresses',
      description: 'Manage your shipping and billing addresses',
      icon: MapPin,
      href: '/account/addresses',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Wishlist',
      description: 'Items you saved for later',
      icon: Heart,
      href: '/account/wishlist',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Settings',
      description: 'Account preferences and notifications',
      icon: Settings,
      href: '/account/settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Overview</h1>
        <p className="mt-2 text-gray-600">
          Manage your account and preferences
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
              <p className="text-sm text-gray-600">
                Jump to commonly used features
              </p>
            </div>
            <div className="flex space-x-4">
              <Button asChild variant="outline">
                <Link href="/products" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
              <Button asChild>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  View Orders
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Sections */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {accountSections.map(section => (
          <Card
            key={section.title}
            className="cursor-pointer transition-shadow hover:shadow-lg"
          >
            <Link href={section.href}>
              <CardHeader className="pb-4">
                <div
                  className={`h-12 w-12 ${section.bgColor} mb-4 flex items-center justify-center rounded-lg`}
                >
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest account activity</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="py-8 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">No recent activity to show</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
