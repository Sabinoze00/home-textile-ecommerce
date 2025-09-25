'use client'

import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductFilters as ProductFiltersType } from '@/types'

interface FilterOption {
  id: string
  name: string
  value: string
  count?: number
}

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  onFiltersChange?: (filters: ProductFiltersType) => void
  availableFilters?: {
    categories: FilterOption[]
    colors: FilterOption[]
    sizes: FilterOption[]
    materials: FilterOption[]
    priceRange: { min: number; max: number }
  }
  initialFilters?: ProductFiltersType
}

export function FilterPanel({
  isOpen,
  onClose,
  onFiltersChange,
  availableFilters,
  initialFilters,
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [filters, setFilters] = useState<ProductFiltersType>(
    initialFilters || {}
  )
  const [pendingFilters, setPendingFilters] = useState<ProductFiltersType>(
    initialFilters || {}
  )

  // Update filters when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
      setPendingFilters(initialFilters)
    }
  }, [initialFilters])

  const handleFilterChange = (newFilters: ProductFiltersType) => {
    setPendingFilters(newFilters)
  }

  const applyFilters = () => {
    setFilters(pendingFilters)
    onFiltersChange?.(pendingFilters)
    onClose()
  }

  const clearAllFilters = () => {
    const emptyFilters = {}
    setPendingFilters(emptyFilters)
    setFilters(emptyFilters)
    onFiltersChange?.(emptyFilters)
    onClose()
  }

  const toggleArrayFilter = (key: keyof ProductFiltersType, value: string) => {
    const currentArray = (pendingFilters[key] as string[]) || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]

    handleFilterChange({
      ...pendingFilters,
      [key]: newArray.length > 0 ? newArray : undefined,
    })
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
    if (pendingFilters.categories?.length)
      count += pendingFilters.categories.length
    if (pendingFilters.colors?.length) count += pendingFilters.colors.length
    if (pendingFilters.sizes?.length) count += pendingFilters.sizes.length
    if (pendingFilters.materials?.length)
      count += pendingFilters.materials.length
    if (pendingFilters.priceRange) count += 1
    if (pendingFilters.inStock) count += 1
    if (pendingFilters.onSale) count += 1
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

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop Overlay - Full Screen */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        style={{
          margin: 0,
          padding: 0,
          animation: 'fadeIn 300ms ease-out forwards',
        }}
        onClick={onClose}
      />

      {/* Filter Panel - Mobile Drawer Style */}
      <div
        className="fixed inset-y-0 left-0 z-50 w-3/4 bg-white shadow-xl"
        style={{
          animation: 'slideInFromLeft 300ms ease-out forwards',
          margin: 0,
          padding: 0,
        }}
      >
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close filters"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="p-4">
            <div className="space-y-4">
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
                          pendingFilters.categories?.includes(category.value) ||
                          false
                        }
                        onChange={() =>
                          toggleArrayFilter('categories', category.value)
                        }
                        className="rounded border-gray-300 text-textile-navy focus:ring-textile-navy"
                      />
                      <span className="text-sm text-gray-700">
                        {category.name}
                      </span>
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
                        value={pendingFilters.priceRange?.min || ''}
                        onChange={e =>
                          handleFilterChange({
                            ...pendingFilters,
                            priceRange: {
                              ...pendingFilters.priceRange,
                              min: e.target.value
                                ? parseFloat(e.target.value)
                                : 0,
                              max:
                                pendingFilters.priceRange?.max ||
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
                        value={pendingFilters.priceRange?.max || ''}
                        onChange={e =>
                          handleFilterChange({
                            ...pendingFilters,
                            priceRange: {
                              min: pendingFilters.priceRange?.min || 0,
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
                        checked={
                          pendingFilters.colors?.includes(color.value) || false
                        }
                        onChange={() =>
                          toggleArrayFilter('colors', color.value)
                        }
                        className="rounded border-gray-300 text-textile-navy focus:ring-textile-navy"
                      />
                      <span className="text-sm text-gray-700">
                        {color.name}
                      </span>
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
                        checked={
                          pendingFilters.sizes?.includes(size.value) || false
                        }
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
                          pendingFilters.materials?.includes(material.value) ||
                          false
                        }
                        onChange={() =>
                          toggleArrayFilter('materials', material.value)
                        }
                        className="rounded border-gray-300 text-textile-navy focus:ring-textile-navy"
                      />
                      <span className="text-sm text-gray-700">
                        {material.name}
                      </span>
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
                    checked={pendingFilters.inStock || false}
                    onChange={e =>
                      handleFilterChange({
                        ...pendingFilters,
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
                    checked={pendingFilters.onSale || false}
                    onChange={e =>
                      handleFilterChange({
                        ...pendingFilters,
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
                <h4 className="mb-3 font-medium text-gray-900">
                  Active Filters
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pendingFilters.categories?.map(category => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {category}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          toggleArrayFilter('categories', category)
                        }
                      />
                    </Badge>
                  ))}
                  {pendingFilters.colors?.map(color => (
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
                  {pendingFilters.sizes?.map(size => (
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
                  {pendingFilters.materials?.map(material => (
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

            {/* Footer with Apply and Clear All buttons */}
            <div className="sticky bottom-0 mt-6 border-t border-gray-200 bg-white p-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="h-12 flex-1 border-textile-terracotta text-textile-terracotta hover:bg-textile-terracotta hover:text-white"
                >
                  Clear All
                </Button>
                <Button
                  onClick={applyFilters}
                  className="h-12 flex-1 bg-textile-navy text-white hover:bg-textile-navy/90"
                >
                  Applica Filtri
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
