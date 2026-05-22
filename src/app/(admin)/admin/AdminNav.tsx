import Link from 'next/link'
import { logout } from '@/actions/auth'

type NavItem = { href: string; label: string; icon: React.ReactNode }

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Обзор',
    items: [
      {
        href: '/admin',
        label: 'Дашборд',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
      },
    ],
  },
  {
    label: 'Контент',
    items: [
      {
        href: '/admin/services',
        label: 'Услуги',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
      },
      {
        href: '/admin/categories',
        label: 'Категории',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
      },
      {
        href: '/admin/catalog',
        label: 'Каталог',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
      },
      {
        href: '/admin/homepage',
        label: 'Главная',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      },
      {
        href: '/admin/navbar',
        label: 'Шапка',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="5" rx="1"/><path d="M3 11h18M3 16h10"/></svg>,
      },
    ],
  },
  {
    label: 'Пользователи',
    items: [
      {
        href: '/admin/users',
        label: 'Пользователи',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
      },
      {
        href: '/admin/moderation',
        label: 'Модерация',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      },
    ],
  },
  {
    label: 'Финансы',
    items: [
      {
        href: '/admin/orders',
        label: 'Заказы',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
      },
      {
        href: '/admin/finance',
        label: 'Финансы',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
      },
      {
        href: '/admin/payouts',
        label: 'Выплаты',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
      },
    ],
  },
  {
    label: 'Система',
    items: [
      {
        href: '/admin/reviews',
        label: 'Отзывы',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      },
      {
        href: '/admin/notify',
        label: 'Уведомления',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
      },
      {
        href: '/admin/logs',
        label: 'Логи',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
      },
    ],
  },
]

function NavLink({ href, label, icon, isActive }: { href: string; label: string; icon: React.ReactNode; isActive: boolean }) {
  return (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '8px 12px', marginBottom: '1px',
      borderRadius: '10px',
      fontSize: '13px', fontWeight: isActive ? 700 : 500,
      color: isActive ? 'var(--ink)' : 'rgba(255,255,255,0.42)',
      textDecoration: 'none',
      background: isActive ? 'var(--lime)' : 'transparent',
      transition: 'all 0.14s cubic-bezier(0.22,1,0.36,1)',
      letterSpacing: '-0.01em',
      position: 'relative',
    }}>
      <span style={{ opacity: isActive ? 1 : 0.65, flexShrink: 0, color: isActive ? 'var(--ink)' : 'inherit' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {isActive && (
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--ink)', opacity: 0.35, flexShrink: 0 }} />
      )}
    </Link>
  )
}

export default function AdminNav({ active }: { active: string }) {
  return (
    <>
      <style>{`
        .admin-nav-link-hover:hover {
          background: rgba(255,255,255,0.07) !important;
          color: rgba(255,255,255,0.75) !important;
        }
        .admin-nav-footer-btn:hover {
          background: rgba(255,255,255,0.06) !important;
          color: rgba(255,255,255,0.5) !important;
        }
      `}</style>
      <aside style={{
        width: '240px',
        flexShrink: 0,
        background: 'var(--ink)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        fontFamily: 'var(--ff-display)',
      }}>

        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '9px',
                background: 'var(--lime)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div>
                <p style={{
                  fontFamily: 'var(--ff-display)',
                  fontSize: '15px', fontWeight: 800,
                  color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em',
                }}>Unit One</p>
                <p style={{
                  fontFamily: 'var(--ff-mono)',
                  color: 'rgba(255,255,255,0.28)', fontSize: '9px',
                  letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginTop: '1px',
                }}>Admin Panel</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
          {sections.map((section, si) => (
            <div key={si} style={{ marginBottom: '4px' }}>
              <p style={{
                fontFamily: 'var(--ff-mono)',
                fontSize: '9px', fontWeight: 700,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: si === 0 ? '4px 12px 6px' : '14px 12px 6px',
              }}>
                {section.label}
              </p>
              {section.items.map(link => {
                const isActive = active === link.href
                return isActive ? (
                  <NavLink key={link.href} href={link.href} label={link.label} icon={link.icon} isActive />
                ) : (
                  <Link key={link.href} href={link.href} className="admin-nav-link-hover" style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', marginBottom: '1px',
                    borderRadius: '10px',
                    fontSize: '13px', fontWeight: 500,
                    color: 'rgba(255,255,255,0.42)',
                    textDecoration: 'none',
                    background: 'transparent',
                    transition: 'all 0.14s cubic-bezier(0.22,1,0.36,1)',
                    letterSpacing: '-0.01em',
                  }}>
                    <span style={{ opacity: 0.65, flexShrink: 0 }}>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/" className="admin-nav-footer-btn" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 12px', marginBottom: '2px', borderRadius: '10px',
            fontSize: '12px', color: 'rgba(255,255,255,0.28)', textDecoration: 'none',
            transition: 'all 0.14s',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            На сайт
          </Link>
          <form action={logout}>
            <button type="submit" className="admin-nav-footer-btn" style={{
              width: '100%', padding: '8px 12px',
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.22)', fontSize: '12px', fontWeight: 500,
              cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px',
              borderRadius: '10px', fontFamily: 'var(--ff-display)', letterSpacing: '-0.01em',
              transition: 'all 0.14s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Выйти
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
