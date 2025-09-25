import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    // Admin Credentials Provider (solo per sviluppo)
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin Login',
      credentials: {
        isAdmin: { label: 'Admin', type: 'text' },
      },
      async authorize(credentials) {
        // Solo per sviluppo
        if (process.env.NODE_ENV !== 'development') {
          return null
        }

        if (credentials?.isAdmin === 'true') {
          // Trova l'utente admin dal database
          const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
          })

          if (admin) {
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role,
            }
          }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
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
    async signIn({ user, account, profile }) {
      // Per il provider admin-login, permetti sempre il login
      if (account?.provider === 'admin-login') {
        return true
      }

      return true
    },
  },
  events: {
    async createUser({ user }) {
      console.log('New user created:', user.email || `${user.name} (no email)`)
    },
  },
}