'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Star, ShoppingCart, Heart, Share2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProductGallery } from '@/components/product/ProductGallery'
import { VariantSelector } from '@/components/product/VariantSelector'
import { ProductCarousel } from '@/components/product/ProductCarousel'
import { AddToCartWithQuantity } from '@/components/cart/AddToCartButton'
import { Collapsible } from '@/components/ui/collapsible'
import { useCart } from '@/hooks/use-cart'
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
  const { addItem } = useCart()
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({})
  const [selectedVariantImage, setSelectedVariantImage] = useState<
    string | undefined
  >()
  const [showStickyCart, setShowStickyCart] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const addToCartRef = useRef<HTMLDivElement>(null)

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

  // Get current price based on selected variant
  const getCurrentPrice = () => {
    const selectedVariant = getSelectedVariant()
    return selectedVariant?.price || product.price
  }

  // Get original price for sale comparison
  const getOriginalPrice = () => {
    const selectedVariant = getSelectedVariant()
    return selectedVariant?.originalPrice || product.originalPrice
  }

  // Handle sticky cart visibility
  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect()
        // Hide sticky cart when the actual cart is visible
        setShowStickyCart(rect.top > window.innerHeight)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle sticky add to cart
  const handleStickyAddToCart = async () => {
    if (isAdding) return

    console.log('handleStickyAddToCart called with quantity:', quantity)
    setIsAdding(true)
    try {
      console.log('Adding to cart with parameters:', {
        product: product.name,
        variant: getSelectedVariant()?.value,
        quantity: quantity,
      })

      addItem(product, getSelectedVariant(), quantity)
      console.log('Item successfully added to cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 lg:px-6">
      {/* Breadcrumb */}
      <nav className="mb-2 flex items-center gap-2 text-[11px] text-gray-600">
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
      </nav>

      {/* Brand and Title */}
      <div className="mb-3">
        <div className="text-xs text-gray-600 underline">
          Home Textile Store
        </div>
        <h1 className="text-[18px] font-bold text-gray-900">{product.name}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Product Gallery with Badges Overlay */}
        <div className="relative">
          {/* Badges positioned over image */}
          <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1">
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
          {/* Heart icon positioned in top-right */}
          <button className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-2 shadow-sm transition-colors hover:bg-white hover:text-red-500">
            <Heart className="h-5 w-5" />
          </button>
          <ProductGallery
            images={product.images || []}
            productName={product.name}
            selectedVariantImage={selectedVariantImage}
          />
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(getCurrentPrice())}
            </span>
            {getOriginalPrice() && getOriginalPrice() > getCurrentPrice() && (
              <>
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(getOriginalPrice())}
                </span>
                <span className="text-sm font-semibold text-red-600">
                  Save {formatPrice(getOriginalPrice() - getCurrentPrice())}
                </span>
              </>
            )}
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {renderStars(product.rating.average)}
              </div>
              <span className="text-xs text-gray-600">
                {product.rating.average.toFixed(1)} ({product.rating.count}{' '}
                reviews)
              </span>
            </div>
          )}

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

          {/* Availability and Estimated Delivery */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-900">
                In Stock
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Est. Arrival: </span>
              <span>
                {new Date().getHours() < 12
                  ? new Date(
                      Date.now() + 24 * 60 * 60 * 1000
                    ).toLocaleDateString('it-IT', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })
                  : new Date(
                      Date.now() + 48 * 60 * 60 * 1000
                    ).toLocaleDateString('it-IT', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div ref={addToCartRef} className="space-y-3">
            {/* Custom quantity selector + add to cart */}
            <div className="flex w-full items-center space-x-2">
              <div className="flex items-center rounded-md border border-gray-300">
                <button
                  onClick={() => {
                    const newQuantity = Math.max(1, quantity - 1)
                    console.log(
                      'Normal component quantity decreased to:',
                      newQuantity
                    )
                    setQuantity(newQuantity)
                  }}
                  disabled={quantity <= 1}
                  className="inline-flex h-8 w-8 items-center justify-center whitespace-nowrap rounded-full p-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-plus h-3 w-3 rotate-45"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </button>
                <span className="min-w-[2rem] px-2 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    const newQuantity = Math.min(
                      product.stockQuantity || 10,
                      quantity + 1
                    )
                    console.log(
                      'Normal component quantity increased to:',
                      newQuantity
                    )
                    setQuantity(newQuantity)
                  }}
                  disabled={quantity >= (product.stockQuantity || 10)}
                  className="inline-flex h-8 w-8 items-center justify-center whitespace-nowrap rounded-full p-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-plus h-3 w-3"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </button>
              </div>

              <button
                onClick={handleStickyAddToCart}
                disabled={isAdding || !product.inStock}
                className="inline-flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-all duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="mr-2">
                  <ShoppingCart className="h-4 w-4" />
                </span>
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
            <div className="text-center text-xs text-gray-600">
              Spedizione gratuita per ordini sopra €100 • Resi gratuiti
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Product Details */}
      <div className="mt-6 space-y-0 border-t pt-4">
        <Collapsible title="Product Overview" defaultOpen={true}>
          <p className="text-[14px] leading-relaxed">
            {product.description || product.shortDescription}
          </p>
        </Collapsible>

        <Collapsible title="Size Information">
          {product.specifications && product.specifications.length > 0 ? (
            <dl className="space-y-2 text-[14px]">
              {product.specifications.map((spec: any) => (
                <div key={spec.id} className="flex text-[14px]">
                  <dt className="w-1/3 text-[14px] font-medium">
                    {spec.name}:
                  </dt>
                  <dd className="text-[14px]">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-[14px]">
              Please refer to our size guide for detailed measurements.
            </p>
          )}
        </Collapsible>

        <Collapsible title="Care Instructions">
          <ul className="space-y-1 text-[14px]">
            <li className="text-[14px]">
              • Machine wash cold with like colors
            </li>
            <li className="text-[14px]">• Use mild detergent</li>
            <li className="text-[14px]">• Tumble dry low or line dry</li>
            <li className="text-[14px]">• Do not bleach</li>
            <li className="text-[14px]">• Iron on low heat if needed</li>
          </ul>
        </Collapsible>

        <Collapsible title="Shipping & Returns">
          <div className="space-y-2 text-[14px]">
            <p className="text-[14px]">
              <strong>Shipping:</strong> Free standard shipping on orders over
              $75. Standard shipping takes 5-7 business days.
            </p>
            <p className="text-[14px]">
              <strong>Returns:</strong> 30-day return policy. Items must be in
              original condition with tags attached.
            </p>
            <p className="text-[14px]">
              <strong>Exchanges:</strong> Free exchanges within 30 days of
              purchase.
            </p>
          </div>
        </Collapsible>

        <Collapsible title="Certifications">
          <div className="space-y-2 text-[14px]">
            <p className="text-[14px]">• OEKO-TEX Standard 100 certified</p>
            <p className="text-[14px]">• Made with organic cotton</p>
            <p className="text-[14px]">• Eco-friendly manufacturing process</p>
            <p className="text-[14px]">• Fair trade certified</p>
          </div>
        </Collapsible>
      </div>
      {/* You Might Also Like Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-[24px] font-semibold text-gray-900">
          You Might Also Like
        </h2>
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4">
            {/* Mock products for now - replace with actual related products */}
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="group w-48 flex-none cursor-pointer">
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <div className="flex h-full items-center justify-center text-gray-400">
                    Product {index + 1}
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    Similar Product {index + 1}
                  </h3>
                  <p className="text-sm text-gray-600">$49.99</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart */}
      {showStickyCart && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-lg">
          <div className="container mx-auto">
            <div className="flex w-full items-center space-x-2">
              {/* Quantity selector */}
              <div className="flex items-center rounded-md border border-gray-300">
                <button
                  onClick={() => {
                    const newQuantity = Math.max(1, quantity - 1)
                    console.log('Sticky quantity decreased to:', newQuantity)
                    setQuantity(newQuantity)
                  }}
                  disabled={quantity <= 1}
                  className="inline-flex h-8 w-8 items-center justify-center whitespace-nowrap rounded-full p-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-plus h-3 w-3 rotate-45"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </button>
                <span className="min-w-[2rem] px-2 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    const newQuantity = Math.min(
                      product.stockQuantity || 10,
                      quantity + 1
                    )
                    console.log('Sticky quantity increased to:', newQuantity)
                    setQuantity(newQuantity)
                  }}
                  disabled={quantity >= (product.stockQuantity || 10)}
                  className="inline-flex h-8 w-8 items-center justify-center whitespace-nowrap rounded-full p-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-plus h-3 w-3"
                  >
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </button>
              </div>

              {/* Add to Cart button with price */}
              <button
                onClick={handleStickyAddToCart}
                disabled={isAdding || !product.inStock}
                className="inline-flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-all duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="mr-2">
                  <ShoppingCart className="h-4 w-4" />
                </span>
                {isAdding
                  ? 'Adding...'
                  : `Add to Cart - ${formatPrice(getCurrentPrice())}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
