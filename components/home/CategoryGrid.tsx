import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Category } from '@/types'

type CategoryBadge = 'sale' | 'bestseller' | 'new' | 'featured' | null

const categories: (Omit<Category, 'slug'> & { badge: CategoryBadge })[] = [
  {
    id: 1,
    name: 'SHEETS',
    href: '/sheets',
    image:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    badge: null,
  },
  {
    id: 2,
    name: 'DUVET COVERS',
    href: '/duvet-covers',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80',
    badge: null,
  },
  {
    id: 3,
    name: 'QUILTS & COVERLETS',
    href: '/quilts-coverlets',
    image:
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    badge: null,
  },
  {
    id: 4,
    name: 'COMFORTERS',
    href: '/comforters',
    image:
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    badge: 'bestseller',
  },
  {
    id: 5,
    name: 'UP TO 40% OFF BATH',
    href: '/bath',
    image:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    badge: 'sale',
  },
  {
    id: 6,
    name: 'BLANKETS & THROWS',
    href: '/blankets-throws',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    badge: null,
  },
  {
    id: 7,
    name: 'KIDS',
    href: '/kids',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
    badge: 'new',
  },
  {
    id: 8,
    name: 'HOME DECOR',
    href: '/home-decor',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80',
    badge: null,
  },
]

export function CategoryGrid() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="mb-4 text-3xl font-bold text-textile-navy md:text-4xl">
          Shop by Category
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Discover our carefully curated collection of home essentials designed
          to bring comfort and style to every room.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {categories.map(category => (
          <Link
            key={category.id}
            href={category.href}
            className="card-hover group relative aspect-square overflow-hidden rounded-lg bg-gray-100"
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/50" />

            {/* Badge */}
            {category.badge && (
              <div className="absolute left-2 top-2 z-10">
                <Badge variant={category.badge}>
                  {category.badge === 'sale' && 'SALE'}
                  {category.badge === 'bestseller' && 'BESTSELLER'}
                  {category.badge === 'new' && 'NEW'}
                  {category.badge === 'featured' && 'FEATURED'}
                </Badge>
              </div>
            )}

            {/* Category Name */}
            <div className="absolute inset-0 z-10 flex items-center justify-center p-2">
              <h3 className="text-center text-base font-bold leading-tight text-white md:text-lg">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <p className="mb-4 text-gray-600">
          Can't find what you're looking for?
        </p>
        <Link
          href="/all-products"
          className="inline-flex items-center font-medium text-textile-navy transition-colors duration-200 hover:text-textile-terracotta"
        >
          View All Products
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </section>
  )
}
