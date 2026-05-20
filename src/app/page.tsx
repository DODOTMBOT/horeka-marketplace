import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getServices } from '@/actions/services'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unit One — платформа для профессионалов HoReCa',
  description: 'Услуги специалистов, вакансии, поставщики продуктов и оборудования для ресторанов, отелей и кафе.',
}

export default async function LandingPage() {
  const [{ services: featured }, categories] = await Promise.all([
    getServices({ page: 1 }).catch(() => ({ services: [], total: 0, pages: 0 })),
    prisma.category.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
  ])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
        <div className="layout-with-sidebar">

          {/* Left Sidebar */}
          <aside className="sidebar-hide" style={{ display: 'block' }}>
            <div style={{
              background: '#fff',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.2px' }}>Категории</p>
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

            {/* Hero + side banners */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', alignItems: 'stretch' }}>

              {/* Hero banner */}
              <div style={{
                borderRadius: 'var(--radius)',
                background: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)',
                padding: '40px 36px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                position: 'relative', overflow: 'hidden', minHeight: '260px',
              }}>
                <div style={{
                  position: 'absolute', right: '-20px', bottom: '-10px',
                  fontSize: '160px', lineHeight: 1, opacity: 0.18, userSelect: 'none',
                  transform: 'rotate(-10deg)',
                }}>
                  🍳
                </div>
                <div style={{
                  display: 'inline-flex', width: 'fit-content',
                  background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)',
                  borderRadius: '50px', padding: '4px 14px',
                  fontSize: '12px', fontWeight: 700, color: '#5c6bc0',
                  marginBottom: '14px', border: '1px solid rgba(255,255,255,0.7)',
                }}>
                  ✦ Платформа для профессионалов HoReCa
                </div>
                <h1 style={{
                  fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800,
                  color: '#2d3057', lineHeight: 1.2,
                  letterSpacing: '-0.5px', marginBottom: '10px', maxWidth: '380px',
                }}>
                  Услуги, вакансии и поставщики для HoReCa
                </h1>
                <p style={{
                  fontSize: '14px', color: '#4a4f7a', lineHeight: 1.6,
                  marginBottom: '24px', maxWidth: '320px',
                }}>
                  Всё для ресторанного бизнеса в одном месте — специалисты, открытые позиции и проверенные поставщики
                </p>
                <Link href="/catalog" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  width: 'fit-content', padding: '12px 26px',
                  borderRadius: '50px',
                  background: 'var(--primary)', color: '#fff',
                  fontSize: '14px', fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(249,115,22,0.38)',
                }}>
                  Начать работу
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              </div>

              {/* Side banners */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
                  padding: '24px 22px',
                  flex: 1, position: 'relative', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <div style={{ position: 'absolute', right: '-8px', bottom: '-8px', fontSize: '80px', opacity: 0.2, userSelect: 'none' }}>🍷</div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#c2185b', marginBottom: '4px', letterSpacing: '0.04em' }}>НОВИНКА</p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#880e4f', lineHeight: 1.3, marginBottom: '10px' }}>
                    Напитки и алкоголь
                  </p>
                  <Link href="/catalog?category=beverages" style={{
                    display: 'inline-flex', width: 'fit-content',
                    padding: '7px 16px', borderRadius: '50px',
                    background: '#e91e8c', color: '#fff',
                    fontSize: '12px', fontWeight: 600,
                  }}>
                    Смотреть →
                  </Link>
                </div>

                <div style={{
                  borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                  padding: '24px 22px',
                  flex: 1, position: 'relative', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <div style={{ position: 'absolute', right: '-8px', bottom: '-8px', fontSize: '80px', opacity: 0.2, userSelect: 'none' }}>👨‍🍳</div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#388e3c', marginBottom: '4px', letterSpacing: '0.04em' }}>ПОПУЛЯРНО</p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#1b5e20', lineHeight: 1.3, marginBottom: '10px' }}>
                    Персонал для кухни
                  </p>
                  <Link href="/catalog?category=staff" style={{
                    display: 'inline-flex', width: 'fit-content',
                    padding: '7px 16px', borderRadius: '50px',
                    background: '#43a047', color: '#fff',
                    fontSize: '12px', fontWeight: 600,
                  }}>
                    Смотреть →
                  </Link>
                </div>
              </div>
            </div>

            {/* Featured services */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                  Популярные предложения
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
                    Стать поставщиком
                  </Link>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '14px',
                }}>
                  {featured.slice(0, 8).map(service => {
                    const rating = service.reviews.length
                      ? (service.reviews.reduce((s, r) => s + r.rating, 0) / service.reviews.length).toFixed(1)
                      : null
                    return (
                      <Link key={service.id} href={`/catalog/${service.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                        <div className="card-hover" style={{
                          background: '#fff',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          boxShadow: 'var(--shadow-card)',
                          overflow: 'hidden',
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
                              background: 'rgba(255,255,255,0.9)',
                              backdropFilter: 'blur(6px)',
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
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-card)',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
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

            {/* How it works */}
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '14px', letterSpacing: '-0.3px' }}>
                Как это работает
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { n: '1', title: 'Найдите услугу', desc: 'Используйте поиск и фильтры для выбора подходящего поставщика', icon: '🔍' },
                  { n: '2', title: 'Проверьте поставщика', desc: 'Смотрите отзывы, рейтинг и статус верификации ИНН', icon: '✅' },
                  { n: '3', title: 'Оформите заказ', desc: 'Выберите пакет услуг и получите результат в срок', icon: '🚀' },
                ].map(step => (
                  <div key={step.n} style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '24px 22px',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', marginBottom: '14px',
                    }}>
                      {step.icon}
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{step.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
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
