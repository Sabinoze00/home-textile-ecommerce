import {
  cn,
  formatPrice,
  formatDate,
  slugify,
  truncate,
  CART_CONSTANTS,
  calculateCartTotals,
  getInitials,
  debounce,
  throttle,
  isValidEmail,
  generateId,
  capitalize,
  getBreakpointValue,
  isMobile,
  isTablet,
  isDesktop,
  calculateDiscountPercentage,
  formatRating,
  generateProductSlug,
  getImageUrl,
  sortProducts,
  filterProducts,
  buildSearchParams,
  parseSearchParams,
  generateOrderNumber,
  formatOrderNumber,
} from '../utils'

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('p-4', 'bg-red-500')).toBe('p-4 bg-red-500')
      expect(cn('p-4', { 'bg-red-500': true, 'text-white': false })).toBe(
        'p-4 bg-red-500'
      )
    })
  })

  describe('formatPrice', () => {
    it('should format USD price by default', () => {
      expect(formatPrice(29.99)).toBe('$29.99')
      expect(formatPrice(100)).toBe('$100.00')
    })

    it('should format different currencies', () => {
      expect(formatPrice(29.99, { currency: 'EUR' })).toBe('€29.99')
      expect(formatPrice(29.99, { currency: 'GBP' })).toBe('£29.99')
    })

    it('should handle zero and negative values', () => {
      expect(formatPrice(0)).toBe('$0.00')
      expect(formatPrice(-10.5)).toBe('-$10.50')
    })

    it('should format with compact notation', () => {
      expect(formatPrice(1000, { notation: 'compact' })).toMatch(
        /^\$1(\.\d+)?K$/
      )
    })
  })

  describe('formatDate', () => {
    it('should format date with default options', () => {
      const date = new Date('2023-12-25')
      expect(formatDate(date)).toBe('December 25, 2023')
    })

    it('should accept custom options', () => {
      const date = new Date('2023-12-25')
      expect(formatDate(date, { month: 'short', day: '2-digit' })).toBe(
        'Dec 25, 2023'
      )
    })

    it('should handle string and number inputs', () => {
      expect(formatDate('2023-12-25')).toBe('December 25, 2023')
      expect(formatDate(1703462400000, { timeZone: 'UTC' })).toBe(
        'December 25, 2023'
      ) // Unix timestamp
    })
  })

  describe('slugify', () => {
    it('should convert string to slug format', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Cotton Bed Sheets & Pillowcases')).toBe(
        'cotton-bed-sheets-pillowcases'
      )
    })

    it('should handle special characters', () => {
      expect(slugify('Test@#$%^&*()')).toBe('test')
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces')
    })

    it('should handle empty and whitespace strings', () => {
      expect(slugify('')).toBe('')
      expect(slugify('   ')).toBe('')
    })
  })

  describe('truncate', () => {
    it('should truncate strings longer than length', () => {
      expect(truncate('This is a long string', 10)).toBe('This is a ...')
    })

    it('should return original string if shorter than length', () => {
      expect(truncate('Short', 10)).toBe('Short')
    })

    it('should handle exact length strings', () => {
      expect(truncate('Exactly10!', 10)).toBe('Exactly10!')
    })
  })

  describe('calculateCartTotals', () => {
    it('should calculate totals for empty cart', () => {
      const result = calculateCartTotals([])
      expect(result).toEqual({
        subtotal: 0,
        tax: 0,
        shipping: CART_CONSTANTS.SHIPPING_COST,
        total: CART_CONSTANTS.SHIPPING_COST,
        freeShippingRemaining: CART_CONSTANTS.SHIPPING_THRESHOLD,
        qualifiesForFreeShipping: false,
      })
    })

    it('should calculate totals for single item', () => {
      const items = [{ price: 50, quantity: 1 }]
      const result = calculateCartTotals(items)
      expect(result.subtotal).toBe(50)
      expect(result.tax).toBeCloseTo(4, 2) // 8% of 50
      expect(result.shipping).toBe(CART_CONSTANTS.SHIPPING_COST)
      expect(result.total).toBeCloseTo(63.99, 2)
      expect(result.freeShippingRemaining).toBe(25) // 75 - 50
      expect(result.qualifiesForFreeShipping).toBe(false)
    })

    it('should calculate totals for multiple items', () => {
      const items = [
        { price: 25, quantity: 2 },
        { price: 30, quantity: 1 },
      ]
      const result = calculateCartTotals(items)
      expect(result.subtotal).toBe(80) // (25*2) + (30*1)
      expect(result.tax).toBeCloseTo(6.4, 2) // 8% of 80
      expect(result.shipping).toBe(0) // Free shipping over $75
      expect(result.total).toBeCloseTo(86.4, 2)
      expect(result.freeShippingRemaining).toBe(0)
      expect(result.qualifiesForFreeShipping).toBe(true)
    })

    it('should handle free shipping threshold edge case', () => {
      const items = [{ price: 75, quantity: 1 }]
      const result = calculateCartTotals(items)
      expect(result.qualifiesForFreeShipping).toBe(true)
      expect(result.shipping).toBe(0)
      expect(result.freeShippingRemaining).toBe(0)
    })

    it('should calculate totals just under free shipping threshold', () => {
      const items = [{ price: 74.99, quantity: 1 }]
      const result = calculateCartTotals(items)
      expect(result.qualifiesForFreeShipping).toBe(false)
      expect(result.shipping).toBe(CART_CONSTANTS.SHIPPING_COST)
      expect(result.freeShippingRemaining).toBeCloseTo(0.01, 2)
    })
  })

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
      expect(getInitials('Mary Jane Watson')).toBe('MJ')
    })

    it('should handle single name', () => {
      expect(getInitials('John')).toBe('J')
    })

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('')
    })
  })

  describe('debounce', () => {
    jest.useFakeTimers()

    it('should debounce function calls', () => {
      const mockFn = jest.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')

      expect(mockFn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg3')
    })

    afterEach(() => {
      jest.clearAllTimers()
    })
  })

  describe('throttle', () => {
    jest.useFakeTimers()

    it('should throttle function calls', () => {
      const mockFn = jest.fn()
      const throttledFn = throttle(mockFn, 100)

      throttledFn('arg1')
      throttledFn('arg2')
      throttledFn('arg3')

      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg1')

      jest.advanceTimersByTime(100)

      throttledFn('arg4')
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenCalledWith('arg4')
    })

    afterEach(() => {
      jest.clearAllTimers()
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@example')).toBe(false)
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(id1.length).toBe(9)
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('WORLD')).toBe('World')
    })

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('')
    })
  })

  describe('getBreakpointValue', () => {
    it('should return correct breakpoint values', () => {
      expect(getBreakpointValue('sm')).toBe(640)
      expect(getBreakpointValue('md')).toBe(768)
      expect(getBreakpointValue('lg')).toBe(1024)
      expect(getBreakpointValue('xl')).toBe(1280)
      expect(getBreakpointValue('2xl')).toBe(1536)
    })
  })

  describe('Device detection functions', () => {
    const originalInnerWidth = window.innerWidth

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      })
    })

    describe('isMobile', () => {
      it('should return true for mobile widths', () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 767,
        })
        expect(isMobile()).toBe(true)
      })

      it('should return false for non-mobile widths', () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768,
        })
        expect(isMobile()).toBe(false)
      })
    })

    describe('isTablet', () => {
      it('should return true for tablet widths', () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 800,
        })
        expect(isTablet()).toBe(true)
      })

      it('should return false for non-tablet widths', () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 600,
        })
        expect(isTablet()).toBe(false)
      })
    })

    describe('isDesktop', () => {
      it('should return true for desktop widths', () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1200,
        })
        expect(isDesktop()).toBe(true)
      })

      it('should return false for non-desktop widths', () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 800,
        })
        expect(isDesktop()).toBe(false)
      })
    })
  })

  describe('calculateDiscountPercentage', () => {
    it('should calculate correct discount percentage', () => {
      expect(calculateDiscountPercentage(100, 80)).toBe(20)
      expect(calculateDiscountPercentage(50, 25)).toBe(50)
    })

    it('should handle edge cases', () => {
      expect(calculateDiscountPercentage(100, 100)).toBe(0)
      expect(calculateDiscountPercentage(10, 5)).toBe(50)
    })
  })

  describe('formatRating', () => {
    it('should format rating to one decimal place', () => {
      expect(formatRating(4.5)).toBe('4.5')
      expect(formatRating(4.567)).toBe('4.6')
      expect(formatRating(5)).toBe('5.0')
    })
  })

  describe('generateProductSlug', () => {
    it('should generate slug from product name', () => {
      expect(generateProductSlug('Cotton Bed Sheets')).toBe('cotton-bed-sheets')
      expect(generateProductSlug('Luxury Towel Set')).toBe('luxury-towel-set')
    })
  })

  describe('getImageUrl', () => {
    it('should return original URL without parameters', () => {
      const url = 'https://example.com/image.jpg'
      expect(getImageUrl(url)).toBe(url)
    })

    it('should add parameters for Unsplash images', () => {
      const url = 'https://images.unsplash.com/photo-123'
      const result = getImageUrl(url, 400, 300)
      expect(result).toContain('w=400')
      expect(result).toContain('h=300')
      expect(result).toContain('fit=crop')
      expect(result).toContain('auto=format')
    })

    it('should handle non-Unsplash URLs with parameters', () => {
      const url = 'https://example.com/image.jpg'
      const result = getImageUrl(url, 400, 300)
      expect(result).toBe(url) // Should return original URL for non-Unsplash
    })
  })

  describe('sortProducts', () => {
    const mockProducts = [
      {
        name: 'B Product',
        price: 100,
        rating: { average: 4.5 },
        createdAt: new Date('2023-01-01'),
        isBestseller: false,
      },
      {
        name: 'A Product',
        price: 50,
        rating: { average: 3.5 },
        createdAt: new Date('2023-02-01'),
        isBestseller: true,
      },
      {
        name: 'C Product',
        price: 75,
        rating: { average: 5.0 },
        createdAt: new Date('2023-01-15'),
        isBestseller: false,
      },
    ]

    it('should sort by name', () => {
      const sorted = sortProducts(mockProducts, 'name')
      expect(sorted[0].name).toBe('A Product')
      expect(sorted[1].name).toBe('B Product')
      expect(sorted[2].name).toBe('C Product')
    })

    it('should sort by price', () => {
      const sorted = sortProducts(mockProducts, 'price')
      expect(sorted[0].price).toBe(50)
      expect(sorted[1].price).toBe(75)
      expect(sorted[2].price).toBe(100)
    })

    it('should sort by rating', () => {
      const sorted = sortProducts(mockProducts, 'rating')
      expect(sorted[0].rating!.average).toBe(3.5)
      expect(sorted[1].rating!.average).toBe(4.5)
      expect(sorted[2].rating!.average).toBe(5.0)
    })

    it('should sort by newest', () => {
      const sorted = sortProducts(mockProducts, 'newest')
      expect(sorted[0].createdAt).toEqual(new Date('2023-02-01'))
      expect(sorted[1].createdAt).toEqual(new Date('2023-01-15'))
      expect(sorted[2].createdAt).toEqual(new Date('2023-01-01'))
    })

    it('should sort by bestseller', () => {
      const sorted = sortProducts(mockProducts, 'bestseller')
      expect(sorted[0].isBestseller).toBe(true)
    })

    it('should handle descending order', () => {
      const sorted = sortProducts(mockProducts, 'price', 'desc')
      expect(sorted[0].price).toBe(100)
      expect(sorted[1].price).toBe(75)
      expect(sorted[2].price).toBe(50)
    })
  })

  describe('filterProducts', () => {
    const mockProducts = [
      {
        name: 'Cotton Bed Sheets',
        description: 'Soft cotton bedding',
        price: 50,
        category: { slug: 'bedding' },
        variants: [
          { type: 'color', value: 'white' },
          { type: 'size', value: 'queen' },
        ],
        rating: { average: 4.5 },
        inStock: true,
        isOnSale: false,
      },
      {
        name: 'Luxury Towels',
        description: 'Premium bath towels',
        price: 80,
        category: { slug: 'towels' },
        variants: [
          { type: 'color', value: 'blue' },
          { type: 'size', value: 'large' },
        ],
        rating: { average: 3.5 },
        inStock: false,
        isOnSale: true,
      },
      {
        name: 'Silk Pillowcase',
        description: 'Smooth silk pillow cover',
        price: 120,
        category: { slug: 'bedding' },
        variants: [
          { type: 'color', value: 'white' },
          { type: 'size', value: 'standard' },
        ],
        rating: { average: 5.0 },
        inStock: true,
        isOnSale: false,
      },
    ]

    it('should filter by text query', () => {
      const filtered = filterProducts(mockProducts, { query: 'cotton' })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Cotton Bed Sheets')
    })

    it('should filter by category', () => {
      const filtered = filterProducts(mockProducts, { category: 'bedding' })
      expect(filtered).toHaveLength(2)
    })

    it('should filter by price range', () => {
      const filtered = filterProducts(mockProducts, {
        priceRange: { min: 60, max: 100 },
      })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Luxury Towels')
    })

    it('should filter by colors', () => {
      const filtered = filterProducts(mockProducts, { colors: ['white'] })
      expect(filtered).toHaveLength(2)
    })

    it('should filter by sizes', () => {
      const filtered = filterProducts(mockProducts, { sizes: ['queen'] })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Cotton Bed Sheets')
    })

    it('should filter by rating', () => {
      const filtered = filterProducts(mockProducts, { rating: 4.0 })
      expect(filtered).toHaveLength(2)
    })

    it('should filter by stock status', () => {
      const filtered = filterProducts(mockProducts, { inStock: true })
      expect(filtered).toHaveLength(2)
    })

    it('should filter by sale status', () => {
      const filtered = filterProducts(mockProducts, { onSale: true })
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Luxury Towels')
    })

    it('should handle multiple filters', () => {
      const filtered = filterProducts(mockProducts, {
        category: 'bedding',
        inStock: true,
        colors: ['white'],
      })
      expect(filtered).toHaveLength(2)
    })
  })

  describe('buildSearchParams', () => {
    it('should build search params from object', () => {
      const params = { category: 'bedding', colors: ['white', 'blue'], page: 1 }
      const result = buildSearchParams(params)
      expect(result).toContain('category=bedding')
      expect(result).toContain('colors=white%2Cblue')
      expect(result).toContain('page=1')
    })

    it('should ignore undefined and null values', () => {
      const params = {
        category: 'bedding',
        color: null,
        size: undefined,
        search: '',
      }
      const result = buildSearchParams(params)
      expect(result).toBe('category=bedding')
    })

    it('should handle empty arrays', () => {
      const params = { category: 'bedding', colors: [] }
      const result = buildSearchParams(params)
      expect(result).toBe('category=bedding')
    })
  })

  describe('parseSearchParams', () => {
    it('should parse search params correctly', () => {
      const searchParams = new URLSearchParams(
        'category=bedding&colors=white,blue&inStock=true&minPrice=50'
      )
      const result = parseSearchParams(searchParams)

      expect(result.category).toBe('bedding')
      expect(result.colors).toEqual(['white', 'blue'])
      expect(result.inStock).toBe(true)
      expect(result.minPrice).toBe(50)
    })

    it('should handle boolean values', () => {
      const searchParams = new URLSearchParams('inStock=true&onSale=false')
      const result = parseSearchParams(searchParams)

      expect(result.inStock).toBe(true)
      expect(result.onSale).toBe(false)
    })

    it('should handle numeric values', () => {
      const searchParams = new URLSearchParams(
        'minPrice=50&maxPrice=100&rating=4'
      )
      const result = parseSearchParams(searchParams)

      expect(result.minPrice).toBe(50)
      expect(result.maxPrice).toBe(100)
      expect(result.rating).toBe(4)
    })

    it('should handle empty comma-separated values', () => {
      const searchParams = new URLSearchParams('colors=white,,blue')
      const result = parseSearchParams(searchParams)

      expect(result.colors).toEqual(['white', 'blue'])
    })
  })

  describe('generateOrderNumber', () => {
    it('should generate order number with correct format', () => {
      const orderNumber = generateOrderNumber()
      expect(orderNumber).toMatch(/^ORD-\d{6}-[A-Z0-9]{6}$/)
    })

    it('should generate unique order numbers', () => {
      const order1 = generateOrderNumber()
      const order2 = generateOrderNumber()
      expect(order1).not.toBe(order2)
    })
  })

  describe('formatOrderNumber', () => {
    it('should format order number from date', () => {
      const date = new Date('2023-12-25T10:30:45.123Z')
      const orderNumber = formatOrderNumber(date)
      expect(orderNumber).toMatch(/^20231225103045-[A-Z0-9]{4}$/)
    })

    it('should use current date when no date provided', () => {
      const orderNumber = formatOrderNumber()
      expect(orderNumber).toMatch(/^\d{14}-[A-Z0-9]{4}$/)
    })
  })
})
