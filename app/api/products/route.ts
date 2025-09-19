import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SearchParamsSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse and validate query parameters
    const params = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      colors: searchParams.get('colors') || undefined,
      sizes: searchParams.get('sizes') || undefined,
      materials: searchParams.get('materials') || undefined,
      rating: searchParams.get('rating') || undefined,
      inStock: searchParams.get('inStock') || undefined,
      onSale: searchParams.get('onSale') || undefined,
      featured: searchParams.get('featured') || undefined,
      new: searchParams.get('new') || undefined,
      bestseller: searchParams.get('bestseller') || undefined,
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: searchParams.get('sortOrder') || 'asc',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    }

    const validatedParams = SearchParamsSchema.parse(params)

    // Build where clause
    const where: Prisma.ProductWhereInput = {}

    // Text search
    if (validatedParams.q) {
      where.OR = [
        { name: { contains: validatedParams.q, mode: 'insensitive' } },
        { description: { contains: validatedParams.q, mode: 'insensitive' } },
        { tags: { hasSome: [validatedParams.q] } },
      ]
    }

    // Category filter
    if (validatedParams.category) {
      where.category = { is: { slug: validatedParams.category } }
    }

    // Price range filter
    if (validatedParams.minPrice || validatedParams.maxPrice) {
      where.price = {}
      if (validatedParams.minPrice) {
        where.price.gte = validatedParams.minPrice
      }
      if (validatedParams.maxPrice) {
        where.price.lte = validatedParams.maxPrice
      }
    }

    // Build variant filters using AND array of separate variants.some clauses
    const variantFilters = []

    // Color filter
    if (validatedParams.colors) {
      const colors = validatedParams.colors.split(',')
      variantFilters.push({
        variants: {
          some: {
            type: 'color',
            value: { in: colors },
          },
        },
      })
    }

    // Size filter
    if (validatedParams.sizes) {
      const sizes = validatedParams.sizes.split(',')
      variantFilters.push({
        variants: {
          some: {
            type: 'size',
            value: { in: sizes },
          },
        },
      })
    }

    // Material filter
    if (validatedParams.materials) {
      const materials = validatedParams.materials.split(',')
      variantFilters.push({
        variants: {
          some: {
            type: 'material',
            value: { in: materials },
          },
        },
      })
    }

    // Apply variant filters using AND logic
    if (variantFilters.length > 0) {
      where.AND = [...(where.AND || []), ...variantFilters]
    }

    // Rating filter
    if (validatedParams.rating) {
      where.rating = { gte: validatedParams.rating }
    }

    // Stock filter
    if (validatedParams.inStock !== undefined) {
      where.inStock = validatedParams.inStock
    }

    // Sale filter
    if (validatedParams.onSale !== undefined) {
      where.isOnSale = validatedParams.onSale
    }

    // Featured filter
    if (validatedParams.featured !== undefined) {
      where.isFeatured = validatedParams.featured
    }

    // New filter
    if (validatedParams.new !== undefined) {
      where.isNew = validatedParams.new
    }

    // Bestseller filter
    if (validatedParams.bestseller !== undefined) {
      where.isBestseller = validatedParams.bestseller
    }

    // Build orderBy clause
    const orderBy: Prisma.ProductOrderByWithRelationInput = {}

    switch (validatedParams.sortBy) {
      case 'price':
        orderBy.price = validatedParams.sortOrder
        break
      case 'rating':
        orderBy.rating = validatedParams.sortOrder
        break
      case 'newest':
        orderBy.createdAt = 'desc'
        break
      case 'bestseller':
        orderBy.isBestseller = 'desc'
        break
      default:
        orderBy.name = validatedParams.sortOrder
    }

    // Calculate pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit

    // Get total count for pagination
    const total = await prisma.product.count({ where })

    // Fetch products
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: validatedParams.limit,
      include: {
        category: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        variants: {
          where: { type: 'color' },
          take: 5,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })

    // Transform data to match frontend types
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      discountPercentage: product.discountPercentage,
      sku: product.sku,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      images: product.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
        href: `/products?category=${product.category.slug}`,
        image: product.category.image,
        description: product.category.description,
        badge: product.category.badge as 'sale' | 'bestseller' | 'new' | 'featured' | null,
        isActive: product.category.isActive,
        sortOrder: product.category.sortOrder,
      },
      tags: product.tags,
      rating: product.rating
        ? {
            average: Number(product.rating),
            count: product._count.reviews,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, // Simplified for now
          }
        : undefined,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        type: variant.type as 'color' | 'size' | 'material' | 'pattern',
        value: variant.value,
        price: variant.price ? Number(variant.price) : undefined,
        sku: variant.sku,
        inStock: variant.inStock,
        image: variant.image,
      })),
      isFeatured: product.isFeatured,
      isOnSale: product.isOnSale,
      isNew: product.isNew,
      isBestseller: product.isBestseller,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }))

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / validatedParams.limit)
    const hasNext = validatedParams.page < totalPages
    const hasPrev = validatedParams.page > 1

    return NextResponse.json({
      data: transformedProducts,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    })
  } catch (error) {
    console.error('Products API error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}