import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active') === 'true'

    const categories = await prisma.category.findMany({
      where: isActive ? { isActive: true } : undefined,
      include: {
        _count: {
          select: {
            products: {
              where: {
                inStock: true,
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    const categoriesWithCount = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      badge: category.badge,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      productCount: category._count.products,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }))

    return NextResponse.json({
      data: categoriesWithCount,
      total: categoriesWithCount.length,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
