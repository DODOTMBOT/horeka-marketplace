import Link from 'next/link'
import { type Metadata } from 'next'
import Navbar from '@/components/Navbar'
import ServiceCard from '@/components/ServiceCard'
import TagsCloud from './TagsCloud'
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

const PRICE_UNITS = [
  { value: 'разово', label: 'Разово' },
  { value: 'в месяц', label: 'В месяц' },
  { value: 'в час', label: 'В час' },
  { value: 'за кг', label: 'За кг' },
  { value: 'за единицу', label: 'За единицу' },
  { value: 'по запросу', label: 'По запросу' },
]

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

  // Serialisable makeUrl — passed to client component as plain function result (href strings)
  const buildUrl = (overrides: Partial<SearchParams>) => {
    const merged = { ...params, page: '1', ...overrides }
    const q = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
      .join('&')
    return q ? `/catalog?${q}` : '/catalog'
  }

  // For TagsCloud client component we pass a serialisable map of href strings
  const tagHrefs = Object.fromEntries(
    allTags.map(({ tag }) => [tag, buildUrl({ tag })])
  )
  const clearTagHref = buildUrl({ tag: '' })

  const activeFiltersCount = [
    params.category, params.search, params.priceMin, params.priceMax,
    params.priceUnit, params.tag, innVerified ? '1' : undefined,
  ].filter(Boolean).length

  const inputCls: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: '6px',
    border: '1.5px solid var(--border)', background: 'var(--bg)',
    fontSize: '13px', color: 'var(--text)', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      {/* Full-width container */}
      <div style={{ padding: '20px 32px' }}>

        {/* Mobile category scroll */}
        <div className="mobile-only" style={{ display: 'none', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', gap: '8px', width: 'max-content' }}>
            <Link href={buildUrl({ category: '' })} style={{
              padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
              background: !params.category ? 'var(--primary)' : '#fff', color: !params.category ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)', textDecoration: 'none',
            }}>Все</Link>
            {categories.map(cat => (
              <Link key={cat.id} href={buildUrl({ category: cat.slug })} style={{
                padding: '6px 14px', borderRadius: '50px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                background: params.category === cat.slug ? 'var(--primary)' : '#fff',
                color: params.category === cat.slug ? '#fff' : 'var(--text-muted)',
                border: '1px solid var(--border)', textDecoration: 'none',
              }}>{cat.icon} {cat.name}</Link>
            ))}
          </div>
        </div>

        <div className="layout-with-sidebar">

          {/* ── Sidebar ── */}
          <aside className="sidebar-hide" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Поиск */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', background: '#fafafa' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Поиск</p>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <form method="get" action="/catalog">
                  {params.category && <input type="hidden" name="category" value={params.category} />}
                  {params.priceMin && <input type="hidden" name="priceMin" value={params.priceMin} />}
                  {params.priceMax && <input type="hidden" name="priceMax" value={params.priceMax} />}
                  {params.priceUnit && <input type="hidden" name="priceUnit" value={params.priceUnit} />}
                  {params.tag && <input type="hidden" name="tag" value={params.tag} />}
                  {params.verified && <input type="hidden" name="verified" value={params.verified} />}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="text" name="search" defaultValue={params.search} placeholder="Название, тег..." style={inputCls} />
                    <button type="submit" style={{
                      padding: '8px 12px', borderRadius: '6px',
                      background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 700,
                      border: 'none', cursor: 'pointer', flexShrink: 0,
                    }}>→</button>
                  </div>
                </form>
              </div>
            </div>

            {/* Категория */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', background: '#fafafa' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Категория</p>
              </div>
              <div style={{ padding: '4px 0' }}>
                {[{ slug: '', name: 'Все категории', icon: null }, ...categories].map(cat => {
                  const active = cat.slug === '' ? !params.category : params.category === cat.slug
                  return (
                    <Link key={cat.slug || '__all'} href={buildUrl({ category: cat.slug })} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 16px', fontSize: '13px', fontWeight: active ? 600 : 400,
                      color: active ? 'var(--primary)' : 'var(--text-muted)',
                      background: active ? 'var(--primary-light)' : 'transparent',
                      textDecoration: 'none', transition: 'background 0.12s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {cat.icon && <span style={{ fontSize: '14px', lineHeight: 1 }}>{cat.icon}</span>}
                        <span>{cat.name}</span>
                      </div>
                      {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Цена */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', background: '#fafafa' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Цена, ₽</p>
              </div>
              <div style={{ padding: '12px' }}>
                <form method="get" action="/catalog">
                  {params.category && <input type="hidden" name="category" value={params.category} />}
                  {params.search && <input type="hidden" name="search" value={params.search} />}
                  {params.priceUnit && <input type="hidden" name="priceUnit" value={params.priceUnit} />}
                  {params.tag && <input type="hidden" name="tag" value={params.tag} />}
                  {params.verified && <input type="hidden" name="verified" value={params.verified} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="number" name="priceMin" defaultValue={params.priceMin} placeholder="от"
                      min="0" style={{ ...inputCls, textAlign: 'center' }} />
                    <span style={{ color: '#d1d5db', flexShrink: 0, fontSize: '12px' }}>—</span>
                    <input type="number" name="priceMax" defaultValue={params.priceMax} placeholder="до"
                      min="0" style={{ ...inputCls, textAlign: 'center' }} />
                    <button type="submit" style={{
                      padding: '8px 10px', borderRadius: '6px',
                      background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 700,
                      border: 'none', cursor: 'pointer', flexShrink: 0,
                    }}>→</button>
                  </div>
                  {(params.priceMin || params.priceMax) && (
                    <Link href={buildUrl({ priceMin: '', priceMax: '' })} style={{
                      fontSize: '11px', color: '#9ca3af', marginTop: '7px', display: 'block', textDecoration: 'none',
                    }}>× сбросить цену</Link>
                  )}
                </form>
              </div>
            </div>

            {/* Тип цены */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', background: '#fafafa' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Тип цены</p>
              </div>
              <div style={{ padding: '4px 0' }}>
                {[{ value: '', label: 'Любой' }, ...PRICE_UNITS].map(u => {
                  const active = u.value === '' ? !params.priceUnit : params.priceUnit === u.value
                  return (
                    <Link key={u.value || '__any'} href={buildUrl({ priceUnit: u.value })} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 16px', fontSize: '13px', fontWeight: active ? 600 : 400,
                      color: active ? 'var(--primary)' : 'var(--text-muted)',
                      background: active ? 'var(--primary-light)' : 'transparent',
                      textDecoration: 'none', transition: 'background 0.12s',
                    }}>
                      {u.label}
                      {active && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Продавец */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', background: '#fafafa' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Продавец</p>
              </div>
              <div style={{ padding: '10px 14px' }}>
                <Link href={buildUrl({ verified: innVerified ? '' : '1' })} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
                }}>
                  <div style={{
                    width: '17px', height: '17px', borderRadius: '4px', flexShrink: 0,
                    border: `2px solid ${innVerified ? 'var(--primary)' : '#d1d5db'}`,
                    background: innVerified ? 'var(--primary)' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.12s',
                  }}>
                    {innVerified && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '13px', color: innVerified ? 'var(--primary)' : '#6b7280', fontWeight: innVerified ? 600 : 400 }}>
                    ИНН верифицирован
                  </span>
                </Link>
              </div>
            </div>

            {/* Сброс */}
            {activeFiltersCount > 0 && (
              <Link href="/catalog" style={{
                display: 'block', textAlign: 'center', padding: '9px 16px',
                borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca',
                textDecoration: 'none',
              }}>
                Сбросить все фильтры ({activeFiltersCount})
              </Link>
            )}
          </aside>

          {/* ── Основной контент ── */}
          <div>
            {/* Заголовок */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
                  {params.tag
                    ? `#${params.tag}`
                    : params.category
                      ? (categories.find(c => c.slug === params.category)?.name ?? 'Каталог')
                      : 'Каталог услуг'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
                  {total} {total === 1 ? 'предложение' : total < 5 ? 'предложения' : 'предложений'}
                  {activeFiltersCount > 0 && (
                    <Link href="/catalog" style={{ marginLeft: '8px', color: 'var(--primary)', fontSize: '12px', textDecoration: 'none' }}>
                      сбросить фильтры ×
                    </Link>
                  )}
                </p>
              </div>
              <Link href="/dashboard/services/new" style={{
                padding: '9px 20px', borderRadius: '50px',
                background: 'var(--primary)', color: '#fff',
                fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(249,115,22,0.28)',
                whiteSpace: 'nowrap',
              }}>
                + Разместить услугу
              </Link>
            </div>

            {/* Теги */}
            {allTags.length > 0 && (
              <div style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
              }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  Теги
                </p>
                <TagsCloud
                  tags={allTags}
                  activeTag={params.tag}
                  tagHrefs={tagHrefs}
                  clearTagHref={clearTagHref}
                />
              </div>
            )}

            {/* Карточки */}
            {services.length === 0 ? (
              <div style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '60px 32px', textAlign: 'center',
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
                  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: '14px', marginBottom: '24px',
                }}>
                  {services.map(s => <ServiceCard key={s.id} service={s} isFavorited={favoriteIds.includes(s.id)} />)}
                </div>

                {pages > 1 && (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <Link key={p} href={buildUrl({ page: String(p) })} style={{
                        width: '36px', height: '36px', borderRadius: '6px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: p === page ? 700 : 500,
                        background: p === page ? 'var(--primary)' : '#fff',
                        color: p === page ? '#fff' : 'var(--text)',
                        border: '1px solid var(--border)',
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
