'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ColorPicker } from './ColorPicker'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { cn, formatPrice } from '@/lib/utils'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
  className?: string
  onColorSelect?: (productId: string | number, color: string) => void
}

export function ProductCard({
  product,
  className,
  onColorSelect,
}: ProductCardProps) {
  const primaryImage =
    product.images?.find(img => img.isPrimary) || product.images?.[0]
  const colorVariants =
    product.variants?.filter(variant => variant.type === 'color') || []

  const calculateDiscountPercentage = (): number | null => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
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
        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative h-3 w-3">
          <Star className="h-3 w-3 text-yellow-400" />
          <Star
            className="absolute inset-0 h-3 w-3 overflow-hidden fill-yellow-400 text-yellow-400"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </div>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />)
    }

    return stars
  }

  const discountPercentage = calculateDiscountPercentage()

  return (
    <div
      className={cn(
        'card-hover group relative overflow-hidden rounded-lg bg-white',
        className
      )}
    >
      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden"
      >
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <span className="text-sm text-gray-400">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          {product.isOnSale && discountPercentage && (
            <Badge variant="sale">-{discountPercentage}%</Badge>
          )}
          {product.isBestseller && (
            <Badge variant="bestseller">Bestseller</Badge>
          )}
          {product.isNew && <Badge variant="new">New</Badge>}
          {product.isFeatured && <Badge variant="featured">Featured</Badge>}
          {!product.inStock && (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-3 p-4">
        {/* Category */}
        <div className="text-xs uppercase tracking-wide text-gray-500">
          {product.category.name}
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 font-medium text-gray-900 transition-colors group-hover:text-textile-navy">
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
          <span className="text-lg font-semibold text-gray-900">
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
          <p className="line-clamp-2 text-sm text-gray-600">
            {product.shortDescription}
          </p>
        )}

        {/* Add to Cart Button */}
        <div className="pt-2">
          <AddToCartButton
            product={product}
            productVariant={
              colorVariants.length > 0 ? colorVariants[0] : undefined
            }
            className="w-full"
            size="sm"
          />
        </div>
      </div>
    </div>
  )
}
