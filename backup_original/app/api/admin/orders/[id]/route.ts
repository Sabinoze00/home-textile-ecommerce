import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  validateAdminRole,
  logAdminAction,
  handleAdminError,
} from '@/lib/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validation = await validateAdminRole()
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    // Fetch full order details
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Format order for detailed view
    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentProvider: order.paymentProvider,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      estimatedDelivery: order.estimatedDelivery,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      total: Number(order.total),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: order.user,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage:
          item.productImage || order.items[0]?.product?.images[0]?.url,
        productSlug: item.product?.slug,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total),
      })),
      itemCount: order._count.items,
    }

    return NextResponse.json({
      success: true,
      data: formattedOrder,
    })
  } catch (error) {
    console.error('Error fetching order details:', error)
    return handleAdminError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validation = await validateAdminRole()
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const body = await request.json()
    const { status, paymentStatus, trackingNumber, notes } = body

    // Validate order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
      },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (notes !== undefined) updateData.notes = notes

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        trackingNumber: true,
        notes: true,
        updatedAt: true,
      },
    })

    // Log the admin action
    await logAdminAction(
      validation.user.id,
      'UPDATE_ORDER',
      `Updated order ${existingOrder.orderNumber}`,
      { orderId: params.id, changes: updateData }
    )

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully',
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return handleAdminError(error)
  }
}
