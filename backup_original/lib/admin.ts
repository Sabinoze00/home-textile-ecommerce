import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { AdminMetrics, AdminProductTableRow, AdminOrderTableRow } from '@/types'

// Export constants
export const MAX_EXPORT_LIMIT = 1000

// CSV helper functions
export function escapeCsvField(field: any): string {
  if (field === null || field === undefined) {
    return '""'
  }

  const stringField = String(field)
  // Always wrap in quotes and escape internal quotes by doubling them
  return `"${stringField.replace(/"/g, '""')}"`
}

export async function validateAdminRole() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'Authentication required', status: 401 }
  }

  if (session.user.role !== 'ADMIN') {
    return { error: 'Admin access required', status: 403 }
  }

  return { user: session.user, status: 200 }
}

export async function requireAdmin() {
  const validation = await validateAdminRole()

  if (validation.error) {
    throw new Error(validation.error)
  }

  return validation.user
}

export function formatAdminData<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  }
}

export async function generateAdminReport(
  type: 'products' | 'orders' | 'customers',
  filters?: any,
  user?: { id: string; role: string }
) {
  // If no user provided, validate admin role
  if (!user) {
    await requireAdmin()
  }

  switch (type) {
    case 'products':
      return await generateProductReport(filters)
    case 'orders':
      return await generateOrderReport(filters)
    case 'customers':
      return await generateCustomerReport(filters)
    default:
      throw new Error('Invalid report type')
  }
}

async function generateProductReport(filters?: any) {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: true,
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return products.map(product => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    price: Number(product.price),
    stockQuantity: product.stockQuantity || 0,
    category: product.category.name,
    status: product.inStock ? 'active' : 'inactive',
    reviewCount: product._count.reviews,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }))
}

async function generateOrderReport(filters?: any) {
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      shippingAddress: true,
      items: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
    customerEmail: order.user.email || '',
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: Number(order.total),
    itemCount: order.items.length,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }))
}

async function generateCustomerReport(filters?: any) {
  const users = await prisma.user.findMany({
    include: {
      orders: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return users.map(user => ({
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    orderCount: user._count.orders,
    totalSpent: user.orders.reduce(
      (sum, order) => sum + Number(order.total),
      0
    ),
    createdAt: user.createdAt,
    lastOrderAt: user.orders[0]?.createdAt || null,
  }))
}

export async function calculateMetrics(user?: {
  id: string
  role: string
}): Promise<AdminMetrics> {
  // If no user provided, validate admin role
  if (!user) {
    await requireAdmin()
  }

  const [
    totalSales,
    totalOrders,
    totalProducts,
    totalCustomers,
    previousMonthSales,
    previousMonthOrders,
    topProducts,
    monthlyRevenue,
  ] = await Promise.all([
    // Total sales (sum of all paid orders)
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { total: true },
    }),

    // Total orders count
    prisma.order.count(),

    // Total products count
    prisma.product.count(),

    // Total customers count
    prisma.user.count(),

    // Previous month sales for growth calculation
    prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { total: true },
    }),

    // Previous month orders for growth calculation
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),

    // Top selling products
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    }),

    // Monthly revenue for the last 12 months
    getMonthlyRevenue(),
  ])

  // Calculate growth percentages
  const currentMonthSales = await prisma.order.aggregate({
    where: {
      paymentStatus: 'PAID',
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
    _sum: { total: true },
  })

  const currentMonthOrders = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  })

  const revenueGrowth = previousMonthSales._sum.total
    ? ((Number(currentMonthSales._sum.total || 0) -
        Number(previousMonthSales._sum.total)) /
        Number(previousMonthSales._sum.total)) *
      100
    : 0

  const orderGrowth = previousMonthOrders
    ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100
    : 0

  // Get product details for top selling products
  const topSellingProducts = await Promise.all(
    topProducts.map(async item => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true },
      })
      return {
        id: item.productId,
        name: product?.name || 'Unknown Product',
        sales: item._sum.quantity || 0,
        revenue: Number(item._sum.total || 0),
      }
    })
  )

  return {
    totalSales: Number(totalSales._sum.total || 0),
    totalOrders,
    totalProducts,
    totalCustomers,
    revenueGrowth,
    orderGrowth,
    topSellingProducts,
    revenueByMonth: monthlyRevenue,
  }
}

async function getMonthlyRevenue() {
  const now = new Date()

  // Build array of month queries to execute in parallel
  const monthQueries = []
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    monthQueries.push({
      date,
      revenueQuery: prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: {
            gte: date,
            lt: nextMonth,
          },
        },
        _sum: { total: true },
      }),
      ordersQuery: prisma.order.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextMonth,
          },
        },
      }),
    })
  }

  // Execute all queries in parallel
  const results = await Promise.all(
    monthQueries.map(async ({ date, revenueQuery, ordersQuery }) => {
      const [revenue, orders] = await Promise.all([revenueQuery, ordersQuery])
      return {
        month: date.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        }),
        revenue: Number(revenue._sum.total || 0),
        orders,
      }
    })
  )

  return results
}

export function handleAdminError(error: unknown) {
  console.error('Admin operation error:', error)

  if (error instanceof Error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

export async function logAdminAction(
  action: string,
  resourceType: string,
  resourceId: string,
  details?: any,
  user?: { id: string; role: string }
) {
  // If no user provided, validate admin role
  const validatedUser = user || (await requireAdmin())

  console.log(
    `Admin Action: ${validatedUser.id} performed ${action} on ${resourceType} ${resourceId}`,
    details
  )

  // Here you could store admin action logs in a database table
  // For now, we just log to console
}
