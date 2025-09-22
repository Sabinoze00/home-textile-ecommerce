import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProductSearchQuerySchema } from '@/lib/validations'

// Helper function to calculate relevance score
function calculateRelevanceScore(
  product: any,
  query: string,
  isExactMatch: boolean,
  matchField: string
): number {
  let score = 0
  const queryLower = query.toLowerCase()
  const productName = product.name.toLowerCase()
  const numericRating = product.rating ? Number(product.rating) : undefined

  // Base scoring
  if (isExactMatch) {
    if (matchField === 'name') score += 100
    else if (matchField === 'shortDescription') score += 80
    else if (matchField === 'description') score += 60
    else if (matchField === 'category') score += 70
    else if (matchField === 'tags') score += 50
  } else {
    if (matchField === 'name') score += 50
    else if (matchField === 'shortDescription') score += 40
    else if (matchField === 'description') score += 30
    else if (matchField === 'category') score += 35
    else if (matchField === 'tags') score += 25
  }

  // Bonus for word position (starts with query gets higher score)
  if (productName.startsWith(queryLower)) {
    score += 30
  } else if (productName.includes(` ${queryLower}`)) {
    score += 15
  }

  // Bonus for product quality indicators
  if (product.isBestseller) score += 20
  if (product.isFeatured) score += 15
  if (product.isNew) score += 10
  if (numericRating !== undefined && numericRating >= 4.5) score += 15
  else if (numericRating !== undefined && numericRating >= 4.0) score += 10
  else if (numericRating !== undefined && numericRating >= 3.5) score += 5

  // Penalty for out of stock (though we filter these out)
  if (!product.inStock) score -= 50

  // Bonus for sale items (user interest)
  if (product.isOnSale) score += 5

  return score
}

// Helper function to generate fuzzy search variations
function generateFuzzyVariations(query: string): string[] {
  const variations = [query]
  const words = query.toLowerCase().split(' ')

  // Add individual words for partial matching
  words.forEach(word => {
    if (word.length > 2) {
      variations.push(word)
    }
  })

  // Add variations with common typos/substitutions
  const commonSubstitutions: { [key: string]: string[] } = {
    sheet: ['sheets', 'sheeting'],
    pillow: ['pillows', 'cushion', 'cushions'],
    blanket: ['blankets', 'throw', 'throws'],
    cover: ['covers', 'covering'],
    duvet: ['duvets', 'comforter', 'comforters'],
    towel: ['towels', 'bath'],
    cotton: ['100% cotton', 'pure cotton'],
    linen: ['100% linen', 'pure linen'],
  }

  words.forEach(word => {
    if (commonSubstitutions[word]) {
      variations.push(...commonSubstitutions[word])
    }
  })

  return [...new Set(variations)]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse and validate query parameters
    const params = {
      q: searchParams.get('q') || '',
      limit: searchParams.get('limit') || '10',
    }

    const validatedParams = ProductSearchQuerySchema.parse(params)

    if (!validatedParams.q.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Generate fuzzy search variations
    const queryVariations = generateFuzzyVariations(validatedParams.q)

    // Create comprehensive search conditions
    const searchConditions: any[] = []

    // For each variation, create search conditions
    queryVariations.forEach(variation => {
      searchConditions.push(
        // Exact name match (highest priority)
        {
          name: { equals: variation, mode: 'insensitive' as const },
        },
        // Name contains
        {
          name: { contains: variation, mode: 'insensitive' as const },
        },
        // Short description contains
        {
          shortDescription: {
            contains: variation,
            mode: 'insensitive' as const,
          },
        },
        // Description contains
        {
          description: { contains: variation, mode: 'insensitive' as const },
        },
        // Tags array contains
        {
          tags: { hasSome: [variation] },
        },
        // Category name contains
        {
          category: {
            name: { contains: variation, mode: 'insensitive' as const },
          },
        }
      )
    })

    // Perform text search across products with enhanced fuzzy matching
    const products = await prisma.product.findMany({
      where: {
        OR: searchConditions,
        inStock: true, // Only show in-stock products in search
      },
      take: validatedParams.limit * 3, // Get more results for scoring
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
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })

    // Calculate relevance scores and transform data
    const scoredResults = products.map(product => {
      let maxScore = 0
      let matchField = 'name'
      const queryLower = validatedParams.q.toLowerCase()

      // Determine best matching field and score
      const productNameLower = product.name.toLowerCase()
      const categoryNameLower = product.category.name.toLowerCase()
      const shortDescLower = product.shortDescription?.toLowerCase() || ''
      const descLower = product.description?.toLowerCase() || ''

      // Check for exact matches first
      if (productNameLower === queryLower) {
        maxScore = calculateRelevanceScore(
          product,
          validatedParams.q,
          true,
          'name'
        )
        matchField = 'name'
      } else if (productNameLower.includes(queryLower)) {
        const score = calculateRelevanceScore(
          product,
          validatedParams.q,
          false,
          'name'
        )
        if (score > maxScore) {
          maxScore = score
          matchField = 'name'
        }
      }

      if (categoryNameLower.includes(queryLower)) {
        const score = calculateRelevanceScore(
          product,
          validatedParams.q,
          categoryNameLower === queryLower,
          'category'
        )
        if (score > maxScore) {
          maxScore = score
          matchField = 'category'
        }
      }

      if (shortDescLower.includes(queryLower)) {
        const score = calculateRelevanceScore(
          product,
          validatedParams.q,
          false,
          'shortDescription'
        )
        if (score > maxScore) {
          maxScore = score
          matchField = 'shortDescription'
        }
      }

      if (descLower.includes(queryLower)) {
        const score = calculateRelevanceScore(
          product,
          validatedParams.q,
          false,
          'description'
        )
        if (score > maxScore) {
          maxScore = score
          matchField = 'description'
        }
      }

      // Check tags
      if (
        product.tags &&
        product.tags.some((tag: string) =>
          tag.toLowerCase().includes(queryLower)
        )
      ) {
        const score = calculateRelevanceScore(
          product,
          validatedParams.q,
          false,
          'tags'
        )
        if (score > maxScore) {
          maxScore = score
          matchField = 'tags'
        }
      }

      // Check fuzzy variations
      queryVariations.forEach(variation => {
        const variationLower = variation.toLowerCase()
        if (productNameLower.includes(variationLower)) {
          const score = calculateRelevanceScore(
            product,
            variation,
            productNameLower === variationLower,
            'name'
          )
          if (score > maxScore) {
            maxScore = score
            matchField = 'name'
          }
        }
      })

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        price: Number(product.price),
        originalPrice: product.originalPrice
          ? Number(product.originalPrice)
          : undefined,
        image: product.images[0]?.url,
        category: {
          name: product.category.name,
          slug: product.category.slug,
        },
        rating: product.rating ? Number(product.rating) : undefined,
        isOnSale: product.isOnSale,
        isBestseller: product.isBestseller,
        isNew: product.isNew,
        colors: product.variants
          .filter(v => v.type === 'color')
          .map(v => v.value)
          .slice(0, 3),
        relevanceScore: maxScore,
        matchField,
      }
    })

    // Sort by relevance score and take the requested limit
    const searchResults = scoredResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, validatedParams.limit)
      .map(({ relevanceScore, matchField, ...result }) => result) // Remove internal scoring fields

    // Get enhanced search suggestions with fuzzy matching
    const suggestionConditions = queryVariations.map(variation => ({
      name: { contains: variation, mode: 'insensitive' as const },
    }))

    const suggestions = await prisma.product.findMany({
      where: {
        OR: suggestionConditions,
        inStock: true,
      },
      select: {
        name: true,
        slug: true,
        isBestseller: true,
        rating: true,
      },
      take: 8,
    })

    // Score and sort suggestions by relevance
    const scoredSuggestions = suggestions
      .map(suggestion => {
        let score = 0
        const nameLower = suggestion.name.toLowerCase()
        const queryLower = validatedParams.q.toLowerCase()

        // Exact match bonus
        if (nameLower === queryLower) score += 100
        // Starts with query bonus
        else if (nameLower.startsWith(queryLower)) score += 50
        // Contains query bonus
        else if (nameLower.includes(queryLower)) score += 25

        // Quality bonuses
        if (suggestion.isBestseller) score += 10
        if (suggestion.rating && Number(suggestion.rating) >= 4.5) score += 5

        return { ...suggestion, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ score, ...suggestion }) => suggestion)

    // Get enhanced category suggestions with fuzzy matching
    const categorySuggestionConditions = queryVariations.map(variation => ({
      name: { contains: variation, mode: 'insensitive' as const },
    }))

    const categorySuggestions = await prisma.category.findMany({
      where: {
        OR: categorySuggestionConditions,
        isActive: true,
      },
      select: {
        name: true,
        slug: true,
      },
      take: 3,
    })

    return NextResponse.json({
      results: searchResults,
      suggestions: scoredSuggestions.map(s => ({
        type: 'product' as const,
        name: s.name,
        href: `/products/${s.slug}`,
      })),
      categories: categorySuggestions.map(c => ({
        type: 'category' as const,
        name: c.name,
        href: `/products?category=${c.slug}`,
      })),
      query: validatedParams.q,
      total: searchResults.length,
      queryVariations: queryVariations, // For debugging (can be removed in production)
    })
  } catch (error) {
    console.error('Search API error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
