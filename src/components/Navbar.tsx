import Link from 'next/link'
import { getSession } from '@/lib/session'
import { logout } from '@/actions/auth'

export default async function Navbar() {
  const session = await getSession()

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
    }}>
      <div className="nav-grid" style={{
        maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
        height: '68px',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>HoReCa Hub</span>
        </Link>

        {/* Search */}
        <form method="get" action="/catalog" className="nav-search-col" style={{ width: '100%' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)', flexShrink: 0 }}
              width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text" name="search"
              placeholder="Поиск поставщиков и услуг..."
              style={{
                width: '100%',
                padding: '11px 52px 11px 44px',
                borderRadius: '50px',
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                fontSize: '14px',
                color: 'var(--text)',
                transition: 'border-color 0.15s',
              }}
            />
            <button type="submit" style={{
              position: 'absolute', right: '6px',
              padding: '7px 18px', borderRadius: '50px',
              background: 'var(--primary)', color: '#fff',
              fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
            }}>
              Найти
            </button>
          </div>
        </form>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
          {session ? (
            <>
              <Link href="/dashboard" style={{
                padding: '8px 18px', borderRadius: '50px',
                background: 'var(--primary)', color: '#fff',
                fontSize: '13px', fontWeight: 600,
                boxShadow: '0 2px 8px rgba(249,115,22,0.28)',
                whiteSpace: 'nowrap',
              }}>
                Кабинет
              </Link>
              <form action={logout}>
                <button type="submit" style={{
                  padding: '8px 16px', borderRadius: '50px',
                  background: 'transparent', border: '1.5px solid var(--border)',
                  fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                padding: '8px 18px', borderRadius: '50px',
                background: 'transparent', border: '1.5px solid var(--border)',
                fontSize: '13px', fontWeight: 600, color: 'var(--text)',
                whiteSpace: 'nowrap',
              }}>
                Войти
              </Link>
              <Link href="/register" style={{
                padding: '8px 20px', borderRadius: '50px',
                background: 'var(--primary)', color: '#fff',
                fontSize: '13px', fontWeight: 600,
                boxShadow: '0 2px 8px rgba(249,115,22,0.28)',
                whiteSpace: 'nowrap',
              }}>
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
