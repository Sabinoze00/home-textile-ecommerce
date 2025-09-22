import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Eye, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  quantity: number
  productName: string
  productImage: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number | string
  createdAt: string
  items: OrderItem[]
}

interface OrderCardProps {
  order: Order
}

export function OrderCard({ order }: OrderCardProps) {
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

  const getShippingStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'Delivered'
      case 'shipped':
        return 'In Transit'
      case 'processing':
        return 'Processing'
      default:
        return 'Order Received'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Order #{order.orderNumber}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span>
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </span>
              <span className="font-semibold text-gray-900">
                {formatPrice(Number(order.total))}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() +
                order.status.slice(1).toLowerCase()}
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/account/orders/${order.id}`}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          {/* Order Items Preview */}
          <div className="flex items-center space-x-4">
            {order.items.slice(0, 3).map((item: OrderItem, index: number) => (
              <div key={item.id} className="relative">
                <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100">
                  {item.productImage ? (
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <Package className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
                {item.quantity > 1 && (
                  <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
                    {item.quantity}
                  </div>
                )}
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-sm text-gray-500">
                +{order.items.length - 3}
              </div>
            )}
          </div>

          {/* Shipping Status */}
          <div className="flex items-center text-sm text-gray-600">
            <Truck className="mr-2 h-4 w-4" />
            <span>{getShippingStatus(order.status)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
