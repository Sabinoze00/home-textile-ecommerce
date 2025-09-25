'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { User, Package, MapPin, Heart, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

interface AccountLayoutProps {
  children: React.ReactNode
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push(`/auth/signin?callbackUrl=${pathname}`)
      return
    }
  }, [session, status, router, pathname])

  if (status === 'loading' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-textile-navy"></div>
      </div>
    )
  }

  const navigation = [
    {
      name: 'Overview',
      href: '/account',
      icon: User,
      current: pathname === '/account',
    },
    {
      name: 'Orders',
      href: '/account/orders',
      icon: Package,
      current: pathname.startsWith('/account/orders'),
    },
    {
      name: 'Addresses',
      href: '/account/addresses',
      icon: MapPin,
      current: pathname.startsWith('/account/addresses'),
    },
    {
      name: 'Wishlist',
      href: '/account/wishlist',
      icon: Heart,
      current: pathname.startsWith('/account/wishlist'),
    },
    {
      name: 'Settings',
      href: '/account/settings',
      icon: Settings,
      current: pathname.startsWith('/account/settings'),
    },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-8 rounded-lg bg-white p-6 shadow-sm">
              {/* User Info */}
              <div className="mb-6 border-b border-gray-200 pb-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-textile-navy text-lg font-semibold text-white">
                    {session.user?.email?.charAt(0).toUpperCase() ||
                      session.user?.name?.charAt(0).toUpperCase() ||
                      'U'}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      {session.user?.name || 'User'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {session.user?.email || 'No email'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-textile-navy text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        item.current
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Sign Out */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="mt-8 lg:col-span-9 lg:mt-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
