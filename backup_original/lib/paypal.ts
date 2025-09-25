import paypal from '@paypal/checkout-server-sdk'
import { Order, OrderItem } from '@/types'

// Country name to ISO 3166-1 alpha-2 code mapping
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'United States': 'US',
  'United States of America': 'US',
  USA: 'US',
  US: 'US',
  Canada: 'CA',
  'United Kingdom': 'GB',
  UK: 'GB',
  Germany: 'DE',
  France: 'FR',
  Italy: 'IT',
  Spain: 'ES',
  Netherlands: 'NL',
  Belgium: 'BE',
  Switzerland: 'CH',
  Austria: 'AT',
  Sweden: 'SE',
  Norway: 'NO',
  Denmark: 'DK',
  Finland: 'FI',
  Poland: 'PL',
  'Czech Republic': 'CZ',
  Hungary: 'HU',
  Portugal: 'PT',
  Greece: 'GR',
  Ireland: 'IE',
  Luxembourg: 'LU',
  Australia: 'AU',
  'New Zealand': 'NZ',
  Japan: 'JP',
  'South Korea': 'KR',
  Singapore: 'SG',
  'Hong Kong': 'HK',
  Taiwan: 'TW',
  India: 'IN',
  China: 'CN',
  Brazil: 'BR',
  Mexico: 'MX',
  Argentina: 'AR',
  Chile: 'CL',
  Colombia: 'CO',
  Peru: 'PE',
  Venezuela: 'VE',
  Uruguay: 'UY',
  Paraguay: 'PY',
  Ecuador: 'EC',
  Bolivia: 'BO',
  Guyana: 'GY',
  Suriname: 'SR',
  'French Guiana': 'GF',
}

function getCountryCode(countryName: string): string {
  // If it's already a 2-letter code, return as is
  if (countryName.length === 2) {
    return countryName.toUpperCase()
  }

  // Look up in mapping
  const code = COUNTRY_NAME_TO_CODE[countryName]
  if (code) {
    return code
  }

  // Default to US if not found
  console.warn(
    `Country "${countryName}" not found in mapping, defaulting to US`
  )
  return 'US'
}

// Lazy initialization of PayPal client to avoid import-time crashes
let paypalClient: paypal.core.PayPalHttpClient | null = null

function getPayPalClient(): paypal.core.PayPalHttpClient {
  if (!paypalClient) {
    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error(
        'PayPal client credentials are not set in environment variables'
      )
    }

    const environment =
      process.env.PAYPAL_ENVIRONMENT === 'live'
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret)

    paypalClient = new paypal.core.PayPalHttpClient(environment)
  }
  return paypalClient
}

export const formatPayPalAmount = (amount: number): string => {
  return amount.toFixed(2)
}

export interface CreatePayPalOrderParams {
  orderId: string
  order: Order
  returnUrl?: string
  cancelUrl?: string
}

export const createPayPalOrder = async ({
  orderId,
  order,
  returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
  cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
}: CreatePayPalOrderParams): Promise<any> => {
  try {
    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer('return=representation')

    const orderItems = order.items.map(item => ({
      name: item.product.name,
      description:
        item.product.shortDescription ||
        item.product.description.substring(0, 127),
      unit_amount: {
        currency_code: order.currency || 'USD',
        value: formatPayPalAmount(item.price),
      },
      quantity: item.quantity.toString(),
      category: 'PHYSICAL_GOODS',
    }))

    const itemTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    request.requestBody({
      intent: 'CAPTURE',
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: 'Home Textile Store',
        locale: 'en-US',
        landing_page: 'BILLING',
        shipping_preference: 'SET_PROVIDED_ADDRESS',
        user_action: 'PAY_NOW',
      },
      purchase_units: [
        {
          reference_id: orderId,
          custom_id: order.orderNumber,
          description: `Order ${order.orderNumber}`,
          amount: {
            currency_code: order.currency || 'USD',
            value: formatPayPalAmount(order.total),
            breakdown: {
              item_total: {
                currency_code: order.currency || 'USD',
                value: formatPayPalAmount(itemTotal),
              },
              shipping: {
                currency_code: order.currency || 'USD',
                value: formatPayPalAmount(order.shipping),
              },
              tax_total: {
                currency_code: order.currency || 'USD',
                value: formatPayPalAmount(order.tax),
              },
            },
          },
          items: orderItems,
          shipping: {
            method: 'United States Postal Service',
            address: {
              name: {
                full_name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
              },
              address_line_1: order.shippingAddress.street,
              admin_area_2: order.shippingAddress.city,
              admin_area_1: order.shippingAddress.state,
              postal_code: order.shippingAddress.postalCode,
              country_code: getCountryCode(order.shippingAddress.country),
            },
          },
        },
      ],
    })

    const response = await getPayPalClient().execute(request)
    return response.result
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    throw new Error('Failed to create PayPal order')
  }
}

export const capturePayPalPayment = async (
  paypalOrderId: string
): Promise<any> => {
  try {
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId)
    request.requestBody({})

    const response = await getPayPalClient().execute(request)
    return response.result
  } catch (error) {
    console.error('Error capturing PayPal payment:', error)
    throw new Error('Failed to capture PayPal payment')
  }
}

export const getPayPalOrderDetails = async (
  paypalOrderId: string
): Promise<any> => {
  try {
    const request = new paypal.orders.OrdersGetRequest(paypalOrderId)
    const response = await getPayPalClient().execute(request)
    return response.result
  } catch (error) {
    console.error('Error getting PayPal order details:', error)
    throw new Error('Failed to get PayPal order details')
  }
}

export const verifyPayPalWebhook = async (
  headers: Record<string, string>,
  body: string,
  webhookId: string
): Promise<boolean> => {
  try {
    const request = new paypal.notifications.WebhookVerifySignatureRequest()
    request.requestBody({
      auth_algo: headers['paypal-auth-algo'],
      cert_id: headers['paypal-cert-id'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    })

    const response = await getPayPalClient().execute(request)
    return response.result.verification_status === 'SUCCESS'
  } catch (error) {
    console.error('Error verifying PayPal webhook:', error)
    return false
  }
}

export const handlePayPalWebhookEvent = async (event: any): Promise<void> => {
  console.log(`Processing PayPal webhook event: ${event.event_type}`)

  switch (event.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      const capture = event.resource
      console.log('PayPal payment captured:', capture.id)
      break

    case 'PAYMENT.CAPTURE.DENIED':
      const deniedCapture = event.resource
      console.log('PayPal payment denied:', deniedCapture.id)
      break

    case 'PAYMENT.CAPTURE.REFUNDED':
      const refund = event.resource
      console.log('PayPal payment refunded:', refund.id)
      break

    default:
      console.log(`Unhandled PayPal event type: ${event.event_type}`)
  }
}

export const createPayPalRefund = async (
  captureId: string,
  amount?: number,
  currency = 'USD'
): Promise<any> => {
  try {
    const request = new paypal.payments.CapturesRefundRequest(captureId)

    const refundBody: any = {
      note_to_payer: 'Refund for your order',
    }

    if (amount) {
      refundBody.amount = {
        value: formatPayPalAmount(amount),
        currency_code: currency,
      }
    }

    request.requestBody(refundBody)

    const response = await getPayPalClient().execute(request)
    return response.result
  } catch (error) {
    console.error('Error creating PayPal refund:', error)
    throw new Error('Failed to create PayPal refund')
  }
}

export const validatePayPalConfiguration = (): boolean => {
  const requiredEnvVars = [
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
    'PAYPAL_ENVIRONMENT',
  ]

  return requiredEnvVars.every(envVar => Boolean(process.env[envVar]))
}

export const getPayPalEnvironment = (): string => {
  return process.env.PAYPAL_ENVIRONMENT === 'live' ? 'production' : 'sandbox'
}

export const getPayPalClientId = (): string => {
  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    throw new Error('PayPal client ID not configured for client-side')
  }
  return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
}
