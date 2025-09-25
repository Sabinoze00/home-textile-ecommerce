'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const navigationItems = [
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

export function Navigation({
  mode = 'desktop',
  className,
  onMobileMenuToggle,
}: {
  mode?: 'mobile' | 'desktop'
  className?: string
  onMobileMenuToggle?: () => void
}) {
  const isMobile = mode === 'mobile'

  return (
    <>
      {/* Desktop Navigation - shown when not in mobile mode */}
      {!isMobile && (
        <nav className="flex items-center justify-center space-x-8 py-3">
          {navigationItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors duration-200 hover:text-textile-terracotta ${
                item.highlight
                  ? 'font-semibold text-red-600'
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
          onClick={onMobileMenuToggle}
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}
    </>
  )
}
