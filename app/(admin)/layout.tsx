import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated
  if (!session?.user?.id) {
    redirect('/admin/login?callbackUrl=/admin')
  }

  // Check if user has admin role
  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar user={session.user} />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Admin header */}
          <header className="border-b border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your store and monitor performance
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notification bell */}
                <button className="relative p-2 text-gray-400 hover:text-gray-600">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {/* Notification badge */}
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500"></span>
                </button>

                {/* User profile */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {session.user.name || session.user.email}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                    <span className="text-sm font-medium text-white">
                      {(session.user.name ||
                        session.user.email ||
                        'A')[0].toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center space-x-2">
                  <button className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                    Quick Add
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Breadcrumb navigation */}
          <nav className="border-b border-gray-200 bg-white px-6 py-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <a href="/admin" className="hover:text-gray-900">
                Dashboard
              </a>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-900">Current Page</span>
            </div>
          </nav>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <p>&copy; 2024 Home Textile Store. All rights reserved.</p>
              </div>
              <div className="flex items-center space-x-4">
                <span>System Status: </span>
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-green-600">Operational</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}