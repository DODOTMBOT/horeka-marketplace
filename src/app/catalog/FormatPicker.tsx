'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CatalogConfig, FormatBlock } from '@/lib/catalogDefaults'

export default function FormatPicker({
  config,
  activeFormat,
  currentSearch,
}: {
  config: CatalogConfig
  activeFormat: string | undefined
  currentSearch: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  // Optimistic: track which format was just clicked before navigation completes
  const [optimistic, setOptimistic] = useState<string | null | 'reset'>(null)

  // The "visual" active format: what we show immediately on click
  const visualActive = optimistic === 'reset' ? undefined : (optimistic ?? activeFormat)

  function handleClick(key: string) {
    const isActive = (visualActive === key)
    if (isActive) {
      setOptimistic('reset')
      startTransition(() => {
        router.push('/catalog', { scroll: false })
      })
    } else {
      setOptimistic(key)
      const params = new URLSearchParams({ format: key })
      if (currentSearch) params.set('search', currentSearch)
      startTransition(() => {
        router.push(`/catalog?${params.toString()}`, { scroll: false })
      })
    }
  }

  return (
    <>
      <style>{`
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .fmt-card {
          transition: filter 0.3s cubic-bezier(0.22,1,0.36,1),
                      opacity 0.3s cubic-bezier(0.22,1,0.36,1),
                      box-shadow 0.3s cubic-bezier(0.22,1,0.36,1),
                      transform 0.3s cubic-bezier(0.22,1,0.36,1);
          animation: cardReveal 0.5s cubic-bezier(0.22,1,0.36,1) both;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .fmt-card:nth-child(1) { animation-delay: 0ms; }
        .fmt-card:nth-child(2) { animation-delay: 60ms; }
        .fmt-card:nth-child(3) { animation-delay: 120ms; }
        .fmt-card.active {
          box-shadow: 0 16px 48px rgba(0,0,0,0.22);
          transform: translateY(-3px) scale(1.01) !important;
        }
        .fmt-card.dimmed {
          filter: grayscale(1) brightness(0.65);
          opacity: 0.45;
          transform: scale(0.98) !important;
        }
        .fmt-card:not(.active):not(.dimmed):hover {
          transform: translateY(-2px) scale(1.005);
          box-shadow: 0 8px 28px rgba(0,0,0,0.12);
        }
        .fmt-cta-arrow {
          transition: transform 0.2s;
        }
        .fmt-card:hover .fmt-cta-arrow {
          transform: translateX(3px);
        }
      `}</style>

      <div style={{ display: 'flex', gap: '12px' }}>
        {config.formats.map((block, i) => {
          const isActive = visualActive === block.key
          const isDimmed = visualActive !== undefined && visualActive !== block.key
          const isLight = block.textColor === 'light'
          const textMain = isLight ? '#fff' : 'var(--ink)'
          const textSub  = isLight ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'
          const cardBg   = isLight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'

          return (
            <div
              key={block.key}
              role="button"
              tabIndex={0}
              onClick={() => handleClick(block.key)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(block.key) }}
              className={`fmt-card${isActive ? ' active' : isDimmed ? ' dimmed' : ''}`}
              style={{
                flex: 1, minWidth: 0,
                background: block.bgColor,
                borderRadius: 'var(--r-xl)',
                padding: '32px',
                position: 'relative', overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              <p style={{
                fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 600,
                color: isLight ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                letterSpacing: '0.1em', marginBottom: '16px',
              }}>
                {String(i + 1).padStart(2, '0')} / {String(config.formats.length).padStart(2, '0')}
              </p>

              <h2 style={{
                fontFamily: 'var(--ff-display)', fontWeight: 800,
                fontSize: '28px', color: textMain,
                lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '4px',
              }}>
                {block.title}
              </h2>
              <p style={{ fontSize: '12px', color: textSub, marginBottom: '14px', fontWeight: 500 }}>
                {block.subtitle}
              </p>
              <p style={{ fontSize: '13px', color: textSub, lineHeight: 1.55, marginBottom: '20px' }}>
                {block.description}
              </p>

              <div style={{
                display: 'flex', gap: '16px', marginBottom: '20px',
                padding: '12px 14px', borderRadius: 'var(--r-md)', background: cardBg,
              }}>
                <div>
                  <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 900, fontSize: '24px', color: textMain, lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {block.stat}
                  </p>
                  <p style={{ fontSize: '10px', color: textSub, marginTop: '2px', fontFamily: 'var(--ff-mono)', letterSpacing: '0.04em' }}>
                    {block.statLabel.toUpperCase()}
                  </p>
                </div>
                <div style={{ borderLeft: `1px solid ${isLight ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`, paddingLeft: '16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: textMain, lineHeight: 1.3 }}>{block.priceHint}</p>
                  <p style={{ fontSize: '11px', color: textSub, marginTop: '2px' }}>{block.timeHint}</p>
                </div>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: '13px', color: textMain, letterSpacing: '-0.01em' }}>
                  {isActive ? 'Сбросить' : 'Выбрать'}
                </span>
                <svg className="fmt-cta-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textMain} strokeWidth="2.5" strokeLinecap="round">
                  <path d={isActive ? 'M18 6L6 18M6 6l12 12' : 'M5 12h14M12 5l7 7-7 7'} />
                </svg>
              </div>

              {/* Active ring overlay */}
              {isActive && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 'var(--r-xl)',
                  border: '2.5px solid rgba(255,255,255,0.45)',
                  pointerEvents: 'none',
                  animation: 'fadeIn 0.2s ease both',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Global loading shimmer when navigating */}
      {pending && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '3px',
          background: 'var(--blue)', zIndex: 9999,
          animation: 'loadBar 0.8s ease-in-out infinite',
        }} />
      )}
      <style>{`
        @keyframes loadBar {
          0%   { transform: scaleX(0); transform-origin: left; }
          50%  { transform: scaleX(0.6); transform-origin: left; }
          100% { transform: scaleX(1); transform-origin: left; opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
      `}</style>
    </>
  )
}
