'use client'

import { useEffect, useState, Suspense } from 'react'
import { MetricCard } from '@/components/admin/MetricCard'
import { AdminMetrics } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
              </div>
              <div className="mb-2 h-8 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/3 rounded bg-gray-200"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-80 rounded bg-gray-200"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-80 rounded bg-gray-200"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MainDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/analytics')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics')
      }

      setMetrics(data.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to load dashboard'
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
            <CardTitle className="font-medium text-red-800">Error Loading Dashboard</CardTitle>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return <div>No data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-gray-600">
            Monitor your store performance and key metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Sales"
          value={`$${metrics.totalSales.toLocaleString()}`}
          change={metrics.revenueGrowth}
          changeType={metrics.revenueGrowth >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          change={metrics.orderGrowth}
          changeType={metrics.orderGrowth >= 0 ? 'positive' : 'negative'}
          icon={ShoppingCart}
          color="green"
        />
        <MetricCard
          title="Products"
          value={metrics.totalProducts.toLocaleString()}
          change={0} // Static for now
          changeType="neutral"
          icon={Package}
          color="purple"
        />
        <MetricCard
          title="Customers"
          value={metrics.totalCustomers.toLocaleString()}
          change={0} // Static for now
          changeType="neutral"
          icon={Users}
          color="orange"
        />
      </div>

      {/* Charts and Additional Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Top Selling Products
              </CardTitle>
              <Link
                href="/admin/products"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topSellingProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <span className="text-sm font-medium text-gray-600">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="max-w-[200px] truncate font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.sales} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${product.revenue.toLocaleString()}
                    </p>
                    <div className="h-2 w-16 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{
                          width: `${Math.min((product.revenue / metrics.topSellingProducts[0].revenue) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                href="/admin/products"
                className="flex items-center rounded-lg bg-blue-50 p-3 transition-colors hover:bg-blue-100"
              >
                <Package className="mr-3 h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Add New Product</p>
                  <p className="text-sm text-blue-700">
                    Create a new product listing
                  </p>
                </div>
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center rounded-lg bg-green-50 p-3 transition-colors hover:bg-green-100"
              >
                <ShoppingCart className="mr-3 h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Process Orders</p>
                  <p className="text-sm text-green-700">Manage pending orders</p>
                </div>
              </Link>
              <Link
                href="/admin/analytics"
                className="flex items-center rounded-lg bg-purple-50 p-3 transition-colors hover:bg-purple-100"
              >
                <TrendingUp className="mr-3 h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">View Analytics</p>
                  <p className="text-sm text-purple-700">
                    Detailed performance reports
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm text-gray-600">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Recent Activity
              </CardTitle>
              <Link
                href="/admin/orders"
                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium text-gray-900">
                    New order #1001 received
                  </p>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Customer: John Doe • $245.00 • 2 items • Just now
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-medium text-gray-900">
                    Order #1000 shipped
                  </p>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Customer: Jane Smith • $189.99 • 3 items • 1 hour ago
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-gray-900">
                    Product updated
                  </p>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Premium Cotton Bedsheet • Stock: 25 units • 2 hours ago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <MainDashboard />
    </Suspense>
  )
}