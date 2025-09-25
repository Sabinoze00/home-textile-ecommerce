import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'All Collections | Cozy Home',
  description:
    'Browse all our collections of premium home textiles including sheets, bedding, bath, and more.',
}

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image: string
  productCount: number
  badge?: string | null
}

async function getAllCollections(): Promise<Collection[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  try {
    const response = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch collections')
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching collections:', error)
    return []
  }
}

async function getFeaturedProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  try {
    const response = await fetch(
      `${baseUrl}/api/products?isFeatured=true&limit=6`,
      {
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch featured products')
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={collection.image}
          alt={collection.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {collection.badge && (
          <div className="absolute left-3 top-3 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
            {collection.badge}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-textile-navy">
          {collection.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
          {collection.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {collection.productCount} products
          </span>
          <span className="text-sm font-medium text-textile-navy group-hover:underline">
            Shop Now →
          </span>
        </div>
      </div>
    </Link>
  )
}

function ProductCard({ product }: { product: any }) {
  const collectionSlug = product.category?.slug || 'products'

  return (
    <Link
      href={`/collections/${collectionSlug}/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={product.images?.[0]?.url || '/placeholder-product.jpg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.isOnSale && (
          <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">
            Sale
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-textile-navy">
          {product.name}
        </h4>
        <p className="mt-1 text-xs text-gray-500">{product.category?.name}</p>
        <div className="mt-2 flex items-center">
          <span className="text-sm font-semibold text-gray-900">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="ml-2 text-xs text-gray-500 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

async function ProductsContent() {
  const [collections, featuredProducts] = await Promise.all([
    getAllCollections(),
    getFeaturedProducts(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
              All Collections
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Explore our curated collections of premium home textiles, designed
              to bring comfort and style to your home.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Collections Grid */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">
            Browse by Collection
          </h2>
          {collections.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {collections.map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500">
                No collections available at the moment.
              </p>
            </div>
          )}
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div>
            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Featured Products
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <Skeleton className="mx-auto mb-4 h-12 w-80" />
            <Skeleton className="mx-auto h-6 w-96" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-16">
          <Skeleton className="mb-8 h-8 w-60" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-lg bg-white">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoadingSkeleton />}>
      <ProductsContent />
    </Suspense>
  )
}
