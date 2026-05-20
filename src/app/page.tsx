import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getServices } from '@/actions/services'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unit One — платформа для профессионалов HoReCa',
  description: 'Услуги специалистов, вакансии, поставщики продуктов и оборудования для ресторанов, отелей и кафе.',
}

const sections = [
  {
    href: '/catalog',
    label: 'Маркетплейс услуг',
    desc: 'Специалисты, консультанты и подрядчики для вашего заведения',
    accent: '#f97316',
    accentLight: '#fff7ed',
    accentBorder: '#fed7aa',
    badge: 'Работает',
    badgeColor: '#f97316',
    badgeBg: '#fff7ed',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    tags: ['Консалтинг', 'Аудит меню', 'Оборудование', 'Дизайн'],
    emoji: '📦',
  },
  {
    href: '/jobs',
    label: 'Вакансии',
    desc: 'Откройте вакансию или найдите работу в ресторанной индустрии',
    accent: '#2563eb',
    accentLight: '#eff6ff',
    accentBorder: '#bfdbfe',
    badge: 'Скоро',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    tags: ['Шеф-повара', 'Официанты', 'Бармены', 'Управляющие'],
    emoji: '👨‍🍳',
  },
  {
    href: '/suppliers',
    label: 'Поставщики',
    desc: 'Продукты питания, напитки и оборудование от проверенных поставщиков',
    accent: '#16a34a',
    accentLight: '#f0fdf4',
    accentBorder: '#bbf7d0',
    badge: 'Скоро',
    badgeColor: '#16a34a',
    badgeBg: '#f0fdf4',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
    tags: ['Мясо и рыба', 'Овощи', 'Напитки', 'Кухонное оборудование'],
    emoji: '🥩',
  },
]

export default async function LandingPage() {
  const [{ services: featured }, categories] = await Promise.all([
    getServices({ page: 1 }).catch(() => ({ services: [], total: 0, pages: 0 })),
    prisma.category.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
  ])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(249,115,22,0.08)', borderRadius: '50px',
            padding: '5px 14px', marginBottom: '16px',
            fontSize: '12px', fontWeight: 700, color: 'var(--primary)',
            border: '1px solid rgba(249,115,22,0.2)',
          }}>
            ✦ Единая платформа для HoReCa
          </div>
          <h1 style={{
            fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800,
            color: 'var(--text)', lineHeight: 1.15, letterSpacing: '-0.8px',
            marginBottom: '12px',
          }}>
            Всё для ресторанного бизнеса
          </h1>
          <p style={{
            fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6,
            maxWidth: '480px', margin: '0 auto',
          }}>
            Услуги специалистов, вакансии и поставщики — в одном месте
          </p>
        </div>

        {/* 3 Section cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '48px',
        }}>
          {sections.map(s => (
            <Link key={s.href} href={s.href} style={{ textDecoration: 'none', display: 'block' }}>
              <div className="card-hover" style={{
                background: '#fff',
                border: `1px solid ${s.accentBorder}`,
                borderRadius: '12px',
                padding: '28px 26px 26px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 0.18s, transform 0.18s',
              }}>
                {/* Top accent line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: '3px', background: s.accent,
                }} />

                {/* Badge */}
                <div style={{ marginBottom: '20px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700,
                    color: s.badgeColor, background: s.badgeBg,
                    borderRadius: '4px', padding: '2px 8px',
                  }}>
                    {s.badge}
                  </span>
                </div>

                {/* Icon */}
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: s.accentLight, border: `1px solid ${s.accentBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: s.accent, marginBottom: '18px', flexShrink: 0,
                }}>
                  {s.icon}
                </div>

                {/* Title + desc */}
                <h2 style={{
                  fontSize: '18px', fontWeight: 800, color: 'var(--text)',
                  marginBottom: '8px', letterSpacing: '-0.3px',
                }}>
                  {s.label}
                </h2>
                <p style={{
                  fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6,
                  marginBottom: '20px', flex: 1,
                }}>
                  {s.desc}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {s.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: '11px', fontWeight: 500,
                      color: 'var(--text-muted)', background: 'var(--bg)',
                      border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 7px',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px', fontWeight: 700, color: s.accent,
                }}>
                  Перейти
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>

                {/* Background emoji */}
                <div style={{
                  position: 'absolute', right: '-10px', bottom: '-10px',
                  fontSize: '90px', opacity: 0.06, userSelect: 'none',
                  lineHeight: 1,
                }}>
                  {s.emoji}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="layout-with-sidebar">

          {/* Left Sidebar */}
          <aside className="sidebar-hide" style={{ display: 'block' }}>
            <div style={{
              background: '#fff', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden',
            }}>
              <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.2px' }}>Категории услуг</p>
              </div>
              <div style={{ padding: '8px 0' }}>
                <Link href="/catalog" className="cat-link" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text)',
                }}>
                  <span>Все категории</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
                {categories.map(cat => (
                  <Link key={cat.id} href={`/catalog?category=${cat.slug}`} className="cat-link" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 20px', fontSize: '13px', color: 'var(--text-muted)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '16px', lineHeight: 1 }}>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Featured services */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                  Популярные услуги
                </h2>
                <Link href="/catalog" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>
                  Смотреть все →
                </Link>
              </div>

              {featured.length === 0 ? (
                <div style={{
                  background: '#fff', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '48px 32px', textAlign: 'center',
                }}>
                  <p style={{ fontSize: '32px', marginBottom: '12px' }}>📦</p>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Пока нет услуг</p>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>Станьте первым поставщиком</p>
                  <Link href="/register?role=SELLER" style={{
                    display: 'inline-block', padding: '10px 24px', borderRadius: '50px',
                    background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '14px',
                  }}>
                    Разместить услугу
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                  {featured.slice(0, 8).map(service => {
                    const rating = service.reviews.length
                      ? (service.reviews.reduce((s, r) => s + r.rating, 0) / service.reviews.length).toFixed(1)
                      : null
                    return (
                      <Link key={service.id} href={`/catalog/${service.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                        <div className="card-hover" style={{
                          background: '#fff', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '160px', background: 'var(--bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '48px', overflow: 'hidden', position: 'relative',
                          }}>
                            {service.images[0]
                              ? <img src={service.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : service.category.icon}
                            <div style={{
                              position: 'absolute', top: '10px', left: '10px',
                              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)',
                              borderRadius: '50px', padding: '2px 9px',
                              fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
                            }}>
                              {service.category.name}
                            </div>
                          </div>
                          <div style={{ padding: '12px 14px 14px' }}>
                            <p style={{
                              fontSize: '13px', fontWeight: 600, color: 'var(--text)',
                              marginBottom: '8px', lineHeight: 1.45,
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {service.title}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              {rating
                                ? <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>★ {rating}</span>
                                : <span />}
                              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                                от {Number(service.price).toLocaleString('ru-RU')} ₽
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Stats strip */}
            <div style={{
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)',
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            }}>
              {[
                { value: '500+', label: 'Специалистов' },
                { value: '2 000+', label: 'Предложений' },
                { value: '10+', label: 'Категорий' },
                { value: '98%', label: 'Довольных клиентов' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  padding: '22px 16px', textAlign: 'center',
                  borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                }}>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <footer style={{
        background: '#fff', borderTop: '1px solid var(--border)',
        padding: '28px 24px', textAlign: 'center', marginTop: '24px',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          © 2026 Unit One — платформа для профессионалов HoReCa
        </p>
      </footer>
    </div>
  )
}
