import Link from 'next/link'
import { type Metadata } from 'next'
import Navbar from '@/components/Navbar'
import ServiceCard from '@/components/ServiceCard'
import { getServices, getAllTags } from '@/actions/services'
import { getFavoriteIds } from '@/actions/favorites'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams
  if (params.search) return { title: `Поиск: ${params.search}`, description: `Результаты поиска по запросу "${params.search}" в каталоге Unit One` }
  if (params.category) return { title: `Каталог — ${params.category}`, description: `Услуги категории ${params.category} на Unit One` }
  if (params.tag) return { title: `#${params.tag} — каталог`, description: `Услуги с тегом ${params.tag} на Unit One` }
  return { title: 'Каталог', description: 'Услуги специалистов, поставщики продуктов и оборудования для ресторанов, отелей и кафе на Unit One' }
}

const PRICE_UNITS = ['разово', 'в месяц', 'в час', 'за кг', 'за единицу', 'по запросу']

type SearchParams = {
  category?: string
  search?: string
  priceMin?: string
  priceMax?: string
  priceUnit?: string
  tag?: string
  verified?: string
  page?: string
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const page = Number(params.page) || 1

  const minPrice = params.priceMin ? Number(params.priceMin) : undefined
  const maxPrice = params.priceMax ? Number(params.priceMax) : undefined
  const innVerified = params.verified === '1'

  const [{ services, total, pages }, categories, allTags, favoriteIds] = await Promise.all([
    getServices({
      categorySlug: params.category,
      search: params.search,
      minPrice,
      maxPrice,
      priceUnit: params.priceUnit,
      tag: params.tag,
      innVerified: innVerified || undefined,
      page,
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    getAllTags(),
    getFavoriteIds(),
  ])

  const makeUrl = (overrides: Partial<SearchParams>) => {
    const merged = { ...params, page: '1', ...overrides }
    const q = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
      .join('&')
    return q ? `/catalog?${q}` : '/catalog'
  }

  const activeFiltersCount = [
    params.category, params.search, params.priceMin, params.priceMax,
    params.priceUnit, params.tag, params.verified === '1' ? '1' : undefined,
  ].filter(Boolean).length

  const sideCard = (children: React.ReactNode, title: string) => (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', overflow: 'hidden',
    }}>
      <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', background: '#fafafa' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.02em' }}>{title}</p>
      </div>
      {children}
    </div>
  )

  const linkRow = (active: boolean, href: string, children: React.ReactNode) => (
    <Link href={href} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 18px', fontSize: '13px',
      fontWeight: active ? 600 : 400,
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      background: active ? 'var(--primary-light)' : 'transparent',
      transition: 'background 0.12s, color 0.12s',
      textDecoration: 'none',
    }}>
      {children}
      {active && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>}
    </Link>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px' }}>

        {/* Tags cloud — full width above layout */}
        {allTags.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)', padding: '14px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                  Теги:
                </span>
                {params.tag && (
                  <Link href={makeUrl({ tag: '' })} style={{
                    fontSize: '12px', fontWeight: 700,
                    padding: '3px 10px', borderRadius: '50px',
                    background: 'var(--primary)', color: '#fff',
                    textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px',
                  }}>
                    #{params.tag} <span style={{ opacity: 0.8 }}>×</span>
                  </Link>
                )}
                {allTags.map(({ tag, count }) => {
                  const isActive = params.tag === tag
                  if (isActive) return null
                  return (
                    <Link key={tag} href={makeUrl({ tag })} style={{
                      fontSize: '12px', fontWeight: 500,
                      padding: '3px 10px', borderRadius: '50px',
                      background: '#f3f4f6',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}>
                      #{tag}
                      <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.6 }}>{count}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile category scroll */}
        <div className="mobile-only" style={{ display: 'none', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', gap: '8px', width: 'max-content' }}>
            <Link href={makeUrl({ category: '' })} style={{
              padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
              background: !params.category ? 'var(--primary)' : '#fff',
              color: !params.category ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>Все</Link>
            {categories.map(cat => (
              <Link key={cat.id} href={makeUrl({ category: cat.slug })} style={{
                padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                background: params.category === cat.slug ? 'var(--primary)' : '#fff',
                color: params.category === cat.slug ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>{cat.icon} {cat.name}</Link>
            ))}
          </div>
        </div>

        <div className="layout-with-sidebar">

          {/* ── Sidebar ── */}
          <aside className="sidebar-hide" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Search */}
            {sideCard(
              <div style={{ padding: '12px 14px' }}>
                <form method="get" action="/catalog">
                  {params.category && <input type="hidden" name="category" value={params.category} />}
                  {params.priceMin && <input type="hidden" name="priceMin" value={params.priceMin} />}
                  {params.priceMax && <input type="hidden" name="priceMax" value={params.priceMax} />}
                  {params.priceUnit && <input type="hidden" name="priceUnit" value={params.priceUnit} />}
                  {params.tag && <input type="hidden" name="tag" value={params.tag} />}
                  {params.verified && <input type="hidden" name="verified" value={params.verified} />}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text" name="search"
                      defaultValue={params.search}
                      placeholder="Название, тег..."
                      style={{
                        flex: 1, padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                        fontSize: '13px', color: 'var(--text)',
                        background: 'var(--bg)', border: '1.5px solid var(--border)',
                      }}
                    />
                    <button type="submit" style={{
                      padding: '9px 13px', borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 700,
                      border: 'none', cursor: 'pointer',
                    }}>→</button>
                  </div>
                </form>
              </div>,
              'Поиск'
            )}

            {/* Категория */}
            {sideCard(
              <div style={{ padding: '6px 0' }}>
                {linkRow(!params.category, makeUrl({ category: '' }), <span>Все категории</span>)}
                {categories.map(cat => (
                  linkRow(params.category === cat.slug, makeUrl({ category: cat.slug }), (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '15px', lineHeight: 1 }}>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                  ))
                ))}
              </div>,
              'Категория'
            )}

            {/* Цена */}
            {sideCard(
              <div style={{ padding: '14px' }}>
                <form method="get" action="/catalog">
                  {params.category && <input type="hidden" name="category" value={params.category} />}
                  {params.search && <input type="hidden" name="search" value={params.search} />}
                  {params.priceUnit && <input type="hidden" name="priceUnit" value={params.priceUnit} />}
                  {params.tag && <input type="hidden" name="tag" value={params.tag} />}
                  {params.verified && <input type="hidden" name="verified" value={params.verified} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number" name="priceMin"
                      defaultValue={params.priceMin}
                      placeholder="от"
                      min="0"
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border)', background: 'var(--bg)',
                        fontSize: '13px', color: 'var(--text)',
                      }}
                    />
                    <span style={{ color: 'var(--text-muted)', flexShrink: 0, fontSize: '13px' }}>—</span>
                    <input
                      type="number" name="priceMax"
                      defaultValue={params.priceMax}
                      placeholder="до"
                      min="0"
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border)', background: 'var(--bg)',
                        fontSize: '13px', color: 'var(--text)',
                      }}
                    />
                    <button type="submit" style={{
                      padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 700,
                      border: 'none', cursor: 'pointer', flexShrink: 0,
                    }}>→</button>
                  </div>
                  {(params.priceMin || params.priceMax) && (
                    <Link href={makeUrl({ priceMin: '', priceMax: '' })} style={{
                      fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block',
                    }}>
                      Сбросить цену
                    </Link>
                  )}
                </form>
              </div>,
              'Цена, ₽'
            )}

            {/* Единица цены */}
            {sideCard(
              <div style={{ padding: '6px 0' }}>
                {linkRow(!params.priceUnit, makeUrl({ priceUnit: '' }), <span>Любая</span>)}
                {PRICE_UNITS.map(unit => (
                  linkRow(params.priceUnit === unit, makeUrl({ priceUnit: unit }), <span style={{ textTransform: 'capitalize' }}>{unit}</span>)
                ))}
              </div>,
              'Тип цены'
            )}

            {/* Верификация ИНН */}
            {sideCard(
              <div style={{ padding: '10px 18px' }}>
                <Link href={makeUrl({ verified: innVerified ? '' : '1' })} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  textDecoration: 'none', padding: '4px 0',
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                    border: `2px solid ${innVerified ? 'var(--primary)' : 'var(--border)'}`,
                    background: innVerified ? 'var(--primary)' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {innVerified && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: innVerified ? 600 : 400, color: innVerified ? 'var(--primary)' : 'var(--text-muted)' }}>
                    Только верифицированные ИНН
                  </span>
                </Link>
              </div>,
              'Продавец'
            )}

            {/* Сброс всех */}
            {activeFiltersCount > 0 && (
              <Link href="/catalog" style={{
                display: 'block', textAlign: 'center',
                padding: '9px', borderRadius: 'var(--radius)',
                fontSize: '12px', fontWeight: 600,
                color: '#dc2626', background: '#fef2f2',
                border: '1px solid #fecaca', textDecoration: 'none',
              }}>
                Сбросить все фильтры ({activeFiltersCount})
              </Link>
            )}
          </aside>

          {/* ── Main ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
                  {params.tag ? `#${params.tag}` : params.category ? categories.find(c => c.slug === params.category)?.name ?? 'Каталог' : 'Каталог услуг'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
                  Найдено: {total} предложений
                  {activeFiltersCount > 0 && (
                    <Link href="/catalog" style={{ marginLeft: '8px', color: 'var(--primary)', fontSize: '12px' }}>
                      сбросить фильтры
                    </Link>
                  )}
                </p>
              </div>
              <Link href="/dashboard/services/new" style={{
                padding: '9px 20px', borderRadius: '50px',
                background: 'var(--primary)', color: '#fff',
                fontSize: '13px', fontWeight: 600,
                boxShadow: '0 2px 8px rgba(249,115,22,0.28)',
                textDecoration: 'none',
              }}>
                + Разместить услугу
              </Link>
            </div>

            {services.length === 0 ? (
              <div style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '60px 32px', textAlign: 'center',
                boxShadow: 'var(--shadow-card)',
              }}>
                <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>Услуги не найдены</p>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>Попробуйте изменить фильтры</p>
                <Link href="/catalog" style={{
                  display: 'inline-block', padding: '10px 24px', borderRadius: '50px',
                  background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '14px',
                  textDecoration: 'none',
                }}>
                  Сбросить фильтры
                </Link>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '14px', marginBottom: '24px',
                }}>
                  {services.map(s => <ServiceCard key={s.id} service={s} isFavorited={favoriteIds.includes(s.id)} />)}
                </div>

                {pages > 1 && (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <Link key={p} href={makeUrl({ page: String(p) })} style={{
                        width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: p === page ? 700 : 500,
                        background: p === page ? 'var(--primary)' : '#fff',
                        color: p === page ? '#fff' : 'var(--text)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                        textDecoration: 'none',
                      }}>
                        {p}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
