'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

export default function AdminLogin() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleAdminLogin = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/admin')
          router.refresh()
        }, 1000)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
          <p className="mt-2 text-gray-600">
            Development mode - Direct admin login
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleAdminLogin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </Button>

          {message && (
            <div className="rounded-md bg-gray-100 p-3 text-center text-sm">
              {message}
            </div>
          )}

          <div className="text-center text-xs text-gray-500">
            This login method only works in development mode
          </div>
        </div>
      </Card>
    </div>
  )
}
