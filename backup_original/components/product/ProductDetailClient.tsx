'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProductGallery } from '@/components/product/ProductGallery'
import { VariantSelector } from '@/components/product/VariantSelector'
import { ProductCarousel } from '@/components/product/ProductCarousel'
import { AddToCartWithQuantity } from '@/components/cart/AddToCartButton'
import { formatPrice } from '@/lib/utils'

function renderStars(rating: number) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
    )
  }

  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative h-5 w-5">
        <Star className="h-5 w-5 text-yellow-400" />
        <Star
          className="absolute inset-0 h-5 w-5 overflow-hidden fill-yellow-400 text-yellow-400"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        />
      </div>
    )
  }

  const emptyStars = 5 - Math.ceil(rating)
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />)
  }

  return stars
}

export function ProductDetailClient({ product }: { product: any }) {
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({})
  const [selectedVariantImage, setSelectedVariantImage] = useState<
    string | undefined
  >()

  const handleVariantChange = (type: string, value: string, variant: any) => {
    setSelectedVariants(prev => ({
      ...prev,
      [type]: value,
    }))

    // Update image if color variant has an image
    if (type === 'color' && variant.image) {
      setSelectedVariantImage(variant.image)
    }
  }

  // Get selected variant object based on selectedVariants
  const getSelectedVariant = () => {
    if (!product.variants || Object.keys(selectedVariants).length === 0) {
      return undefined
    }

    const firstVariantType = Object.keys(selectedVariants)[0]
    if (!firstVariantType) {
      return undefined
    }

    return product.variants.find(
      (variant: any) =>
        variant.type === firstVariantType &&
        variant.value === selectedVariants[firstVariantType]
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-textile-navy">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-textile-navy">
          Products
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-textile-navy"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Product Gallery */}
        <ProductGallery
          images={product.images || []}
          productName={product.name}
          selectedVariantImage={selectedVariantImage}
        />

        {/* Product Info */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.isOnSale && <Badge variant="sale">Sale</Badge>}
            {product.isBestseller && (
              <Badge variant="bestseller">Bestseller</Badge>
            )}
            {product.isNew && <Badge variant="new">New</Badge>}
            {product.isFeatured && <Badge variant="featured">Featured</Badge>}
            {!product.inStock && (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* Product Name */}
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 md:text-4xl">
              {product.name}
            </h1>
            <p className="text-lg text-gray-600">{product.shortDescription}</p>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {renderStars(product.rating.average)}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating.average.toFixed(1)} ({product.rating.count}{' '}
                reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-lg font-semibold text-red-600">
                  Save {formatPrice(product.originalPrice - product.price)}
                </span>
              </>
            )}
          </div>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedVariants={selectedVariants}
              onVariantChange={handleVariantChange}
              showPricing={true}
              basePrice={product.price}
            />
          )}

          {/* Actions */}
          <div className="space-y-4">
            <AddToCartWithQuantity
              product={product}
              productVariant={getSelectedVariant()}
              defaultQuantity={1}
              maxQuantity={product.stockQuantity || 10}
              className="w-full"
              size="lg"
            />

            <div className="flex gap-4">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 font-medium transition-colors hover:bg-gray-50">
                <Heart className="h-5 w-5" />
                Save
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 font-medium transition-colors hover:bg-gray-50">
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 border-t pt-6">
            <div>
              <h3 className="mb-2 font-medium text-gray-900">Description</h3>
              <p className="leading-relaxed text-gray-600">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div>
                <h3 className="mb-2 font-medium text-gray-900">
                  Specifications
                </h3>
                <dl className="space-y-2">
                  {product.specifications.map((spec: any) => (
                    <div key={spec.id} className="flex">
                      <dt className="w-1/3 text-sm font-medium text-gray-900">
                        {spec.name}:
                      </dt>
                      <dd className="text-sm text-gray-600">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="mt-16">
          <ProductCarousel
            products={product.relatedProducts}
            title="You Might Also Like"
            subtitle="Similar products from the same category"
          />
        </div>
      )}
    </div>
  )
}
