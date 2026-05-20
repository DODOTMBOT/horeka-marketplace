'use client'

import { useState } from 'react'
import Link from 'next/link'

const SHOW_INITIAL = 10

export default function TagsCloud({
  tags,
  activeTag,
  tagHrefs,
  clearTagHref,
}: {
  tags: { tag: string; count: number }[]
  activeTag?: string
  tagHrefs: Record<string, string>
  clearTagHref: string
}) {
  const [expanded, setExpanded] = useState(false)

  const filtered = tags.filter(t => t.tag !== activeTag)
  const visible = expanded ? filtered : filtered.slice(0, SHOW_INITIAL)
  const hasMore = filtered.length > SHOW_INITIAL

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
      {activeTag && (
        <Link href={clearTagHref} style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          fontSize: '12px', fontWeight: 700,
          padding: '4px 11px', borderRadius: '50px',
          background: 'var(--primary)', color: '#fff',
          textDecoration: 'none',
        }}>
          #{activeTag} <span style={{ fontSize: '15px', lineHeight: 1, opacity: 0.8 }}>×</span>
        </Link>
      )}

      {visible.map(({ tag, count }) => (
        <Link key={tag} href={tagHrefs[tag] ?? '/catalog'} style={{
          display: 'inline-flex', alignItems: 'center', gap: '3px',
          fontSize: '12px', fontWeight: 500,
          padding: '4px 10px', borderRadius: '50px',
          background: '#f3f4f6', color: '#6b7280',
          border: '1px solid #e5e7eb',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          #{tag}
          <span style={{ fontSize: '10px', opacity: 0.5 }}>{count}</span>
        </Link>
      ))}

      {hasMore && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            fontSize: '12px', fontWeight: 600, color: 'var(--primary)',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 2px', textDecoration: 'none',
          }}
        >
          {expanded ? '← Скрыть' : `Ещё ${filtered.length - SHOW_INITIAL} →`}
        </button>
      )}

      {!tags.length && !activeTag && (
        <span style={{ fontSize: '12px', color: '#d1d5db' }}>Тегов пока нет</span>
      )}
    </div>
  )
}
