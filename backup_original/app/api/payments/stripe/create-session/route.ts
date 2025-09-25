import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession } from '@/lib/stripe'
import { StripeCheckoutSchema } from '@/lib/validations'

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
    const validation = StripeCheckoutSchema.safeParse(body)
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

    // Transform order for Stripe (using the stored product data from OrderItem)
    const transformedOrder = {
      ...order,
      items: order.items.map(item => ({
        product: {
          id: item.productId,
          name: item.productName,
          shortDescription: '',
          description: '',
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

    // Create Stripe checkout session
    const stripeSession = await createCheckoutSession({
      orderId: order.id,
      order: transformedOrder as any,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      customerEmail: session.user.email ?? undefined,
    })

    // Update order with Stripe session information
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: 'STRIPE',
        paymentIntentId:
          typeof stripeSession.payment_intent === 'string'
            ? stripeSession.payment_intent
            : null,
        paymentMetadata: {
          stripeSessionId: stripeSession.id,
          stripePaymentIntentId: stripeSession.payment_intent,
        },
      },
    })

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url,
    })
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
