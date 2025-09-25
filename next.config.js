/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      {
        source: '/bedding',
        destination: '/collections/bedding',
        permanent: false,
      },
      {
        source: '/sheets',
        destination: '/collections/sheets',
        permanent: false,
      },
      {
        source: '/comforters',
        destination: '/collections/comforters',
        permanent: false,
      },
      {
        source: '/pillows',
        destination: '/collections/pillows',
        permanent: false,
      },
      {
        source: '/bath',
        destination: '/collections/bath',
        permanent: false,
      },
      {
        source: '/mattress',
        destination: '/collections/mattress',
        permanent: false,
      },
      {
        source: '/loungewear',
        destination: '/collections/loungewear',
        permanent: false,
      },
      {
        source: '/kids-baby',
        destination: '/collections/kids-baby',
        permanent: false,
      },
      {
        source: '/home-decor',
        destination: '/collections/home-decor',
        permanent: false,
      },
      {
        source: '/outdoor',
        destination: '/collections/outdoor',
        permanent: false,
      },
      {
        source: '/new',
        destination: '/collections/new',
        permanent: false,
      },
      {
        source: '/sale',
        destination: '/collections/sale',
        permanent: false,
      },
    ]
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
