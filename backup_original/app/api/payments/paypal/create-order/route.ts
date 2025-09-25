import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPayPalOrder } from '@/lib/paypal'
import { PayPalOrderSchema } from '@/lib/validations'

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
    const validation = PayPalOrderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { orderId } = validation.data

    // Fetch order from database
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      )
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Order is not in pending status' },
        { status: 400 }
      )
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Order has already been paid' },
        { status: 400 }
      )
    }

    // Transform order for PayPal (using the stored product data from OrderItem)
    const transformedOrder = {
      ...order,
      items: order.items.map(item => ({
        product: {
          id: item.productId,
          name: item.productName,
          shortDescription: '',
          description: `${item.productName}${item.variantName ? ` - ${item.variantName}: ${item.variantValue}` : ''}`,
          images: [{ url: item.productImage }],
        },
        variant: item.variantId
          ? {
              id: item.variantId,
              name: item.variantName || '',
              value: item.variantValue || '',
            }
          : undefined,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      total: Number(order.total),
    }

    // Create PayPal order
    const paypalOrder = await createPayPalOrder({
      orderId: order.id,
      order: transformedOrder as any,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    })

    // Update order with PayPal order information
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: 'PAYPAL',
        paypalOrderId: paypalOrder.id,
        paymentMetadata: {
          paypalOrderId: paypalOrder.id,
          paypalStatus: paypalOrder.status,
        },
      },
    })

    // Find approval URL from PayPal links
    const approvalUrl = paypalOrder.links?.find(
      (link: any) => link.rel === 'approve'
    )?.href

    return NextResponse.json({
      orderId: paypalOrder.id,
      approvalUrl,
      status: paypalOrder.status,
    })
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
}
