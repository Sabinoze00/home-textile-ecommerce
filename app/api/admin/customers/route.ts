import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Admin role validation
async function validateAdminRole() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }

  if (session.user.role !== 'ADMIN') {
    return { error: 'Forbidden - Admin access required', status: 403 }
  }

  return { success: true, userId: session.user.id }
}

// GET - Fetch customers with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Filtering
    const search = searchParams.get('search') || ''

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {
      // Only show actual customers, not admin users
      role: 'USER'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'email') {
      orderBy.email = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    // Fetch customers with relations
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          orders: {
            where: {
              paymentStatus: 'PAID',
            },
            select: {
              total: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where })
    ])

    // Format customers for admin table
    const formattedCustomers = customers.map(customer => {
      const totalSpent = customer.orders.reduce(
        (sum, order) => sum + Number(order.total),
        0
      )
      const lastOrder = customer.orders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]

      return {
        id: customer.id,
        name: customer.name || 'N/A',
        email: customer.email || '',
        orderCount: customer._count.orders,
        totalSpent,
        joinDate: customer.createdAt.toISOString(),
        lastOrderAt: lastOrder?.createdAt.toISOString() || null,
      }
    })

    // Calculate analytics
    const analytics = await getCustomerAnalytics(where)

    return NextResponse.json({
      success: true,
      data: {
        customers: formattedCustomers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        analytics
      }
    })

  } catch (error) {
    console.error('Customers GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getCustomerAnalytics(where: any) {
  try {
    const [
      totalCustomers,
      customersWithOrders,
      totalRevenue,
      avgCustomerValue,
      topCustomers
    ] = await Promise.all([
      // Total customers count
      prisma.user.count({ where }),

      // Customers with at least one paid order
      prisma.user.count({
        where: {
          ...where,
          orders: {
            some: {
              paymentStatus: 'PAID'
            }
          }
        }
      }),

      // Total revenue from all customers
      prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID',
          user: where
        },
        _sum: { total: true },
      }),

      // Average customer lifetime value
      prisma.order.groupBy({
        by: ['userId'],
        where: {
          paymentStatus: 'PAID',
          user: where
        },
        _sum: { total: true },
      }).then(results => {
        if (results.length === 0) return 0
        const totalSpent = results.reduce((sum, customer) => sum + Number(customer._sum.total || 0), 0)
        return totalSpent / results.length
      }),

      // Top 5 customers by spending
      prisma.user.findMany({
        where,
        include: {
          orders: {
            where: { paymentStatus: 'PAID' },
            select: { total: true }
          }
        },
        take: 5
      }).then(customers =>
        customers
          .map(customer => ({
            id: customer.id,
            name: customer.name || 'N/A',
            email: customer.email || '',
            totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.total), 0)
          }))
          .filter(customer => customer.totalSpent > 0)
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 5)
      )
    ])

    return {
      totalCustomers,
      customersWithOrders,
      totalRevenue: Number(totalRevenue._sum.total || 0),
      avgCustomerValue: Number(avgCustomerValue || 0),
      topCustomers
    }
  } catch (error) {
    console.error('Customer analytics error:', error)
    return {
      totalCustomers: 0,
      customersWithOrders: 0,
      totalRevenue: 0,
      avgCustomerValue: 0,
      topCustomers: []
    }
  }
}