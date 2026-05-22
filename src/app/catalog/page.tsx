import Link from 'next/link'
import { type Metadata } from 'next'
import Navbar from '@/components/Navbar'
import ServiceCard from '@/components/ServiceCard'
import TagsCloud from './TagsCloud'
import SearchAutocomplete from '@/components/SearchAutocomplete'
import FormatPicker from './FormatPicker'
import { getServices, getAllTags } from '@/actions/services'
import { getFavoriteIds } from '@/actions/favorites'
import { getCatalogConfig } from '@/lib/siteConfig'
import { prisma } from '@/lib/prisma'

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams
  if (params.search) return { title: `Поиск: ${params.search}`, description: `Результаты поиска по запросу "${params.search}" в каталоге Unit One` }
  if (params.category) return { title: `Каталог — ${params.category}`, description: `Услуги категории ${params.category} на Unit One` }
  if (params.tag) return { title: `#${params.tag} — каталог`, description: `Услуги с тегом ${params.tag} на Unit One` }
  if (params.format) {
    const label = params.format === 'digital' ? 'Инструменты' : params.format === 'service' ? 'Специалисты' : 'Проекты'
    return { title: `${label} — каталог`, description: 'Услуги на Unit One' }
  }
  return { title: 'Каталог', description: 'Услуги специалистов, поставщики продуктов и оборудования для ресторанов, отелей и кафе на Unit One' }
}

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Новые' },
  { value: 'popular',    label: 'Популярные' },
  { value: 'price_asc',  label: 'Цена ↑' },
  { value: 'price_desc', label: 'Цена ↓' },
]

type SearchParams = {
  category?: string
  search?: string
  priceMin?: string
  priceMax?: string
  tag?: string
  page?: string
  sort?: string
  format?: string
}

function Pagination({ page, pages, buildUrl }: { page: number; pages: number; buildUrl: (o: Partial<SearchParams>) => string }) {
  if (pages <= 1) return null
  const items: (number | 'ellipsis')[] = []
  if (pages <= 7) {
    for (let i = 1; i <= pages; i++) items.push(i)
  } else {
    items.push(1)
    if (page > 3) items.push('ellipsis')
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) items.push(i)
    if (page < pages - 2) items.push('ellipsis')
    items.push(pages)
  }
  return (
    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center', marginTop: '32px' }}>
      {page > 1 && (
        <Link href={buildUrl({ page: String(page - 1) })} style={{
          padding: '8px 14px', borderRadius: 'var(--r-sm)', fontSize: '13px', fontWeight: 700,
          background: 'var(--paper-2)', color: 'var(--ink)', border: '1.5px solid var(--line)', textDecoration: 'none',
        }}>← Назад</Link>
      )}
      {items.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`e${idx}`} style={{ padding: '8px 6px', fontSize: '13px', color: 'var(--muted)' }}>…</span>
        ) : (
          <Link key={item} href={buildUrl({ page: String(item) })} style={{
            width: '36px', height: '36px', borderRadius: 'var(--r-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: item === page ? 800 : 500,
            background: item === page ? 'var(--fmt-accent)' : 'var(--paper-2)',
            color: item === page ? 'var(--fmt-text)' : 'var(--muted)',
            border: `1.5px solid ${item === page ? 'var(--fmt-accent)' : 'var(--line)'}`,
            textDecoration: 'none',
            transition: 'all 0.15s',
          }}>{item}</Link>
        )
      )}
      {page < pages && (
        <Link href={buildUrl({ page: String(page + 1) })} style={{
          padding: '8px 14px', borderRadius: 'var(--r-sm)', fontSize: '13px', fontWeight: 700,
          background: 'var(--paper-2)', color: 'var(--ink)', border: '1.5px solid var(--line)', textDecoration: 'none',
        }}>Вперёд →</Link>
      )}
    </div>
  )
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const activeFormat = params.format

  const catalogCfg = await getCatalogConfig()

  // Resolve accent from admin-configured format block
  const activeBlock = catalogCfg.formats.find(f => f.key === activeFormat)
  const accentBg   = activeBlock?.bgColor  ?? 'var(--ink)'
  const accentText = activeBlock?.textColor === 'light' ? '#fff' : '#0F0F12'

  let services: Awaited<ReturnType<typeof getServices>>['services'] = []
  let total = 0
  let pages = 0
  let categories: { id: string; slug: string; name: string; icon: string | null; format: string }[] = []
  let allTags: { tag: string; count: number }[] = []
  let favoriteIds: string[] = []

  if (activeFormat) {
    const page = Number(params.page) || 1
    const minPrice = params.priceMin ? Number(params.priceMin) : undefined
    const maxPrice = params.priceMax ? Number(params.priceMax) : undefined
    const sort = (params.sort as 'newest' | 'price_asc' | 'price_desc' | 'popular') || 'newest'

    const results = await Promise.all([
      getServices({
        categorySlug: params.category,
        search: params.search,
        minPrice,
        maxPrice,
        tag: params.tag,
        page,
        sort,
        format: activeFormat,
      }),
      prisma.category.findMany({
        where: { format: activeFormat },
        orderBy: { name: 'asc' },
        select: { id: true, slug: true, name: true, icon: true, format: true },
      }),
      getAllTags({ format: activeFormat }),
      getFavoriteIds(),
    ])
    ;({ services, total, pages } = results[0])
    categories = results[1]
    allTags    = results[2]
    favoriteIds = results[3]
  }

  const page = Number(params.page) || 1
  const sort = (params.sort as 'newest' | 'price_asc' | 'price_desc' | 'popular') || 'newest'
  const activeFiltersCount = [
    params.category, params.search, params.priceMin, params.priceMax, params.tag,
  ].filter(Boolean).length

  const buildUrl = (overrides: Partial<SearchParams>) => {
    const merged = { ...params, page: '1', ...overrides }
    const q = Object.entries(merged)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
      .join('&')
    return q ? `/catalog?${q}` : '/catalog'
  }

  const tagHrefs    = Object.fromEntries(allTags.map(({ tag }) => [tag, buildUrl({ tag })]))
  const clearTagHref = buildUrl({ tag: '' })

  const hiddenFields: Record<string, string> = {}
  if (params.format)   hiddenFields.format   = params.format
  if (params.category) hiddenFields.category = params.category
  if (params.priceMin) hiddenFields.priceMin = params.priceMin
  if (params.priceMax) hiddenFields.priceMax = params.priceMax
  if (params.tag)      hiddenFields.tag      = params.tag
  if (params.sort)     hiddenFields.sort     = params.sort

  // Thin accent strip color for sidebar labels
  const accentLight = `${accentBg}22`  // 13% opacity tint

  return (
    <>
      <style>{`
        @keyframes contentReveal {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .catalog-content { animation: contentReveal 0.45s cubic-bezier(0.22,1,0.36,1) both; }

        /* Category chips */
        .cat-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 999px;
          font-size: 12px; font-weight: 600; text-decoration: none;
          border: 1.5px solid var(--line); background: var(--paper-2);
          color: var(--muted); transition: all 0.15s; white-space: nowrap;
          font-family: var(--ff-display); letter-spacing: -0.01em;
        }
        .cat-chip:hover { border-color: var(--fmt-accent); color: var(--ink); background: #fff; }
        .cat-chip.active {
          background: var(--fmt-accent); border-color: transparent;
          color: var(--fmt-text); font-weight: 800;
          box-shadow: 0 4px 14px color-mix(in srgb, var(--fmt-accent) 35%, transparent);
        }

        /* Sort chips */
        .sort-chip {
          padding: 7px 12px; font-size: 12px; font-weight: 600;
          text-decoration: none; white-space: nowrap; border-radius: var(--r-sm);
          color: var(--muted); background: transparent; transition: all 0.15s;
          font-family: var(--ff-display); letter-spacing: -0.01em;
        }
        .sort-chip:hover { color: var(--ink); background: rgba(0,0,0,0.05); }
        .sort-chip.active {
          background: var(--fmt-accent); color: var(--fmt-text); font-weight: 800;
          box-shadow: 0 2px 8px color-mix(in srgb, var(--fmt-accent) 30%, transparent);
        }

        /* Price inputs */
        .price-input {
          width: 100%; padding: 10px 12px; border-radius: var(--r-md);
          border: 1.5px solid var(--line); background: var(--paper-2);
          font-size: 14px; font-weight: 600; color: var(--ink);
          outline: none; text-align: center; font-family: var(--ff-display);
          transition: border-color 0.15s, background 0.15s;
        }
        .price-input:focus { border-color: var(--fmt-accent); background: #fff; }
        .price-input::placeholder { color: var(--muted); font-weight: 400; }

        /* Price submit button */
        .price-btn {
          flex-shrink: 0; width: 40px; height: 40px;
          border-radius: var(--r-md);
          background: var(--fmt-accent); color: var(--fmt-text);
          border: none; cursor: pointer; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s, transform 0.15s;
        }
        .price-btn:hover { opacity: 0.85; transform: scale(1.05); }

        /* Sidebar label accent line */
        .sidebar-label {
          font-family: var(--ff-mono); font-size: 10px; font-weight: 700;
          color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 10px;
          display: flex; align-items: center; gap: 7px;
        }
        .sidebar-label::before {
          content: ''; display: block;
          width: 12px; height: 2px; border-radius: 1px;
          background: var(--fmt-accent); flex-shrink: 0;
        }

        /* Tag cloud card header accent */
        .tag-cloud-header {
          font-family: var(--ff-mono); font-size: 10px; font-weight: 700;
          color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 7px;
        }
        .tag-cloud-header::before {
          content: ''; display: block;
          width: 12px; height: 2px; border-radius: 1px;
          background: var(--fmt-accent); flex-shrink: 0;
        }

        /* Count number accent */
        .count-num { color: var(--fmt-accent); }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
        <Navbar />

        {/* ── Hero ── */}
        <section style={{ background: 'var(--paper)', padding: '44px 28px 40px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '32px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em' }}>UNIT ONE</span>
                  <span style={{ color: 'var(--muted)', fontSize: '10px' }}>→</span>
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'var(--ink)', letterSpacing: '0.08em' }}>{catalogCfg.headline.toUpperCase()}</span>
                </div>
                <h1 style={{
                  fontFamily: 'var(--ff-display)', fontWeight: 800,
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  color: 'var(--ink)', lineHeight: 0.95,
                  letterSpacing: '-0.045em', marginBottom: '10px',
                }}>
                  {catalogCfg.headline}
                </h1>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>
                  {catalogCfg.subheadline}
                </p>
              </div>
              <Link href="/dashboard/services/new" style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '11px 20px', borderRadius: 'var(--r-md)',
                background: 'var(--ink)', color: 'var(--paper)',
                fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                letterSpacing: '-0.01em', flexShrink: 0,
              }}>
                + Разместить
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <FormatPicker config={catalogCfg} activeFormat={activeFormat} currentSearch={params.search ?? ''} />
          </div>
        </section>

        {/* ── Catalog content ── */}
        {activeFormat && (
          <div
            key={activeFormat}
            className="catalog-content"
            style={{
              // Inject format accent as CSS variables for the whole content zone
              '--fmt-accent': accentBg,
              '--fmt-text': accentText,
              borderTop: '1px solid var(--line)',
              padding: '32px 28px 56px',
              maxWidth: '1280px', margin: '0 auto',
            } as React.CSSProperties}
          >
            <div className="layout-with-sidebar" style={{ gap: '40px' }}>

              {/* ── Sidebar ── */}
              <aside className="sidebar-hide" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* Search */}
                <div>
                  <p className="sidebar-label">Поиск</p>
                  <SearchAutocomplete initialValue={params.search} hiddenFields={hiddenFields} />
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div>
                    <p className="sidebar-label">Категория</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[{ slug: '', name: 'Все', icon: null }, ...categories].map(cat => {
                        const isActive = cat.slug === '' ? !params.category : params.category === cat.slug
                        return (
                          <Link
                            key={cat.slug || '__all'}
                            href={buildUrl({ category: cat.slug })}
                            className={`cat-chip${isActive ? ' active' : ''}`}
                          >
                            {cat.icon && <span style={{ fontSize: '13px' }}>{cat.icon}</span>}
                            {cat.name}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div>
                  <p className="sidebar-label">Цена, ₽</p>
                  <form method="get" action="/catalog">
                    {params.format   && <input type="hidden" name="format"   value={params.format} />}
                    {params.category && <input type="hidden" name="category" value={params.category} />}
                    {params.search   && <input type="hidden" name="search"   value={params.search} />}
                    {params.tag      && <input type="hidden" name="tag"      value={params.tag} />}
                    {params.sort     && <input type="hidden" name="sort"     value={params.sort} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="number" name="priceMin" defaultValue={params.priceMin} placeholder="от"  min="0" className="price-input" />
                      <span style={{ color: 'var(--line)', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>—</span>
                      <input type="number" name="priceMax" defaultValue={params.priceMax} placeholder="до" min="0" className="price-input" />
                      <button type="submit" className="price-btn">→</button>
                    </div>
                    {(params.priceMin || params.priceMax) && (
                      <Link href={buildUrl({ priceMin: '', priceMax: '' })} style={{
                        fontSize: '11px', color: 'var(--muted)', marginTop: '8px',
                        display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none',
                      }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                        сбросить цену
                      </Link>
                    )}
                  </form>
                </div>

                {/* Reset all */}
                {activeFiltersCount > 0 && (
                  <Link href={`/catalog?format=${activeFormat}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px 16px', borderRadius: 'var(--r-md)',
                    fontSize: '12px', fontWeight: 800, letterSpacing: '-0.01em',
                    background: accentLight,
                    border: `1px solid ${accentBg}44`,
                    color: accentBg === '#0F0F12' || accentBg.startsWith('#0') ? accentBg : accentBg,
                    textDecoration: 'none',
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    Сбросить фильтры ({activeFiltersCount})
                  </Link>
                )}
              </aside>

              {/* ── Main content ── */}
              <div style={{ minWidth: 0 }}>

                {/* Sort + count bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
                }}>
                  <p style={{ fontFamily: 'var(--ff-display)', fontSize: '14px', color: 'var(--muted)', fontWeight: 500 }}>
                    <span className="count-num" style={{ fontWeight: 800, fontSize: '16px' }}>{total}</span>{' '}
                    {total === 1 ? 'предложение' : total < 5 ? 'предложения' : 'предложений'}
                  </p>
                  <div style={{
                    display: 'flex', gap: '2px', padding: '4px',
                    background: 'var(--paper-2)', borderRadius: 'var(--r-md)',
                    border: '1px solid var(--line)',
                  }}>
                    {SORT_OPTIONS.map(opt => (
                      <Link
                        key={opt.value}
                        href={buildUrl({ sort: opt.value })}
                        className={`sort-chip${sort === opt.value ? ' active' : ''}`}
                      >
                        {opt.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Tag cloud */}
                {allTags.length > 0 && (
                  <div style={{
                    marginBottom: '24px', padding: '20px 24px',
                    background: '#fff', borderRadius: 'var(--r-lg)',
                    border: '1px solid var(--line)',
                    borderTop: `3px solid ${accentBg}`,
                  }}>
                    <p className="tag-cloud-header">Облако тегов</p>
                    <TagsCloud
                      tags={allTags}
                      activeTag={params.tag}
                      tagHrefs={tagHrefs}
                      clearTagHref={clearTagHref}
                      accentColor={accentBg}
                      accentTextColor={accentText}
                    />
                  </div>
                )}

                {/* Cards */}
                {services.length === 0 ? (
                  <div style={{
                    background: '#fff', border: '1px solid var(--line)',
                    borderRadius: 'var(--r-lg)', padding: '60px 32px', textAlign: 'center',
                  }}>
                    <p style={{ fontSize: '36px', marginBottom: '16px' }}>🔍</p>
                    <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '28px', color: 'var(--ink)', letterSpacing: '-0.04em', marginBottom: '8px' }}>
                      Ничего не найдено
                    </p>
                    <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px' }}>Попробуйте изменить фильтры</p>
                    <Link href={`/catalog?format=${activeFormat}`} style={{
                      display: 'inline-block', padding: '12px 28px', borderRadius: 'var(--r-md)',
                      background: 'var(--fmt-accent)', color: 'var(--fmt-text)',
                      fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                    }}>
                      Сбросить фильтры
                    </Link>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))', gap: '20px' }}>
                      {services.map(s => <ServiceCard key={s.id} service={s} isFavorited={favoriteIds.includes(s.id)} />)}
                    </div>
                    <Pagination page={page} pages={pages} buildUrl={buildUrl} />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
