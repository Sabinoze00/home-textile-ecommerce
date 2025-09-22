import { Suspense } from 'react'
import { Metadata } from 'next'
import { ProductsPageClient } from '@/components/product/ProductsPageClient'
import { Skeleton } from '@/components/ui/skeleton'
import { parseSearchParams } from '@/lib/utils'

interface ProductListingStructuredData {
  '@context': string
  '@type': string
  name: string
  description: string
  url: string
  mainEntity: {
    '@type': string
    numberOfItems: number
    itemListElement: Array<{
      '@type': string
      position: number
      item: {
        '@type': string
        name: string
        url: string
        image?: string
        offers: {
          '@type': string
          price: string
          priceCurrency: string
          availability: string
        }
      }
    }>
  }
}

interface ProductsPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export const metadata: Metadata = {
  title: 'Products | Home Textile Store',
  description:
    'Browse our collection of premium home textiles including sheets, duvet covers, towels and more.',
}

async function getProducts(searchParams: Record<string, any>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Build query string from search params
  const params = new URLSearchParams()

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','))
        }
      } else {
        params.set(key, String(value))
      }
    }
  })

  try {
    const response = await fetch(
      `${baseUrl}/api/products?${params.toString()}`,
      {
        cache: 'no-store', // Disable cache for fresh data
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    }
  }
}

function generateProductListingStructuredData(
  products: any[],
  total: number,
  searchParams: Record<string, any>
): ProductListingStructuredData {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const categoryFilter = searchParams.category

  let title = 'All Products'
  let description = 'Browse our complete collection of premium home textiles'

  if (categoryFilter) {
    title = `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Products`
    description = `Explore our ${categoryFilter} collection of premium home textiles`
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${baseUrl}/products${Object.keys(searchParams).length > 0 ? `?${new URLSearchParams(searchParams).toString()}` : ''}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: total,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          url: `${baseUrl}/products/${product.slug}`,
          image: product.images?.[0]?.url
            ? `${baseUrl}${product.images[0].url}`
            : undefined,
          offers: {
            '@type': 'Offer',
            price: product.price.toString(),
            priceCurrency: 'USD',
            availability: product.inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          },
        },
      })),
    },
  }
}

async function ProductsContent({
  searchParams,
}: {
  searchParams: Record<string, any>
}) {
  const initialData = await getProducts(searchParams)
  const structuredData = generateProductListingStructuredData(
    initialData.data,
    initialData.pagination.total,
    searchParams
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <ProductsPageClient
        initialData={initialData}
        initialSearchParams={searchParams}
      />
    </>
  )
}

function ProductsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Content Skeleton */}
        <div className="lg:col-span-3">
          <Skeleton className="mb-6 h-4 w-48" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-lg bg-white"
              >
                <Skeleton className="aspect-square w-full" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-1/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded-full" />
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

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  // Parse search params to proper types
  const usp = new URLSearchParams(
    Object.entries(searchParams).flatMap(([k, v]) =>
      v === undefined
        ? []
        : Array.isArray(v)
          ? v.map(val => [k, val])
          : [[k, v]]
    ) as [string, string][]
  )
  const parsedParams = parseSearchParams(usp)

  return (
    <Suspense fallback={<ProductsLoadingSkeleton />}>
      <ProductsContent searchParams={parsedParams} />
    </Suspense>
  )
}
