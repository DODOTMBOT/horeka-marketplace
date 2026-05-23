import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getUnreadCount } from '@/actions/notifications'
import { prisma } from '@/lib/prisma'
import DashboardSidebar from '@/components/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const [user, unreadCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { avatarUrl: true },
    }),
    getUnreadCount(),
  ])

  const isSeller = session.role === 'SELLER' || session.role === 'ADMIN'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper, #F6F4ED)' }}>
      <DashboardSidebar
        name={session.name}
        role={session.role}
        avatarUrl={user?.avatarUrl}
        unreadCount={unreadCount}
        isSeller={isSeller}
      />
      <div style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}
