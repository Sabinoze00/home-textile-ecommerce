import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AllProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold text-textile-navy md:text-4xl">
              All Products
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Browse our complete collection of premium home textiles and decor
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Coming Soon</h2>
          <p className="mb-8 text-gray-600">
            We're working hard to bring you our complete product catalog. In the
            meantime, explore our categories to find what you need.
          </p>

          <Link href="/">
            <Button variant="textile" className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
