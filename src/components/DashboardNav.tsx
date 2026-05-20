import Link from 'next/link'
import { getSession } from '@/lib/session'
import { logout } from '@/actions/auth'
import { getUnreadCount } from '@/actions/notifications'

export default async function DashboardNav({ active }: { active?: string }) {
  const session = await getSession()
  if (!session) return null

  const isSeller = session.role === 'SELLER' || session.role === 'ADMIN'
  const initials = session.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
  const unreadCount = await getUnreadCount()

  const links = [
    { href: '/dashboard', label: 'Обзор', key: 'dashboard' },
    ...(isSeller
      ? [
          { href: '/dashboard/services', label: 'Мои услуги', key: 'services' },
          { href: '/dashboard/orders/incoming', label: 'Входящие заказы', key: 'incoming' },
        ]
      : [
          { href: '/dashboard/orders', label: 'Мои заказы', key: 'orders' },
        ]),
    { href: '/dashboard/favorites', label: 'Избранное', key: 'favorites' },
    { href: '/dashboard/notifications', label: 'Уведомления', key: 'notifications' },
    { href: '/dashboard/messages', label: 'Сообщения', key: 'messages' },
    { href: '/dashboard/profile', label: 'Профиль', key: 'profile' },
  ]

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
        height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginRight: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>Unit One</span>
          </Link>
          {links.map(link => (
            <Link key={link.key} href={link.href} style={{
              padding: '6px 12px', borderRadius: 'var(--radius-sm)', flexShrink: 0,
              fontSize: '13px', fontWeight: active === link.key ? 600 : 500,
              color: active === link.key ? 'var(--primary)' : 'var(--text-muted)',
              background: active === link.key ? 'var(--primary-light)' : 'transparent',
              whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              {link.label}
              {link.key === 'notifications' && unreadCount > 0 && (
                <span style={{
                  background: 'var(--primary)', color: '#fff',
                  fontSize: '10px', fontWeight: 700,
                  borderRadius: '50px', padding: '1px 6px', lineHeight: '16px',
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '12px',
          }}>
            {initials}
          </div>
          <form action={logout}>
            <button type="submit" style={{
              padding: '6px 14px', borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)', border: '1.5px solid var(--border)',
              fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
            }}>Выйти</button>
          </form>
        </div>
      </div>
    </header>
  )
}
