import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  price: number,
  options: {
    currency?: 'USD' | 'EUR' | 'GBP' | 'JPY'
    notation?: Intl.NumberFormatOptions['notation']
  } = {}
) {
  const { currency = 'USD', notation = 'standard' } = options

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(price)
}

export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date))
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function getBreakpointValue(breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'): number {
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  }
  return breakpoints[breakpoint]
}

export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < getBreakpointValue('md')
}

export function isTablet(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= getBreakpointValue('md') && window.innerWidth < getBreakpointValue('lg')
}

export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= getBreakpointValue('lg')
}

// Product-related utility functions
export function calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function generateProductSlug(name: string): string {
  return slugify(name)
}

export function getImageUrl(url: string, width?: number, height?: number): string {
  // In a real app, you might want to use a service like Cloudinary or Vercel's image optimization
  if (width || height) {
    const params = new URLSearchParams()
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    params.set('fit', 'crop')
    params.set('auto', 'format')

    // For Unsplash images
    if (url.includes('unsplash.com')) {
      return `${url}&${params.toString()}`
    }
  }
  return url
}

export function sortProducts<T extends { name: string; price: number; rating?: { average: number }; createdAt: Date; isBestseller?: boolean }>(
  products: T[],
  sortBy: 'name' | 'price' | 'rating' | 'newest' | 'bestseller',
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
  const sorted = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price':
        return a.price - b.price
      case 'rating':
        const aRating = a.rating?.average || 0
        const bRating = b.rating?.average || 0
        return aRating - bRating
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'bestseller':
        if (a.isBestseller && !b.isBestseller) return -1
        if (!a.isBestseller && b.isBestseller) return 1
        return 0
      default:
        return 0
    }
  })

  return sortOrder === 'desc' ? sorted.reverse() : sorted
}

export function filterProducts<T extends {
  name: string
  description: string
  price: number
  category: { slug: string }
  variants?: { type: string; value: string }[]
  rating?: { average: number }
  inStock?: boolean
  isOnSale?: boolean
  tags?: string[]
}>(
  products: T[],
  filters: {
    query?: string
    category?: string
    priceRange?: { min: number; max: number }
    colors?: string[]
    sizes?: string[]
    rating?: number
    inStock?: boolean
    onSale?: boolean
  }
): T[] {
  return products.filter((product) => {
    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase()
      const searchText = `${product.name} ${product.description}`.toLowerCase()
      if (!searchText.includes(query)) return false
    }

    // Category filter
    if (filters.category && product.category.slug !== filters.category) {
      return false
    }

    // Price range filter
    if (filters.priceRange) {
      if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
        return false
      }
    }

    // Color filter
    if (filters.colors && filters.colors.length > 0) {
      const productColors = product.variants?.filter(v => v.type === 'color').map(v => v.value) || []
      if (!filters.colors.some(color => productColors.includes(color))) {
        return false
      }
    }

    // Size filter
    if (filters.sizes && filters.sizes.length > 0) {
      const productSizes = product.variants?.filter(v => v.type === 'size').map(v => v.value) || []
      if (!filters.sizes.some(size => productSizes.includes(size))) {
        return false
      }
    }

    // Rating filter
    if (filters.rating && (!product.rating || product.rating.average < filters.rating)) {
      return false
    }

    // Stock filter
    if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
      return false
    }

    // Sale filter
    if (filters.onSale !== undefined && product.isOnSale !== filters.onSale) {
      return false
    }

    return true
  })
}

export function buildSearchParams(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          searchParams.set(key, value.join(','))
        }
      } else {
        searchParams.set(key, String(value))
      }
    }
  })

  return searchParams.toString()
}

export function parseSearchParams(searchParams: URLSearchParams): Record<string, any> {
  const params: Record<string, any> = {}

  for (const [key, value] of searchParams.entries()) {
    // Handle comma-separated arrays
    if (['colors', 'sizes', 'materials', 'ratings'].includes(key)) {
      params[key] = value.split(',').filter(Boolean)
    }
    // Handle boolean values
    else if (['inStock', 'onSale', 'featured', 'new', 'bestseller'].includes(key)) {
      params[key] = value === 'true'
    }
    // Handle numeric values
    else if (['minPrice', 'maxPrice', 'rating', 'page', 'limit'].includes(key)) {
      const num = Number(value)
      if (!isNaN(num)) params[key] = num
    }
    // Handle string values
    else {
      params[key] = value
    }
  }

  return params
}