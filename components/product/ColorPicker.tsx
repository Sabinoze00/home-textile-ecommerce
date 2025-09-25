'use client'

import { cn } from '@/lib/utils'
import { ProductVariant } from '@/types'

interface ColorPickerProps {
  colors: ProductVariant[]
  selectedColor?: string
  onColorSelect?: (color: string) => void
  size?: 'xs' | 'sm' | 'md' | 'lg'
  mode?: 'thumbnail' | 'full'
  className?: string
  interactiveFallback?: boolean
}

const colorMap: Record<string, string> = {
  white: '#ffffff',
  cream: '#f9f7f2',
  ivory: '#fffff0',
  natural: '#f5f3f0',
  beige: '#f5f5dc',
  navy: '#1e293b',
  'deep navy': '#0f172a',
  charcoal: '#374151',
  grey: '#9ca3af',
  'light grey': '#d1d5db',
  black: '#000000',
  sage: '#84a59d',
  'sage green': '#84a59d',
  terracotta: '#c4756b',
  rose: '#fda4af',
  'rose garden': '#f9a8d4',
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#eab308',
  purple: '#a855f7',
  pink: '#ec4899',
  orange: '#f97316',
  brown: '#92400e',
  tan: '#d2b48c',
  gold: '#fbbf24',
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}

export function ColorPicker({
  colors,
  selectedColor,
  onColorSelect,
  size = 'md',
  mode = 'thumbnail',
  className,
  interactiveFallback = false,
}: ColorPickerProps) {
  const colorVariants =
    colors?.filter(variant => variant.type === 'color') || []
  const hasSyntheticVariant = colorVariants.length === 0

  // If no color variants, create default ones
  const displayVariants =
    colorVariants.length > 0
      ? colorVariants
      : [
          {
            id: 'natural',
            name: 'Natural',
            type: 'color' as const,
            value: 'natural',
            inStock: true,
          },
          {
            id: 'white',
            name: 'White',
            type: 'color' as const,
            value: 'white',
            inStock: true,
          },
          {
            id: 'cream',
            name: 'Cream',
            type: 'color' as const,
            value: 'cream',
            inStock: true,
          },
          {
            id: 'sage',
            name: 'Sage',
            type: 'color' as const,
            value: 'sage',
            inStock: true,
          },
        ]

  const getColorValue = (colorName: string): string => {
    const normalized = colorName.toLowerCase().trim()
    return colorMap[normalized] || '#9ca3af' // fallback to gray
  }

  const handleColorClick = (color: ProductVariant) => {
    // Don't emit color selection for synthetic variants unless explicitly allowed
    if (hasSyntheticVariant && !interactiveFallback) {
      return
    }

    if (onColorSelect) {
      onColorSelect(color.value)
    }
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    color: ProductVariant
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleColorClick(color)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex gap-1.5', mode === 'full' && 'gap-2')}>
        {displayVariants.map(color => {
          const isSelected = selectedColor === color.value
          const colorValue = getColorValue(color.value)
          const isLight = [
            '#ffffff',
            '#fffff0',
            '#f9f7f2',
            '#f5f5dc',
            '#f5f3f0',
            '#d1d5db',
          ].includes(colorValue.toLowerCase())
          const isDisabled =
            !color.inStock || (hasSyntheticVariant && !interactiveFallback)

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => handleColorClick(color)}
              onKeyDown={e => handleKeyDown(e, color)}
              className={cn(
                'relative rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-textile-navy focus:ring-offset-2',
                sizeClasses[size],
                isSelected
                  ? 'scale-110 border-textile-navy shadow-md'
                  : 'border-gray-300 hover:scale-105 hover:border-gray-400',
                isDisabled && 'cursor-not-allowed opacity-50'
              )}
              style={{ backgroundColor: colorValue }}
              title={color.name || color.value}
              aria-label={`Select ${color.name || color.value} color`}
              disabled={isDisabled}
            >
              {/* Inner border for light colors */}
              {isLight && (
                <div
                  className="absolute inset-0.5 rounded-full border border-gray-200"
                  style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
                />
              )}

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      isLight ? 'bg-gray-600' : 'bg-white'
                    )}
                  />
                </div>
              )}

              {/* Out of stock indicator */}
              {!color.inStock && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-0.5 rotate-45 rounded-full bg-red-500" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {mode === 'full' && selectedColor && (
        <span className="ml-2 text-sm text-gray-600">
          {displayVariants.find(c => c.value === selectedColor)?.name ||
            selectedColor}
        </span>
      )}
    </div>
  )
}
