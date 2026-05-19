import Link from 'next/link'
import { type Metadata } from 'next'
import Navbar from '@/components/Navbar'
import ServiceCard from '@/components/ServiceCard'
import { getServices } from '@/actions/services'
import { getFavoriteIds } from '@/actions/favorites'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams
  if (params.search) {
    return { title: `Поиск: ${params.search}`, description: `Результаты поиска по запросу "${params.search}" в каталоге HoReCa Hub` }
  }
  if (params.category) {
    return { title: `Каталог — ${params.category}`, description: `Поставщики и услуги категории ${params.category} на HoReCa Hub` }
  }
  return { title: 'Каталог услуг', description: 'Все поставщики и услуги для ресторанного бизнеса: продукты, оборудование, персонал и многое другое' }
}

const PRICE_RANGES = [
  { label: 'Любая цена', min: undefined, max: undefined },
  { label: 'До 10 000 ₽', min: undefined, max: 10000 },
  { label: '10 000 – 50 000 ₽', min: 10000, max: 50000 },
  { label: '50 000 – 200 000 ₽', min: 50000, max: 200000 },
  { label: 'От 200 000 ₽', min: 200000, max: undefined },
]

type SearchParams = { category?: string; search?: string; price?: string; page?: string }

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const priceIdx = Number(params.price) || 0
  const priceRange = PRICE_RANGES[priceIdx]

  const [{ services, total, pages }, categories, favoriteIds] = await Promise.all([
    getServices({
      categorySlug: params.category,
      search: params.search,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      page,
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    getFavoriteIds(),
  ])

  const makeUrl = (overrides: Partial<SearchParams & { page: string }>) => {
    const p = { ...params, ...overrides }
    const q = Object.entries(p)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
      .join('&')
    return q ? `/catalog?${q}` : '/catalog'
  }

  const filterLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '9px 20px',
    fontSize: '13px', fontWeight: active ? 600 : 400,
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    background: active ? 'var(--primary-light)' : 'transparent',
    transition: 'background 0.15s, color 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
        {/* Mobile: quick category links */}
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

          {/* Sidebar */}
          <aside className="sidebar-hide" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Search */}
            <div style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.1px' }}>Поиск</p>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <form method="get" action="/catalog">
                  {params.category && <input type="hidden" name="category" value={params.category} />}
                  {params.price && <input type="hidden" name="price" value={params.price} />}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text" name="search"
                      defaultValue={params.search}
                      placeholder="Название..."
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
                    }}>
                      →
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Categories */}
            <div style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>Категория</p>
              </div>
              <div style={{ padding: '8px 0' }}>
                <Link href={makeUrl({ category: '' })} style={filterLinkStyle(!params.category)}>
                  <span>Все категории</span>
                  {!params.category && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>}
                </Link>
                {categories.map(cat => (
                  <Link key={cat.id} href={makeUrl({ category: cat.slug })} style={{
                    ...filterLinkStyle(params.category === cat.slug),
                    gap: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <span style={{ fontSize: '15px', lineHeight: 1 }}>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                    {params.category === cat.slug && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>}
                  </Link>
                ))}
              </div>
            </div>

            {/* Price */}
            <div style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>Цена</p>
              </div>
              <div style={{ padding: '8px 0' }}>
                {PRICE_RANGES.map((range, i) => (
                  <Link key={i} href={makeUrl({ price: String(i), page: '1' })} style={filterLinkStyle(priceIdx === i)}>
                    <span>{range.label}</span>
                    {priceIdx === i && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
                  Каталог услуг
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
                  Найдено: {total} предложений
                </p>
              </div>
              <Link href="/dashboard/services/new" style={{
                padding: '9px 20px', borderRadius: '50px',
                background: 'var(--primary)', color: '#fff',
                fontSize: '13px', fontWeight: 600,
                boxShadow: '0 2px 8px rgba(249,115,22,0.28)',
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
