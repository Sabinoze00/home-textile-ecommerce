import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Skip middleware for admin login page
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Admin route protection
    if (pathname.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }

      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Admin routes require ADMIN role (except login page)
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
          return token?.role === 'ADMIN'
        }

        // Account routes require authentication
        if (pathname.startsWith('/account')) {
          return !!token
        }

        // Allow guest access to checkout routes
        if (pathname.startsWith('/checkout')) {
          return true
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: ['/account/:path*', '/checkout', '/admin/((?!login).*)'],
}
