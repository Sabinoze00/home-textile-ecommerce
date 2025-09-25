'use client'

import { useEffect, useState } from 'react'
import { MetricCard } from '@/components/admin/MetricCard'
import { AdminMetrics, AdminOrderTableRow } from '@/types'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle,
  ExternalLink,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import Link from 'next/link'

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [recentOrders, setRecentOrders] = useState<AdminOrderTableRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
    fetchRecentOrders()
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

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders?limit=5&page=1')
      const data = await response.json()

      if (response.ok) {
        setRecentOrders(data.data || [])
      } else {
        console.error('Failed to fetch recent orders:', data.error)
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })

      if (response.ok) {
        // Refresh recent orders after successful update
        await fetchRecentOrders()
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="mb-2 h-8 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/3 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
          <h3 className="font-medium text-red-800">Error Loading Dashboard</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!metrics) {
    return <div>No data available</div>
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

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

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue Trend
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <TrendingUp className="mr-1 h-4 w-4" />
              Last 12 months
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={value => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `$${value.toLocaleString()}`,
                    'Revenue',
                  ]}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#1D4ED8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Selling Products
            </h3>
            <Link
              href="/admin/products"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
            </Link>
          </div>
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
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h3>
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
        </div>

        {/* System Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            System Status
          </h3>
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
        </div>

        {/* Recent Orders */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
              <ExternalLink className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.status === 'PENDING'
                            ? 'bg-orange-100 text-orange-800'
                            : order.status === 'CONFIRMED'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'PROCESSING'
                                ? 'bg-purple-100 text-purple-800'
                                : order.status === 'SHIPPED'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'DELIVERED'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      {order.customerName} • ${order.total.toFixed(2)} •{' '}
                      {order.itemCount} items
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        className="rounded p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                        title="Confirm Order"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, 'PROCESSING')
                        }
                        className="rounded p-1 text-purple-600 hover:bg-purple-50 hover:text-purple-800"
                        title="Start Processing"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                    )}
                    {order.status === 'PROCESSING' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                        className="rounded p-1 text-green-600 hover:bg-green-50 hover:text-green-800"
                        title="Mark as Shipped"
                      >
                        <Package className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
