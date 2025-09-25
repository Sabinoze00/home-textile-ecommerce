# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without changes

### Database (Prisma + PostgreSQL)

- `npm run db:generate` - Generate Prisma client after schema changes
- `npm run db:migrate` - Run database migrations in development
- `npm run db:push` - Push schema changes to database (for prototyping)
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio database GUI

## Architecture Overview

This is a Next.js 14 e-commerce application for home textiles built with modern full-stack patterns.

### Tech Stack

- **Framework**: Next.js 14 with App Router and Server Components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v4 with multi-provider support (Google, GitHub, Email)
- **State Management**: Zustand for client state, TanStack Query for server state caching
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Forms**: React Hook Form with Zod runtime validation
- **Payments**: Stripe and PayPal integration with webhook handling
- **Typography**: Playfair Display for headings, Lato for body text

### Key Architectural Patterns

**Data Fetching & State Management:**

- TanStack Query for server state with custom hooks (`use-products.ts`, `use-cart.ts`)
- Zustand with persist middleware for cart state synchronized with localStorage
- Server Components for initial data loading, Client Components for interactivity

**Type Safety & Validation:**

- End-to-end TypeScript from database schema to React components
- Zod schemas for API validation and client-side form validation
- Prisma generates type-safe database client

**Component Architecture:**

- shadcn/ui base components with custom business logic layers
- Feature-based organization (auth, cart, checkout, product, account)
- Compound component patterns for complex UI like ProductCard

### Database Schema

**Core Entities:**

- **Products** with variants (colors, sizes, materials), specifications, images, and reviews
- **Categories** with hierarchical structure and custom badges
- **Users** integrated with NextAuth.js, supporting roles (USER/ADMIN)
- **Orders** with complete lifecycle tracking, payment metadata, and addresses
- **Cart** with persistent items and real-time calculations

**Business Logic:**

- Cart calculations: 8% tax, $9.99 shipping, free shipping over $75
- Product variants with individual pricing and stock management
- Payment processing with dual provider support and webhook idempotency

### API Design

**RESTful Endpoints:**

- `/api/products` - Advanced filtering, sorting, pagination, and search
- `/api/products/[slug]` - Individual product details with variants
- `/api/orders` - Order management with status tracking
- `/api/checkout` - Payment processing with Stripe/PayPal
- `/api/search` - Full-text search with relevance scoring
- `/api/admin/*` - Administrative endpoints with role protection

**Advanced Features:**

- Complex Prisma queries with AND/OR filtering logic
- Cursor-based pagination for performance
- Real-time search with debouncing and result caching
- Webhook endpoints for payment provider callbacks

### State Management

**Client State (Zustand):**

- Shopping cart with persistence and automatic total calculations
- UI state for modals, filters, and temporary form data
- User preferences and settings

**Server State (TanStack Query):**

- Product catalog with intelligent caching and background updates
- User orders and account data with real-time synchronization
- Search results with debounced queries and stale-while-revalidate strategy

### Key Files and Utilities

**`lib/utils.ts` - Core Business Logic:**

- `calculateCartTotals()` - Tax, shipping, and discount calculations
- `sortProducts()` - Multi-criteria sorting (price, rating, date, popularity)
- `filterProducts()` - Complex filtering with category, price range, variants
- `formatPrice()`, `debounce()`, `parseSearchParams()` - Common utilities

**`lib/auth.ts`** - NextAuth.js configuration with Prisma adapter
**`prisma/schema.prisma`** - Complete e-commerce database schema
**`middleware.ts`** - Route protection for `/account` and `/admin` paths
**`components/providers/Providers.tsx`** - Application-wide context providers

### Styling System

**Design Tokens:**

- Custom color palette: textile-navy, textile-sage, textile-terracotta, textile-cream
- Typography scale with Playfair Display (headings) and Lato (body)
- Responsive breakpoints with mobile-first approach

**Component Styling:**

- Tailwind utility classes with custom CSS variables
- shadcn/ui components with variant-based styling using class-variance-authority
- Global styles in `app/globals.css` with theme-aware CSS custom properties

### Development Notes

**Performance Optimizations:**

- Server Components for SEO and initial loading performance
- Image optimization with Next.js Image component
- Strategic database indexing on search and filter fields
- Query caching and prefetching with TanStack Query

**Common Patterns:**

- Fetch requests in Server Components should avoid self-referential calls during build
- Cart state automatically syncs between client and localStorage
- All forms use React Hook Form with Zod validation schemas
- Error boundaries and loading states handled consistently across components

**Payment Integration:**

- Stripe and PayPal webhooks require proper idempotency handling
- Payment metadata stored as JSON in orders table
- Test credentials configured via environment variables

## Recent Product Page Enhancements

### Product Detail Page Layout

**Optimized Mobile-First Design:**

- Compact layout with reduced padding for better mobile experience
- Brand (12px underlined) + Product title (18px) positioned at top
- Breadcrumb navigation with 11px font size (product name removed from breadcrumb)

**Visual Elements:**

- Product badges (Sale, Bestseller, New, etc.) positioned over top-left of main product image
- Heart icon for wishlist functionality positioned in top-right of main image
- Dynamic pricing that updates based on selected product variants

**Interactive Components:**

- Streamlined variant selectors with compact button design
- Synchronized quantity controls between main section and sticky cart
- Real-time availability status with estimated delivery dates (changes based on time of day)

### Sticky Cart Implementation

**Smart Behavior:**

- Appears on page load and follows user scroll
- Automatically hides when user scrolls to the actual cart section
- Full-width responsive design with quantity selector + add to cart button
- Displays current price and free shipping message

### Information Architecture

**Expandable Product Details:**

- Collapsible sections with Playfair Display titles (20px, bold) and 14px content
- Product Overview, Size Information, Care Instructions, Shipping & Returns, Certifications
- Default open state for Product Overview section

**Related Products:**

- Horizontal scrolling layout for "You Might Also Like" section
- Title styled at 24px for visual hierarchy
- Responsive design showing 2-6 products depending on screen size

### Technical Implementation Notes

**State Management:**

- Unified quantity state shared between main and sticky cart components
- Real-time price updates based on variant selection
- Proper cart integration with Zustand store using correct API signature

**Component Architecture:**

- Custom Collapsible component with consistent styling
- Enhanced ProductDetailClient with sticky cart logic
- Modified AddToCartWithQuantity component to support external quantity synchronization
