import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.productReview.deleteMany()
  await prisma.productSpecification.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // Create categories
  console.log('📂 Creating categories...')
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'SHEETS',
        slug: 'sheets',
        description: 'Premium bed sheets in various materials and colors',
        image:
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'DUVET COVERS',
        slug: 'duvet-covers',
        description: 'Stylish duvet covers to transform your bedroom',
        image:
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'QUILTS & COVERLETS',
        slug: 'quilts-coverlets',
        description:
          'Beautiful quilts and coverlets for added warmth and style',
        image:
          'https://images.unsplash.com/photo-1540932239986-30128078f3c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'COMFORTERS',
        slug: 'comforters',
        description: "Cozy comforters for the perfect night's sleep",
        image:
          'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        badge: 'bestseller',
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'BATH',
        slug: 'bath',
        description: 'Luxurious bath towels and accessories',
        image:
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        badge: 'sale',
        sortOrder: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'BLANKETS & THROWS',
        slug: 'blankets-throws',
        description: 'Soft blankets and throws for every season',
        image:
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        sortOrder: 6,
      },
    }),
    prisma.category.create({
      data: {
        name: 'KIDS',
        slug: 'kids',
        description: "Fun and safe textiles for children's rooms",
        image:
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
        badge: 'new',
        sortOrder: 7,
      },
    }),
    prisma.category.create({
      data: {
        name: 'HOME DECOR',
        slug: 'home-decor',
        description: 'Decorative textiles to enhance your living space',
        image:
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80',
        sortOrder: 8,
      },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // Sample products data
  const productsData = [
    // SHEETS
    {
      name: 'Organic Cotton Percale Sheet Set',
      slug: 'organic-cotton-percale-sheet-set',
      description:
        'Experience ultimate comfort with our premium organic cotton percale sheet set. Breathable, crisp, and naturally soft, these sheets are perfect for hot sleepers and those who prefer a hotel-like feel.',
      shortDescription: 'Crisp, breathable organic cotton percale sheets',
      price: 149.99,
      originalPrice: 199.99,
      categoryId: categories[0].id,
      sku: 'SHEET-001',
      tags: ['organic', 'breathable', 'percale', 'cotton'],
      rating: 4.7,
      ratingCount: 324,
      isBestseller: true,
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'White', name: 'Classic White' },
        { type: 'color', value: 'Navy', name: 'Deep Navy' },
        { type: 'color', value: 'Sage', name: 'Sage Green' },
        { type: 'size', value: 'Twin', name: 'Twin', price: 129.99 },
        { type: 'size', value: 'Queen', name: 'Queen', price: 149.99 },
        { type: 'size', value: 'King', name: 'King', price: 169.99 },
      ],
      specifications: [
        { name: 'Material', value: '100% Organic Cotton', category: 'Fabric' },
        { name: 'Weave', value: 'Percale', category: 'Fabric' },
        { name: 'Thread Count', value: '280', category: 'Fabric' },
        { name: 'Care', value: 'Machine wash cold', category: 'Care' },
      ],
    },
    {
      name: 'Bamboo Rayon Sateen Sheet Set',
      slug: 'bamboo-rayon-sateen-sheet-set',
      description:
        'Indulge in luxury with our silky smooth bamboo rayon sateen sheets. Naturally antimicrobial and temperature regulating for the perfect sleep environment.',
      shortDescription: 'Silky smooth bamboo rayon with temperature regulation',
      price: 179.99,
      categoryId: categories[0].id,
      sku: 'SHEET-002',
      tags: ['bamboo', 'sateen', 'antimicrobial', 'eco-friendly'],
      rating: 4.6,
      ratingCount: 189,
      isNew: true,
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        'https://images.unsplash.com/photo-1631049421450-348310b1bcbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80',
      ],
      variants: [
        { type: 'color', value: 'Ivory', name: 'Ivory' },
        { type: 'color', value: 'Charcoal', name: 'Charcoal' },
        { type: 'size', value: 'Queen', name: 'Queen', price: 179.99 },
        { type: 'size', value: 'King', name: 'King', price: 199.99 },
      ],
    },

    // DUVET COVERS
    {
      name: 'Linen Duvet Cover Set',
      slug: 'linen-duvet-cover-set',
      description:
        'Embrace relaxed elegance with our stone-washed linen duvet cover set. The naturally rumpled texture and soft feel create a perfectly imperfect, lived-in luxury.',
      shortDescription: 'Stone-washed linen with relaxed elegance',
      price: 199.99,
      originalPrice: 259.99,
      categoryId: categories[1].id,
      sku: 'DUVET-001',
      tags: ['linen', 'stone-washed', 'relaxed', 'natural'],
      rating: 4.8,
      ratingCount: 412,
      isFeatured: true,
      isOnSale: true,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2058&q=80',
        'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'Natural', name: 'Natural Linen' },
        { type: 'color', value: 'Sage', name: 'Sage Green' },
        { type: 'color', value: 'Terracotta', name: 'Terracotta' },
        { type: 'size', value: 'Full', name: 'Full/Queen', price: 199.99 },
        { type: 'size', value: 'King', name: 'King', price: 229.99 },
      ],
    },
    {
      name: 'Modern Geometric Duvet Cover',
      slug: 'modern-geometric-duvet-cover',
      description:
        'Add contemporary style to your bedroom with this striking geometric pattern duvet cover. Made from premium cotton sateen for a luxurious feel.',
      shortDescription: 'Contemporary geometric pattern in premium cotton',
      price: 159.99,
      categoryId: categories[1].id,
      sku: 'DUVET-002',
      tags: ['geometric', 'modern', 'cotton', 'contemporary'],
      rating: 4.5,
      ratingCount: 156,
      images: [
        'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80',
      ],
      variants: [
        { type: 'color', value: 'Navy', name: 'Navy & White' },
        { type: 'color', value: 'Charcoal', name: 'Charcoal & Cream' },
      ],
    },

    // QUILTS & COVERLETS
    {
      name: 'Vintage Floral Quilt',
      slug: 'vintage-floral-quilt',
      description:
        'This beautifully crafted vintage-inspired floral quilt brings timeless elegance to any bedroom. Hand-stitched details and premium cotton fill provide both style and comfort.',
      shortDescription: 'Hand-stitched vintage floral design',
      price: 299.99,
      categoryId: categories[2].id,
      sku: 'QUILT-001',
      tags: ['vintage', 'floral', 'hand-stitched', 'cotton-fill'],
      rating: 4.9,
      ratingCount: 78,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1540932239986-30128078f3c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
      ],
      variants: [
        { type: 'color', value: 'Rose', name: 'Rose Garden' },
        { type: 'size', value: 'Queen', name: 'Queen', price: 299.99 },
        { type: 'size', value: 'King', name: 'King', price: 349.99 },
      ],
    },

    // COMFORTERS
    {
      name: 'All-Season Down Alternative Comforter',
      slug: 'all-season-down-alternative-comforter',
      description:
        'Perfect for year-round comfort, this hypoallergenic down alternative comforter provides the warmth and fluffiness of down without allergens.',
      shortDescription: 'Hypoallergenic down alternative for all seasons',
      price: 119.99,
      originalPrice: 149.99,
      categoryId: categories[3].id,
      sku: 'COMF-001',
      tags: ['down-alternative', 'hypoallergenic', 'all-season', 'fluffy'],
      rating: 4.6,
      ratingCount: 892,
      isBestseller: true,
      isOnSale: true,
      images: [
        'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'size', value: 'Twin', name: 'Twin', price: 89.99 },
        { type: 'size', value: 'Queen', name: 'Queen', price: 119.99 },
        { type: 'size', value: 'King', name: 'King', price: 139.99 },
      ],
    },

    // BATH
    {
      name: 'Luxury Egyptian Cotton Towel Set',
      slug: 'luxury-egyptian-cotton-towel-set',
      description:
        'Experience spa-like luxury with our premium Egyptian cotton towel set. Ultra-absorbent and incredibly soft, these towels get better with every wash.',
      shortDescription: 'Premium Egyptian cotton with spa-like luxury',
      price: 89.99,
      originalPrice: 139.99,
      categoryId: categories[4].id,
      sku: 'BATH-001',
      tags: ['egyptian-cotton', 'luxury', 'absorbent', 'spa-quality'],
      rating: 4.7,
      ratingCount: 567,
      isOnSale: true,
      images: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'White', name: 'Classic White' },
        { type: 'color', value: 'Navy', name: 'Deep Navy' },
        { type: 'color', value: 'Sage', name: 'Sage Green' },
      ],
    },

    // BLANKETS & THROWS
    {
      name: 'Chunky Knit Throw Blanket',
      slug: 'chunky-knit-throw-blanket',
      description:
        "Add texture and warmth to any space with this cozy chunky knit throw. Made from soft acrylic yarn, it's perfect for snuggling on the couch.",
      shortDescription: 'Cozy chunky knit in soft acrylic yarn',
      price: 79.99,
      categoryId: categories[5].id,
      sku: 'THROW-001',
      tags: ['chunky-knit', 'cozy', 'acrylic', 'textured'],
      rating: 4.4,
      ratingCount: 234,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'Cream', name: 'Cream' },
        { type: 'color', value: 'Grey', name: 'Light Grey' },
        { type: 'color', value: 'Terracotta', name: 'Terracotta' },
      ],
    },

    // KIDS
    {
      name: 'Dinosaur Adventure Sheet Set',
      slug: 'dinosaur-adventure-sheet-set',
      description:
        "Let your little one's imagination run wild with this fun dinosaur-themed sheet set. Made from soft, easy-care cotton blend for busy families.",
      shortDescription: 'Fun dinosaur theme in easy-care cotton blend',
      price: 49.99,
      categoryId: categories[6].id,
      sku: 'KIDS-001',
      tags: ['dinosaur', 'kids', 'fun', 'easy-care'],
      rating: 4.5,
      ratingCount: 145,
      isNew: true,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
      ],
      variants: [
        { type: 'size', value: 'Twin', name: 'Twin', price: 49.99 },
        { type: 'size', value: 'Full', name: 'Full', price: 59.99 },
      ],
    },

    // More SHEETS
    {
      name: 'Microfiber Sheet Set',
      slug: 'microfiber-sheet-set',
      description:
        'Affordable comfort with our soft microfiber sheet set. Wrinkle-resistant and easy care for busy lifestyles.',
      shortDescription: 'Soft, wrinkle-resistant microfiber sheets',
      price: 39.99,
      originalPrice: 59.99,
      categoryId: categories[0].id,
      sku: 'SHEET-003',
      tags: ['microfiber', 'wrinkle-resistant', 'easy-care', 'affordable'],
      rating: 4.3,
      ratingCount: 456,
      isOnSale: true,
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'White', name: 'White' },
        { type: 'color', value: 'Grey', name: 'Grey' },
        { type: 'color', value: 'Navy', name: 'Navy' },
        { type: 'size', value: 'Twin', name: 'Twin', price: 29.99 },
        { type: 'size', value: 'Queen', name: 'Queen', price: 39.99 },
        { type: 'size', value: 'King', name: 'King', price: 49.99 },
      ],
    },
    {
      name: 'Silk Sheet Set',
      slug: 'silk-sheet-set',
      description:
        'Indulge in ultimate luxury with our 100% mulberry silk sheet set. Temperature regulating and gentle on skin and hair.',
      shortDescription: '100% mulberry silk for ultimate luxury',
      price: 299.99,
      categoryId: categories[0].id,
      sku: 'SHEET-004',
      tags: ['silk', 'mulberry', 'luxury', 'temperature-regulating'],
      rating: 4.9,
      ratingCount: 87,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'Champagne', name: 'Champagne' },
        { type: 'color', value: 'Navy', name: 'Navy' },
        { type: 'size', value: 'Queen', name: 'Queen', price: 299.99 },
        { type: 'size', value: 'King', name: 'King', price: 349.99 },
      ],
    },
    {
      name: 'Jersey Knit Sheet Set',
      slug: 'jersey-knit-sheet-set',
      description:
        'Soft and stretchy like your favorite t-shirt. These jersey knit sheets are perfect for cozy comfort.',
      shortDescription: 'Soft and stretchy jersey knit comfort',
      price: 69.99,
      categoryId: categories[0].id,
      sku: 'SHEET-005',
      tags: ['jersey', 'stretchy', 'cozy', 't-shirt-soft'],
      rating: 4.4,
      ratingCount: 278,
      images: [
        'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80',
      ],
      variants: [
        { type: 'color', value: 'Grey', name: 'Heather Grey' },
        { type: 'color', value: 'White', name: 'White' },
        { type: 'size', value: 'Twin', name: 'Twin', price: 59.99 },
        { type: 'size', value: 'Queen', name: 'Queen', price: 69.99 },
      ],
    },
    {
      name: 'Linen Sheet Set',
      slug: 'linen-sheet-set',
      description:
        'Natural linen sheets that get softer with every wash. Perfect for year-round comfort with their breathable weave.',
      shortDescription: 'Natural linen that gets softer with age',
      price: 189.99,
      categoryId: categories[0].id,
      sku: 'SHEET-006',
      tags: ['linen', 'natural', 'breathable', 'ages-beautifully'],
      rating: 4.6,
      ratingCount: 156,
      images: [
        'https://images.unsplash.com/photo-1631049421450-348310b1bcbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80',
      ],
      variants: [
        { type: 'color', value: 'Natural', name: 'Natural' },
        { type: 'color', value: 'Sage', name: 'Sage' },
        { type: 'color', value: 'Terracotta', name: 'Terracotta' },
      ],
    },

    // More DUVET COVERS
    {
      name: 'Striped Cotton Duvet Cover',
      slug: 'striped-cotton-duvet-cover',
      description:
        'Classic stripes meet modern comfort in this premium cotton duvet cover. Timeless design that complements any decor.',
      shortDescription: 'Classic stripes in premium cotton',
      price: 129.99,
      categoryId: categories[1].id,
      sku: 'DUVET-003',
      tags: ['striped', 'classic', 'cotton', 'timeless'],
      rating: 4.5,
      ratingCount: 234,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2058&q=80',
      ],
      variants: [
        { type: 'color', value: 'Navy', name: 'Navy Stripe' },
        { type: 'color', value: 'Grey', name: 'Grey Stripe' },
      ],
    },
    {
      name: 'Floral Print Duvet Cover',
      slug: 'floral-print-duvet-cover',
      description:
        'Bring nature indoors with this beautiful botanical print duvet cover. Soft cotton with a sophisticated floral design.',
      shortDescription: 'Sophisticated botanical print on soft cotton',
      price: 169.99,
      categoryId: categories[1].id,
      sku: 'DUVET-004',
      tags: ['floral', 'botanical', 'nature', 'sophisticated'],
      rating: 4.7,
      ratingCount: 189,
      isNew: true,
      images: [
        'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'Sage', name: 'Sage Floral' },
        { type: 'color', value: 'Blush', name: 'Blush Floral' },
      ],
    },
    {
      name: 'Velvet Duvet Cover',
      slug: 'velvet-duvet-cover',
      description:
        'Luxurious velvet duvet cover for an opulent bedroom feel. Incredibly soft with a rich, lustrous finish.',
      shortDescription: 'Luxurious velvet with rich lustrous finish',
      price: 249.99,
      categoryId: categories[1].id,
      sku: 'DUVET-005',
      tags: ['velvet', 'luxurious', 'opulent', 'lustrous'],
      rating: 4.8,
      ratingCount: 92,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80',
      ],
      variants: [
        { type: 'color', value: 'Emerald', name: 'Emerald Green' },
        { type: 'color', value: 'Navy', name: 'Midnight Navy' },
        { type: 'color', value: 'Burgundy', name: 'Burgundy' },
      ],
    },

    // More QUILTS & COVERLETS
    {
      name: 'Modern Geometric Quilt',
      slug: 'modern-geometric-quilt',
      description:
        'Contemporary geometric patterns create a modern look in this stylish quilt. Perfect for adding visual interest to your bedroom.',
      shortDescription: 'Contemporary geometric patterns for modern style',
      price: 179.99,
      categoryId: categories[2].id,
      sku: 'QUILT-002',
      tags: ['geometric', 'modern', 'contemporary', 'visual-interest'],
      rating: 4.4,
      ratingCount: 123,
      images: [
        'https://images.unsplash.com/photo-1540932239986-30128078f3c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
      ],
      variants: [
        { type: 'color', value: 'Navy', name: 'Navy & White' },
        { type: 'color', value: 'Grey', name: 'Grey & Cream' },
      ],
    },
    {
      name: 'Lightweight Summer Coverlet',
      slug: 'lightweight-summer-coverlet',
      description:
        'Perfect for warm weather, this lightweight coverlet provides just the right amount of coverage without overheating.',
      shortDescription: 'Lightweight coverage perfect for warm weather',
      price: 89.99,
      categoryId: categories[2].id,
      sku: 'QUILT-003',
      tags: ['lightweight', 'summer', 'coverlet', 'breathable'],
      rating: 4.3,
      ratingCount: 167,
      images: [
        'https://images.unsplash.com/photo-1540932239986-30128078f3c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
      ],
      variants: [
        { type: 'color', value: 'White', name: 'Pure White' },
        { type: 'color', value: 'Sage', name: 'Sage Green' },
      ],
    },
    {
      name: 'Patchwork Quilt',
      slug: 'patchwork-quilt',
      description:
        'Traditional patchwork design with a modern twist. Each square tells a story in this beautifully crafted quilt.',
      shortDescription: 'Traditional patchwork with modern appeal',
      price: 259.99,
      categoryId: categories[2].id,
      sku: 'QUILT-004',
      tags: ['patchwork', 'traditional', 'storytelling', 'crafted'],
      rating: 4.7,
      ratingCount: 89,
      images: [
        'https://images.unsplash.com/photo-1540932239986-30128078f3c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
      ],
      variants: [
        { type: 'pattern', value: 'Autumn', name: 'Autumn Colors' },
        { type: 'pattern', value: 'Spring', name: 'Spring Pastels' },
      ],
    },

    // More COMFORTERS
    {
      name: 'Goose Down Comforter',
      slug: 'goose-down-comforter',
      description:
        'Premium goose down comforter for the ultimate in warmth and luxury. Naturally temperature regulating and incredibly lightweight.',
      shortDescription: 'Premium goose down for ultimate luxury',
      price: 299.99,
      categoryId: categories[3].id,
      sku: 'COMF-002',
      tags: ['goose-down', 'premium', 'luxury', 'lightweight'],
      rating: 4.8,
      ratingCount: 234,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'size', value: 'Queen', name: 'Queen', price: 299.99 },
        { type: 'size', value: 'King', name: 'King', price: 349.99 },
      ],
    },
    {
      name: 'Cooling Gel Comforter',
      slug: 'cooling-gel-comforter',
      description:
        'Stay cool all night with our innovative cooling gel comforter. Perfect for hot sleepers and warm climates.',
      shortDescription: 'Innovative cooling gel for hot sleepers',
      price: 159.99,
      categoryId: categories[3].id,
      sku: 'COMF-003',
      tags: ['cooling', 'gel', 'hot-sleepers', 'innovative'],
      rating: 4.5,
      ratingCount: 345,
      isNew: true,
      images: [
        'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'size', value: 'Twin', name: 'Twin', price: 129.99 },
        { type: 'size', value: 'Queen', name: 'Queen', price: 159.99 },
        { type: 'size', value: 'King', name: 'King', price: 189.99 },
      ],
    },
    {
      name: 'Weighted Comforter',
      slug: 'weighted-comforter',
      description:
        'Experience better sleep with our weighted comforter. Designed to provide gentle pressure for improved rest and relaxation.',
      shortDescription: 'Gentle pressure for improved sleep quality',
      price: 199.99,
      categoryId: categories[3].id,
      sku: 'COMF-004',
      tags: ['weighted', 'pressure', 'sleep-quality', 'relaxation'],
      rating: 4.6,
      ratingCount: 189,
      images: [
        'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'weight', value: '15lb', name: '15 lbs', price: 199.99 },
        { type: 'weight', value: '20lb', name: '20 lbs', price: 229.99 },
        { type: 'weight', value: '25lb', name: '25 lbs', price: 259.99 },
      ],
    },

    // More BATH
    {
      name: 'Bamboo Towel Set',
      slug: 'bamboo-towel-set',
      description:
        'Eco-friendly bamboo towels that are naturally antimicrobial and incredibly soft. Perfect for sensitive skin.',
      shortDescription: 'Eco-friendly bamboo with antimicrobial properties',
      price: 79.99,
      categoryId: categories[4].id,
      sku: 'BATH-002',
      tags: ['bamboo', 'eco-friendly', 'antimicrobial', 'sensitive-skin'],
      rating: 4.6,
      ratingCount: 234,
      isNew: true,
      images: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'Natural', name: 'Natural' },
        { type: 'color', value: 'Grey', name: 'Stone Grey' },
      ],
    },
    {
      name: 'Quick-Dry Microfiber Towels',
      slug: 'quick-dry-microfiber-towels',
      description:
        'Ultra-absorbent microfiber towels that dry quickly and resist odors. Perfect for travel and active lifestyles.',
      shortDescription: 'Ultra-absorbent and quick-drying',
      price: 49.99,
      categoryId: categories[4].id,
      sku: 'BATH-003',
      tags: ['microfiber', 'quick-dry', 'travel', 'odor-resistant'],
      rating: 4.3,
      ratingCount: 456,
      images: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'Blue', name: 'Ocean Blue' },
        { type: 'color', value: 'Green', name: 'Forest Green' },
      ],
    },
    {
      name: 'Turkish Cotton Bath Towels',
      slug: 'turkish-cotton-bath-towels',
      description:
        'Authentic Turkish cotton towels known for their exceptional absorbency and durability. A timeless choice for luxury.',
      shortDescription: 'Authentic Turkish cotton for lasting luxury',
      price: 119.99,
      categoryId: categories[4].id,
      sku: 'BATH-004',
      tags: ['turkish-cotton', 'authentic', 'durable', 'timeless'],
      rating: 4.7,
      ratingCount: 178,
      images: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'White', name: 'Pure White' },
        { type: 'color', value: 'Charcoal', name: 'Charcoal' },
      ],
    },
    {
      name: 'Spa Waffle Weave Towels',
      slug: 'spa-waffle-weave-towels',
      description:
        'Luxurious waffle weave towels that provide excellent absorption while remaining lightweight. Perfect spa-like experience.',
      shortDescription: 'Luxurious waffle weave for spa-like comfort',
      price: 69.99,
      categoryId: categories[4].id,
      sku: 'BATH-005',
      tags: ['waffle-weave', 'spa', 'lightweight', 'absorption'],
      rating: 4.5,
      ratingCount: 267,
      images: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'Sage', name: 'Sage Green' },
        { type: 'color', value: 'Navy', name: 'Navy Blue' },
      ],
    },

    // More BLANKETS & THROWS
    {
      name: 'Cashmere Throw Blanket',
      slug: 'cashmere-throw-blanket',
      description:
        'Indulge in pure luxury with our 100% cashmere throw. Incredibly soft and warm, perfect for cozy evenings.',
      shortDescription: '100% cashmere for ultimate luxury',
      price: 199.99,
      categoryId: categories[5].id,
      sku: 'THROW-002',
      tags: ['cashmere', 'luxury', 'soft', 'cozy'],
      rating: 4.9,
      ratingCount: 67,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'Camel', name: 'Camel' },
        { type: 'color', value: 'Navy', name: 'Navy' },
        { type: 'color', value: 'Cream', name: 'Cream' },
      ],
    },
    {
      name: 'Sherpa Fleece Throw',
      slug: 'sherpa-fleece-throw',
      description:
        "Cozy sherpa fleece throw that's perfect for cold nights. Soft on one side, plush sherpa on the other.",
      shortDescription: 'Cozy sherpa fleece for cold nights',
      price: 59.99,
      categoryId: categories[5].id,
      sku: 'THROW-003',
      tags: ['sherpa', 'fleece', 'plush', 'warm'],
      rating: 4.4,
      ratingCount: 345,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'Charcoal', name: 'Charcoal' },
        { type: 'color', value: 'Cream', name: 'Cream' },
      ],
    },
    {
      name: 'Woven Cotton Throw',
      slug: 'woven-cotton-throw',
      description:
        'Beautiful woven cotton throw with fringe details. Adds texture and warmth to any living space.',
      shortDescription: 'Woven cotton with beautiful fringe details',
      price: 69.99,
      categoryId: categories[5].id,
      sku: 'THROW-004',
      tags: ['woven', 'cotton', 'fringe', 'texture'],
      rating: 4.5,
      ratingCount: 189,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'Natural', name: 'Natural' },
        { type: 'color', value: 'Rust', name: 'Rust' },
      ],
    },
    {
      name: 'Electric Heated Throw',
      slug: 'electric-heated-throw',
      description:
        'Stay warm with our electric heated throw featuring multiple heat settings and auto shut-off for safety.',
      shortDescription: 'Electric heated with multiple settings',
      price: 89.99,
      categoryId: categories[5].id,
      sku: 'THROW-005',
      tags: ['electric', 'heated', 'safety', 'warm'],
      rating: 4.3,
      ratingCount: 234,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      ],
      variants: [
        { type: 'color', value: 'Grey', name: 'Soft Grey' },
        { type: 'color', value: 'Brown', name: 'Chocolate Brown' },
      ],
    },

    // More KIDS
    {
      name: 'Princess Castle Bedding Set',
      slug: 'princess-castle-bedding-set',
      description:
        "Transform your little princess's room into a magical castle with this enchanting bedding set.",
      shortDescription: 'Magical princess castle theme',
      price: 59.99,
      categoryId: categories[6].id,
      sku: 'KIDS-002',
      tags: ['princess', 'castle', 'magical', 'enchanting'],
      rating: 4.7,
      ratingCount: 123,
      isNew: true,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
      ],
      variants: [
        { type: 'color', value: 'Pink', name: 'Princess Pink' },
        { type: 'size', value: 'Twin', name: 'Twin', price: 59.99 },
      ],
    },
    {
      name: 'Space Adventure Comforter',
      slug: 'space-adventure-comforter',
      description:
        'Blast off to dreamland with this space-themed comforter featuring rockets, planets, and stars.',
      shortDescription: 'Space theme with rockets and planets',
      price: 79.99,
      categoryId: categories[6].id,
      sku: 'KIDS-003',
      tags: ['space', 'rockets', 'planets', 'adventure'],
      rating: 4.6,
      ratingCount: 89,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
      ],
      variants: [
        { type: 'size', value: 'Twin', name: 'Twin', price: 79.99 },
        { type: 'size', value: 'Full', name: 'Full', price: 89.99 },
      ],
    },
    {
      name: 'Animal Safari Sheet Set',
      slug: 'animal-safari-sheet-set',
      description:
        'Go on a safari adventure every night with this fun animal-themed sheet set featuring lions, elephants, and giraffes.',
      shortDescription: 'Safari animals for adventurous dreams',
      price: 54.99,
      categoryId: categories[6].id,
      sku: 'KIDS-004',
      tags: ['safari', 'animals', 'adventure', 'educational'],
      rating: 4.5,
      ratingCount: 156,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
      ],
      variants: [
        { type: 'size', value: 'Twin', name: 'Twin', price: 54.99 },
        { type: 'size', value: 'Full', name: 'Full', price: 64.99 },
      ],
    },
    {
      name: 'Unicorn Dreams Pillow Set',
      slug: 'unicorn-dreams-pillow-set',
      description:
        'Magical unicorn pillows that sparkle and shine. Perfect for creating a dreamy bedroom atmosphere.',
      shortDescription: 'Magical unicorn pillows with sparkle',
      price: 39.99,
      categoryId: categories[6].id,
      sku: 'KIDS-005',
      tags: ['unicorn', 'magical', 'sparkle', 'dreams'],
      rating: 4.8,
      ratingCount: 234,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
      ],
      variants: [
        { type: 'color', value: 'Rainbow', name: 'Rainbow' },
        { type: 'color', value: 'Pink', name: 'Pink & Gold' },
      ],
    },
    {
      name: 'Sports Champions Bedding',
      slug: 'sports-champions-bedding',
      description:
        'Score big with this sports-themed bedding featuring footballs, basketballs, and soccer balls.',
      shortDescription: 'Multi-sport theme for little athletes',
      price: 64.99,
      categoryId: categories[6].id,
      sku: 'KIDS-006',
      tags: ['sports', 'champions', 'athletic', 'multi-sport'],
      rating: 4.4,
      ratingCount: 178,
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
      ],
      variants: [
        { type: 'size', value: 'Twin', name: 'Twin', price: 64.99 },
        { type: 'size', value: 'Full', name: 'Full', price: 74.99 },
      ],
    },

    // HOME DECOR
    {
      name: 'Bohemian Macrame Wall Hanging',
      slug: 'bohemian-macrame-wall-hanging',
      description:
        'Add boho chic style to your walls with this handcrafted macrame wall hanging. Made from natural cotton cord with intricate knotting patterns.',
      shortDescription: 'Handcrafted macrame in natural cotton cord',
      price: 69.99,
      categoryId: categories[7].id,
      sku: 'DECOR-001',
      tags: ['macrame', 'bohemian', 'handcrafted', 'wall-decor'],
      rating: 4.6,
      ratingCount: 89,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2058&q=80',
      ],
      variants: [
        { type: 'size', value: 'Small', name: 'Small (24")', price: 69.99 },
        { type: 'size', value: 'Large', name: 'Large (36")', price: 99.99 },
      ],
    },
    {
      name: 'Decorative Throw Pillows Set',
      slug: 'decorative-throw-pillows-set',
      description:
        'Transform your living space with this coordinated set of decorative throw pillows in various textures and patterns.',
      shortDescription: 'Coordinated set with varied textures',
      price: 89.99,
      categoryId: categories[7].id,
      sku: 'DECOR-002',
      tags: ['throw-pillows', 'decorative', 'coordinated', 'textures'],
      rating: 4.5,
      ratingCount: 167,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2058&q=80',
      ],
      variants: [
        { type: 'color', value: 'Neutral', name: 'Neutral Tones' },
        { type: 'color', value: 'Bold', name: 'Bold Colors' },
      ],
    },
    {
      name: 'Tapestry Wall Art',
      slug: 'tapestry-wall-art',
      description:
        'Large tapestry featuring intricate mandala designs. Perfect for creating a focal point in any room.',
      shortDescription: 'Intricate mandala design tapestry',
      price: 45.99,
      categoryId: categories[7].id,
      sku: 'DECOR-003',
      tags: ['tapestry', 'mandala', 'wall-art', 'focal-point'],
      rating: 4.3,
      ratingCount: 234,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2058&q=80',
      ],
      variants: [
        { type: 'color', value: 'Blue', name: 'Ocean Blue' },
        { type: 'color', value: 'Purple', name: 'Royal Purple' },
      ],
    },
    {
      name: 'Woven Table Runner',
      slug: 'woven-table-runner',
      description:
        'Elegant woven table runner that adds sophistication to your dining table. Perfect for special occasions or everyday use.',
      shortDescription: 'Elegant woven design for dining tables',
      price: 29.99,
      categoryId: categories[7].id,
      sku: 'DECOR-004',
      tags: ['table-runner', 'woven', 'elegant', 'dining'],
      rating: 4.4,
      ratingCount: 145,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2058&q=80',
      ],
      variants: [
        { type: 'color', value: 'Gold', name: 'Gold Accent' },
        { type: 'color', value: 'Silver', name: 'Silver Accent' },
      ],
    },
    {
      name: 'Moroccan Pouf Ottoman',
      slug: 'moroccan-pouf-ottoman',
      description:
        'Handcrafted Moroccan pouf that serves as both seating and storage. Adds an exotic touch to any space.',
      shortDescription: 'Handcrafted Moroccan with dual function',
      price: 119.99,
      categoryId: categories[7].id,
      sku: 'DECOR-005',
      tags: ['moroccan', 'pouf', 'handcrafted', 'storage'],
      rating: 4.7,
      ratingCount: 98,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2058&q=80',
      ],
      variants: [
        { type: 'color', value: 'Natural', name: 'Natural Leather' },
        { type: 'color', value: 'Black', name: 'Black Leather' },
      ],
    },
    {
      name: 'Vintage Persian Rug',
      slug: 'vintage-persian-rug',
      description:
        'Authentic vintage-style Persian rug with intricate patterns and rich colors. A statement piece for any room.',
      shortDescription: 'Authentic vintage style with rich patterns',
      price: 299.99,
      categoryId: categories[7].id,
      sku: 'DECOR-006',
      tags: ['persian', 'vintage', 'authentic', 'statement'],
      rating: 4.8,
      ratingCount: 67,
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2058&q=80',
      ],
      variants: [
        { type: 'size', value: 'Medium', name: '5x8 ft', price: 299.99 },
        { type: 'size', value: 'Large', name: '8x10 ft', price: 499.99 },
      ],
    },
  ]

  console.log('🛍️ Creating products...')

  for (const productData of productsData) {
    const { images, variants, specifications, ...product } = productData

    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        discountPercentage: product.originalPrice
          ? Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100
            )
          : null,
      },
    })

    // Create images
    if (images) {
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            url: images[i],
            alt: `${product.name} - Image ${i + 1}`,
            isPrimary: i === 0,
            sortOrder: i,
            productId: createdProduct.id,
          },
        })
      }
    }

    // Create variants
    if (variants) {
      for (const variant of variants) {
        await prisma.productVariant.create({
          data: {
            ...variant,
            productId: createdProduct.id,
          },
        })
      }
    }

    // Create specifications
    if (specifications) {
      for (const spec of specifications) {
        await prisma.productSpecification.create({
          data: {
            ...spec,
            productId: createdProduct.id,
          },
        })
      }
    }

    // Create sample reviews
    const reviewsCount = Math.floor(Math.random() * 5) + 1
    for (let i = 0; i < reviewsCount; i++) {
      await prisma.productReview.create({
        data: {
          userName: `Customer ${i + 1}`,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          title: 'Great product!',
          comment:
            'I love this product. Great quality and exactly as described.',
          productId: createdProduct.id,
          isVerifiedPurchase: Math.random() > 0.3,
        },
      })
    }
  }

  console.log(
    `✅ Created ${productsData.length} products with images, variants, and reviews`
  )
  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
