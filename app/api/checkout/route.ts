import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Prisma, OrderStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { CheckoutSchema } from '@/lib/validations'
import { calculateCartTotals, formatOrderNumber } from '@/lib/utils'

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
    const { shippingAddress, billingAddress, sameAsShipping, notes } =
      CheckoutSchema.parse(body)

    // Get user's cart items (in a real app, this might come from the request or session)
    const cartItems = body.items
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // 1) Fetch products and selected variants for all items
    const productIds = cartItems.map((i: any) => i.productId)
    const variantIds = cartItems.map((i: any) => i.variantId).filter(Boolean)

    const [products, variants] = await Promise.all([
      prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
        include: {
          images: {
            where: {
              isPrimary: true,
            },
            take: 1,
          },
        },
      }),
      variantIds.length > 0
        ? prisma.productVariant.findMany({
            where: {
              id: {
                in: variantIds,
              },
            },
          })
        : [],
    ])

    const productById = Object.fromEntries(products.map(p => [p.id, p]))
    const variantById = Object.fromEntries(variants.map(v => [v.id, v]))

    // 2) Validate existence, stock, and quantities
    const validationErrors: string[] = []
    const validatedItems: any[] = []

    for (const item of cartItems) {
      const product = productById[item.productId]
      const variant = item.variantId ? variantById[item.variantId] : null

      // Check product existence
      if (!product) {
        validationErrors.push(`Product ${item.productId} not found`)
        continue
      }

      // Check variant existence if specified
      if (item.variantId && !variant) {
        validationErrors.push(`Product variant ${item.variantId} not found`)
        continue
      }

      // Check stock availability
      if (!product.inStock) {
        validationErrors.push(`Product "${product.name}" is out of stock`)
        continue
      }

      if (variant && !variant.inStock) {
        validationErrors.push(
          `Product variant "${product.name} - ${variant.value}" is out of stock`
        )
        continue
      }

      // Check stock quantity (null means unlimited stock)
      if (product.stockQuantity !== null) {
        const availableStock = product.stockQuantity
        if (availableStock < item.quantity) {
          validationErrors.push(
            `Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${item.quantity}`
          )
          continue
        }
      }

      // 3) Compute authoritative server-side prices
      const basePrice = Number(product.price)
      const variantPriceOverride = variant?.price ? Number(variant.price) : null
      const authoritativePrice = variantPriceOverride || basePrice

      // Validate client price matches server price
      if (Math.abs(item.price - authoritativePrice) > 0.01) {
        validationErrors.push(
          `Price mismatch for "${product.name}". Expected: ${authoritativePrice}, Received: ${item.price}`
        )
        continue
      }

      validatedItems.push({
        ...item,
        product,
        variant,
        authoritativePrice,
        lineTotal: authoritativePrice * item.quantity,
      })
    }

    // 6) Return 400 error when validation fails
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    // 4) Recalculate totals from server data and compare with client payload
    const serverSubtotal = validatedItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    )
    const { tax, shipping, total } = calculateCartTotals(
      validatedItems.map(item => ({
        price: item.authoritativePrice,
        quantity: item.quantity,
      }))
    )

    // Validate totals match (allowing for small floating point differences)
    const clientTotals = calculateCartTotals(cartItems)
    if (Math.abs(serverSubtotal - clientTotals.subtotal) > 0.01) {
      return NextResponse.json(
        {
          error: 'Total mismatch',
          details: `Server calculated subtotal: ${serverSubtotal}, Client sent: ${clientTotals.subtotal}`,
        },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = formatOrderNumber()

    // 5) Wrap order creation and stock decrements in a transaction
    const order = await prisma.$transaction(async tx => {
      // Create shipping address
      const createdShippingAddress = await tx.address.create({
        data: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          company: shippingAddress.company,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
          type: 'shipping',
          userId: session.user.id,
        },
      })

      // Create billing address
      const createdBillingAddress = await tx.address.create({
        data: {
          firstName: sameAsShipping
            ? shippingAddress.firstName
            : billingAddress.firstName,
          lastName: sameAsShipping
            ? shippingAddress.lastName
            : billingAddress.lastName,
          company: sameAsShipping
            ? shippingAddress.company
            : billingAddress.company,
          street: sameAsShipping
            ? shippingAddress.street
            : billingAddress.street,
          city: sameAsShipping ? shippingAddress.city : billingAddress.city,
          state: sameAsShipping ? shippingAddress.state : billingAddress.state,
          postalCode: sameAsShipping
            ? shippingAddress.postalCode
            : billingAddress.postalCode,
          country: sameAsShipping
            ? shippingAddress.country
            : billingAddress.country,
          phone: sameAsShipping ? shippingAddress.phone : billingAddress.phone,
          type: 'billing',
          userId: session.user.id,
        },
      })

      // Create order with address references
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          status: OrderStatus.PENDING,
          subtotal: new Prisma.Decimal(serverSubtotal),
          tax: new Prisma.Decimal(tax),
          shipping: new Prisma.Decimal(shipping),
          total: new Prisma.Decimal(total),
          notes,
          shippingAddressId: createdShippingAddress.id,
          billingAddressId: createdBillingAddress.id,
          // Create order items with snapshot fields and totals
          items: {
            create: validatedItems.map(item => ({
              quantity: item.quantity,
              price: new Prisma.Decimal(item.authoritativePrice),
              total: new Prisma.Decimal(item.lineTotal),
              productId: item.productId,
              variantId: item.variantId ?? null,
              productName: item.product.name,
              productSlug: item.product.slug,
              productImage: item.product.images?.[0]?.url || '',
              variantName: item.variant?.name || null,
              variantValue: item.variant?.value || null,
            })),
          },
        },
        include: {
          items: true,
          shippingAddress: true,
          billingAddress: true,
        },
      })

      // Decrement stock quantities for ordered products (only if stock is tracked)
      for (const item of validatedItems) {
        const product = productById[item.productId]
        if (product && product.stockQuantity !== null) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          })
        }
      }

      return createdOrder
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        order,
      },
    })
  } catch (error) {
    console.error('Checkout error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's saved addresses for checkout
    const addresses = await prisma.address.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        isDefault: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        addresses,
      },
    })
  } catch (error) {
    console.error('Get checkout data error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
