import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'

function getAdminCredentialsProvider() {
  const enableAdminCredentials = process.env.ENABLE_ADMIN_CREDENTIALS === 'true'
  const nodeEnv = process.env.NODE_ENV
  const adminAllowedIps =
    process.env.ADMIN_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || []

  // Security check: ensure admin credentials are disabled by default
  if (!enableAdminCredentials) {
    return []
  }

  // Security warning: log when admin credentials are enabled
  console.warn('⚠️  SECURITY WARNING: Admin credentials provider is ENABLED')
  console.warn(
    '⚠️  This should only be used for development or emergency access'
  )
  console.warn(
    '⚠️  Consider using database seeding for admin user creation instead'
  )

  // Production environment check
  if (nodeEnv === 'production') {
    console.error(
      '🚨 CRITICAL: Admin credentials provider should NOT be enabled in production!'
    )
    console.error('🚨 Set ENABLE_ADMIN_CREDENTIALS=false or remove it entirely')

    // Optionally block in production entirely
    if (process.env.FORCE_DISABLE_ADMIN_CREDENTIALS_IN_PROD !== 'false') {
      console.error(
        '🚨 Admin credentials provider BLOCKED in production environment'
      )
      return []
    }
  }

  return [
    CredentialsProvider({
      id: 'admin',
      name: 'Admin Login',
      credentials: {
        username: {
          label: 'Admin Username',
          type: 'text',
          placeholder: 'admin',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const adminUsername = process.env.ADMIN_USERNAME
        const adminPassword = process.env.ADMIN_PASSWORD
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com'

        // Get client IP for logging and allowlist check
        const forwardedFor = req?.headers?.['x-forwarded-for']
        const realIp = req?.headers?.['x-real-ip']
        const clientIp =
          (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) ||
          (Array.isArray(realIp) ? realIp[0] : realIp) ||
          'unknown'

        console.warn(`🔐 Admin login attempt from IP: ${clientIp}`)

        // IP allowlist check (if configured)
        if (adminAllowedIps.length > 0) {
          const isAllowedIp = adminAllowedIps.some(allowedIp => {
            if (allowedIp === clientIp) return true
            // Simple CIDR check for localhost variations
            if (
              allowedIp === 'localhost' &&
              (clientIp === '127.0.0.1' || clientIp === '::1')
            )
              return true
            return false
          })

          if (!isAllowedIp) {
            console.error(
              `🚨 Admin login BLOCKED: IP ${clientIp} not in allowlist`
            )
            console.error(`🚨 Allowed IPs: ${adminAllowedIps.join(', ')}`)
            return null
          }
        }

        if (!adminUsername || !adminPassword) {
          console.error(
            '🚨 Admin credentials not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD environment variables.'
          )
          return null
        }

        if (
          credentials?.username === adminUsername &&
          credentials?.password === adminPassword
        ) {
          console.warn(`✅ Admin login successful from IP: ${clientIp}`)

          // Return the admin user from database
          let adminUser = await prisma.user.findUnique({
            where: { email: adminEmail },
          })

          if (!adminUser) {
            console.warn('🔧 Creating admin user in database')
            // Create admin user if it doesn't exist
            adminUser = await prisma.user.create({
              data: {
                email: adminEmail,
                name: 'Admin User',
                role: 'ADMIN',
              },
            })
            console.warn(`✅ Admin user created: ${adminEmail}`)
          }

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
          }
        }

        console.error(
          `🚨 Admin login FAILED: Invalid credentials from IP: ${clientIp}`
        )
        return null
      },
    }),
  ]
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...getAdminCredentialsProvider(),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // Fetch user role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        })
        token.role = dbUser?.role || 'USER'
        token.roleUpdatedAt = Date.now()
      } else if (
        token.id &&
        (!token.roleUpdatedAt ||
          Date.now() - (token.roleUpdatedAt as number) > 10 * 60 * 1000)
      ) {
        // Refresh role every 10 minutes for existing sessions
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        })
        token.role = dbUser?.role || 'USER'
        token.roleUpdatedAt = Date.now()
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account }) {
      // Handle OAuth providers that might not return email
      if (account?.provider === 'github' || account?.provider === 'google') {
        // If no email is provided, we can still allow sign-in
        // The user will be created with name and image only
        if (!user.email) {
          console.log(
            `Sign-in allowed for ${account.provider} user without email:`,
            user.name
          )
        }
        return true
      }

      // For email provider, email is required
      if (account?.provider === 'email') {
        return !!user.email
      }

      return true
    },
  },
  events: {
    async createUser({ user }) {
      // You can add any post-registration logic here
      console.log('New user created:', user.email || `${user.name} (no email)`)
    },
  },
}
