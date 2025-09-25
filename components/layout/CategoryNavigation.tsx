'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CategoryItem {
  name: string
  href: string
  slug: string
}

const categories: CategoryItem[] = [
  { name: 'SHEETS', href: '/products?category=sheets', slug: 'sheets' },
  {
    name: 'DUVET COVERS',
    href: '/products?category=duvet-covers',
    slug: 'duvet-covers',
  },
  { name: 'QUILTS', href: '/products?category=quilts', slug: 'quilts' },
  {
    name: 'COMFORTERS',
    href: '/products?category=comforters',
    slug: 'comforters',
  },
  { name: 'PILLOWS', href: '/products?category=pillows', slug: 'pillows' },
  { name: 'BATH', href: '/products?category=bath', slug: 'bath' },
  { name: 'MATTRESS', href: '/products?category=mattress', slug: 'mattress' },
  {
    name: 'LOUNGEWEAR',
    href: '/products?category=loungewear',
    slug: 'loungewear',
  },
  {
    name: 'KIDS & BABY',
    href: '/products?category=kids-baby',
    slug: 'kids-baby',
  },
  {
    name: 'HOME DECOR',
    href: '/products?category=home-decor',
    slug: 'home-decor',
  },
  { name: 'OUTDOOR', href: '/products?category=outdoor', slug: 'outdoor' },
  { name: 'SALE', href: '/products?onSale=true', slug: 'sale' },
]

// Route path to category slug mapping for direct category routes
const routeToSlugMapping: Record<string, string> = {
  '/sheets': 'sheets',
  '/duvet-covers': 'duvet-covers',
  '/quilts-coverlets': 'quilts',
  '/comforters': 'comforters',
  '/bath': 'bath',
  '/blankets-throws': 'pillows', // assuming throws map to pillows category
  '/kids': 'kids-baby',
  '/home-decor': 'home-decor',
}

interface CategoryNavigationProps {
  className?: string
  isVisible?: boolean
}

export function CategoryNavigation({
  className,
  isVisible = true,
}: CategoryNavigationProps) {
  const pathname = usePathname()
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(
    null
  )

  const getCurrentCategory = () => {
    // Check if we're on a products page with category filter
    if (pathname.includes('/products') && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const categoryParam = urlParams.get('category')
      const onSaleParam = urlParams.get('onSale')

      if (onSaleParam === 'true') return 'sale'
      if (categoryParam) return categoryParam
    }

    // Check if we're on a direct category route
    const mappedSlug = routeToSlugMapping[pathname]
    if (mappedSlug) return mappedSlug

    // Fallback: check if pathname matches any category slug
    const category = categories.find(cat => pathname.includes(cat.slug))
    return category?.slug
  }

  const activeCategory = getCurrentCategory()

  const checkScrollButtons = () => {
    if (!scrollContainer) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainer) return

    const scrollAmount = 200
    const newScrollLeft =
      direction === 'left'
        ? scrollContainer.scrollLeft - scrollAmount
        : scrollContainer.scrollLeft + scrollAmount

    scrollContainer.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainer
    if (container) {
      container.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)

      return () => {
        container.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [scrollContainer])

  return (
    <div
      className={cn(
        'relative overflow-hidden border-b border-gray-200 bg-white transition-all duration-300 ease-in-out',
        isVisible ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0',
        className
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center">
          {/* Left scroll button - only visible on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'absolute left-0 z-10 h-full rounded-none bg-gradient-to-r from-white to-transparent px-2 md:hidden',
              canScrollLeft ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
            onClick={() => scroll('left')}
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Categories container */}
          <div
            ref={setScrollContainer}
            className="flex overflow-x-auto py-3 scrollbar-hide md:py-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-1 pl-2 pr-2 md:gap-2 md:pl-0 md:pr-0">
              {categories.map(category => {
                const isActive = activeCategory === category.slug

                return (
                  <Link
                    key={category.slug}
                    href={category.href}
                    className="t5"
                    data-color="night-sky-dark"
                    data-bg-color="daybreak"
                    data-ht-component={`exposed-nav-card-${category.slug}`}
                  >
                    {category.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right scroll button - only visible on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'absolute right-0 z-10 h-full rounded-none bg-gradient-to-l from-white to-transparent px-2 md:hidden',
              canScrollRight ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
            onClick={() => scroll('right')}
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
