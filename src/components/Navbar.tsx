import Link from 'next/link'
import { getSession } from '@/lib/session'
import { logout } from '@/actions/auth'
import { LogoWordmark, LogoMark } from './Logo'
import { prisma } from '@/lib/prisma'
import { getNavbarConfig } from '@/lib/siteConfig'

async function getUserCount() {
  try { return await prisma.user.count() } catch { return 0 }
}

const NAV_LINKS = [
  { href: '/catalog',   label: 'Каталог' },
  { href: '/suppliers', label: 'Поставщики' },
  { href: '/jobs',      label: 'Вакансии' },
  { href: '/register?role=SELLER', label: 'Для бизнеса' },
]

export default async function Navbar() {
  const [session, userCount, navCfg] = await Promise.all([
    getSession(),
    getUserCount(),
    getNavbarConfig(),
  ])

  return (
    <header style={{
      background: 'var(--paper)',
      borderBottom: '1px solid var(--line)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto', padding: '0 28px',
        height: '72px', display: 'flex', alignItems: 'center', gap: '32px',
      }}>
        {/* Logo */}
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

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="nav-search-col">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} className="nav-link" style={{
              padding: '7px 13px', borderRadius: 'var(--r-sm)',
              fontSize: '14px', fontWeight: 500, color: 'var(--ink)',
              textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'background 0.12s',
            }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Online indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 13px', borderRadius: '999px',
            border: '1px solid var(--line)',
            fontSize: '12px', fontWeight: 600, color: 'var(--ink)',
            whiteSpace: 'nowrap',
          }} className="hide-xs">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
            {userCount.toLocaleString('ru-RU')} ОНЛАЙН
          </div>

          {session ? (
            <>
              {session.role === 'ADMIN' && (
                <Link href="/admin" style={{
                  padding: '8px 15px', borderRadius: 'var(--r-sm)',
                  background: 'var(--ink)', color: 'var(--paper)',
                  fontSize: '12px', fontWeight: 700, textDecoration: 'none',
                  whiteSpace: 'nowrap', letterSpacing: '-0.01em',
                }}>
                  Админ
                </Link>
              )}
              <Link href="/dashboard" style={{
                padding: '8px 20px', borderRadius: 'var(--r-sm)',
                background: 'var(--blue)', color: '#fff',
                fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}>
                Кабинет
              </Link>
              <form action={logout}>
                <button type="submit" style={{
                  padding: '8px 14px', borderRadius: 'var(--r-sm)',
                  background: 'transparent', border: '1px solid var(--line)',
                  fontSize: '13px', color: 'var(--muted)', cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                padding: '8px 16px', borderRadius: 'var(--r-sm)',
                background: 'transparent', border: '1px solid var(--line)',
                fontSize: '13px', fontWeight: 600, color: 'var(--ink)',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}>
                Войти
              </Link>
              <Link href="/register" style={{
                padding: '8px 20px', borderRadius: 'var(--r-sm)',
                background: 'var(--ink)', color: 'var(--paper)',
                fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
                Начать
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
