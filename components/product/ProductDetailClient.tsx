'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProductGallery } from '@/components/product/ProductGallery'
import { VariantSelector } from '@/components/product/VariantSelector'
import { ProductCarousel } from '@/components/product/ProductCarousel'
import { formatPrice } from '@/lib/utils'

function renderStars(rating: number) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
    )
  }

  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative w-5 h-5">
        <Star className="w-5 h-5 text-yellow-400" />
        <Star
          className="w-5 h-5 fill-yellow-400 text-yellow-400 absolute inset-0 overflow-hidden"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        />
      </div>
    )
  }

  const emptyStars = 5 - Math.ceil(rating)
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
    )
  }

  return stars
}

export function ProductDetailClient({ product }: { product: any }) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [selectedVariantImage, setSelectedVariantImage] = useState<string | undefined>()

  const handleVariantChange = (type: string, value: string, variant: any) => {
    setSelectedVariants(prev => ({
      ...prev,
      [type]: value
    }))

    // Update image if color variant has an image
    if (type === 'color' && variant.image) {
      setSelectedVariantImage(variant.image)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-textile-navy">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-textile-navy">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-textile-navy">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
            {product.isBestseller && <Badge variant="bestseller">Bestseller</Badge>}
            {product.isNew && <Badge variant="new">New</Badge>}
            {product.isFeatured && <Badge variant="featured">Featured</Badge>}
            {!product.inStock && <Badge variant="destructive">Out of Stock</Badge>}
          </div>

          {/* Product Name */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
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
                {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
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
            <button
              className="w-full bg-textile-navy text-white py-3 px-6 rounded-md font-medium hover:bg-textile-navy/90 transition-colors flex items-center justify-center gap-2"
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-5 h-5" />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            <div className="flex gap-4">
              <button className="flex-1 border border-gray-300 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Save
              </button>
              <button className="flex-1 border border-gray-300 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t pt-6 space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Specifications</h3>
                <dl className="space-y-2">
                  {product.specifications.map((spec: any) => (
                    <div key={spec.id} className="flex">
                      <dt className="text-sm font-medium text-gray-900 w-1/3">{spec.name}:</dt>
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