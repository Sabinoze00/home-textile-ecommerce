import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Calculate date ranges for growth comparison
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())

    const [
      // Current period metrics
      totalSales,
      totalOrders,
      totalProducts,
      totalCustomers,

      // Previous period metrics for growth calculation
      previousSales,
      previousOrders,

      // Top selling products
      topProducts,

      // Monthly revenue data
      monthlyRevenue
    ] = await Promise.all([
      // Current period totals
      prisma.order.aggregate({
        where: {
          createdAt: { gte: lastMonth },
          paymentStatus: 'PAID',
        },
        _sum: { total: true },
      }),

      prisma.order.count({
        where: {
          createdAt: { gte: lastMonth },
        },
      }),

      prisma.product.count(),

      prisma.user.count({
        where: {
          role: 'USER',
        },
      }),

      // Previous period for comparison
      prisma.order.aggregate({
        where: {
          createdAt: { gte: twoMonthsAgo, lt: lastMonth },
          paymentStatus: 'PAID',
        },
        _sum: { total: true },
      }),

      prisma.order.count({
        where: {
          createdAt: { gte: twoMonthsAgo, lt: lastMonth },
        },
      }),

      // Top selling products (mock data for now)
      Promise.resolve([
        { id: '1', name: 'Premium Cotton Bedsheet', sales: 45, revenue: 2250 },
        { id: '2', name: 'Luxury Comforter Set', sales: 32, revenue: 3200 },
        { id: '3', name: 'Silk Pillowcase', sales: 28, revenue: 1400 },
        { id: '4', name: 'Egyptian Cotton Towel Set', sales: 25, revenue: 1875 },
        { id: '5', name: 'Organic Bamboo Sheets', sales: 22, revenue: 1980 },
      ]),

      // Monthly revenue data (mock data for now)
      Promise.resolve([
        { month: 'Jan', revenue: 12500, orders: 125 },
        { month: 'Feb', revenue: 15800, orders: 158 },
        { month: 'Mar', revenue: 18200, orders: 182 },
        { month: 'Apr', revenue: 16900, orders: 169 },
        { month: 'May', revenue: 21300, orders: 213 },
        { month: 'Jun', revenue: 19800, orders: 198 },
        { month: 'Jul', revenue: 23400, orders: 234 },
        { month: 'Aug', revenue: 25600, orders: 256 },
        { month: 'Sep', revenue: 22900, orders: 229 },
        { month: 'Oct', revenue: 27300, orders: 273 },
        { month: 'Nov', revenue: 29100, orders: 291 },
        { month: 'Dec', revenue: 31800, orders: 318 },
      ]),
    ])

    // Calculate growth percentages
    const currentSalesAmount = Number(totalSales._sum.total || 0)
    const previousSalesAmount = Number(previousSales._sum.total || 0)
    const revenueGrowth = previousSalesAmount > 0
      ? ((currentSalesAmount - previousSalesAmount) / previousSalesAmount) * 100
      : 0

    const orderGrowth = previousOrders > 0
      ? ((totalOrders - previousOrders) / previousOrders) * 100
      : 0

    const metrics = {
      totalSales: currentSalesAmount,
      totalOrders: totalOrders,
      totalProducts: totalProducts,
      totalCustomers: totalCustomers,
      revenueGrowth: revenueGrowth,
      orderGrowth: orderGrowth,
      topSellingProducts: topProducts,
      revenueByMonth: monthlyRevenue,
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      lastUpdated: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}