'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ColorPicker } from './ColorPicker'
import { cn, formatPrice } from '@/lib/utils'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
  className?: string
  onColorSelect?: (productId: string | number, color: string) => void
}

export function ProductCard({ product, className, onColorSelect }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0]
  const colorVariants = product.variants?.filter((variant) => variant.type === 'color') || []


  const calculateDiscountPercentage = (): number | null => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    }
    return product.discountPercentage || null
  }

  const handleColorSelect = (color: string) => {
    if (onColorSelect) {
      onColorSelect(product.id, color)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-3 h-3">
          <Star className="w-3 h-3 text-yellow-400" />
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
      )
    }

    return stars
  }

  const discountPercentage = calculateDiscountPercentage()

  return (
    <div className={cn('group relative bg-white rounded-lg overflow-hidden card-hover', className)}>
      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isOnSale && discountPercentage && (
            <Badge variant="sale">-{discountPercentage}%</Badge>
          )}
          {product.isBestseller && <Badge variant="bestseller">Bestseller</Badge>}
          {product.isNew && <Badge variant="new">New</Badge>}
          {product.isFeatured && <Badge variant="featured">Featured</Badge>}
          {!product.inStock && (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="text-xs text-gray-500 uppercase tracking-wide">
          {product.category.name}
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 group-hover:text-textile-navy transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {renderStars(product.rating.average)}
            </div>
            <span className="text-xs text-gray-500">
              ({product.rating.count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Color Variants */}
        {colorVariants.length > 0 && (
          <div className="pt-2">
            <ColorPicker
              colors={colorVariants}
              onColorSelect={handleColorSelect}
              size="sm"
              mode="thumbnail"
            />
          </div>
        )}

        {/* Short Description */}
        {product.shortDescription && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.shortDescription}
          </p>
        )}
      </div>
    </div>
  )
}