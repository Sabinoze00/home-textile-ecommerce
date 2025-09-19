export interface Category {
  id: string | number
  name: string
  slug: string
  href: string
  image: string
  description?: string
  badge?: 'sale' | 'bestseller' | 'new' | 'featured' | null
  isActive?: boolean
  sortOrder?: number
}

export interface Product {
  id: string | number
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  discountPercentage?: number
  sku: string
  inStock: boolean
  stockQuantity?: number
  images: ProductImage[]
  category: Category
  tags?: string[]
  rating?: ProductRating
  variants?: ProductVariant[]
  specifications?: ProductSpecification[]
  reviews?: ProductReview[]
  relatedProducts?: Product[]
  isFeatured?: boolean
  isOnSale?: boolean
  isNew?: boolean
  isBestseller?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductImage {
  id: string | number
  url: string
  alt: string
  isPrimary?: boolean
  sortOrder?: number
}

export interface ProductVariant {
  id: string | number
  name: string
  type: 'color' | 'size' | 'material' | 'pattern'
  value: string
  price?: number
  sku?: string
  inStock?: boolean
  image?: string
}

export interface ProductSpecification {
  id: string | number
  name: string
  value: string
  category?: string
}

export interface ProductRating {
  average: number
  count: number
  distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface ProductReview {
  id: string | number
  productId: string | number
  userName: string
  userEmail?: string
  rating: number
  title: string
  comment: string
  isVerifiedPurchase?: boolean
  helpful?: number
  createdAt: Date
}

export interface NavigationItem {
  name: string
  href: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavigationItem[]
  highlight?: boolean
  isExternal?: boolean
}

export interface HeroContent {
  title: string
  subtitle?: string
  description?: string
  backgroundImage: string
  ctaText?: string
  ctaLink?: string
  overlay?: boolean
}

export interface ValueProposition {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

export interface FooterLink {
  name: string
  href: string
  isExternal?: boolean
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface SocialLink {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: Date
  avatar?: string
  addresses?: Address[]
  orders?: Order[]
  wishlist?: Product[]
  preferences?: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  id: string
  type: 'shipping' | 'billing'
  firstName: string
  lastName: string
  company?: string
  street1: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault?: boolean
}

export interface UserPreferences {
  newsletter: boolean
  smsUpdates: boolean
  emailPromotions: boolean
  currency: 'USD' | 'EUR' | 'GBP'
  language: 'en' | 'es' | 'fr' | 'de'
}

export interface CartItem {
  id: string
  product: Product
  variant?: ProductVariant
  quantity: number
  price: number
  addedAt: Date
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  couponCode?: string
  discount?: number
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  status: OrderStatus
  paymentStatus: PaymentStatus
  shippingAddress: Address
  billingAddress: Address
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  couponCode?: string
  paymentMethod: PaymentMethod
  tracking?: TrackingInfo
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  product: Product
  variant?: ProductVariant
  quantity: number
  price: number
  total: number
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'

export interface PaymentMethod {
  id: string
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
}

export interface TrackingInfo {
  carrier: string
  trackingNumber: string
  trackingUrl?: string
  estimatedDelivery?: Date
  status: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface FilterOption {
  id: string
  name: string
  value: string | number
  count?: number
}

export interface ProductFilters {
  categories?: string[]
  priceRange?: {
    min: number
    max: number
  }
  colors?: string[]
  sizes?: string[]
  materials?: string[]
  ratings?: number[]
  inStock?: boolean
  onSale?: boolean
  sortBy?: 'name' | 'price' | 'rating' | 'newest' | 'bestseller'
  sortOrder?: 'asc' | 'desc'
}