'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ProductFilters as ProductFiltersType } from '@/types'

interface FilterOption {
  id: string
  name: string
  value: string
  count?: number
}

interface FilterSection {
  id: string
  name: string
  type: 'checkbox' | 'range' | 'radio'
  options?: FilterOption[]
  min?: number
  max?: number
}

interface ProductFiltersProps {
  className?: string
  onFiltersChange?: (filters: ProductFiltersType) => void
  availableFilters?: {
    categories: FilterOption[]
    colors: FilterOption[]
    sizes: FilterOption[]
    materials: FilterOption[]
    priceRange: { min: number; max: number }
  }
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

export function ProductFilters({
  className,
  onFiltersChange,
  availableFilters,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'category',
    'price',
  ])
  const [filters, setFilters] = useState<ProductFiltersType>({})

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

    const sortBy = searchParams.get('sortBy') as ProductFiltersType['sortBy']
    if (sortBy) urlFilters.sortBy = sortBy

    const sortOrder = searchParams.get(
      'sortOrder'
    ) as ProductFiltersType['sortOrder']
    if (sortOrder) urlFilters.sortOrder = sortOrder

    setFilters(urlFilters)
  }, [searchParams])

  const updateURL = (newFilters: ProductFiltersType) => {
    const params = new URLSearchParams()

    if (newFilters.categories?.length) {
      const firstCategory = newFilters.categories[0]
      if (firstCategory) {
        params.set('category', firstCategory)
      }
    }

    if (newFilters.priceRange) {
      if (newFilters.priceRange.min > 0) {
        params.set('minPrice', newFilters.priceRange.min.toString())
      }
      if (newFilters.priceRange.max < 1000) {
        params.set('maxPrice', newFilters.priceRange.max.toString())
      }
    }

    if (newFilters.colors?.length) {
      params.set('colors', newFilters.colors.join(','))
    }

    if (newFilters.sizes?.length) {
      params.set('sizes', newFilters.sizes.join(','))
    }

    if (newFilters.materials?.length) {
      params.set('materials', newFilters.materials.join(','))
    }

    if (newFilters.inStock !== undefined) {
      params.set('inStock', newFilters.inStock.toString())
    }

    if (newFilters.onSale !== undefined) {
      params.set('onSale', newFilters.onSale.toString())
    }

    if (newFilters.sortBy) {
      params.set('sortBy', newFilters.sortBy)
    }

    if (newFilters.sortOrder) {
      params.set('sortOrder', newFilters.sortOrder)
    }

    router.push(`?${params.toString()}`)
  }

  const handleFilterChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters)
    updateURL(newFilters)
    onFiltersChange?.(newFilters)
  }

  const toggleArrayFilter = (key: keyof ProductFiltersType, value: string) => {
    const currentArray = (filters[key] as string[]) || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]

    handleFilterChange({
      ...filters,
      [key]: newArray.length > 0 ? newArray : undefined,
    })
  }

  const handleSortChange = (sortValue: string) => {
    const [sortBy, sortOrder] = sortValue.split('-') as [
      ProductFiltersType['sortBy'],
      ProductFiltersType['sortOrder'],
    ]
    handleFilterChange({
      ...filters,
      sortBy: sortBy === 'newest' ? 'newest' : sortBy,
      sortOrder: sortBy === 'newest' ? undefined : sortOrder,
    })
  }

  const clearAllFilters = () => {
    setFilters({})
    router.push(window.location.pathname)
    onFiltersChange?.({})
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

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

  const FilterSection = ({
    title,
    sectionId,
    children,
  }: {
    title: string
    sectionId: string
    children: React.ReactNode
  }) => {
    const isExpanded = expandedSections.includes(sectionId)

    return (
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => toggleSection(sectionId)}
          className="flex w-full items-center justify-between py-2 text-left"
        >
          <span className="font-medium text-gray-900">{title}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {isExpanded && <div className="mt-3 space-y-2">{children}</div>}
      </div>
    )
  }

  return (
    <div className={cn('', className)}>
      {/* Mobile Filter Toggle */}
      <div className="mb-4 lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      <div
        className={cn(
          'rounded-lg border border-gray-200 bg-white p-6',
          'lg:block',
          isOpen ? 'block' : 'hidden lg:block'
        )}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-textile-terracotta hover:text-textile-terracotta"
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Sort */}
          <FilterSection title="Sort" sectionId="sort">
            <select
              value={`${filters.sortBy || 'name'}-${filters.sortOrder || 'asc'}`}
              onChange={e => handleSortChange(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-textile-navy focus:ring-2 focus:ring-textile-navy"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterSection>

          {/* Categories */}
          {availableFilters?.categories && (
            <FilterSection title="Category" sectionId="category">
              {availableFilters.categories.map(category => (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={
                      filters.categories?.includes(category.value) || false
                    }
                    onChange={() =>
                      toggleArrayFilter('categories', category.value)
                    }
                    className="rounded border-gray-300 text-textile-navy focus:ring-textile-navy"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                  {category.count && (
                    <span className="text-xs text-gray-500">
                      ({category.count})
                    </span>
                  )}
                </label>
              ))}
            </FilterSection>
          )}

          {/* Price Range */}
          {availableFilters?.priceRange && (
            <FilterSection title="Price Range" sectionId="price">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange?.min || ''}
                    onChange={e =>
                      handleFilterChange({
                        ...filters,
                        priceRange: {
                          ...filters.priceRange,
                          min: e.target.value ? parseFloat(e.target.value) : 0,
                          max:
                            filters.priceRange?.max ||
                            availableFilters.priceRange.max,
                        },
                      })
                    }
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange?.max || ''}
                    onChange={e =>
                      handleFilterChange({
                        ...filters,
                        priceRange: {
                          min: filters.priceRange?.min || 0,
                          max: e.target.value
                            ? parseFloat(e.target.value)
                            : availableFilters.priceRange.max,
                        },
                      })
                    }
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                  />
                </div>
              </div>
            </FilterSection>
          )}

          {/* Colors */}
          {availableFilters?.colors && (
            <FilterSection title="Colors" sectionId="colors">
              {availableFilters.colors.map(color => (
                <label
                  key={color.id}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={filters.colors?.includes(color.value) || false}
                    onChange={() => toggleArrayFilter('colors', color.value)}
                    className="rounded border-gray-300 text-textile-navy focus:ring-textile-navy"
                  />
                  <span className="text-sm text-gray-700">{color.name}</span>
                  {color.count && (
                    <span className="text-xs text-gray-500">
                      ({color.count})
                    </span>
                  )}
                </label>
              ))}
            </FilterSection>
          )}

          {/* Sizes */}
          {availableFilters?.sizes && (
            <FilterSection title="Sizes" sectionId="sizes">
              {availableFilters.sizes.map(size => (
                <label
                  key={size.id}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={filters.sizes?.includes(size.value) || false}
                    onChange={() => toggleArrayFilter('sizes', size.value)}
                    className="rounded border-gray-300 text-textile-navy focus:ring-textile-navy"
                  />
                  <span className="text-sm text-gray-700">{size.name}</span>
                  {size.count && (
                    <span className="text-xs text-gray-500">
                      ({size.count})
                    </span>
                  )}
                </label>
              ))}
            </FilterSection>
          )}

          {/* Materials */}
          {availableFilters?.materials && (
            <FilterSection title="Materials" sectionId="materials">
              {availableFilters.materials.map(material => (
                <label
                  key={material.id}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={
                      filters.materials?.includes(material.value) || false
                    }
                    onChange={() =>
                      toggleArrayFilter('materials', material.value)
                    }
                    className="rounded border-gray-300 text-textile-navy focus:ring-textile-navy"
                  />
                  <span className="text-sm text-gray-700">{material.name}</span>
                  {material.count && (
                    <span className="text-xs text-gray-500">
                      ({material.count})
                    </span>
                  )}
                </label>
              ))}
            </FilterSection>
          )}

          {/* Availability */}
          <FilterSection title="Availability" sectionId="availability">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filters.inStock || false}
                onChange={e =>
                  handleFilterChange({
                    ...filters,
                    inStock: e.target.checked || undefined,
                  })
                }
                className="rounded border-gray-300 text-textile-navy focus:ring-textile-navy"
              />
              <span className="text-sm text-gray-700">In Stock Only</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={filters.onSale || false}
                onChange={e =>
                  handleFilterChange({
                    ...filters,
                    onSale: e.target.checked || undefined,
                  })
                }
                className="rounded border-gray-300 text-textile-navy focus:ring-textile-navy"
              />
              <span className="text-sm text-gray-700">On Sale</span>
            </label>
          </FilterSection>
        </div>

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="mb-3 font-medium text-gray-900">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.categories?.map(category => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {category}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleArrayFilter('categories', category)}
                  />
                </Badge>
              ))}
              {filters.colors?.map(color => (
                <Badge
                  key={color}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {color}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleArrayFilter('colors', color)}
                  />
                </Badge>
              ))}
              {filters.sizes?.map(size => (
                <Badge
                  key={size}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {size}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleArrayFilter('sizes', size)}
                  />
                </Badge>
              ))}
              {filters.materials?.map(material => (
                <Badge
                  key={material}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {material}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleArrayFilter('materials', material)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
