import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { startOfDay, endOfDay } from 'date-fns'

// Validation schemas
const orderUpdateSchema = z.object({
  id: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

const bulkActionSchema = z.object({
  action: z.enum(['updateStatus', 'cancel', 'refund', 'addNotes']),
  orderIds: z.array(z.string()),
  status: z.string().optional(),
  notes: z.string().optional(),
  reason: z.string().optional(),
})

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

// Helper function to safely parse dates
function parseDate(dateString: string | null, isEndDate = false): Date | undefined {
  if (!dateString) return undefined

  try {
    const parsed = new Date(dateString)
    if (isNaN(parsed.getTime())) return undefined

    // If it's just a date (YYYY-MM-DD), normalize to start/end of day
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return isEndDate ? endOfDay(parsed) : startOfDay(parsed)
    }

    return parsed
  } catch (error) {
    return undefined
  }
}

// GET - Fetch orders with filtering, sorting, and pagination
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
    const orderStatus = searchParams.get('orderStatus')
    const paymentStatus = searchParams.get('paymentStatus')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          }
        },
        {
          shippingAddress: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ]
          }
        }
      ]
    }

    if (orderStatus && orderStatus !== 'all') {
      where.status = orderStatus.toUpperCase()
    }

    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus.toUpperCase()
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}

      const fromDate = parseDate(dateFrom, false)
      const toDate = parseDate(dateTo, true)

      if (fromDate) where.createdAt.gte = fromDate
      if (toDate) where.createdAt.lte = toDate

      if (fromDate && toDate && fromDate > toDate) {
        return NextResponse.json(
          { error: 'Invalid date range: dateFrom must be before dateTo' },
          { status: 400 }
        )
      }
    }

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === 'total') {
      orderBy.total = sortOrder
    } else if (sortBy === 'orderNumber') {
      orderBy.orderNumber = sortOrder
    } else if (sortBy === 'customer') {
      orderBy.shippingAddress = { firstName: sortOrder }
    } else {
      orderBy.createdAt = sortOrder
    }

    // Fetch orders with relations
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          shippingAddress: {
            select: { firstName: true, lastName: true }
          },
          items: {
            include: {
              product: {
                select: { name: true, images: true }
              }
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where })
    ])

    // Format orders for admin table
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      customerEmail: order.user.email || '',
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentProvider: order.paymentProvider,
      total: Number(order.total),
      itemCount: order.items.length,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total),
        productImage: item.product?.images?.[0] || null,
      })),
    }))

    // Calculate analytics
    const analytics = await getOrderAnalytics(where)

    return NextResponse.json({
      success: true,
      data: {
        orders: formattedOrders,
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
    console.error('Orders GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update single order
export async function PUT(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const body = await request.json()
    const validatedData = orderUpdateSchema.parse(body)

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: validatedData.id }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Validate status transitions
    const validTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['REFUNDED'],
      CANCELLED: [],
      REFUNDED: [],
    }

    if (validatedData.status && validatedData.status !== existingOrder.status) {
      const allowedTransitions = validTransitions[existingOrder.status as keyof typeof validTransitions]
      if (!allowedTransitions.includes(validatedData.status)) {
        return NextResponse.json(
          {
            error: `Cannot transition from ${existingOrder.status} to ${validatedData.status}`,
          },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateFields: any = {}
    if (validatedData.status) {
      updateFields.status = validatedData.status

      // Set estimated delivery for shipped orders
      if (validatedData.status === 'SHIPPED' && !existingOrder.estimatedDelivery) {
        const estimatedDelivery = new Date()
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7)
        updateFields.estimatedDelivery = estimatedDelivery
      }
    }

    if (validatedData.trackingNumber !== undefined) {
      updateFields.trackingNumber = validatedData.trackingNumber
    }

    if (validatedData.notes !== undefined) {
      updateFields.notes = validatedData.notes
    }

    const { id, ...dataToUpdate } = validatedData

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateFields,
      include: {
        user: true,
        shippingAddress: true,
        items: {
          include: {
            product: true
          }
        },
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully'
    })

  } catch (error) {
    console.error('Order update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Bulk actions
export async function PATCH(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const body = await request.json()
    const validatedData = bulkActionSchema.parse(body)

    const { action, orderIds, status, notes, reason } = validatedData

    if (orderIds.length === 0) {
      return NextResponse.json(
        { error: 'No orders selected' },
        { status: 400 }
      )
    }

    let result: any = {}

    switch (action) {
      case 'updateStatus':
        if (!status) {
          return NextResponse.json(
            { error: 'Status is required for updateStatus action' },
            { status: 400 }
          )
        }

        result = await prisma.order.updateMany({
          where: { id: { in: orderIds } },
          data: { status: status.toUpperCase() }
        })
        break

      case 'addNotes':
        if (!notes) {
          return NextResponse.json(
            { error: 'Notes are required for addNotes action' },
            { status: 400 }
          )
        }

        result = await prisma.order.updateMany({
          where: { id: { in: orderIds } },
          data: { notes }
        })
        break

      case 'cancel':
        // Validate orders can be cancelled
        const ordersToCancel = await prisma.order.findMany({
          where: { id: { in: orderIds } }
        })

        const invalidCancelOrders = ordersToCancel.filter(
          order => ['DELIVERED', 'REFUNDED', 'CANCELLED'].includes(order.status)
        )

        if (invalidCancelOrders.length > 0) {
          return NextResponse.json(
            {
              error: `Cannot cancel orders with status: ${invalidCancelOrders.map(o => o.status).join(', ')}`,
            },
            { status: 400 }
          )
        }

        result = await prisma.order.updateMany({
          where: { id: { in: orderIds } },
          data: {
            status: 'CANCELLED',
            notes: reason || 'Cancelled by admin'
          }
        })
        break

      case 'refund':
        // Validate orders can be refunded
        const ordersToRefund = await prisma.order.findMany({
          where: { id: { in: orderIds } }
        })

        const invalidRefundOrders = ordersToRefund.filter(
          order => order.paymentStatus !== 'PAID' || ['REFUNDED', 'CANCELLED'].includes(order.status)
        )

        if (invalidRefundOrders.length > 0) {
          return NextResponse.json(
            {
              error: `Cannot refund orders with invalid payment/order status`,
            },
            { status: 400 }
          )
        }

        result = await prisma.order.updateMany({
          where: { id: { in: orderIds } },
          data: {
            status: 'REFUNDED',
            paymentStatus: 'REFUNDED',
            notes: reason || 'Refunded by admin'
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid bulk action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Bulk ${action} completed successfully on ${result.count} orders`
    })

  } catch (error) {
    console.error('Bulk action error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getOrderAnalytics(where: any) {
  try {
    const [
      totalRevenue,
      statusDistribution,
      paymentStatusDistribution,
      avgOrderValue,
    ] = await Promise.all([
      // Total revenue for filtered orders
      prisma.order.aggregate({
        where: { ...where, paymentStatus: 'PAID' },
        _sum: { total: true },
      }),

      // Status distribution
      prisma.order.groupBy({
        where,
        by: ['status'],
        _count: { status: true },
      }),

      // Payment status distribution
      prisma.order.groupBy({
        where,
        by: ['paymentStatus'],
        _count: { paymentStatus: true },
      }),

      // Average order value
      prisma.order.aggregate({
        where,
        _avg: { total: true },
      }),
    ])

    return {
      totalRevenue: Number(totalRevenue._sum.total || 0),
      averageOrderValue: Number(avgOrderValue._avg.total || 0),
      statusDistribution: statusDistribution.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      paymentStatusDistribution: paymentStatusDistribution.map(item => ({
        status: item.paymentStatus,
        count: item._count.paymentStatus,
      })),
    }
  } catch (error) {
    console.error('Analytics error:', error)
    return {
      totalRevenue: 0,
      averageOrderValue: 0,
      statusDistribution: [],
      paymentStatusDistribution: [],
    }
  }
}