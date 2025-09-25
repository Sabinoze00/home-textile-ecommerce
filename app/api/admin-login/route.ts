import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Invece di creare cookie JWT manualmente, restituiamo i dati admin
    // Il frontend userà NextAuth signIn() con questi dati
    return NextResponse.json({
      success: true,
      message: 'Admin found',
      adminData: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      }
    })

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
