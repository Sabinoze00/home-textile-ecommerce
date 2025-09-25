import Image from 'next/image'
import { CheckCircle, Package, Calendar, Truck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  quantity: number
  price: number | string
  total: number | string
  productName: string
  productImage: string
  variantName?: string | null
  variantValue?: string | null
}

interface Address {
  firstName: string
  lastName: string
  company?: string | null
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string | null
}

interface Order {
  id: string
  orderNumber: string
  status: string
  subtotal: number | string
  tax: number | string
  shipping: number | string
  total: number | string
  createdAt: string
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
}

interface OrderDetailsProps {
  order: Order
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-600" />
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Order Details</h1>
        <div className="inline-block rounded-lg bg-white p-4">
          <p className="mb-1 text-sm text-gray-500">Order Number</p>
          <p className="text-xl font-bold text-gray-900">{order.orderNumber}</p>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <Badge className={getStatusColor(order.status)} variant="outline">
          {order.status.charAt(0).toUpperCase() +
            order.status.slice(1).toLowerCase()}
        </Badge>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item: OrderItem) => (
              <div key={item.id} className="flex space-x-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <span className="text-xs text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {item.productName}
                  </h4>
                  {item.variantName && item.variantValue && (
                    <p className="text-sm text-gray-500">
                      {item.variantName}: {item.variantValue}
                    </p>
                  )}
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(Number(item.total))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">
                {formatPrice(Number(order.subtotal))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">
                {formatPrice(Number(order.tax))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">
                {Number(order.shipping) === 0
                  ? 'Free'
                  : formatPrice(Number(order.shipping))}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(Number(order.total))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Information */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-gray-600">
            <p className="font-medium text-gray-900">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            {order.shippingAddress.company && (
              <p>{order.shippingAddress.company}</p>
            )}
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && (
              <p>{order.shippingAddress.phone}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center text-sm text-gray-600">
              <Truck className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Standard Shipping</p>
                <p>3-5 business days</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="mr-3 h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Order Date</p>
                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
