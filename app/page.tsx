import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { ProductCarousel } from '@/components/product/ProductCarousel'

export const metadata: Metadata = {
  title: 'Home Textile Store - Quality Bedding & Home Decor',
  description: 'Discover premium bedding, comforters, sheets, and home textiles. Transform your space with our curated collection of quality home goods.',
}

async function getBestSellingProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const response = await fetch(`${baseUrl}/api/products?bestseller=true&limit=8`, {
      cache: 'revalidate',
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error('Failed to fetch best selling products')
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching best selling products:', error)
    return []
  }
}

export default async function HomePage() {
  const bestSellingProducts = await getBestSellingProducts()

  return (
    <div className="min-h-screen">
      <HeroSection />

      <div className="section-padding">
        <CategoryGrid />
      </div>

      {/* Best Sellers Section */}
      {bestSellingProducts.length > 0 && (
        <div className="section-padding bg-gray-50">
          <ProductCarousel
            products={bestSellingProducts}
            title="Best Sellers"
            subtitle="Discover our most popular home textile products loved by customers"
          />
        </div>
      )}
    </div>
  )
}