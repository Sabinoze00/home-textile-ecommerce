import { CheckoutClient } from '@/components/checkout/CheckoutClient'

export default async function CheckoutPage() {
  // Note: Cart validation is done on client side since cart is stored in localStorage/zustand
  // Guest checkout is now supported - authentication is optional

  return <CheckoutClient />
}
