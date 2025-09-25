import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schemas
const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  compareAtPrice: z.number().optional(),
  slug: z.string().min(1),
  categoryId: z.string(),
  images: z.array(z.string()).min(1),
  specifications: z.record(z.string()).optional(),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().nonnegative().optional(),
  sku: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string(),
})

const bulkActionSchema = z.object({
  action: z.enum(['activate', 'deactivate', 'delete', 'duplicate', 'changeCategory']),
  productIds: z.array(z.string()),
  categoryId: z.string().optional(),
})

// Admin role validation
async function validateAdminRole() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 }
  }

  if (session.user.role !== 'ADMIN') {
    return { error: 'Forbidden - Admin access required', status: 403 }
  }

  return { success: true, userId: session.user.id }
}

// GET - Fetch products with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { searchParams } = new URL(request.url)

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Filtering
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const status = searchParams.get('status') // 'active', 'inactive', 'all'
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const stockMin = searchParams.get('stockMin')
    const stockMax = searchParams.get('stockMax')

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId
    }

    if (status === 'active') {
      where.inStock = true
    } else if (status === 'inactive') {
      where.inStock = false
    }

    if (priceMin || priceMax) {
      where.price = {}
      if (priceMin) where.price.gte = parseFloat(priceMin)
      if (priceMax) where.price.lte = parseFloat(priceMax)
    }

    if (stockMin || stockMax) {
      where.stockQuantity = {}
      if (stockMin) where.stockQuantity.gte = parseInt(stockMin)
      if (stockMax) where.stockQuantity.lte = parseInt(stockMax)
    }

    // Build orderBy
    const orderBy: any = {}
    if (sortBy === 'category') {
      orderBy.category = { name: sortOrder }
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Fetch products with relations
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          _count: {
            select: {
              reviews: true,
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where })
    ])

    // Calculate additional metrics for each product
    const productsWithMetrics = await Promise.all(
      products.map(async (product) => {
        const avgRating = await prisma.productReview.aggregate({
          where: { productId: product.id },
          _avg: { rating: true }
        })

        return {
          ...product,
          avgRating: avgRating._avg.rating || 0,
          reviewCount: product._count.reviews,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        products: productsWithMetrics,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        }
      }
    })

  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const body = await request.json()
    const validatedData = productCreateSchema.parse(body)

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 409 }
      )
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }


    const product = await prisma.product.create({
      data: {
        ...validatedData,
        specifications: validatedData.specifications || {},
        tags: validatedData.tags || [],
      },
      include: {
        category: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Product creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const body = await request.json()
    const validatedData = productUpdateSchema.parse(body)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: validatedData.id }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check slug uniqueness if updating slug
    if (validatedData.slug && validatedData.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 409 }
        )
      }
    }

    // Verify category if updating
    if (validatedData.categoryId && validatedData.categoryId !== existingProduct.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
    }

    const { id, ...updateData } = validatedData

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    })

  } catch (error) {
    console.error('Product update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete product and related data
    await prisma.$transaction(async (tx) => {
      // Delete reviews first
      await tx.productReview.deleteMany({
        where: { productId }
      })

      // Delete specifications
      await tx.productSpecification.deleteMany({
        where: { productId }
      })

      // Delete variants
      await tx.productVariant.deleteMany({
        where: { productId }
      })

      // Delete images
      await tx.productImage.deleteMany({
        where: { productId }
      })

      // Delete cart items if CartItem model exists
      try {
        await tx.cartItem.deleteMany({
          where: { productId }
        })
      } catch (e) {
        // CartItem might not exist
      }

      // Delete the product
      await tx.product.delete({
        where: { id: productId }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Bulk actions
export async function PATCH(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if ('error' in validation) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const body = await request.json()
    const validatedData = bulkActionSchema.parse(body)

    const { action, productIds, categoryId } = validatedData

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: 'No products selected' },
        { status: 400 }
      )
    }

    let result: any = {}

    switch (action) {
      case 'activate':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { inStock: true }
        })
        break

      case 'deactivate':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { inStock: false }
        })
        break

      case 'delete':
        await prisma.$transaction(async (tx) => {
          // Delete related data first
          await tx.productReview.deleteMany({
            where: { productId: { in: productIds } }
          })

          await tx.productSpecification.deleteMany({
            where: { productId: { in: productIds } }
          })

          await tx.productVariant.deleteMany({
            where: { productId: { in: productIds } }
          })

          await tx.productImage.deleteMany({
            where: { productId: { in: productIds } }
          })

          // Delete cart items if exists
          try {
            await tx.cartItem.deleteMany({
              where: { productId: { in: productIds } }
            })
          } catch (e) {
            // CartItem might not exist
          }

          // Delete products
          result = await tx.product.deleteMany({
            where: { id: { in: productIds } }
          })
        })
        break

      case 'duplicate':
        const productsToDuplicate = await prisma.product.findMany({
          where: { id: { in: productIds } }
        })

        const duplicatedProducts = []
        for (const product of productsToDuplicate) {
          const duplicateData = {
            ...product,
            id: undefined,
            name: `${product.name} (Copy)`,
            slug: `${product.slug}-copy-${Date.now()}`,
            createdAt: undefined,
            updatedAt: undefined,
          }

          const duplicated = await prisma.product.create({
            data: duplicateData
          })
          duplicatedProducts.push(duplicated)
        }

        result = { count: duplicatedProducts.length, products: duplicatedProducts }
        break

      case 'changeCategory':
        if (!categoryId) {
          return NextResponse.json(
            { error: 'Category ID is required for category change' },
            { status: 400 }
          )
        }

        // Verify category exists
        const category = await prisma.category.findUnique({
          where: { id: categoryId }
        })

        if (!category) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          )
        }

        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { categoryId }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid bulk action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Bulk ${action} completed successfully`
    })

  } catch (error) {
    console.error('Bulk action error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}