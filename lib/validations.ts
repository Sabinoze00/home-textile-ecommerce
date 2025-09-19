import { z } from 'zod'

// Product Filters Schema
export const ProductFiltersSchema = z.object({
  categories: z.array(z.string()).optional(),
  priceRange: z
    .object({
      min: z.number().min(0),
      max: z.number().min(0),
    })
    .optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  ratings: z.array(z.number().min(1).max(5)).optional(),
  inStock: z.boolean().optional(),
  onSale: z.boolean().optional(),
  sortBy: z
    .enum(['name', 'price', 'rating', 'newest', 'bestseller'])
    .optional()
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

// Search Parameters Schema
export const SearchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  colors: z.string().optional(), // comma-separated string
  sizes: z.string().optional(), // comma-separated string
  materials: z.string().optional(), // comma-separated string
  rating: z.coerce.number().min(1).max(5).optional(),
  inStock: z.coerce.boolean().optional(),
  onSale: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
  new: z.coerce.boolean().optional(),
  bestseller: z.coerce.boolean().optional(),
  sortBy: z
    .enum(['name', 'price', 'rating', 'newest', 'bestseller'])
    .optional()
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
})

// Pagination Parameters Schema
export const PaginationParamsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
})

// Product Search Query Schema
export const ProductSearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
})

// Product Variant Schema for API requests
export const ProductVariantSchema = z.object({
  type: z.enum(['color', 'size', 'material', 'pattern']),
  value: z.string().min(1),
})

// Product Review Schema for API requests
export const ProductReviewSchema = z.object({
  userName: z.string().min(1, 'Name is required'),
  userEmail: z.string().email('Valid email is required').optional(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1, 'Review title is required'),
  comment: z.string().min(10, 'Review must be at least 10 characters'),
})

// API Response Schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
})

// Paginated Response Schema
export const PaginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
})

// Filter Option Schema
export const FilterOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.union([z.string(), z.number()]),
  count: z.number().optional(),
})

//  Authentication Schemas
export const SignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const SignUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Address Schema
export const AddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
})

// Checkout Schema
export const CheckoutSchema = z.object({
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  sameAsShipping: z.boolean().optional(),
  notes: z.string().optional(),
})

// Order Schema
export const OrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().min(1),
    price: z.number().min(0),
  })),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  notes: z.string().optional(),
})

// Type exports for TypeScript
export type ProductFilters = z.infer<typeof ProductFiltersSchema>
export type SearchParams = z.infer<typeof SearchParamsSchema>
export type PaginationParams = z.infer<typeof PaginationParamsSchema>
export type ProductSearchQuery = z.infer<typeof ProductSearchQuerySchema>
export type ProductVariant = z.infer<typeof ProductVariantSchema>
export type ProductReview = z.infer<typeof ProductReviewSchema>
export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & { data?: T }
export type PaginatedResponse<T = any> = Omit<z.infer<typeof PaginatedResponseSchema>, 'data'> & { data: T[] }
export type FilterOption = z.infer<typeof FilterOptionSchema>
export type SignInData = z.infer<typeof SignInSchema>
export type SignUpData = z.infer<typeof SignUpSchema>
export type AddressData = z.infer<typeof AddressSchema>
export type CheckoutData = z.infer<typeof CheckoutSchema>
export type OrderData = z.infer<typeof OrderSchema>