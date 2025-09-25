import { NextRequest, NextResponse } from 'next/server'
import {
  validateAdminRole,
  calculateMetrics,
  handleAdminError,
} from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') // 'week', 'month', 'year', or custom dates
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate comprehensive metrics (pass validated user to avoid duplicate admin check)
    const metrics = await calculateMetrics(validation.user)

    // Add date range specific analytics if requested
    if (dateRange || (startDate && endDate)) {
      const customMetrics = await getCustomRangeMetrics(
        dateRange,
        startDate,
        endDate
      )
      metrics.customRange = customMetrics
    }

    // Cache the metrics for 5 minutes to improve performance
    const response = NextResponse.json({
      success: true,
      data: metrics,
      lastUpdated: new Date().toISOString(),
    })

    response.headers.set('Cache-Control', 'public, max-age=300') // 5 minutes

    return response
  } catch (error) {
    return handleAdminError(error)
  }
}

async function getCustomRangeMetrics(
  dateRange?: string | null,
  startDate?: string | null,
  endDate?: string | null
) {
  let start: Date
  let end: Date = new Date()

  // Determine date range
  if (startDate && endDate) {
    start = new Date(startDate)
    end = new Date(endDate)
  } else {
    switch (dateRange) {
      case 'week':
        start = new Date()
        start.setDate(start.getDate() - 7)
        break
      case 'month':
        start = new Date()
        start.setMonth(start.getMonth() - 1)
        break
      case 'year':
        start = new Date()
        start.setFullYear(start.getFullYear() - 1)
        break
      default:
        start = new Date()
        start.setMonth(start.getMonth() - 1) // Default to last month
    }
  }

  const dateFilter = {
    createdAt: {
      gte: start,
      lte: end,
    },
  }

  // Get metrics for the specified date range
  const [
    salesData,
    orderCount,
    customerCount,
    averageOrderValue,
    topProducts,
    categoryPerformance,
    dailyRevenue,
    conversionMetrics,
  ] = await Promise.all([
    // Total sales in range
    prisma.order.aggregate({
      where: {
        ...dateFilter,
        paymentStatus: 'PAID',
      },
      _sum: { total: true },
    }),

    // Order count in range
    prisma.order.count({
      where: dateFilter,
    }),

    // New customers in range
    prisma.user.count({
      where: dateFilter,
    }),

    // Average order value in range
    prisma.order.aggregate({
      where: {
        ...dateFilter,
        paymentStatus: 'PAID',
      },
      _avg: { total: true },
    }),

    // Top products in range
    prisma.orderItem.groupBy({
      where: {
        order: {
          ...dateFilter,
          paymentStatus: 'PAID',
        },
      },
      by: ['productId', 'productName'],
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: 10,
    }),

    // Category performance
    getCategoryPerformance(start, end),

    // Daily revenue breakdown
    getDailyRevenue(start, end),

    // Conversion metrics
    getConversionMetrics(start, end),
  ])

  return {
    dateRange: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    totalSales: Number(salesData._sum.total || 0),
    totalOrders: orderCount,
    newCustomers: customerCount,
    averageOrderValue: Number(averageOrderValue._avg.total || 0),
    topProducts: topProducts.map(product => ({
      productId: product.productId,
      productName: product.productName,
      quantity: product._sum.quantity || 0,
      revenue: Number(product._sum.total || 0),
    })),
    categoryPerformance,
    dailyRevenue,
    conversionMetrics,
  }
}

async function getCategoryPerformance(start: Date, end: Date) {
  const categoryData = await prisma.orderItem.groupBy({
    where: {
      order: {
        createdAt: {
          gte: start,
          lte: end,
        },
        paymentStatus: 'PAID',
      },
    },
    by: ['productId'],
    _sum: {
      quantity: true,
      total: true,
    },
  })

  // Get product categories
  const productCategories = await prisma.product.findMany({
    where: {
      id: {
        in: categoryData.map(item => item.productId),
      },
    },
    include: {
      category: true,
    },
  })

  // Group by category
  const categoryMap = new Map()

  productCategories.forEach(product => {
    const categoryName = product.category.name
    const orderItem = categoryData.find(item => item.productId === product.id)

    if (orderItem) {
      const existing = categoryMap.get(categoryName) || {
        quantity: 0,
        revenue: 0,
      }
      categoryMap.set(categoryName, {
        quantity: existing.quantity + (orderItem._sum.quantity || 0),
        revenue: existing.revenue + Number(orderItem._sum.total || 0),
      })
    }
  })

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    quantity: data.quantity,
    revenue: data.revenue,
  }))
}

async function getDailyRevenue(start: Date, end: Date) {
  // Get orders grouped by day
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
      paymentStatus: 'PAID',
    },
    select: {
      createdAt: true,
      total: true,
    },
  })

  // Group by day
  const dailyMap = new Map()
  const currentDate = new Date(start)

  // Initialize all days in range with 0
  while (currentDate <= end) {
    const dateKey = currentDate.toISOString().split('T')[0]
    dailyMap.set(dateKey, 0)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Add actual revenue
  orders.forEach(order => {
    const dateKey = order.createdAt.toISOString().split('T')[0]
    const existing = dailyMap.get(dateKey) || 0
    dailyMap.set(dateKey, existing + Number(order.total))
  })

  return Array.from(dailyMap.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }))
}

async function getConversionMetrics(start: Date, end: Date) {
  const [
    totalVisitors, // This would come from analytics service
    ordersCompleted,
    cartsCreated,
    cartsAbandoned,
  ] = await Promise.all([
    // For now, return a placeholder value
    // In a real app, this would come from Google Analytics or similar
    Promise.resolve(10000),

    // Orders completed
    prisma.order.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        paymentStatus: 'PAID',
      },
    }),

    // Carts created (unique users with cart items)
    prisma.cart.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),

    // Cart abandonment (carts with items but no completed order)
    prisma.cart.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        user: {
          orders: {
            none: {
              createdAt: {
                gte: start,
                lte: end,
              },
              paymentStatus: 'PAID',
            },
          },
        },
      },
    }),
  ])

  const conversionRate =
    totalVisitors > 0 ? (ordersCompleted / totalVisitors) * 100 : 0
  const cartConversionRate =
    cartsCreated > 0 ? (ordersCompleted / cartsCreated) * 100 : 0
  const cartAbandonmentRate =
    cartsCreated > 0 ? (cartsAbandoned / cartsCreated) * 100 : 0

  return {
    totalVisitors,
    ordersCompleted,
    cartsCreated,
    cartsAbandoned,
    conversionRate: Number(conversionRate.toFixed(2)),
    cartConversionRate: Number(cartConversionRate.toFixed(2)),
    cartAbandonmentRate: Number(cartAbandonmentRate.toFixed(2)),
  }
}
