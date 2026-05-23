import Link from 'next/link'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import ServiceCard from '@/components/ServiceCard'
import { getServices } from '@/actions/services'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Додо Пицца × Unit One — сервисы для франчайзи',
  description: 'Специализированные услуги, инструменты и специалисты для франчайзи Додо Пицца.',
}

const DODO = '#e16919'
const DODO_SOFT = 'rgba(225,105,25,0.1)'
const DODO_BORDER = 'rgba(225,105,25,0.2)'

const TABS = [
  { key: undefined,     label: 'Все'          },
  { key: 'digital',    label: 'Инструменты'  },
  { key: 'service',    label: 'Специалисты'  },
  { key: 'project',    label: 'Проекты'      },
] as const

export default async function DodoPage({
  searchParams,
}: {
  searchParams: Promise<{ format?: string; page?: string }>
}) {
  const params = await searchParams
  const format = params.format
  const page   = Number(params.page ?? 1)

  const [{ services, total, pages }, counts] = await Promise.all([
    getServices({ brand: 'dodo', format, page }),
    prisma.service.groupBy({
      by: ['format'],
      where: { brand: 'dodo', status: 'ACTIVE' },
      _count: { id: true },
    }),
  ])

  const countByFormat: Record<string, number> = {}
  for (const r of counts) countByFormat[r.format] = r._count.id
  const totalCount = Object.values(countByFormat).reduce((a, b) => a + b, 0)

  return (
    <>
      <style>{`
        :root { --fmt-accent: ${DODO}; --fmt-text: #fff; }
        .dodo-tab { transition: all 0.15s; }
        .dodo-tab:hover { background: ${DODO_SOFT} !important; border-color: ${DODO} !important; color: ${DODO} !important; }
        .dodo-card-wrap:hover { transform: translateY(-3px); }
        .dodo-card-wrap { transition: transform 0.18s cubic-bezier(0.22,1,0.36,1); }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <Navbar />

        {/* Hero */}
        <section style={{ background: DODO, padding: '52px 28px 48px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.15)', borderRadius: '999px', padding: '5px 14px', marginBottom: '24px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em' }}>
                СПЕЦПРОЕКТ
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{
                  fontFamily: 'var(--ff-display)', fontWeight: 800,
                  fontSize: 'clamp(40px, 6vw, 72px)',
                  color: '#fff', lineHeight: 0.95, letterSpacing: '-0.045em',
                  marginBottom: '16px',
                }}>
                  <span style={{ display: 'block' }}>Додо Пицца</span>
                  <span style={{ display: 'block', opacity: 0.55 }}>× Unit One</span>
                </h1>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', maxWidth: '480px', lineHeight: 1.6, letterSpacing: '-0.01em' }}>
                  Услуги, инструменты и специалисты специально для франчайзи Додо Пицца. Всё проверено и заточено под стандарты сети.
                </p>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '32px', flexShrink: 0 }}>
                {[
                  { n: totalCount,                            label: 'услуг в каталоге' },
                  { n: countByFormat['service'] ?? 0,         label: 'специалистов'     },
                  { n: countByFormat['digital'] ?? 0,         label: 'инструментов'     },
                ].map(({ n, label }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 900, fontSize: '36px', color: '#fff', lineHeight: 1, letterSpacing: '-0.05em' }}>{n}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', fontWeight: 500 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tabs + content */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 28px' }}>

          {/* Format tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {TABS.map(tab => {
              const count = tab.key ? (countByFormat[tab.key] ?? 0) : totalCount
              const isActive = format === tab.key
              return (
                <Link
                  key={tab.label}
                  href={tab.key ? `/dodo?format=${tab.key}` : '/dodo'}
                  className="dodo-tab"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    padding: '8px 16px', borderRadius: '999px',
                    border: `1.5px solid ${isActive ? DODO : 'var(--line)'}`,
                    background: isActive ? DODO : 'var(--paper)',
                    color: isActive ? '#fff' : 'var(--ink)',
                    fontSize: '13px', fontWeight: 700,
                    textDecoration: 'none', letterSpacing: '-0.01em',
                  }}
                >
                  {tab.label}
                  <span style={{
                    fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700,
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--paper-2)',
                    padding: '1px 7px', borderRadius: '999px',
                    color: isActive ? '#fff' : 'var(--muted)',
                  }}>
                    {count}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Services grid */}
          {services.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              border: `2px dashed ${DODO_BORDER}`,
              borderRadius: 'var(--r-xl)', background: DODO_SOFT,
            }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>🍕</p>
              <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '20px', color: DODO, marginBottom: '6px' }}>
                Пока здесь пусто
              </p>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px' }}>
                Вы можете стать первым поставщиком услуг для Додо Пицца
              </p>
              <Link href="/dashboard/services/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: 'var(--r-md)',
                background: DODO, color: '#fff',
                fontSize: '14px', fontWeight: 700, textDecoration: 'none',
              }}>
                Добавить услугу →
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))',
              gap: '20px',
            }}>
              {services.map(svc => (
                <div key={svc.id} className="dodo-card-wrap">
                  <ServiceCard service={svc} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '40px' }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={`/dodo?${format ? `format=${format}&` : ''}page=${p}`}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: p === page ? DODO : 'var(--paper)',
                    color: p === page ? '#fff' : 'var(--ink)',
                    border: `1.5px solid ${p === page ? DODO : 'var(--line)'}`,
                    fontWeight: 700, fontSize: '13px', textDecoration: 'none',
                  }}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}

          {/* CTA для продавцов */}
          <div style={{
            marginTop: '60px',
            background: DODO,
            borderRadius: 'var(--r-xl)',
            padding: '40px 48px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', marginBottom: '8px' }}>
                ДЛЯ ПОСТАВЩИКОВ
              </p>
              <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '22px', color: '#fff', letterSpacing: '-0.03em', marginBottom: '6px' }}>
                Работаете с Додо Пицца?
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                Разместите услугу и получите доступ к сотням франчайзи по всей России.
              </p>
            </div>
            <Link href="/dashboard/services/new" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '14px 28px', borderRadius: 'var(--r-md)',
              background: '#fff', color: DODO,
              fontSize: '14px', fontWeight: 800, textDecoration: 'none',
              letterSpacing: '-0.01em', flexShrink: 0,
            }}>
              Добавить услугу →
            </Link>
          </div>

        </div>
      </div>
    </>
  )
}
