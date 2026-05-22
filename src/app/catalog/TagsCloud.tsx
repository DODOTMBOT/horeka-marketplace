'use client'

import { useState } from 'react'
import Link from 'next/link'

const SHOW_INITIAL = 24

export default function TagsCloud({
  tags,
  activeTag,
  tagHrefs,
  clearTagHref,
  accentColor = 'var(--ink)',
  accentTextColor = '#fff',
}: {
  tags: { tag: string; count: number }[]
  activeTag?: string
  tagHrefs: Record<string, string>
  clearTagHref: string
  accentColor?: string
  accentTextColor?: string
}) {
  const [expanded, setExpanded] = useState(false)

  if (!tags.length && !activeTag) return null

  const minCount = Math.min(...tags.map(t => t.count))
  const maxCount = Math.max(...tags.map(t => t.count))
  const range = maxCount - minCount || 1

  function fontSize(count: number) {
    const ratio = (count - minCount) / range
    return 11 + Math.round(ratio * 10) // 11px → 21px
  }

  function fontWeight(count: number) {
    const ratio = (count - minCount) / range
    return ratio > 0.6 ? 800 : ratio > 0.3 ? 700 : 600
  }

  const others = tags.filter(t => t.tag !== activeTag)
  const visible = expanded ? others : others.slice(0, SHOW_INITIAL)
  const hasMore = others.length > SHOW_INITIAL

  return (
    <div>
      {activeTag && (
        <div style={{ marginBottom: '10px' }}>
          <Link href={clearTagHref} style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: 'var(--r-md)',
            background: accentColor, color: accentTextColor,
            fontSize: '12px', fontWeight: 800, textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}>
            #{activeTag}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'baseline' }}>
        {visible.map(({ tag, count }) => (
          <Link key={tag} href={tagHrefs[tag] ?? '/catalog'} style={{
            fontSize: `${fontSize(count)}px`,
            fontWeight: fontWeight(count),
            fontFamily: 'var(--ff-display)',
            color: 'var(--muted)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
            transition: 'color 0.12s',
            lineHeight: 1.4,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted)' }}
          >
            #{tag}
          </Link>
        ))}

        {hasMore && (
          <button onClick={() => setExpanded(v => !v)} style={{
            fontSize: '11px', fontWeight: 700, color: 'var(--muted)',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '2px 0', textDecoration: 'underline', textUnderlineOffset: '2px',
            letterSpacing: '-0.01em',
          }}>
            {expanded ? '← скрыть' : `+${others.length - SHOW_INITIAL} тегов`}
          </button>
        )}
      </div>
    </div>
  )
}
