import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    slug: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { error: 'Product slug is required' },
        { status: 400 }
      )
    }

    // Fetch product with all related data
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          orderBy: { type: 'asc' },
        },
        specifications: {
          orderBy: { category: 'asc' },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Limit reviews for performance
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      include: {
        category: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        variants: {
          where: { type: 'color' },
          take: 3,
        },
      },
    })

    // Get all reviews for accurate rating distribution
    const allReviews = await prisma.productReview.findMany({
      where: { productId: product.id },
      select: { rating: true },
    })

    // Calculate rating distribution from all reviews
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    allReviews.forEach((review) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++
    })

    // Transform data to match frontend types
    const transformedProduct = {
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
            distribution: ratingDistribution,
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
      specifications: product.specifications.map((spec) => ({
        id: spec.id,
        name: spec.name,
        value: spec.value,
        category: spec.category,
      })),
      reviews: product.reviews.map((review) => ({
        id: review.id,
        productId: review.productId,
        userName: review.userName,
        userEmail: review.userEmail,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerifiedPurchase: review.isVerifiedPurchase,
        helpful: review.helpful,
        createdAt: review.createdAt,
      })),
      relatedProducts: relatedProducts.map((relatedProduct) => ({
        id: relatedProduct.id,
        name: relatedProduct.name,
        slug: relatedProduct.slug,
        description: relatedProduct.description,
        shortDescription: relatedProduct.shortDescription,
        price: Number(relatedProduct.price),
        originalPrice: relatedProduct.originalPrice ? Number(relatedProduct.originalPrice) : undefined,
        discountPercentage: relatedProduct.discountPercentage,
        sku: relatedProduct.sku,
        inStock: relatedProduct.inStock,
        stockQuantity: relatedProduct.stockQuantity,
        images: relatedProduct.images.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
        category: {
          id: relatedProduct.category.id,
          name: relatedProduct.category.name,
          slug: relatedProduct.category.slug,
          href: `/products?category=${relatedProduct.category.slug}`,
          image: relatedProduct.category.image,
          description: relatedProduct.category.description,
          badge: relatedProduct.category.badge as 'sale' | 'bestseller' | 'new' | 'featured' | null,
          isActive: relatedProduct.category.isActive,
          sortOrder: relatedProduct.category.sortOrder,
        },
        tags: relatedProduct.tags,
        variants: relatedProduct.variants.map((variant) => ({
          id: variant.id,
          name: variant.name,
          type: variant.type as 'color' | 'size' | 'material' | 'pattern',
          value: variant.value,
          price: variant.price ? Number(variant.price) : undefined,
          sku: variant.sku,
          inStock: variant.inStock,
          image: variant.image,
        })),
        isFeatured: relatedProduct.isFeatured,
        isOnSale: relatedProduct.isOnSale,
        isNew: relatedProduct.isNew,
        isBestseller: relatedProduct.isBestseller,
        createdAt: relatedProduct.createdAt,
        updatedAt: relatedProduct.updatedAt,
      })),
      isFeatured: product.isFeatured,
      isOnSale: product.isOnSale,
      isNew: product.isNew,
      isBestseller: product.isBestseller,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Product API error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}