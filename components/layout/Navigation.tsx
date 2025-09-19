'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigationItems = [
  { name: 'NEW', href: '/new' },
  { name: 'BEDDING', href: '/bedding' },
  { name: 'SHEETS', href: '/sheets' },
  { name: 'COMFORTERS', href: '/comforters' },
  { name: 'PILLOWS', href: '/pillows' },
  { name: 'BATH', href: '/bath' },
  { name: 'MATTRESS', href: '/mattress' },
  { name: 'LOUNGEWEAR', href: '/loungewear' },
  { name: 'KIDS & BABY', href: '/kids-baby' },
  { name: 'HOME DECOR', href: '/home-decor' },
  { name: 'OUTDOOR', href: '/outdoor' },
  { name: 'SALE', href: '/sale', highlight: true },
]

export function Navigation({ mode = 'desktop', className }: { mode?: 'mobile' | 'desktop'; className?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const isMobile = mode === 'mobile'

  return (
    <>
      {/* Desktop Navigation - shown when not in mobile mode */}
      {!isMobile && (
        <nav className="flex items-center justify-center space-x-8 py-3">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors duration-200 hover:text-textile-terracotta ${
                item.highlight
                  ? 'text-red-600 font-semibold'
                  : 'text-gray-700 hover:text-textile-navy'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}

      {/* Mobile Menu Button - shown when in mobile mode */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className={className}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      )}

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && isMobile && (
        <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <nav className="flex flex-col py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-6 py-3 text-sm font-medium transition-colors duration-200 hover:bg-gray-50 ${
                  item.highlight
                    ? 'text-red-600 font-semibold'
                    : 'text-gray-700 hover:text-textile-navy'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}