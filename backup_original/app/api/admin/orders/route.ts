import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  validateAdminRole,
  formatAdminData,
  handleAdminError,
  logAdminAction,
  MAX_EXPORT_LIMIT,
  escapeCsvField,
} from '@/lib/admin'
import { AdminFiltersSchema, AdminOrderUpdateSchema } from '@/lib/validations'
import { startOfDay, endOfDay } from 'date-fns'

// Helper function to safely parse and normalize dates
function normalizeDate(
  dateString: string | null,
  isEndDate = false
): Date | undefined {
  if (!dateString) return undefined

  try {
    const parsed = new Date(dateString)
    if (isNaN(parsed.getTime())) return undefined

    // If it's just a date (YYYY-MM-DD), normalize to start/end of day
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return isEndDate ? endOfDay(parsed) : startOfDay(parsed)
    }

    // Otherwise use the provided time
    return parsed
  } catch (error) {
    return undefined
  }
}

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
    const isExport = searchParams.get('export') === 'true'

    const filtersValidation = AdminFiltersSchema.safeParse({
      search: searchParams.get('search'),
      orderStatus: searchParams.get('orderStatus'),
      paymentStatus: searchParams.get('paymentStatus'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      page: searchParams.get('page'),
      limit: isExport ? MAX_EXPORT_LIMIT.toString() : searchParams.get('limit'), // Higher limit for export
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

    // Handle selective export by IDs
    const idsParam = searchParams.get('ids')
    if (idsParam) {
      const ids = idsParam.split(',').filter(id => id.trim())
      where.id = { in: ids }
    }

    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        {
          user: {
            is: {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
              ],
            },
          },
        },
        {
          shippingAddress: {
            is: {
              OR: [
                {
                  firstName: { contains: filters.search, mode: 'insensitive' },
                },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
              ],
            },
          },
        },
        {
          items: {
            some: {
              productName: { contains: filters.search, mode: 'insensitive' },
            },
          },
        },
      ]
    }

    if (filters.orderStatus) {
      where.status = filters.orderStatus.toUpperCase()
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus.toUpperCase()
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}

      const fromDate = normalizeDate(filters.dateFrom || null, false)
      const toDate = normalizeDate(filters.dateTo || null, true)

      if (fromDate) {
        where.createdAt.gte = fromDate
      }
      if (toDate) {
        where.createdAt.lte = toDate
      }

      // Ensure we have valid date range
      if (fromDate && toDate && fromDate > toDate) {
        return NextResponse.json(
          { error: 'Invalid date range: dateFrom must be before dateTo' },
          { status: 400 }
        )
      }
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (filters.sortBy === 'total') {
      orderBy.total = filters.sortOrder
    } else if (filters.sortBy === 'orderNumber') {
      orderBy.orderNumber = filters.sortOrder
    } else if (filters.sortBy === 'customer') {
      orderBy.shippingAddress = { firstName: filters.sortOrder }
    } else {
      orderBy.createdAt = filters.sortOrder
    }

    // Fetch orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: true,
          shippingAddress: true,
          billingAddress: true,
          items: true,
        },
        orderBy,
        skip,
        take: filters.limit,
      }),
      prisma.order.count({ where }),
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
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total),
        productImage: item.productImage,
      })),
    }))

    // Handle CSV export
    if (isExport) {
      const csvHeaders =
        'Order Number,Customer Name,Customer Email,Status,Payment Status,Payment Provider,Item Count,Total,Tracking Number,Notes,Created At'
      const csvRows = formattedOrders.map(order =>
        [
          escapeCsvField(order.orderNumber),
          escapeCsvField(order.customerName),
          escapeCsvField(order.customerEmail),
          escapeCsvField(order.status),
          escapeCsvField(order.paymentStatus),
          escapeCsvField(order.paymentProvider || ''),
          escapeCsvField(order.itemCount),
          escapeCsvField(order.total),
          escapeCsvField(order.trackingNumber || ''),
          escapeCsvField(order.notes || ''),
          escapeCsvField(order.createdAt.toISOString().split('T')[0]),
        ].join(',')
      )

      const csvContent = [csvHeaders, ...csvRows].join('\n')
      const today = new Date().toISOString().split('T')[0]

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="orders-${today}.csv"`,
        },
      })
    }

    const response = formatAdminData(
      formattedOrders,
      total,
      filters.page,
      filters.limit
    )

    // Add analytics summary
    const analytics = await getOrderAnalytics(where)
    response.analytics = analytics

    return NextResponse.json(response)
  } catch (error) {
    return handleAdminError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Validate order update data
    const orderValidation = AdminOrderUpdateSchema.safeParse(updateData)
    if (!orderValidation.success) {
      return NextResponse.json(
        { error: 'Invalid order data', details: orderValidation.error.errors },
        { status: 400 }
      )
    }

    const orderData = orderValidation.data

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: true,
      },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
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

    if (orderData.status && orderData.status !== existingOrder.status) {
      const allowedTransitions =
        validTransitions[existingOrder.status as keyof typeof validTransitions]
      if (!allowedTransitions.includes(orderData.status)) {
        return NextResponse.json(
          {
            error: `Cannot transition from ${existingOrder.status} to ${orderData.status}`,
          },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateFields: any = {}

    if (orderData.status) {
      updateFields.status = orderData.status

      // Set estimated delivery for shipped orders
      if (orderData.status === 'SHIPPED' && !existingOrder.estimatedDelivery) {
        const estimatedDelivery = new Date()
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 7) // 7 days from now
        updateFields.estimatedDelivery = estimatedDelivery
      }
    }

    if (orderData.trackingNumber) {
      updateFields.trackingNumber = orderData.trackingNumber
    }

    if (orderData.notes) {
      updateFields.notes = orderData.notes
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateFields,
      include: {
        user: true,
        shippingAddress: true,
        items: true,
      },
    })

    await logAdminAction('UPDATE', 'order', id, orderData)

    // Here you could trigger email notifications to customers about status changes
    // await sendOrderStatusNotification(updatedOrder, orderData.status)

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully',
    })
  } catch (error) {
    return handleAdminError(error)
  }
}

// Bulk update orders
export async function PATCH(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const body = await request.json()
    const { orderIds, action, data } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: 'Order IDs are required' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    const updateData: any = {}

    switch (action) {
      case 'updateStatus':
        if (!data?.status) {
          return NextResponse.json(
            { error: 'Status is required' },
            { status: 400 }
          )
        }
        updateData.status = data.status
        break

      case 'addNotes':
        if (!data?.notes) {
          return NextResponse.json(
            { error: 'Notes are required' },
            { status: 400 }
          )
        }
        updateData.notes = data.notes
        break

      case 'refund':
        // Handle refund processing
        return await handleRefundAction(orderIds, data)

      case 'cancel':
        // Handle cancellation processing
        return await handleCancelAction(orderIds, data)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update multiple orders
    const updatedOrders = await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
      },
      data: updateData,
    })

    await logAdminAction('BULK_UPDATE', 'orders', orderIds.join(','), {
      action,
      data,
    })

    return NextResponse.json({
      success: true,
      message: `${updatedOrders.count} orders updated successfully`,
      updatedCount: updatedOrders.count,
    })
  } catch (error) {
    return handleAdminError(error)
  }
}

async function getOrderAnalytics(where: any) {
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
}

async function handleRefundAction(orderIds: string[], data: any) {
  try {
    // Fetch orders to validate and get payment information
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
      },
      include: {
        items: true,
      },
    })

    // Validate orders can be refunded
    const invalidOrders = orders.filter(
      order =>
        order.paymentStatus !== 'PAID' ||
        order.status === 'REFUNDED' ||
        order.status === 'CANCELLED'
    )

    if (invalidOrders.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot refund orders with invalid status: ${invalidOrders.map(o => o.orderNumber).join(', ')}`,
        },
        { status: 400 }
      )
    }

    let refundedCount = 0
    const refundResults = []

    for (const order of orders) {
      try {
        // TODO: Integrate with payment providers when ready
        if (order.paymentProvider === 'STRIPE') {
          // const refund = await refundStripePayment(order)
          // For now, log a placeholder
          console.log(
            `TODO: Refund Stripe payment for order ${order.orderNumber}`
          )
        } else if (order.paymentProvider === 'PAYPAL') {
          // const refund = await refundPayPalPayment(order)
          // For now, log a placeholder
          console.log(
            `TODO: Refund PayPal payment for order ${order.orderNumber}`
          )
        } else {
          // No payment integration needed
          console.log(
            `Refunding order ${order.orderNumber} (no payment provider)`
          )
        }

        // Update order status to refunded
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'REFUNDED',
            paymentStatus: 'REFUNDED',
            notes: data?.reason || 'Refunded by admin',
          },
        })

        refundedCount++
        refundResults.push({ orderId: order.id, success: true })
      } catch (error) {
        console.error(`Failed to refund order ${order.id}:`, error)
        refundResults.push({
          orderId: order.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    await logAdminAction('REFUND', 'orders', orderIds.join(','), {
      refundedCount,
      results: refundResults,
    })

    return NextResponse.json({
      success: true,
      message: `${refundedCount} orders refunded successfully`,
      refundedCount,
      results: refundResults,
    })
  } catch (error) {
    return handleAdminError(error)
  }
}

async function handleCancelAction(orderIds: string[], data: any) {
  try {
    // Fetch orders to validate
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
      },
    })

    // Validate orders can be cancelled
    const invalidOrders = orders.filter(
      order =>
        order.status === 'DELIVERED' ||
        order.status === 'REFUNDED' ||
        order.status === 'CANCELLED'
    )

    if (invalidOrders.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot cancel orders with invalid status: ${invalidOrders.map(o => o.orderNumber).join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Update orders to cancelled
    const updatedOrders = await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
      },
      data: {
        status: 'CANCELLED',
        notes: data?.reason || 'Cancelled by admin',
      },
    })

    await logAdminAction('CANCEL', 'orders', orderIds.join(','), {
      cancelledCount: updatedOrders.count,
    })

    return NextResponse.json({
      success: true,
      message: `${updatedOrders.count} orders cancelled successfully`,
      cancelledCount: updatedOrders.count,
    })
  } catch (error) {
    return handleAdminError(error)
  }
}
