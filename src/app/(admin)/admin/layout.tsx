import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import AdminPageWrapper from './AdminPageWrapper'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <AdminPageWrapper>{children}</AdminPageWrapper>
    </div>
  )
}
