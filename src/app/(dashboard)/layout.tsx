import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getUnreadCount } from '@/actions/notifications'
import { prisma } from '@/lib/prisma'
import { getNavbarConfig } from '@/lib/siteConfig'
import DashboardNavTop from '@/components/DashboardNavTop'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const [user, unreadCount, navCfg] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { avatarUrl: true },
    }),
    getUnreadCount(),
    getNavbarConfig(),
  ])

  const isSeller = session.role === 'SELLER' || session.role === 'ADMIN'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <DashboardNavTop
        name={session.name}
        role={session.role}
        avatarUrl={user?.avatarUrl}
        isSeller={isSeller}
        unreadCount={unreadCount}
        navCfg={{
          logoImageUrl: navCfg.logoImageUrl,
          logoText: navCfg.logoText,
          showIcon: navCfg.showIcon,
        }}
      />
      {children}
    </div>
  )
}
