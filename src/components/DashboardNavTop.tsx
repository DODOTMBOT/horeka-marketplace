'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/actions/auth'
import { LogoMark } from './Logo'

type NavCfg = {
  logoImageUrl?: string | null
  logoText?: string | null
  showIcon?: boolean
}

type Props = {
  name: string
  role: string
  avatarUrl?: string | null
  isSeller: boolean
  unreadCount: number
  navCfg: NavCfg
}

export default function DashboardNavTop({ name, role, avatarUrl, isSeller, unreadCount, navCfg }: Props) {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  const links = [
    { href: '/dashboard', label: 'Обзор', exact: true },
    ...(isSeller ? [
      { href: '/dashboard/services', label: 'Мои услуги' },
      { href: '/dashboard/orders/incoming', label: 'Входящие заказы' },
    ] : [
      { href: '/dashboard/orders', label: 'Мои заказы' },
      { href: '/dashboard/favorites', label: 'Избранное' },
    ]),
    { href: '/dashboard/messages', label: 'Сообщения', badge: unreadCount },
    { href: '/dashboard/notifications', label: 'Уведомления' },
    { href: '/dashboard/profile', label: 'Профиль' },
  ]

  return (
    <header style={{
      background: 'var(--paper)',
      borderBottom: '1px solid var(--line)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto', padding: '0 28px',
        height: '72px', display: 'flex', alignItems: 'center', gap: '24px',
      }}>
        {/* Logo — same logic as Navbar */}
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          {navCfg.logoImageUrl ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={navCfg.logoImageUrl}
                alt={navCfg.logoText || 'logo'}
                style={{ height: '40px', width: 'auto', display: 'block', objectFit: 'contain' }}
              />
              {navCfg.logoText && (
                <span style={{
                  fontFamily: 'var(--ff-display)', fontWeight: 800,
                  fontSize: '18px', color: 'var(--ink)',
                  letterSpacing: '-0.04em', lineHeight: 1,
                }}>
                  {navCfg.logoText}
                </span>
              )}
            </div>
          ) : navCfg.showIcon ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <LogoMark size={34} />
              {navCfg.logoText && (
                <span style={{
                  fontFamily: 'var(--ff-display)', fontWeight: 800,
                  fontSize: '18px', color: 'var(--ink)',
                  letterSpacing: '-0.04em', lineHeight: 1,
                }}>
                  {navCfg.logoText}
                </span>
              )}
            </div>
          ) : (
            <span style={{
              fontFamily: 'var(--ff-display)', fontWeight: 800,
              fontSize: '20px', color: 'var(--ink)',
              letterSpacing: '-0.04em', lineHeight: 1,
            }}>
              {navCfg.logoText || 'unit one'}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', background: 'var(--line)', flexShrink: 0 }} />

        {/* Dashboard nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', overflowX: 'auto', flex: 1 }}>
          {links.map(link => {
            const active = isActive(link.href, link.exact)
            return (
              <Link key={link.href} href={link.href} style={{
                position: 'relative',
                padding: '7px 12px', borderRadius: 'var(--r-sm)',
                fontSize: '13px', fontWeight: active ? 700 : 500,
                color: active ? 'var(--ink)' : 'var(--muted)',
                background: active ? 'var(--paper-2)' : 'transparent',
                textDecoration: 'none', whiteSpace: 'nowrap',
                transition: 'background 0.12s, color 0.12s',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                {link.label}
                {link.badge && link.badge > 0 && !active && (
                  <span style={{
                    background: 'var(--blue)', color: '#fff',
                    fontSize: '10px', fontWeight: 700,
                    borderRadius: '50px', padding: '1px 6px', lineHeight: '16px',
                  }}>
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: user + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: 'auto' }}>
          {isSeller && (
            <Link href="/dashboard/services/new" style={{
              padding: '8px 16px', borderRadius: 'var(--r-sm)',
              background: 'var(--ink)', color: 'var(--paper)',
              fontSize: '12px', fontWeight: 700, textDecoration: 'none',
              whiteSpace: 'nowrap', letterSpacing: '-0.01em',
            }}>
              + Услуга
            </Link>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '5px 10px 5px 5px', borderRadius: '999px',
            border: '1px solid var(--line)',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--ink)', color: 'var(--lime)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '10px',
              }}>
                {initials}
              </div>
            )}
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name.split(' ')[0]}
            </span>
          </div>

          <form action={logout}>
            <button type="submit" style={{
              padding: '8px 14px', borderRadius: 'var(--r-sm)',
              background: 'transparent', border: '1px solid var(--line)',
              fontSize: '12px', color: 'var(--muted)', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Выйти
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
