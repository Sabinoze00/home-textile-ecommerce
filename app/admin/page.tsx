import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Database,
  Eye,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Cozy Home',
  description: 'Admin dashboard for managing your e-commerce store',
}

async function getStats() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  try {
    const [productsRes, categoriesRes, ordersRes] = await Promise.all([
      fetch(`${baseUrl}/api/products`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/categories`, { cache: 'no-store' }),
      fetch(`${baseUrl}/api/orders`, { cache: 'no-store' }),
    ])

    const products = await productsRes.json()
    const categories = await categoriesRes.json()
    const orders = ordersRes.ok ? await ordersRes.json() : { data: [] }

    return {
      productsCount: products.pagination?.total || 0,
      categoriesCount: categories.data?.length || 0,
      ordersCount: orders.data?.length || 0,
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return {
      productsCount: 0,
      categoriesCount: 0,
      ordersCount: 0,
    }
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authConfig)

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  const stats = await getStats()

  const dashboardCards = [
    {
      title: 'Products',
      count: stats.productsCount,
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-500',
    },
    {
      title: 'Categories',
      count: stats.categoriesCount,
      icon: BarChart3,
      href: '/admin/categories',
      color: 'bg-green-500',
    },
    {
      title: 'Orders',
      count: stats.ordersCount,
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-yellow-500',
    },
    {
      title: 'Users',
      count: '?',
      icon: Users,
      href: '/admin/users',
      color: 'bg-purple-500',
    },
  ]

  const quickLinks = [
    {
      title: 'Prisma Studio',
      description: 'Database interface',
      href: 'http://localhost:5556',
      icon: Database,
      external: true,
    },
    {
      title: 'View Site',
      description: 'Visit storefront',
      href: '/',
      icon: Eye,
      external: false,
    },
    {
      title: 'Settings',
      description: 'System settings',
      href: '/admin/settings',
      icon: Settings,
      external: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-gray-600">
                Welcome back, {session.user?.name || session.user?.email}
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Admin Access
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map(card => {
            const IconComponent = card.icon
            return (
              <Link key={card.title} href={card.href}>
                <Card className="cursor-pointer p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-center">
                    <div className={`rounded-lg p-3 ${card.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {card.title}
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {card.count}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <h2 className="text-xl font-semibold text-gray-900 md:col-span-3">
            Quick Links
          </h2>
          {quickLinks.map(link => {
            const IconComponent = link.icon
            const LinkComponent = link.external ? 'a' : Link
            const linkProps = link.external
              ? {
                  href: link.href,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                }
              : { href: link.href }

            return (
              <LinkComponent key={link.title} {...linkProps}>
                <Card className="cursor-pointer p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-center">
                    <IconComponent className="h-8 w-8 text-gray-600" />
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </LinkComponent>
            )
          })}
        </div>

        {/* Recent Activity Placeholder */}
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Recent Activity
          </h2>
          <p className="text-gray-600">
            This section will show recent orders, product updates, and system
            activity.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between border-b border-gray-100 py-2">
              <span className="text-sm text-gray-600">System initialized</span>
              <span className="text-xs text-gray-400">Just now</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 py-2">
              <span className="text-sm text-gray-600">Admin user created</span>
              <span className="text-xs text-gray-400">Today</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
