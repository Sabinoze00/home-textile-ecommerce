import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyPayPalWebhook } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    // Validate required environment variables
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!webhookId) {
      console.error('PAYPAL_WEBHOOK_ID is not configured')
      return NextResponse.json(
        { error: 'Webhook not properly configured' },
        { status: 500 }
      )
    }

    const body = await request.text()
    const headersList = headers()

    // Get PayPal webhook headers
    const webhookHeaders = {
      'paypal-auth-algo': headersList.get('paypal-auth-algo') || '',
      'paypal-cert-id': headersList.get('paypal-cert-id') || '',
      'paypal-transmission-id': headersList.get('paypal-transmission-id') || '',
      'paypal-transmission-sig':
        headersList.get('paypal-transmission-sig') || '',
      'paypal-transmission-time':
        headersList.get('paypal-transmission-time') || '',
    }

    // Verify webhook signature
    const isValid = await verifyPayPalWebhook(webhookHeaders, body, webhookId)

    if (!isValid) {
      console.error('Invalid PayPal webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log(`Processing PayPal webhook: ${event.event_type}`)

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
        provider: 'PAYPAL',
        eventType: event.event_type,
        processed: false,
        metadata: event,
      },
    })

    // Handle different event types
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptureCompleted(event)
        break

      case 'PAYMENT.CAPTURE.DENIED':
        await handlePaymentCaptureDenied(event)
        break

      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentCaptureRefunded(event)
        break

      case 'CHECKOUT.ORDER.APPROVED':
        await handleCheckoutOrderApproved(event)
        break

      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`)
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
    console.error('Error processing PayPal webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCaptureCompleted(event: any) {
  try {
    const capture = event.resource
    const customId = capture.custom_id || capture.invoice_id

    if (!customId) {
      console.error('No custom ID found in PayPal capture event')
      return
    }

    // Find order by order number (stored as custom_id in PayPal)
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: customId,
      },
    })

    if (!order) {
      console.error(`No order found with order number ${customId}`)
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
          paypalCaptureId: capture.id,
          paypalStatus: capture.status,
          capturedAmount: capture.amount.value,
          capturedCurrency: capture.amount.currency_code,
          paidAt: new Date().toISOString(),
        },
      },
    })

    console.log(`Order ${order.id} payment confirmed via PayPal capture`)
  } catch (error) {
    console.error('Error handling PayPal capture completed:', error)
    throw error
  }
}

async function handlePaymentCaptureDenied(event: any) {
  try {
    const capture = event.resource
    const customId = capture.custom_id || capture.invoice_id

    if (!customId) {
      console.error('No custom ID found in PayPal capture denied event')
      return
    }

    // Find order by order number
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: customId,
      },
    })

    if (!order) {
      console.error(`No order found with order number ${customId}`)
      return
    }

    // Update order status to failed
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'FAILED',
        paymentMetadata: {
          ...(order.paymentMetadata as any),
          paypalCaptureId: capture.id,
          paypalStatus: capture.status,
          deniedReason: capture.status_details?.reason,
          failedAt: new Date().toISOString(),
        },
      },
    })

    console.log(`Order ${order.id} payment denied by PayPal`)
  } catch (error) {
    console.error('Error handling PayPal capture denied:', error)
    throw error
  }
}

async function handlePaymentCaptureRefunded(event: any) {
  try {
    const refund = event.resource
    const captureId = refund.links
      ?.find((link: any) => link.rel === 'up')
      ?.href?.split('/')
      .pop()

    if (!captureId) {
      console.error('No capture ID found in PayPal refund event')
      return
    }

    // Find order by PayPal capture ID in metadata
    const order = await prisma.order.findFirst({
      where: {
        paymentMetadata: {
          path: ['paypalCaptureId'],
          equals: captureId,
        },
      },
    })

    if (!order) {
      console.error(`No order found with PayPal capture ID ${captureId}`)
      return
    }

    // Update order status to refunded
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'REFUNDED',
        paymentMetadata: {
          ...(order.paymentMetadata as any),
          paypalRefundId: refund.id,
          refundAmount: refund.amount.value,
          refundCurrency: refund.amount.currency_code,
          refundedAt: new Date().toISOString(),
        },
      },
    })

    console.log(`Order ${order.id} refunded via PayPal`)
  } catch (error) {
    console.error('Error handling PayPal refund:', error)
    throw error
  }
}

async function handleCheckoutOrderApproved(event: any) {
  try {
    const order = event.resource
    const customId = order.purchase_units?.[0]?.custom_id

    if (!customId) {
      console.error('No custom ID found in PayPal order approved event')
      return
    }

    // Find order by order number
    const dbOrder = await prisma.order.findFirst({
      where: {
        orderNumber: customId,
      },
    })

    if (!dbOrder) {
      console.error(`No order found with order number ${customId}`)
      return
    }

    // Update order metadata with approval information
    await prisma.order.update({
      where: { id: dbOrder.id },
      data: {
        paymentMetadata: {
          ...(dbOrder.paymentMetadata as any),
          paypalOrderApproved: true,
          approvedAt: new Date().toISOString(),
        },
      },
    })

    console.log(`PayPal order ${order.id} approved for order ${dbOrder.id}`)
  } catch (error) {
    console.error('Error handling PayPal order approved:', error)
    throw error
  }
}
