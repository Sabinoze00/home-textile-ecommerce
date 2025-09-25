import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { capturePayPalPayment } from '@/lib/paypal'
import { PaymentCaptureSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body with Zod
    const validation = PaymentCaptureSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { paypalOrderId, orderId } = validation.data

    // Fetch order from database
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      )
    }

    if (order.paypalOrderId !== paypalOrderId) {
      return NextResponse.json(
        { error: 'PayPal order ID does not match' },
        { status: 400 }
      )
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Order has already been paid' },
        { status: 400 }
      )
    }

    // Capture PayPal payment
    const captureResult = await capturePayPalPayment(paypalOrderId)

    if (!captureResult || captureResult.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Failed to capture PayPal payment' },
        { status: 400 }
      )
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMetadata: {
          ...(order.paymentMetadata as any),
          paypalCaptureId:
            captureResult.purchase_units[0]?.payments?.captures?.[0]?.id,
          paypalCaptureStatus: captureResult.status,
          capturedAt: new Date().toISOString(),
        },
      },
    })

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        total: updatedOrder.total,
      },
      paypalCaptureId:
        captureResult.purchase_units[0]?.payments?.captures?.[0]?.id,
    })
  } catch (error) {
    console.error('Error capturing PayPal payment:', error)
    return NextResponse.json(
      { error: 'Failed to capture PayPal payment' },
      { status: 500 }
    )
  }
}
