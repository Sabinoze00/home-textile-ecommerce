import type { Metadata } from 'next'
import { Lato, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from '@/components/providers/Providers'

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair-display',
})

export const metadata: Metadata = {
  title: 'Home Textile Store - Quality Bedding & Home Decor',
  description:
    'Discover premium bedding, comforters, sheets, and home textiles. Transform your space with our curated collection of quality home goods.',
  keywords: [
    'bedding',
    'sheets',
    'comforters',
    'home textiles',
    'home decor',
    'quality bedding',
  ],
  authors: [{ name: 'Home Textile Store' }],
  creator: 'Home Textile Store',
  publisher: 'Home Textile Store',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hometextilestore.com',
    title: 'Home Textile Store - Quality Bedding & Home Decor',
    description:
      'Discover premium bedding, comforters, sheets, and home textiles.',
    siteName: 'Home Textile Store',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home Textile Store - Quality Bedding & Home Decor',
    description:
      'Discover premium bedding, comforters, sheets, and home textiles.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${lato.variable} ${playfairDisplay.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
