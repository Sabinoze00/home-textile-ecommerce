'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  HelpCircle,
  Activity,
} from 'lucide-react'

interface AdminSidebarProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
  }
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    badge: null,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: '5', // Could be dynamic based on pending orders
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    badge: null,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    badge: null,
  },
]

const bottomNavigationItems = [
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    name: 'Help & Support',
    href: '/admin/help',
    icon: HelpCircle,
  },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const SidebarContent = () => (
    <>
      {/* Logo and brand */}
      <div className="flex items-center border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Activity className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Admin Panel
              </h2>
              <p className="text-xs text-gray-500">Home Textile Store</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigationItems.map(item => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              } `}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-600">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick stats */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Today's Sales</span>
              <Bell className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">$2,847</div>
            <div className="text-xs opacity-80">+12% from yesterday</div>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 px-4 py-4">
        {bottomNavigationItems.map(item => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`mb-1 flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } `}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}

        {/* User profile and logout */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          {!isCollapsed && (
            <div className="mb-2 flex items-center px-3 py-2">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                <span className="text-sm font-medium text-gray-700">
                  {(user.name || user.email || 'A')[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700`}
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} `}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-full overflow-y-auto">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden border-r border-gray-200 bg-white shadow-lg transition-all duration-300 lg:fixed lg:inset-y-0 lg:flex lg:flex-col ${isCollapsed ? 'w-16' : 'w-64'} `}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 shadow-sm hover:text-gray-700"
        >
          <Menu className="h-3 w-3" />
        </button>

        <SidebarContent />
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-gray-300 bg-white p-2 shadow-sm lg:hidden"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Spacer for desktop sidebar */}
      <div
        className={`hidden lg:block ${isCollapsed ? 'w-16' : 'w-64'} flex-shrink-0`}
      />
    </>
  )
}