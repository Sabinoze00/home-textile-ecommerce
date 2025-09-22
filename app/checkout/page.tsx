import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { CheckoutClient } from '@/components/checkout/CheckoutClient'

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin?callbackUrl=/checkout')
  }

  // Note: Cart validation is done on client side since cart is stored in localStorage/zustand
  // The middleware will also protect this route

  return <CheckoutClient />
}
