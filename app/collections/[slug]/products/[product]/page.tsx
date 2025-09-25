import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'

interface ProductPageProps {
  params: {
    slug: string
    product: string
  }
}

async function getProductData(productSlug: string, collectionSlug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  try {
    const response = await fetch(`${baseUrl}/api/products/${productSlug}`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      return null
    }

    const product = await response.json()

    // Verify product belongs to this collection
    if (collectionSlug !== 'new' && collectionSlug !== 'sale') {
      if (product.category.slug !== collectionSlug) {
        return null
      }
    }

    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getCollectionData(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  try {
    const response = await fetch(`${baseUrl}/api/categories/${slug}`, {
      next: { revalidate: 3600 },
    })

    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductData(params.product, params.slug)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.name} - ${product.category.name} - Cozy Home`,
    description: product.shortDescription || product.description,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description,
      images: product.images?.length > 0 ? [product.images[0].url] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const [product, collection] = await Promise.all([
    getProductData(params.product, params.slug),
    getCollectionData(params.slug),
  ])

  if (!product) {
    notFound()
  }

  const collectionName =
    collection?.name ||
    (params.slug === 'new'
      ? 'New Arrivals'
      : params.slug === 'sale'
        ? 'Sale Items'
        : product.category.name)

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b bg-gray-50">
        <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/products" className="hover:text-gray-900">
              Products
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/collections/${params.slug}`}
              className="hover:text-gray-900"
            >
              {collectionName}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <ProductDetailClient product={product} />

      {/* Related Products Section */}
      <div className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              More from {collectionName}
            </h2>
            <p className="mt-2 text-gray-600">
              Discover more products in this collection
            </p>
          </div>

          <div className="text-center">
            <Link
              href={`/collections/${params.slug}`}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              View All {collectionName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
