'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/actions/auth'

type Props = {
  name: string
  role: string
  avatarUrl?: string | null
  unreadCount: number
  isSeller: boolean
}

const ROLE_LABEL: Record<string, string> = {
  BUYER: 'Покупатель',
  SELLER: 'Исполнитель',
  ADMIN: 'Администратор',
}

function NavLink({ href, label, badge, exact }: { href: string; label: string; badge?: number; exact?: boolean }) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '9px 12px', borderRadius: '8px', textDecoration: 'none',
      background: active ? 'var(--lime)' : 'transparent',
      transition: 'background 0.12s',
    }}>
      <span style={{
        fontSize: '13px', fontWeight: active ? 700 : 500,
        color: active ? 'var(--ink)' : 'rgba(255,255,255,0.72)',
        letterSpacing: active ? '-0.01em' : 'normal',
      }}>
        {label}
      </span>
      {badge && badge > 0 && !active && (
        <span style={{
          background: 'var(--lime)', color: 'var(--ink)',
          fontSize: '10px', fontWeight: 800, borderRadius: '50px',
          padding: '1px 7px', lineHeight: '16px', flexShrink: 0,
        }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}

export default function DashboardSidebar({ name, role, avatarUrl, unreadCount, isSeller }: Props) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <aside style={{
      width: '220px', flexShrink: 0,
      background: 'var(--ink)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 18px 18px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '7px', background: 'var(--lime)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: '#fff', letterSpacing: '-0.02em' }}>
            Unit One
          </span>
        </Link>
      </div>

      {/* User card */}
      <div style={{
        margin: '0 10px 8px',
        padding: '12px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
            background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '13px', color: 'var(--ink)',
          }}>
            {initials}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '13px', color: '#fff', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>
            {ROLE_LABEL[role] ?? role}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <NavLink href="/dashboard" label="Обзор" exact />

        {isSeller ? (
          <>
            <NavLink href="/dashboard/services" label="Мои услуги" />
            <NavLink href="/dashboard/orders/incoming" label="Входящие заказы" />
          </>
        ) : (
          <>
            <NavLink href="/dashboard/orders" label="Мои заказы" />
            <NavLink href="/dashboard/favorites" label="Избранное" />
          </>
        )}

        <NavLink href="/dashboard/messages" label="Сообщения" badge={unreadCount} />
        <NavLink href="/dashboard/notifications" label="Уведомления" />
        <NavLink href="/dashboard/profile" label="Профиль" />

        {isSeller && (
          <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '12px' }}>
            <Link href="/dashboard/services/new" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '9px 12px', borderRadius: '8px', textDecoration: 'none',
              border: '1.5px solid rgba(215,255,58,0.3)',
              background: 'rgba(215,255,58,0.06)',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--lime)' }}>+ Добавить услугу</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/catalog" style={{
          display: 'block', padding: '8px 12px', borderRadius: '8px', textDecoration: 'none',
          fontSize: '12px', color: 'rgba(255,255,255,0.4)',
          marginBottom: '2px',
        }}>
          → Каталог
        </Link>
        <form action={logout}>
          <button type="submit" style={{
            width: '100%', padding: '8px 12px', borderRadius: '8px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            textAlign: 'left', fontSize: '12px', color: 'rgba(255,255,255,0.35)',
          }}>
            Выйти
          </button>
        </form>
      </div>
    </aside>
  )
}
