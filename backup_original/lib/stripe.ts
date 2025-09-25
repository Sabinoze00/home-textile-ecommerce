import Stripe from 'stripe'
import { Order, OrderItem } from '@/types'

// Country name to ISO 3166-1 alpha-2 code mapping for Stripe
const STRIPE_SUPPORTED_COUNTRIES = [
  'AC',
  'AD',
  'AE',
  'AF',
  'AG',
  'AI',
  'AL',
  'AM',
  'AO',
  'AQ',
  'AR',
  'AT',
  'AU',
  'AW',
  'AX',
  'AZ',
  'BA',
  'BB',
  'BD',
  'BE',
  'BF',
  'BG',
  'BH',
  'BI',
  'BJ',
  'BL',
  'BM',
  'BN',
  'BO',
  'BQ',
  'BR',
  'BS',
  'BT',
  'BV',
  'BW',
  'BY',
  'BZ',
  'CA',
  'CC',
  'CD',
  'CF',
  'CG',
  'CH',
  'CI',
  'CK',
  'CL',
  'CM',
  'CN',
  'CO',
  'CR',
  'CV',
  'CW',
  'CX',
  'CY',
  'CZ',
  'DE',
  'DJ',
  'DK',
  'DM',
  'DO',
  'DZ',
  'EC',
  'EE',
  'EG',
  'EH',
  'ER',
  'ES',
  'ET',
  'FI',
  'FJ',
  'FK',
  'FO',
  'FR',
  'GA',
  'GB',
  'GD',
  'GE',
  'GF',
  'GG',
  'GH',
  'GI',
  'GL',
  'GM',
  'GN',
  'GP',
  'GQ',
  'GR',
  'GS',
  'GT',
  'GU',
  'GW',
  'GY',
  'HK',
  'HM',
  'HN',
  'HR',
  'HT',
  'HU',
  'ID',
  'IE',
  'IL',
  'IM',
  'IN',
  'IO',
  'IQ',
  'IS',
  'IT',
  'JE',
  'JM',
  'JO',
  'JP',
  'KE',
  'KG',
  'KH',
  'KI',
  'KM',
  'KN',
  'KR',
  'KW',
  'KY',
  'KZ',
  'LA',
  'LB',
  'LC',
  'LI',
  'LK',
  'LR',
  'LS',
  'LT',
  'LU',
  'LV',
  'LY',
  'MA',
  'MC',
  'MD',
  'ME',
  'MF',
  'MG',
  'MK',
  'ML',
  'MM',
  'MN',
  'MO',
  'MP',
  'MQ',
  'MR',
  'MS',
  'MT',
  'MU',
  'MV',
  'MW',
  'MX',
  'MY',
  'MZ',
  'NA',
  'NC',
  'NE',
  'NF',
  'NG',
  'NI',
  'NL',
  'NO',
  'NP',
  'NR',
  'NU',
  'NZ',
  'OM',
  'PA',
  'PE',
  'PF',
  'PG',
  'PH',
  'PK',
  'PL',
  'PM',
  'PN',
  'PR',
  'PS',
  'PT',
  'PW',
  'PY',
  'QA',
  'RE',
  'RO',
  'RS',
  'RU',
  'RW',
  'SA',
  'SB',
  'SC',
  'SE',
  'SG',
  'SH',
  'SI',
  'SJ',
  'SK',
  'SL',
  'SM',
  'SN',
  'SO',
  'SR',
  'SS',
  'ST',
  'SV',
  'SX',
  'SZ',
  'TA',
  'TC',
  'TD',
  'TF',
  'TG',
  'TH',
  'TJ',
  'TK',
  'TL',
  'TM',
  'TN',
  'TO',
  'TR',
  'TT',
  'TV',
  'TW',
  'TZ',
  'UA',
  'UG',
  'UM',
  'US',
  'UY',
  'UZ',
  'VA',
  'VC',
  'VE',
  'VG',
  'VI',
  'VN',
  'VU',
  'WF',
  'WS',
  'XK',
  'YE',
  'YT',
  'ZA',
  'ZM',
  'ZW',
] as const

const COUNTRY_NAME_TO_CODE_STRIPE: Record<string, string> = {
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
}

function getStripeCountryCode(countryName: string): string {
  // If it's already a 2-letter code, check if supported
  if (countryName.length === 2) {
    const code = countryName.toUpperCase()
    return STRIPE_SUPPORTED_COUNTRIES.includes(code as any) ? code : 'US'
  }

  // Look up in mapping
  const code = COUNTRY_NAME_TO_CODE_STRIPE[countryName]
  if (code && STRIPE_SUPPORTED_COUNTRIES.includes(code as any)) {
    return code
  }

  // Default to US if not found or not supported
  return 'US'
}

function getAllowedCountries(shippingCountry?: string): string[] {
  if (!shippingCountry) {
    // Default to common countries
    return ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'AU']
  }

  const countryCode = getStripeCountryCode(shippingCountry)

  // Include the shipping country and some common ones
  const commonCountries = ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'AU']
  const allowedCountries = [countryCode, ...commonCountries]

  // Remove duplicates and ensure all are supported
  return [...new Set(allowedCountries)].filter(code =>
    STRIPE_SUPPORTED_COUNTRIES.includes(code as any)
  )
}

// Lazy initialization of Stripe client to avoid import-time crashes
let stripeClient: Stripe | null = null

function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  }
  return stripeClient
}

export const formatStripeAmount = (amount: number): number => {
  return Math.round(amount * 100)
}

export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100
}

export interface CreateCheckoutSessionParams {
  orderId: string
  order: Order
  successUrl?: string
  cancelUrl?: string
  customerEmail?: string
}

export const createCheckoutSession = async ({
  orderId,
  order,
  successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
  customerEmail,
}: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> => {
  try {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      order.items.map(item => ({
        price_data: {
          currency: order.currency?.toLowerCase() || 'usd',
          product_data: {
            name: item.product.name,
            description:
              item.product.shortDescription || item.product.description,
            images:
              item.product.images?.length > 0
                ? [item.product.images[0].url]
                : [],
            metadata: {
              productId: item.product.id.toString(),
              variantId: item.variant?.id?.toString() || '',
            },
          },
          unit_amount: formatStripeAmount(item.price),
        },
        quantity: item.quantity,
      }))

    // Add shipping if applicable
    if (order.shipping > 0) {
      lineItems.push({
        price_data: {
          currency: order.currency?.toLowerCase() || 'usd',
          product_data: {
            name: 'Shipping',
            description: 'Shipping charges',
          },
          unit_amount: formatStripeAmount(order.shipping),
        },
        quantity: 1,
      })
    }

    // Add tax if applicable
    if (order.tax > 0) {
      lineItems.push({
        price_data: {
          currency: order.currency?.toLowerCase() || 'usd',
          product_data: {
            name: 'Tax',
            description: 'Tax charges',
          },
          unit_amount: formatStripeAmount(order.tax),
        },
        quantity: 1,
      })
    }

    const session = await getStripeClient().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId,
        orderNumber: order.orderNumber,
      },
      customer_email: customerEmail ?? undefined,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: getAllowedCountries(order.shippingAddress?.country),
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    })

    return session
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}

export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent =
      await getStripeClient().paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    throw new Error('Failed to retrieve payment intent')
  }
}

export const retrieveCheckoutSession = async (
  sessionId: string
): Promise<Stripe.Checkout.Session> => {
  try {
    const session = await getStripeClient().checkout.sessions.retrieve(
      sessionId,
      {
        expand: ['payment_intent'],
      }
    )
    return session
  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    throw new Error('Failed to retrieve checkout session')
  }
}

export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event => {
  try {
    const event = getStripeClient().webhooks.constructEvent(
      payload,
      signature,
      secret
    )
    return event
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    throw new Error('Invalid webhook signature')
  }
}

export const handleWebhookEvent = async (
  event: Stripe.Event
): Promise<void> => {
  console.log(`Processing Stripe webhook event: ${event.type}`)

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      console.log('Checkout session completed:', session.id)
      break

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment intent succeeded:', paymentIntent.id)
      break

    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment intent failed:', failedPaymentIntent.id)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}

export const createRefund = async (
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> => {
  try {
    const refund = await getStripeClient().refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? formatStripeAmount(amount) : undefined,
    })
    return refund
  } catch (error) {
    console.error('Error creating refund:', error)
    throw new Error('Failed to create refund')
  }
}

export const getPaymentMethodTypes = (): string[] => {
  return ['card']
}

export const validateStripeConfiguration = (): boolean => {
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ]

  return requiredEnvVars.every(envVar => Boolean(process.env[envVar]))
}
