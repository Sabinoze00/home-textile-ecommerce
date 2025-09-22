'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Plus, Edit, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AddressesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin?callbackUrl=/account/addresses')
      return
    }

    const fetchAddresses = async () => {
      try {
        // For now, we'll use mock data since we haven't implemented the addresses API
        // In a real app, you'd fetch from /api/addresses
        const mockAddresses = [
          {
            id: '1',
            type: 'shipping',
            firstName: 'John',
            lastName: 'Doe',
            company: 'Tech Corp',
            street: '123 Main Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'US',
            phone: '+1 (555) 123-4567',
            isDefault: true,
          },
          {
            id: '2',
            type: 'billing',
            firstName: 'John',
            lastName: 'Doe',
            street: '456 Office Ave',
            city: 'Los Angeles',
            state: 'CA',
            postalCode: '90210',
            country: 'US',
            phone: '+1 (555) 987-6543',
            isDefault: false,
          },
        ]

        setAddresses(mockAddresses)
        setLoading(false)
      } catch (err) {
        setError('Failed to load addresses')
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-textile-navy"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      // In a real app, you'd call the delete API
      setAddresses(addresses.filter(addr => addr.id !== addressId))
    } catch (err) {
      alert('Failed to delete address')
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      // In a real app, you'd call the API to set default
      setAddresses(
        addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId,
        }))
      )
    } catch (err) {
      alert('Failed to update default address')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/account" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Account
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Addresses</h1>
              <p className="mt-2 text-gray-600">
                Manage your shipping and billing addresses
              </p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Address
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <MapPin className="mx-auto mb-4 h-12 w-12 text-red-400" />
                <p className="text-red-600">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!error && addresses.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <MapPin className="mx-auto mb-6 h-16 w-16 text-gray-400" />
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  No addresses saved
                </h2>
                <p className="mb-8 text-gray-600">
                  Add your shipping and billing addresses for faster checkout.
                </p>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Address
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {addresses.map(address => (
              <Card
                key={address.id}
                className={address.isDefault ? 'ring-2 ring-textile-navy' : ''}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {address.type === 'shipping'
                          ? 'Shipping Address'
                          : 'Billing Address'}
                        {address.isDefault && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Star className="h-3 w-3" />
                            Default
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="font-medium text-gray-900">
                      {address.firstName} {address.lastName}
                    </p>
                    {address.company && <p>{address.company}</p>}
                    <p>{address.street}</p>
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                    {address.phone && <p>{address.phone}</p>}
                  </div>

                  {!address.isDefault && (
                    <div className="mt-4 border-t pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                        className="w-full"
                      >
                        Set as Default
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Address Tips
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Keep your addresses up to date for accurate delivery
                    estimates and faster checkout. Your default address will be
                    automatically selected during checkout.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
