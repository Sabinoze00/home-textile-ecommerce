import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { OrdersQueryParamsSchema } from '@/lib/validations'
import { OrderStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const { page, limit, status, sortBy, sortOrder } =
      OrdersQueryParamsSchema.parse({
        page: searchParams.get('page')
          ? parseInt(searchParams.get('page')!)
          : 1,
        limit: searchParams.get('limit')
          ? parseInt(searchParams.get('limit')!)
          : 10,
        status: searchParams.get('status') || undefined,
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
      })

    const skip = (page - 1) * limit

    // Build where clause with optional status filter
    const where = {
      userId: session.user.id,
      ...(status && { status: status as OrderStatus }),
    }

    // Build orderBy clause
    const orderBy = (() => {
      switch (sortBy) {
        case 'total':
          return { total: sortOrder }
        case 'status':
          return { status: sortOrder }
        case 'orderNumber':
          return { orderNumber: sortOrder }
        case 'createdAt':
        default:
          return { createdAt: sortOrder }
      }
    })()

    // Get user's orders with filtering, sorting, and pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          shippingAddress: true,
          billingAddress: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
    })
  } catch (error) {
    console.error('Get orders error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
