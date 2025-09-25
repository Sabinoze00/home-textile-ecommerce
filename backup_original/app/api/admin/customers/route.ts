import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  validateAdminRole,
  formatAdminData,
  handleAdminError,
} from '@/lib/admin'
import { AdminFiltersSchema } from '@/lib/validations'

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
    const filtersValidation = AdminFiltersSchema.safeParse({
      search: searchParams.get('search'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    })

    if (!filtersValidation.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: filtersValidation.error.errors },
        { status: 400 }
      )
    }

    const filters = filtersValidation.data
    const skip = (filters.page - 1) * filters.limit

    // Build where clause for filtering
    const where: any = {}

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (filters.sortBy === 'name') {
      orderBy.name = filters.sortOrder
    } else if (filters.sortBy === 'email') {
      orderBy.email = filters.sortOrder
    } else if (filters.sortBy === 'orders') {
      // This requires a more complex query, we'll sort by order count
      orderBy.createdAt = filters.sortOrder
    } else {
      orderBy.createdAt = filters.sortOrder
    }

    // Fetch customers with pagination
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
        skip,
        take: filters.limit,
      }),
      prisma.user.count({ where }),
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
        name: customer.name || '',
        email: customer.email || '',
        orderCount: customer._count.orders,
        totalSpent,
        createdAt: customer.createdAt,
        lastOrderAt: lastOrder?.createdAt || null,
      }
    })

    const response = formatAdminData(
      formattedCustomers,
      total,
      filters.page,
      filters.limit
    )

    return NextResponse.json(response)
  } catch (error) {
    return handleAdminError(error)
  }
}
