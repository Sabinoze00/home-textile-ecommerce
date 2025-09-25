import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  validateAdminRole,
  formatAdminData,
  handleAdminError,
  logAdminAction,
  MAX_EXPORT_LIMIT,
  escapeCsvField,
} from '@/lib/admin'
import { AdminFiltersSchema, AdminProductSchema } from '@/lib/validations'
import { z } from 'zod'
import { startOfDay, endOfDay } from 'date-fns'

// Helper function to safely parse and normalize dates
function normalizeDate(
  dateString: string | null,
  isEndDate = false
): Date | undefined {
  if (!dateString) return undefined

  try {
    const parsed = new Date(dateString)
    if (isNaN(parsed.getTime())) return undefined

    // If it's just a date (YYYY-MM-DD), normalize to start/end of day
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return isEndDate ? endOfDay(parsed) : startOfDay(parsed)
    }

    // Otherwise use the provided time
    return parsed
  } catch (error) {
    return undefined
  }
}

export async function GET(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const isExport = searchParams.get('export') === 'true'

    const filtersValidation = AdminFiltersSchema.safeParse({
      search: searchParams.get('search'),
      status: searchParams.get('status'),
      category: searchParams.get('category'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      page: searchParams.get('page'),
      limit: isExport ? MAX_EXPORT_LIMIT.toString() : searchParams.get('limit'), // Higher limit for export
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    })

    if (!filtersValidation.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: filtersValidation.error.errors },
        { status: 400 }
      )
    }

    const filters = filtersValidation.data
    const skip = (filters.page - 1) * filters.limit

    // Build where clause for filtering
    const where: any = {}

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.status) {
      if (filters.status === 'active') {
        where.inStock = true
      } else if (filters.status === 'inactive') {
        where.inStock = false
      }
    }

    if (filters.category) {
      // Attempt to find category by ID first, then by slug
      const categoryExists = await prisma.category.findUnique({
        where: { id: filters.category },
        select: { id: true },
      })

      if (categoryExists) {
        // Filter by category ID
        where.categoryId = filters.category
      } else {
        // Filter by category slug
        where.category = { is: { slug: filters.category } }
      }
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}

      const fromDate = normalizeDate(filters.dateFrom || null, false)
      const toDate = normalizeDate(filters.dateTo || null, true)

      if (fromDate) {
        where.createdAt.gte = fromDate
      }
      if (toDate) {
        where.createdAt.lte = toDate
      }

      // Ensure we have valid date range
      if (fromDate && toDate && fromDate > toDate) {
        return NextResponse.json(
          { error: 'Invalid date range: dateFrom must be before dateTo' },
          { status: 400 }
        )
      }
    }

    // Check if we need to sort by sales or revenue (requires in-memory sorting)
    const needsAnalyticsSorting =
      filters.sortBy === 'sales' || filters.sortBy === 'revenue'

    // Build orderBy clause for database sorting (skip if we need analytics sorting)
    const orderBy: any = {}
    if (!needsAnalyticsSorting) {
      if (filters.sortBy === 'name') {
        orderBy.name = filters.sortOrder
      } else if (filters.sortBy === 'price') {
        orderBy.price = filters.sortOrder
      } else if (filters.sortBy === 'stock') {
        orderBy.stockQuantity = filters.sortOrder
      } else {
        orderBy.createdAt = filters.sortOrder
      }
    } else {
      // For analytics sorting, we'll fetch all matching products and sort in-memory
      orderBy.createdAt = 'desc' // Default order for fetching
    }

    // Fetch products with analytics - adjust pagination for analytics sorting
    const [products, total, productAnalytics] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy,
        ...(needsAnalyticsSorting ? {} : { skip, take: filters.limit }),
      }),
      prisma.product.count({ where }),
      // Get product analytics (sales and revenue)
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            paymentStatus: 'PAID',
          },
        },
        _sum: {
          quantity: true,
          total: true,
        },
      }),
    ])

    // Create analytics map for efficient lookup
    const analyticsMap = new Map()
    productAnalytics.forEach(item => {
      analyticsMap.set(item.productId, {
        sales: item._sum.quantity || 0,
        revenue: Number(item._sum.total || 0),
      })
    })

    // Format products for admin table
    let formattedProducts = products.map(product => {
      const analytics = analyticsMap.get(product.id) || { sales: 0, revenue: 0 }
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: Number(product.price),
        stockQuantity: product.stockQuantity || 0,
        category: product.category.name,
        status: product.inStock ? 'active' : 'inactive',
        reviewCount: product._count.reviews,
        image: product.images[0]?.url || null,
        sales: analytics.sales,
        revenue: analytics.revenue,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }
    })

    // Apply in-memory sorting for sales and revenue
    if (needsAnalyticsSorting) {
      formattedProducts.sort((a, b) => {
        let comparison = 0

        if (filters.sortBy === 'sales') {
          comparison = a.sales - b.sales
        } else if (filters.sortBy === 'revenue') {
          comparison = a.revenue - b.revenue
        }

        // Apply sort order (desc = reverse)
        if (filters.sortOrder === 'desc') {
          comparison = -comparison
        }

        return comparison
      })

      // Apply pagination after sorting
      const startIndex = skip
      const endIndex = skip + filters.limit
      formattedProducts = formattedProducts.slice(startIndex, endIndex)
    }

    // Handle CSV export
    if (isExport) {
      const csvHeaders =
        'ID,Name,SKU,Price,Stock Quantity,Category,Status,Review Count,Sales,Revenue,Created At,Updated At'
      const csvRows = formattedProducts.map(product =>
        [
          escapeCsvField(product.id),
          escapeCsvField(product.name),
          escapeCsvField(product.sku),
          escapeCsvField(product.price),
          escapeCsvField(product.stockQuantity),
          escapeCsvField(product.category),
          escapeCsvField(product.status),
          escapeCsvField(product.reviewCount),
          escapeCsvField(product.sales),
          escapeCsvField(product.revenue),
          escapeCsvField(product.createdAt.toISOString().split('T')[0]),
          escapeCsvField(product.updatedAt.toISOString().split('T')[0]),
        ].join(',')
      )

      const csvContent = [csvHeaders, ...csvRows].join('\n')
      const today = new Date().toISOString().split('T')[0]

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="products-${today}.csv"`,
        },
      })
    }

    const response = formatAdminData(
      formattedProducts,
      total,
      filters.page,
      filters.limit
    )

    return NextResponse.json(response)
  } catch (error) {
    return handleAdminError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const body = await request.json()
    const { action, productIds } = body

    // Handle duplicate action
    if (action === 'duplicate') {
      if (
        !productIds ||
        !Array.isArray(productIds) ||
        productIds.length === 0
      ) {
        return NextResponse.json(
          { error: 'Product IDs are required for duplication' },
          { status: 400 }
        )
      }

      // Fetch the products to duplicate
      const originalProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
          images: true,
          specifications: true,
          variants: true,
        },
      })

      if (originalProducts.length === 0) {
        return NextResponse.json(
          { error: 'No products found to duplicate' },
          { status: 404 }
        )
      }

      const duplicatedProducts = []

      for (const original of originalProducts) {
        const duplicatedProduct = await prisma.product.create({
          data: {
            name: `${original.name} (Copy)`,
            slug: `${original.slug}-copy-${Date.now()}`,
            description: original.description,
            shortDescription: original.shortDescription,
            price: original.price,
            originalPrice: original.originalPrice,
            discountPercentage: original.discountPercentage,
            sku: `${original.sku}-COPY-${Date.now()}`,
            stockQuantity: original.stockQuantity,
            categoryId: original.categoryId,
            inStock: false, // Set duplicated products as inactive by default
            tags: original.tags,
            isFeatured: original.isFeatured,
            isOnSale: original.isOnSale,
            isNew: original.isNew,
            isBestseller: original.isBestseller,
            images: {
              create: original.images.map(img => ({
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary,
                sortOrder: img.sortOrder,
              })),
            },
            specifications: {
              create: original.specifications.map(spec => ({
                name: spec.name,
                value: spec.value,
                category: spec.category,
              })),
            },
            variants: {
              create: original.variants.map(variant => ({
                name: variant.name,
                type: variant.type,
                value: variant.value,
                price: variant.price,
                sku: variant.sku,
                inStock: variant.inStock,
                image: variant.image,
              })),
            },
          },
        })

        duplicatedProducts.push(duplicatedProduct)
      }

      await logAdminAction(
        'DUPLICATE_PRODUCTS',
        'products',
        duplicatedProducts.map(p => p.id).join(','),
        {
          originalIds: productIds,
        }
      )

      return NextResponse.json({
        success: true,
        message: `${duplicatedProducts.length} products duplicated successfully`,
        data: duplicatedProducts,
      })
    }

    // Handle regular product creation (default action)
    // Validate product data
    const productValidation = AdminProductSchema.safeParse(body)
    if (!productValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid product data',
          details: productValidation.error.errors,
        },
        { status: 400 }
      )
    }

    const productData = productValidation.data

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: productData.sku },
    })

    if (existingSku) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 409 }
      )
    }

    // Check if slug already exists
    const existingSlug = await prisma.product.findUnique({
      where: { slug: productData.slug },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 409 }
      )
    }

    // Calculate discount percentage if original price is provided
    let discountPercentage = null
    if (
      productData.originalPrice &&
      productData.originalPrice > productData.price
    ) {
      discountPercentage = Math.round(
        ((productData.originalPrice - productData.price) /
          productData.originalPrice) *
          100
      )
    }

    // Create product with images in a transaction
    const product = await prisma.$transaction(async tx => {
      const createdProduct = await tx.product.create({
        data: {
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          shortDescription: productData.shortDescription,
          price: productData.price,
          originalPrice: productData.originalPrice,
          discountPercentage,
          sku: productData.sku,
          stockQuantity: productData.stockQuantity || 0,
          inStock:
            productData.inStock !== undefined
              ? productData.inStock
              : (productData.stockQuantity || 0) > 0,
          tags: productData.tags || [],
          categoryId: productData.categoryId,
          isFeatured: productData.isFeatured || false,
          isOnSale: productData.isOnSale || false,
          isNew: productData.isNew || false,
          isBestseller: productData.isBestseller || false,
        },
      })

      // Create images if provided
      if (productData.images && productData.images.length > 0) {
        await tx.productImage.createMany({
          data: productData.images.map((image, index) => ({
            productId: createdProduct.id,
            url: image.url,
            alt: image.alt || productData.name,
            isPrimary: image.isPrimary || index === 0,
            sortOrder: image.sortOrder || index,
          })),
        })
      }

      return tx.product.findUnique({
        where: { id: createdProduct.id },
        include: {
          category: true,
          images: true,
        },
      })
    })

    await logAdminAction('CREATE', 'product', product!.id, productData)

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully',
    })
  } catch (error) {
    return handleAdminError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Validate product data (make all fields optional for updates)
    const productValidation = AdminProductSchema.partial().safeParse(updateData)
    if (!productValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid product data',
          details: productValidation.error.errors,
        },
        { status: 400 }
      )
    }

    const productData = productValidation.data

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check for SKU conflicts (if SKU is being updated)
    if (productData.sku && productData.sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: productData.sku },
      })

      if (existingSku) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 409 }
        )
      }
    }

    // Check for slug conflicts (if slug is being updated)
    if (productData.slug && productData.slug !== existingProduct.slug) {
      const existingSlug = await prisma.product.findUnique({
        where: { slug: productData.slug },
      })

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 409 }
        )
      }
    }

    // Calculate discount percentage if prices are updated
    let discountPercentage = existingProduct.discountPercentage
    const newPrice = productData.price ?? Number(existingProduct.price)
    const newOriginalPrice =
      productData.originalPrice ?? Number(existingProduct.originalPrice || 0)

    if (newOriginalPrice && newOriginalPrice > newPrice) {
      discountPercentage = Math.round(
        ((newOriginalPrice - newPrice) / newOriginalPrice) * 100
      )
    } else {
      discountPercentage = null
    }

    // Update inStock status - use provided value or compute from stockQuantity
    const newStockQuantity =
      productData.stockQuantity ?? existingProduct.stockQuantity
    const inStock =
      productData.inStock !== undefined
        ? productData.inStock
        : (newStockQuantity || 0) > 0

    // Update product with images in a transaction
    const updatedProduct = await prisma.$transaction(async tx => {
      // Remove images from productData before updating product
      const { images, ...productUpdateData } = productData

      const updated = await tx.product.update({
        where: { id },
        data: {
          ...productUpdateData,
          discountPercentage,
          inStock,
        },
      })

      // Handle image updates if provided
      if (images !== undefined) {
        // Delete existing images
        await tx.productImage.deleteMany({
          where: { productId: id },
        })

        // Create new images if provided
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((image, index) => ({
              productId: id,
              url: image.url,
              alt: image.alt || updated.name,
              isPrimary: image.isPrimary || index === 0,
              sortOrder: image.sortOrder || index,
            })),
          })
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: true,
        },
      })
    })

    await logAdminAction('UPDATE', 'product', id, productData)

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    })
  } catch (error) {
    return handleAdminError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product is in any orders
    const orderItems = await prisma.orderItem.findFirst({
      where: { productId: id },
    })

    if (orderItems) {
      return NextResponse.json(
        { error: 'Cannot delete product that has been ordered' },
        { status: 409 }
      )
    }

    // Delete product (this will cascade delete related records due to schema constraints)
    await prisma.product.delete({
      where: { id },
    })

    await logAdminAction('DELETE', 'product', id, {
      name: existingProduct.name,
    })

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    return handleAdminError(error)
  }
}

// Bulk operations endpoint
export async function PATCH(request: NextRequest) {
  try {
    const validation = await validateAdminRole()
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    const body = await request.json()

    // Validate bulk operation data
    const bulkOperationSchema = z.object({
      productIds: z
        .array(z.string())
        .min(1, 'At least one product ID is required'),
      action: z.enum(['activate', 'deactivate', 'delete', 'changeCategory'], {
        errorMap: () => ({
          message:
            'Invalid action. Must be activate, deactivate, delete, or changeCategory',
        }),
      }),
      data: z
        .object({
          categoryId: z.string().optional(),
        })
        .optional(),
    })

    const validation_result = bulkOperationSchema.safeParse(body)
    if (!validation_result.success) {
      return NextResponse.json(
        {
          error: 'Invalid bulk operation data',
          details: validation_result.error.errors,
        },
        { status: 400 }
      )
    }

    const { productIds, action, data } = validation_result.data

    // Check if all products exist
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    })

    if (existingProducts.length !== productIds.length) {
      const foundIds = existingProducts.map(p => p.id)
      const missingIds = productIds.filter(id => !foundIds.includes(id))
      return NextResponse.json(
        { error: `Products not found: ${missingIds.join(', ')}` },
        { status: 404 }
      )
    }

    let updateResult: { count: number } = { count: 0 }

    switch (action) {
      case 'activate':
        updateResult = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { inStock: true },
        })
        break

      case 'deactivate':
        updateResult = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { inStock: false },
        })
        break

      case 'delete':
        // Check if any products are in orders before deleting
        const orderItems = await prisma.orderItem.findFirst({
          where: { productId: { in: productIds } },
        })

        if (orderItems) {
          return NextResponse.json(
            { error: 'Cannot delete products that have been ordered' },
            { status: 409 }
          )
        }

        updateResult = await prisma.product.deleteMany({
          where: { id: { in: productIds } },
        })
        break

      case 'changeCategory':
        if (!data?.categoryId) {
          return NextResponse.json(
            { error: 'Category ID is required for changeCategory action' },
            { status: 400 }
          )
        }

        // Verify category exists
        const category = await prisma.category.findUnique({
          where: { id: data.categoryId },
        })

        if (!category) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          )
        }

        updateResult = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { categoryId: data.categoryId },
        })
        break
    }

    await logAdminAction('BULK_UPDATE', 'products', productIds.join(','), {
      action,
      data,
    })

    return NextResponse.json({
      success: true,
      message: `${updateResult.count} products ${action === 'delete' ? 'deleted' : 'updated'} successfully`,
      updatedCount: updateResult.count,
    })
  } catch (error) {
    return handleAdminError(error)
  }
}
