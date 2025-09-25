'use client'

import { useState, useEffect } from 'react'
import { AdminMetrics } from '@/types'
import { MetricCard } from '@/components/admin/MetricCard'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
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

export default function AdminAnalytics() {
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
        error instanceof Error ? error.message : 'Failed to load analytics'
      )
    } finally {
      setLoading(false)
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
          <h3 className="font-medium text-red-800">Error Loading Analytics</h3>
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
    return <div>No analytics data available</div>
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-gray-600">
          Detailed performance analytics and insights
        </p>
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
          change={0}
          changeType="neutral"
          icon={Package}
          color="purple"
        />
        <MetricCard
          title="Customers"
          value={metrics.totalCustomers.toLocaleString()}
          change={0}
          changeType="neutral"
          icon={Users}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">
            Revenue Trend (12 Months)
          </h3>
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
          <h3 className="mb-6 text-lg font-semibold text-gray-900">
            Top Selling Products
          </h3>
          <div className="space-y-4">
            {metrics.topSellingProducts.map((product, index) => (
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
                        width: `${Math.min((product.revenue / (metrics.topSellingProducts[0]?.revenue || 1)) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
