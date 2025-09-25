'use client'

import { useState, useEffect } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { ColorPicker } from './ColorPicker'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ProductVariant } from '@/types'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariants?: Record<string, string>
  onVariantChange?: (
    type: string,
    value: string,
    variant: ProductVariant
  ) => void
  className?: string
  showPricing?: boolean
  basePrice?: number
}

export function VariantSelector({
  variants,
  selectedVariants = {},
  onVariantChange,
  className,
  showPricing = false,
  basePrice = 0,
}: VariantSelectorProps) {
  const [localSelectedVariants, setLocalSelectedVariants] =
    useState<Record<string, string>>(selectedVariants)

  useEffect(() => {
    setLocalSelectedVariants(selectedVariants)
  }, [selectedVariants])

  // Group variants by type
  const variantsByType = variants.reduce(
    (acc, variant) => {
      if (!acc[variant.type]) {
        acc[variant.type] = []
      }
      acc[variant.type].push(variant)
      return acc
    },
    {} as Record<string, ProductVariant[]>
  )

  const handleVariantSelect = (type: string, value: string) => {
    const variant = variants.find(v => v.type === type && v.value === value)
    if (!variant) return

    const newSelectedVariants = {
      ...localSelectedVariants,
      [type]: value,
    }

    setLocalSelectedVariants(newSelectedVariants)
    onVariantChange?.(type, value, variant)
  }

  const getVariantPrice = (variant: ProductVariant): number => {
    return variant.price || basePrice
  }

  const getSelectedVariantPrice = (): number => {
    const selectedVariantsList = Object.entries(localSelectedVariants)
      .map(([type, value]) =>
        variants.find(v => v.type === type && v.value === value)
      )
      .filter(Boolean) as ProductVariant[]

    const variantWithPrice = selectedVariantsList.find(
      v => v.price !== undefined && v.price !== null
    )
    return variantWithPrice?.price || basePrice
  }

  const isVariantAvailable = (variant: ProductVariant): boolean => {
    return variant.inStock !== false
  }

  const getVariantTypeDisplayName = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')
  }

  if (!variants || variants.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-6', className)}>
      {Object.entries(variantsByType).map(([type, typeVariants]) => (
        <div key={type} className="space-y-3">
          <div>
            <h4 className="font-bold text-gray-900">
              {getVariantTypeDisplayName(type)}
            </h4>
          </div>

          {/* Color variants use ColorPicker */}
          {type === 'color' ? (
            <ColorPicker
              colors={typeVariants}
              selectedColor={localSelectedVariants[type]}
              onColorSelect={value => handleVariantSelect(type, value)}
              size="lg"
              mode="full"
            />
          ) : (
            /* Other variants use button grid */
            <div className="flex flex-wrap gap-2">
              {typeVariants.map(variant => {
                const isSelected = localSelectedVariants[type] === variant.value
                const isAvailable = isVariantAvailable(variant)

                return (
                  <button
                    key={variant.id}
                    onClick={() =>
                      isAvailable && handleVariantSelect(type, variant.value)
                    }
                    disabled={!isAvailable}
                    className={cn(
                      'relative rounded-md border px-3 py-2 text-center text-sm font-medium transition-all duration-200',
                      isSelected
                        ? 'border-textile-navy bg-textile-navy text-white'
                        : isAvailable
                          ? 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                          : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500 opacity-60'
                    )}
                    title={variant.name || variant.value}
                  >
                    {variant.name || variant.value}

                    {!isAvailable && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-red-600">
                        Out of Stock
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}

      {/* Selected variants summary */}
      {Object.keys(localSelectedVariants).length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4">
          <h5 className="mb-3 font-medium text-gray-900">Selected Options</h5>
          <div className="space-y-2">
            {Object.entries(localSelectedVariants).map(([type, value]) => {
              const variant = variants.find(
                v => v.type === type && v.value === value
              )
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-gray-600">
                    {getVariantTypeDisplayName(type)}:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {variant?.name || value}
                    </span>
                    {variant?.sku && (
                      <Badge variant="secondary" className="text-xs">
                        {variant.sku}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Total price if different from base */}
            {showPricing && getSelectedVariantPrice() !== basePrice && (
              <div className="border-t border-gray-200 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    Variant Price:
                  </span>
                  <span className="text-sm font-semibold text-textile-navy">
                    ${getSelectedVariantPrice().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Availability notice */}
      {Object.values(localSelectedVariants).length > 0 && (
        <div className="text-sm text-gray-600">
          {Object.entries(localSelectedVariants).every(([type, value]) => {
            const variant = variants.find(
              v => v.type === type && v.value === value
            )
            return variant && isVariantAvailable(variant)
          }) ? (
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-4 w-4" />
              <span>Selected options are available</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Some selected options are out of stock</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
