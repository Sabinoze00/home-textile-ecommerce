# Home Textile E-commerce Store

A modern, responsive e-commerce website built with Next.js 14, TypeScript, and Tailwind CSS, inspired by premium home textile stores like The Company Store.

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 14 App Router, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Component Architecture**: Modular, reusable components with Shadcn/ui integration
- **Performance Optimized**: Image optimization, lazy loading, and modern web practices
- **Type Safety**: Full TypeScript coverage for robust development
- **SEO Ready**: Built-in metadata and OpenGraph support

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Development**: ESLint, Prettier, and modern tooling

## 📦 Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # Base UI components (Button, Input, Badge)
│   ├── layout/           # Layout components (Header, Footer, Navigation)
│   └── home/             # Homepage-specific components
├── lib/                  # Utility functions
│   └── utils.ts          # Common utilities and helper functions
├── types/                # TypeScript type definitions
│   └── index.ts          # Shared interfaces and types
├── public/               # Static assets
│   └── images/           # Image assets organized by category
└── Configuration files   # Next.js, TypeScript, Tailwind, ESLint, etc.
```

## 🎨 Design System

### Colors

- **Primary**: Navy blue for headers and primary actions
- **Secondary**: Sage green for secondary elements
- **Accent**: Terracotta for highlights and calls-to-action
- **Neutral**: Cream and warm tones for backgrounds
- **Typography**: Inter font family for modern readability

### Components

- Responsive navigation with mobile hamburger menu
- Hero section with full-width imagery and overlay text
- Category grid with hover effects and badge system
- Footer with newsletter signup and comprehensive links
- Reusable UI components following Shadcn/ui patterns

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm, yarn, or pnpm package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd home-textile-ecommerce
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🎯 Development Guidelines

### Code Style

- Use TypeScript for all components and utilities
- Follow ESLint and Prettier configurations
- Use Tailwind CSS classes for styling
- Implement responsive design with mobile-first approach
- Use Shadcn/ui components when possible

### Component Development

- Create reusable components in appropriate directories
- Use proper TypeScript interfaces for props
- Follow naming conventions (PascalCase for components)
- Include proper accessibility attributes
- Optimize images using Next.js Image component

### Performance Best Practices

- Use Next.js Image component for optimized images
- Implement proper lazy loading
- Minimize bundle size with tree shaking
- Use semantic HTML elements
- Optimize for Core Web Vitals

## 🌐 Deployment

The application is ready for deployment on platforms like:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Docker containers**

### Build for Production

```bash
npm run build
npm run start
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1280px

## 🔧 Customization

### Adding New Components

1. Create component in appropriate directory
2. Export from component's index file
3. Add TypeScript interfaces in `types/index.ts`
4. Follow existing component patterns

### Extending the Design System

1. Update `tailwind.config.ts` for new colors/spacing
2. Add custom CSS classes in `globals.css`
3. Update component variants as needed

### Adding New Pages

1. Create new route in `app/` directory
2. Follow Next.js 14 App Router conventions
3. Add proper metadata for SEO
4. Implement responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Design inspiration from The Company Store and premium home textile retailers
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Lucide React](https://lucide.dev/) for beautiful icons

---

Built with ❤️ for creating beautiful, functional e-commerce experiences.
