import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getHomepageConfig } from '@/lib/siteConfig'
import type { GridSection, HeroV2 } from '@/lib/siteConfig'
import type { Metadata } from 'next'
import AiPanelAnimated from './AiPanelAnimated'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Unit One — платформа для профессионалов HoReCa',
  description: 'Услуги специалистов, вакансии, поставщики продуктов и оборудования для ресторанов, отелей и кафе.',
}

function _AiPanelStatic({ hero }: { hero: HeroV2 }) {
  const chips = hero.aiChips ? hero.aiChips.split(',').map(s => s.trim()).filter(Boolean) : []
  return (
    <div style={{
      background: 'var(--ink)',
      borderRadius: 'var(--r-xl)',
      padding: '24px',
      width: '320px',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '6px',
            background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 2 12 12"/><path d="m22 2-5 5"/><path d="m22 2-5 0"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>
            UNIT.AI · ASSISTANT
          </span>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          {['#f87171','#fbbf24','#4ade80'].map(c => (
            <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.7 }} />
          ))}
        </div>
      </div>

      {/* Chat bubble */}
      <div style={{
        background: 'rgba(255,255,255,0.07)',
        borderRadius: 'var(--r-md)',
        padding: '14px 16px',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'var(--blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: 0 }}>
            {hero.aiQuery}
          </p>
        </div>
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        {chips.map((chip, i) => (
          <span key={i} style={{
            fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600,
            padding: '4px 10px', borderRadius: '999px',
            background: i === 0 ? 'var(--blue)' : i === 1 ? 'var(--lime)' : 'rgba(255,255,255,0.1)',
            color: i === 1 ? 'var(--ink)' : '#fff',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}>
            {chip}
          </span>
        ))}
      </div>

      {/* CTA button */}
      <Link href="/catalog" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '13px 20px', borderRadius: 'var(--r-md)',
        background: 'var(--lime)', color: 'var(--ink)',
        fontSize: '13px', fontWeight: 800, textDecoration: 'none',
        letterSpacing: '-0.01em',
      }}>
        Подобрать поставщика
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </Link>
    </div>
  )
}

function HeroSection({ hero }: { hero: HeroV2 }) {
  return (
    <section style={{ background: 'var(--paper)', padding: '52px 28px 56px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--blue)', borderRadius: '999px',
          padding: '5px 14px', marginBottom: '28px',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--lime)', display: 'inline-block', flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600,
            color: '#fff', letterSpacing: '0.08em',
          }}>
            {hero.badge}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '40px' }}>
          {/* Left: heading + desc */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: 'var(--ff-display)',
              fontWeight: 800,
              fontSize: 'clamp(48px, 7.5vw, 96px)',
              color: 'var(--ink)',
              lineHeight: 0.92,
              letterSpacing: '-0.045em',
              marginBottom: '20px',
            }}>
              <span style={{ display: 'block' }}>{hero.titleLine1}</span>
              <span style={{ display: 'block' }}>{hero.titleLine2}</span>
              <span style={{ display: 'inline' }}>
                <span style={{ color: 'var(--blue)' }}>{hero.titleAccent} </span>
                <span style={{
                  background: 'var(--lime)',
                  padding: '0 6px 4px',
                  borderRadius: '4px',
                  color: 'var(--ink)',
                }}>{hero.titleHighlight}</span>
              </span>
            </h1>

            <p style={{
              fontSize: '16px', color: 'var(--muted)', lineHeight: 1.65,
              maxWidth: '480px', marginBottom: '40px', letterSpacing: '-0.01em',
            }}>
              {hero.description}
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href="/catalog" style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '13px 24px', borderRadius: 'var(--r-md)',
                background: 'var(--ink)', color: 'var(--paper)',
                fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}>
                Открыть каталог
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/register?role=SELLER" style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '13px 24px', borderRadius: 'var(--r-md)',
                background: 'transparent', border: '1.5px solid var(--line)',
                fontSize: '14px', fontWeight: 600, color: 'var(--ink)', textDecoration: 'none',
              }}>
                Стать поставщиком
              </Link>
            </div>
          </div>

          {/* Right: AI panel */}
          <div className="sidebar-hide">
            <AiPanelAnimated />
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionCard({ section, index, total }: { section: GridSection; index: number; total: number }) {
  const isLight = section.textColor === 'light'
  const textMain  = isLight ? '#fff' : 'var(--ink)'
  const textSub   = isLight ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'
  const textMuted = isLight ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'
  const divider   = isLight ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.08)'
  const catBg     = isLight ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
  const catBorder = isLight ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'

  return (
    <div style={{
      background: section.bgColor,
      padding: '36px 32px',
      display: 'flex',
      flexDirection: 'column',
      borderRight: `1px solid ${divider}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dodo badge */}
      {index === 0 && (
        <Link href="/dodo" style={{
          position: 'absolute', top: '28px', right: '-8px',
          display: 'inline-flex', alignItems: 'center',
          padding: '8px 20px', borderRadius: '999px',
          background: '#e16919', color: '#fff',
          fontSize: '13px', fontWeight: 800,
          textDecoration: 'none', letterSpacing: '-0.01em',
          transform: 'rotate(3deg)',
          boxShadow: '0 4px 16px rgba(225,105,25,0.45)',
          whiteSpace: 'nowrap',
          zIndex: 1,
        }}>
          Спецпроект Додо
        </Link>
      )}
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{
          fontFamily: 'var(--ff-mono)', fontSize: '9px', fontWeight: 700,
          color: textMuted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px',
        }}>
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>
        <h2 style={{
          fontFamily: 'var(--ff-display)', fontWeight: 800,
          fontSize: '26px', color: textMain,
          lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '6px',
        }}>
          {section.title}
        </h2>
        <p style={{ fontSize: '13px', color: textSub, lineHeight: 1.4 }}>
          {section.subtitle}
        </p>
      </div>

      {/* Category rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {section.categories.map((cat, ci) => (
          <Link
            key={ci}
            href={cat.href ?? (cat.categorySlug ? `/catalog?category=${cat.categorySlug}` : section.ctaHref)}
            style={{
              background: catBg,
              border: `1px solid ${catBorder}`,
              borderRadius: '12px',
              padding: '14px 16px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              transition: 'background 0.15s',
            }}
          >
            <div>
              <p style={{
                fontSize: '14px', fontWeight: 700, color: textMain,
                letterSpacing: '-0.02em', marginBottom: '2px',
              }}>
                {cat.name}
              </p>
              <p style={{ fontSize: '11px', color: textSub, lineHeight: 1.3 }}>
                {cat.hint}
              </p>
            </div>
            <p style={{
              fontFamily: 'var(--ff-display)', fontWeight: 900,
              fontSize: '24px', color: textMain, lineHeight: 1,
              letterSpacing: '-0.04em', flexShrink: 0,
            }}>
              {typeof cat.count === 'number' ? cat.count.toLocaleString('ru-RU') : cat.count}
            </p>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '11px', color: textMuted, lineHeight: 1.5 }}>
          {section.stats}
        </p>
        <Link href={section.ctaHref} style={{
          fontFamily: 'var(--ff-display)', fontWeight: 700,
          fontSize: '13px', color: textMain,
          textDecoration: 'none', letterSpacing: '-0.01em',
          display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0,
          opacity: 0.8,
        }}>
          смотреть →
        </Link>
      </div>
    </div>
  )
}

export default async function LandingPage() {
  const [cfg, formatCounts] = await Promise.all([
    getHomepageConfig(),
    prisma.service.groupBy({
      by: ['format'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
    }),
  ])

  const countByFormat: Record<string, number> = {}
  for (const r of formatCounts) countByFormat[r.format] = r._count.id

  const hero = cfg.heroV2
  const rawSections = cfg.gridSections && cfg.gridSections.length > 0 ? cfg.gridSections : []

  // inject real counts into format-based category cards
  const sections = rawSections.map(section => ({
    ...section,
    categories: section.categories.map(cat => {
      const m = cat.href?.match(/[?&]format=(\w+)/)
      if (m) return { ...cat, count: countByFormat[m[1]] ?? 0 }
      return cat
    }),
  }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <Navbar />
      <HeroSection hero={hero} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        borderTop: '1px solid var(--line)',
      }}>
        {sections.map((section, i) => (
          <SectionCard key={i} section={section} index={i} total={sections.length} />
        ))}
      </div>
    </div>
  )
}
