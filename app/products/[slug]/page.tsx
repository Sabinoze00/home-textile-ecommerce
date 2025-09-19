import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'
import { Skeleton } from '@/components/ui/skeleton'

interface ProductStructuredData {
  '@context': string
  '@type': string
  name: string
  description?: string
  image?: string[]
  brand?: {
    '@type': string
    name: string
  }
  offers: {
    '@type': string
    price: string
    priceCurrency: string
    availability: string
    priceValidUntil?: string
  }
  aggregateRating?: {
    '@type': string
    ratingValue: number
    reviewCount: number
  }
  review?: Array<{
    '@type': string
    reviewRating: {
      '@type': string
      ratingValue: number
    }
    author: {
      '@type': string
      name: string
    }
    reviewBody?: string
  }>
}

interface ProductDetailPageProps {
  params: {
    slug: string
  }
}

async function getProduct(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const response = await fetch(`${baseUrl}/api/products/${slug}`, {
      cache: 'revalidate',
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch product')
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

function generateProductStructuredData(product: any): ProductStructuredData {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const structuredData: ProductStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.shortDescription,
    image: product.images?.map((img: any) => `${baseUrl}${img.url}`) || [],
    brand: {
      '@type': 'Brand',
      name: 'Home Textile Store'
    },
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: 'USD',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    }
  }

  if (product.rating) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.average,
      reviewCount: product.rating.count
    }
  }

  if (product.reviews && product.reviews.length > 0) {
    structuredData.review = product.reviews.slice(0, 5).map((review: any) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating
      },
      author: {
        '@type': 'Person',
        name: review.userName
      },
      reviewBody: review.comment
    }))
  }

  return structuredData
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    }
  }

  return {
    title: `${product.name} | Home Textile Store`,
    description: product.shortDescription || product.description,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description,
      images: [
        {
          url: product.images?.[0]?.url || '',
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  }
}


async function ProductDetailContent({ slug }: { slug: string }) {
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const structuredData = generateProductStructuredData(product)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <ProductDetailClient product={product} />
    </>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-4 w-96 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-8 h-8 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent slug={params.slug} />
    </Suspense>
  )
}