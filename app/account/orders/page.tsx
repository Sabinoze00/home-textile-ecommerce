'use client'

import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OrderCard } from '@/components/account/OrderCard'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        const result = await response.json()

        if (result.success) {
          setOrders(result.data)
        } else {
          setError(result.error || 'Failed to load orders')
        }
      } catch (err) {
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-textile-navy"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <p className="mt-2 text-gray-600">Track and manage your orders</p>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-red-400" />
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!error && orders.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Package className="mx-auto mb-6 h-16 w-16 text-gray-400" />
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                No orders yet
              </h2>
              <p className="mb-8 text-gray-600">
                Start shopping to see your orders here.
              </p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
