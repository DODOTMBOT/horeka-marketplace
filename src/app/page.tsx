import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getHomepageConfig } from '@/lib/siteConfig'
import type { HeroV2 } from '@/lib/siteConfig'
import type { Metadata } from 'next'
import AiPanelAnimated from './AiPanelAnimated'
import CloudSections from '@/components/CloudSections'

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


export default async function LandingPage() {
  const cfg = await getHomepageConfig()
  const hero = cfg.heroV2

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <Navbar />
      <HeroSection hero={hero} />
      <CloudSections />
    </div>
  )
}
