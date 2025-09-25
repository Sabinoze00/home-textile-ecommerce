import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

// SOLO PER SVILUPPO - Accesso admin diretto
export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Only available in development' },
      { status: 403 }
    )
  }

  try {
    // Trova l'utente admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Crea un token JWT semplice per NextAuth
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
    const token = await new SignJWT({
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 ore
    })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret)

    // Imposta i cookie di sessione NextAuth
    const sessionCookie = `next-auth.session-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`

    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful',
      redirectTo: '/admin',
    })

    response.headers.set('Set-Cookie', sessionCookie)

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
