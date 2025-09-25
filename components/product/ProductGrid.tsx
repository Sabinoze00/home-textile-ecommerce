'use client'

import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  className?: string
  onColorSelect?: (productId: string | number, color: string) => void
  emptyMessage?: string
  gridCols?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  collectionSlug?: string
}

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-lg bg-white">
    <Skeleton className="aspect-square w-full" />
    <div className="space-y-3 p-4">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-5 w-1/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  </div>
)

export function ProductGrid({
  products,
  loading = false,
  className,
  onColorSelect,
  emptyMessage = 'No products found',
  gridCols = { default: 2, sm: 2, lg: 3, xl: 4 },
  collectionSlug,
}: ProductGridProps) {
  const getGridClasses = () => {
    const classes = ['grid', 'gap-3']

    // Default grid columns
    classes.push(`grid-cols-${gridCols.default}`)

    // Responsive grid columns
    if (gridCols.sm) classes.push(`sm:grid-cols-${gridCols.sm}`)
    if (gridCols.md) classes.push(`md:grid-cols-${gridCols.md}`)
    if (gridCols.lg) classes.push(`lg:grid-cols-${gridCols.lg}`)
    if (gridCols.xl) classes.push(`xl:grid-cols-${gridCols.xl}`)

    return classes.join(' ')
  }

  if (loading) {
    return (
      <div className={cn(getGridClasses(), className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className={cn('py-16 text-center', className)}>
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {emptyMessage}
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(getGridClasses(), className)}>
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onColorSelect={onColorSelect}
          collectionSlug={collectionSlug}
        />
      ))}
    </div>
  )
}
