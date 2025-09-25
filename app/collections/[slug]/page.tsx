import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilters } from '@/components/product/ProductFilters'
import { ProductSort } from '@/components/product/ProductSort'

interface CollectionPageProps {
  params: {
    slug: string
  }
  searchParams: {
    sort?: string
    minPrice?: string
    maxPrice?: string
    color?: string
    material?: string
    size?: string
    page?: string
  }
}

async function getCollectionData(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  try {
    // Get collection by slug
    const categoryResponse = await fetch(`${baseUrl}/api/categories/${slug}`, {
      next: { revalidate: 3600 },
    })

    if (!categoryResponse.ok) {
      return null
    }

    const category = await categoryResponse.json()
    return category
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

async function getCollectionProducts(
  slug: string,
  searchParams: CollectionPageProps['searchParams']
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  // Handle special collections
  const params = new URLSearchParams()

  if (slug === 'new') {
    params.set('new', 'true')
  } else if (slug === 'sale') {
    params.set('onSale', 'true')
  } else {
    params.set('category', slug)
  }

  // Add search params
  if (searchParams.sort) params.set('sort', searchParams.sort)
  if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice)
  if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice)
  if (searchParams.color) params.set('color', searchParams.color)
  if (searchParams.material) params.set('material', searchParams.material)
  if (searchParams.size) params.set('size', searchParams.size)
  if (searchParams.page) params.set('page', searchParams.page)

  try {
    const response = await fetch(
      `${baseUrl}/api/products?${params.toString()}`,
      {
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching collection products:', error)
    return { data: [], pagination: { total: 0 } }
  }
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const collection = await getCollectionData(params.slug)

  if (!collection) {
    return {
      title: 'Collection Not Found',
    }
  }

  return {
    title: `${collection.name} Collection - Cozy Home`,
    description:
      collection.description ||
      `Shop our ${collection.name.toLowerCase()} collection`,
  }
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const [collection, productsData] = await Promise.all([
    getCollectionData(params.slug),
    getCollectionProducts(params.slug, searchParams),
  ])

  if (!collection && !['new', 'sale'].includes(params.slug)) {
    notFound()
  }

  // For special collections without category data
  const collectionTitle =
    collection?.name ||
    (params.slug === 'new'
      ? 'New Arrivals'
      : params.slug === 'sale'
        ? 'Sale Items'
        : params.slug.charAt(0).toUpperCase() + params.slug.slice(1))
  const collectionDescription =
    collection?.description ||
    `Browse our ${collectionTitle.toLowerCase()} collection`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Collection Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              {collectionTitle}
            </h1>
            {collectionDescription && (
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                {collectionDescription}
              </p>
            )}
            <div className="mt-6 text-sm text-gray-500">
              {productsData.pagination?.total || 0} products
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Products */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="hidden w-64 flex-shrink-0 lg:block">
            <ProductFilters />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Controls */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {productsData.data?.length || 0} of{' '}
                {productsData.pagination?.total || 0} products
              </div>
              <ProductSort />
            </div>

            {/* Products Grid */}
            <ProductGrid
              products={productsData.data || []}
              collectionSlug={params.slug}
            />

            {/* Pagination would go here */}
          </div>
        </div>
      </div>
    </div>
  )
}
