'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, User, Heart, LogOut, Shield } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Navigation } from './Navigation'
import { SearchBar } from './SearchBar'
import { CategoryNavigation } from './CategoryNavigation'
import { MobileMenu } from './MobileMenu'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useCart } from '@/hooks/use-cart'

export function Header() {
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [showCategories, setShowCategories] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHomepage = pathname === '/'

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const shouldHideCategories = scrollPosition > 50

      setScrolled(scrollPosition > 0)
      setShowCategories(!shouldHideCategories)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="relative">
      {/* Mobile Menu - rendered outside sticky container */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

      {/* Promotional Banner */}
      <div className="bg-textile-navy px-4 py-1 text-center text-white">
        <p className="text-sm">
          Free shipping on orders over $75 | 30-day returns
        </p>
      </div>

      {/* Main Header */}
      <div
        className={`relative border-b border-gray-200 bg-white ${isHomepage || scrolled ? 'sticky top-0 z-40' : ''}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main row with centered logo and side icons */}
          <div className="flex h-12 items-center justify-between">
            {/* Left side icons on desktop, mobile menu on mobile */}
            <div className="flex items-center space-x-4">
              <Navigation
                mode="mobile"
                className="lg:hidden"
                onMobileMenuToggle={toggleMobileMenu}
              />
              <div className="hidden items-center space-x-4 lg:flex">
                {/* Account */}
                {session ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5 text-gray-600" />
                        <span className="sr-only">Account</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem asChild>
                        <Link href="/account">My Account</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/orders">Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/addresses">Addresses</Link>
                      </DropdownMenuItem>
                      {session?.user?.role === 'ADMIN' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin">
                              <Shield className="mr-2 h-4 w-4" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/auth/signin">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="sr-only">Sign In</span>
                    </Link>
                  </Button>
                )}

                {/* Wishlist */}
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5 text-gray-600" />
                  <span className="sr-only">Wishlist</span>
                </Button>
              </div>
            </div>

            {/* Centered Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 transform">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-textile-navy">
                  Cozy Home
                </span>
              </Link>
            </div>

            {/* Right side - Search and Cart */}
            <div className="flex items-center space-x-4">
              {/* Desktop Search Bar */}
              <div className="hidden md:flex">
                <SearchBar className="w-80" />
              </div>

              {/* Shopping Cart with CartDrawer */}
              <CartDrawer>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-5 w-5 text-gray-600" />
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-textile-terracotta text-xs text-white">
                      {itemCount}
                    </span>
                  )}
                  <span className="sr-only">Shopping cart</span>
                </Button>
              </CartDrawer>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="pb-4 md:hidden">
            <SearchBar className="w-full" />
          </div>
        </div>

        {/* Category Navigation - Only on homepage */}
        {isHomepage && (
          <CategoryNavigation
            isVisible={showCategories}
            className={`transition-all duration-300 ${scrolled ? 'border-t-0' : 'border-t border-gray-100'}`}
          />
        )}

        {/* Desktop Navigation Row */}
        <div className="hidden border-t border-gray-100 lg:block">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Navigation mode="desktop" />
          </div>
        </div>
      </div>
    </header>
  )
}
