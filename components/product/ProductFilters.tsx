'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ProductFilters as ProductFiltersType } from '@/types'

interface ProductFiltersProps {
  className?: string
  onFilterToggle?: () => void
  initialFilters?: ProductFiltersType
}

export function ProductFilters({
  className,
  onFilterToggle,
  initialFilters,
}: ProductFiltersProps) {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<ProductFiltersType>(
    initialFilters || {}
  )

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: ProductFiltersType = {}

    const category = searchParams.get('category')
    if (category) urlFilters.categories = [category]

    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice || maxPrice) {
      urlFilters.priceRange = {
        min: minPrice ? parseFloat(minPrice) : 0,
        max: maxPrice ? parseFloat(maxPrice) : 1000,
      }
    }

    const colors = searchParams.get('colors')
    if (colors) urlFilters.colors = colors.split(',')

    const sizes = searchParams.get('sizes')
    if (sizes) urlFilters.sizes = sizes.split(',')

    const materials = searchParams.get('materials')
    if (materials) urlFilters.materials = materials.split(',')

    const inStock = searchParams.get('inStock')
    if (inStock) urlFilters.inStock = inStock === 'true'

    const onSale = searchParams.get('onSale')
    if (onSale) urlFilters.onSale = onSale === 'true'

    setFilters(urlFilters)
  }, [searchParams])

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.categories?.length) count += filters.categories.length
    if (filters.colors?.length) count += filters.colors.length
    if (filters.sizes?.length) count += filters.sizes.length
    if (filters.materials?.length) count += filters.materials.length
    if (filters.priceRange) count += 1
    if (filters.inStock) count += 1
    if (filters.onSale) count += 1
    return count
  }

  return (
    <div className={cn('', className)}>
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={onFilterToggle}
        className="h-10 w-full justify-center px-4 py-2"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
          )}
        </div>
      </Button>
    </div>
  )
}
