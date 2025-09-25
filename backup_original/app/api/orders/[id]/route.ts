import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { OrderStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const orderId = params.id

    // Get specific order with full details
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id, // Ensure user can only access their own orders
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const orderId = params.id
    const body = await request.json()

    // Check if order exists and belongs to user
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Only allow certain status updates by customers
    const allowedUpdates: any = {}

    if (
      body.status === OrderStatus.CANCELLED &&
      existingOrder.status === OrderStatus.PENDING
    ) {
      allowedUpdates.status = OrderStatus.CANCELLED
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      )
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: allowedUpdates,
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
