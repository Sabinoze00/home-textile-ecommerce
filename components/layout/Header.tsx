'use client'

import Link from 'next/link'
import { ShoppingBag, User, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from './Navigation'
import { SearchBar } from './SearchBar'

export function Header() {
  return (
    <header className="relative">
      {/* Promotional Banner */}
      <div className="bg-textile-navy text-white text-center py-2 px-4">
        <p className="text-sm">
          Free shipping on orders over $75 | 30-day returns
        </p>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main row with centered logo and side icons */}
          <div className="flex items-center justify-between h-16">
            {/* Left side icons on desktop, mobile menu on mobile */}
            <div className="flex items-center space-x-4">
              <Navigation mode="mobile" className="lg:hidden" />
              <div className="hidden lg:flex items-center space-x-4">
                {/* Account */}
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="sr-only">Account</span>
                </Button>

                {/* Wishlist */}
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5 text-gray-600" />
                  <span className="sr-only">Wishlist</span>
                </Button>
              </div>
            </div>

            {/* Centered Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
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
                <SearchBar className="w-64" />
              </div>

              {/* Shopping Cart */}
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-textile-terracotta text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  2
                </span>
                <span className="sr-only">Shopping cart</span>
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <SearchBar className="w-full" />
          </div>
        </div>

        {/* Desktop Navigation Row */}
        <div className="hidden lg:block border-t border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Navigation mode="desktop" />
          </div>
        </div>
      </div>
    </header>
  )
}