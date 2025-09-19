'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from './ProductCard'
import { cn } from '@/lib/utils'
import { Product } from '@/types'

interface ProductCarouselProps {
  products: Product[]
  title?: string
  subtitle?: string
  className?: string
  onColorSelect?: (productId: string | number, color: string) => void
}

export function ProductCarousel({
  products,
  title,
  subtitle,
  className,
  onColorSelect,
}: ProductCarouselProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const handleResize = () => checkScrollButtons()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [products])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const cardWidth = container.children[0]?.clientWidth || 300
      const gap = 24 // 1.5rem gap
      const scrollAmount = cardWidth + gap

      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const cardWidth = container.children[0]?.clientWidth || 300
      const gap = 24 // 1.5rem gap
      const scrollAmount = cardWidth + gap

      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (!products || products.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-gray-500">No products available</p>
      </div>
    )
  }

  return (
    <section className={cn('relative', className)}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold text-textile-navy mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        {products.length > 1 && (
          <>
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200',
                canScrollLeft
                  ? 'hover:bg-gray-50 hover:shadow-xl'
                  : 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200',
                canScrollRight
                  ? 'hover:bg-gray-50 hover:shadow-xl'
                  : 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </>
        )}

        {/* Products Grid */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          onScroll={checkScrollButtons}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-none w-72 sm:w-80"
            >
              <ProductCard
                product={product}
                onColorSelect={onColorSelect}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile scroll indicator */}
      <div className="flex justify-center mt-4 sm:hidden">
        <div className="flex gap-2">
          {Array.from({ length: Math.ceil(products.length / 1) }).map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300"
            />
          ))}
        </div>
      </div>
    </section>
  )
}