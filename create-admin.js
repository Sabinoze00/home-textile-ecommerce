const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Crea un utente admin con email e password fittizi
    const admin = await prisma.user.upsert({
      where: { email: 'admin@admin.com' },
      update: { role: 'ADMIN' },
      create: {
        email: 'admin@admin.com',
        name: 'Admin User',
        role: 'ADMIN',
      },
    })

    console.log('✅ Utente admin creato con successo!')
    console.log('📧 Email: admin@admin.com')
    console.log(
      '🔑 Vai su http://localhost:3000/auth/signin e accedi con questa email'
    )
    console.log('👤 Role:', admin.role)
  } catch (error) {
    console.error('❌ Errore:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
