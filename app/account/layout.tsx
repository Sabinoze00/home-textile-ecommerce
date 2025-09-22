import { AccountLayout } from '@/components/account/AccountLayout'

interface AccountLayoutPageProps {
  children: React.ReactNode
}

export default function AccountLayoutPage({
  children,
}: AccountLayoutPageProps) {
  return <AccountLayout>{children}</AccountLayout>
}
