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
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current
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
      <div className={cn('py-12 text-center', className)}>
        <p className="text-gray-500">No products available</p>
      </div>
    )
  }

  return (
    <section className={cn('relative', className)}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-8 text-center">
          {title && (
            <h2 className="mb-4 text-3xl font-bold text-textile-navy md:text-4xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
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
                'absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-200',
                canScrollLeft
                  ? 'hover:bg-gray-50 hover:shadow-xl'
                  : 'cursor-not-allowed opacity-50'
              )}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={cn(
                'absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-lg transition-all duration-200',
                canScrollRight
                  ? 'hover:bg-gray-50 hover:shadow-xl'
                  : 'cursor-not-allowed opacity-50'
              )}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </>
        )}

        {/* Products Grid */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
          onScroll={checkScrollButtons}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {products.map(product => (
            <div key={product.id} className="w-72 flex-none sm:w-80">
              <ProductCard product={product} onColorSelect={onColorSelect} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile scroll indicator */}
      <div className="mt-4 flex justify-center sm:hidden">
        <div className="flex gap-2">
          {Array.from({ length: Math.ceil(products.length / 1) }).map(
            (_, index) => (
              <div key={index} className="h-2 w-2 rounded-full bg-gray-300" />
            )
          )}
        </div>
      </div>
    </section>
  )
}
