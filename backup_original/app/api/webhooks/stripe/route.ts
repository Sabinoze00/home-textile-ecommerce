import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    // Validate required environment variables
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured')
      return NextResponse.json(
        { error: 'Webhook not properly configured' },
        { status: 500 }
      )
    }

    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature, webhookSecret)
    } catch (error) {
      console.error('Invalid webhook signature:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`Processing Stripe webhook: ${event.type}`)

    // Check if event has already been processed (idempotency)
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id },
    })

    if (existingEvent?.processed) {
      console.log(`Event ${event.id} already processed, skipping`)
      return NextResponse.json({ received: true })
    }

    // Record the event for idempotency
    await prisma.webhookEvent.upsert({
      where: { eventId: event.id },
      update: { processed: false }, // Reset if exists but not processed
      create: {
        eventId: event.id,
        provider: 'STRIPE',
        eventType: event.type,
        processed: false,
        metadata: event.data,
      },
    })

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        )
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        )
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        )
        break

      case 'invoice.payment_succeeded':
        // Handle subscription payments if needed
        console.log('Invoice payment succeeded:', event.data.object.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark event as processed
    await prisma.webhookEvent.update({
      where: { eventId: event.id },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing Stripe webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const orderId = session.metadata?.orderId

    if (!orderId) {
      console.error('No order ID found in session metadata')
      return
    }

    // Check if order has already been processed to prevent duplicate processing
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!existingOrder) {
      console.error(`Order ${orderId} not found`)
      return
    }

    if (existingOrder.paymentStatus === 'PAID') {
      console.log(`Order ${orderId} already processed`)
      return
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMetadata: {
          ...(existingOrder.paymentMetadata as any),
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          stripeCustomerId: session.customer,
          paidAt: new Date().toISOString(),
        },
      },
    })

    console.log(`Order ${orderId} payment confirmed via Stripe`)
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
    throw error
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    // Find order by payment intent ID
    const order = await prisma.order.findFirst({
      where: {
        paymentIntentId: paymentIntent.id,
      },
    })

    if (!order) {
      console.error(`No order found for payment intent ${paymentIntent.id}`)
      return
    }

    if (order.paymentStatus === 'PAID') {
      console.log(`Order ${order.id} already processed`)
      return
    }

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMetadata: {
          ...(order.paymentMetadata as any),
          stripePaymentIntentId: paymentIntent.id,
          stripePaymentMethod: paymentIntent.payment_method,
          paymentIntentStatus: paymentIntent.status,
          paidAt: new Date().toISOString(),
        },
      },
    })

    console.log(`Order ${order.id} payment confirmed via payment intent`)
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error)
    throw error
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find order by payment intent ID
    const order = await prisma.order.findFirst({
      where: {
        paymentIntentId: paymentIntent.id,
      },
    })

    if (!order) {
      console.error(`No order found for payment intent ${paymentIntent.id}`)
      return
    }

    // Update order status to failed
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'FAILED',
        paymentMetadata: {
          ...(order.paymentMetadata as any),
          stripePaymentIntentId: paymentIntent.id,
          paymentIntentStatus: paymentIntent.status,
          failureReason: paymentIntent.last_payment_error?.message,
          failedAt: new Date().toISOString(),
        },
      },
    })

    console.log(`Order ${order.id} payment failed`)
  } catch (error) {
    console.error('Error handling payment intent failed:', error)
    throw error
  }
}
