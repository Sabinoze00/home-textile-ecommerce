'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ProductFilters as ProductFiltersType } from '@/types'

interface ProductSortProps {
  className?: string
  onSortChange?: (sort: {
    sortBy?: ProductFiltersType['sortBy']
    sortOrder?: ProductFiltersType['sortOrder']
  }) => void
}

const sortOptions = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'price-asc', label: 'Price Low to High' },
  { value: 'price-desc', label: 'Price High to Low' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'bestseller', label: 'Best Sellers' },
]

export function ProductSort({ className, onSortChange }: ProductSortProps) {
  const searchParams = useSearchParams()
  const [sortBy, setSortBy] = useState<ProductFiltersType['sortBy']>()
  const [sortOrder, setSortOrder] = useState<ProductFiltersType['sortOrder']>()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Initialize sort from URL params
  useEffect(() => {
    const urlSortBy = searchParams.get('sortBy') as ProductFiltersType['sortBy']
    const urlSortOrder = searchParams.get(
      'sortOrder'
    ) as ProductFiltersType['sortOrder']

    if (urlSortBy) setSortBy(urlSortBy)
    if (urlSortOrder) setSortOrder(urlSortOrder)
  }, [searchParams])

  const handleSortChange = (sortValue: string) => {
    let finalSortBy: ProductFiltersType['sortBy']
    let finalSortOrder: ProductFiltersType['sortOrder']

    if (sortValue === 'newest' || sortValue === 'bestseller') {
      finalSortBy = sortValue as ProductFiltersType['sortBy']
      finalSortOrder = undefined
    } else {
      const [newSortBy, newSortOrder] = sortValue.split('-') as [
        ProductFiltersType['sortBy'],
        ProductFiltersType['sortOrder'],
      ]
      finalSortBy = newSortBy
      finalSortOrder = newSortOrder
    }

    setSortBy(finalSortBy)
    setSortOrder(finalSortOrder)
    onSortChange?.({ sortBy: finalSortBy, sortOrder: finalSortOrder })
    setIsDropdownOpen(false)
  }

  const getCurrentValue = () => {
    if (sortBy === 'newest' || sortBy === 'bestseller') {
      return sortBy
    }
    return `${sortBy || 'name'}-${sortOrder || 'asc'}`
  }

  const getCurrentSortLabel = () => {
    const currentValue = getCurrentValue()
    const option = sortOptions.find(opt => opt.value === currentValue)
    return option?.label || 'Name A-Z'
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Desktop Sort Dropdown */}
      <div className="hidden md:flex md:items-center md:gap-2">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <select
          value={getCurrentValue()}
          onChange={e => handleSortChange(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-textile-navy focus:outline-none focus:ring-2 focus:ring-textile-navy"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Sort Dropdown */}
      <div className="relative md:hidden">
        <Button
          variant="outline"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full min-w-[160px] justify-between"
        >
          <span className="text-sm">{getCurrentSortLabel()}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>

        {isDropdownOpen && (
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm hover:bg-gray-50',
                  getCurrentValue() === option.value &&
                    'bg-textile-navy text-white'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
