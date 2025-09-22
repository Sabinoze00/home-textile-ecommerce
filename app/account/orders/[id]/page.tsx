import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OrderDetails } from '@/components/account/OrderDetails'

interface OrderDetailPageProps {
  params: {
    id: string
  }
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin?callbackUrl=/account/orders')
  }

  // Fetch order with full details
  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      items: true,
      shippingAddress: true,
      billingAddress: true,
    },
  })

  if (!order) {
    redirect('/account/orders')
  }

  // Convert Decimal fields to numbers and Date to string for the component
  const orderData = {
    ...order,
    subtotal: order.subtotal.toNumber(),
    tax: order.tax.toNumber(),
    shipping: order.shipping.toNumber(),
    total: order.total.toNumber(),
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(item => ({
      ...item,
      price: item.price.toNumber(),
      total: item.total.toNumber(),
    })),
  }

  return <OrderDetails order={orderData} />
}
