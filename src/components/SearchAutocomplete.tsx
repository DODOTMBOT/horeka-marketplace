'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchAutocomplete({
  initialValue = '',
  hiddenFields = {},
}: {
  initialValue?: string
  hiddenFields?: Record<string, string>
}) {
  const [value, setValue] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<{ titles: string[]; tags: string[] }>({ titles: [], tags: [] })
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const router = useRouter()

  useEffect(() => {
    if (value.length < 2) { setSuggestions({ titles: [], tags: [] }); setOpen(false); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
      const data = await res.json()
      setSuggestions(data)
      setOpen(true)
    }, 250)
    return () => clearTimeout(timer.current)
  }, [value])

  function pick(term: string, isTag = false) {
    setOpen(false)
    const params = new URLSearchParams(
      Object.entries(hiddenFields).filter(([, v]) => v)
    )
    if (isTag) {
      params.set('tag', term)
      params.delete('search')
    } else {
      params.set('search', term)
    }
    params.delete('page')
    router.push(`/catalog?${params.toString()}`)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setOpen(false)
    const params = new URLSearchParams(
      Object.entries(hiddenFields).filter(([, v]) => v)
    )
    if (value) params.set('search', value)
    params.delete('page')
    router.push(`/catalog?${params.toString()}`)
  }

  const hasItems = suggestions.titles.length > 0 || suggestions.tags.length > 0

  return (
    <form onSubmit={submit}>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            value={value}
            onChange={e => { setValue(e.target.value); setOpen(true) }}
            onFocus={() => value.length >= 2 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 180)}
            placeholder="Название, тег..."
            style={{
              flex: 1, padding: '8px 10px', borderRadius: '6px',
              border: '1.5px solid var(--border)', background: 'var(--bg)',
              fontSize: '13px', color: 'var(--text)', outline: 'none',
            }}
          />
          <button type="submit" style={{
            padding: '8px 12px', borderRadius: '6px',
            background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 700,
            border: 'none', cursor: 'pointer', flexShrink: 0,
          }}>→</button>
        </div>

        {open && hasItems && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
            background: '#fff', border: '1px solid var(--border)', borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden',
          }}>
            {suggestions.titles.length > 0 && (
              <>
                <div style={{ padding: '6px 12px 2px', fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Услуги
                </div>
                {suggestions.titles.map(t => (
                  <button key={t} type="button" onMouseDown={() => pick(t)} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '8px 12px', textAlign: 'left',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '13px', color: 'var(--text)',
                  }}>
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>🔍</span>
                    {t}
                  </button>
                ))}
              </>
            )}
            {suggestions.tags.length > 0 && (
              <>
                <div style={{ padding: '6px 12px 2px', fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderTop: suggestions.titles.length ? '1px solid var(--border)' : 'none', marginTop: suggestions.titles.length ? '4px' : 0 }}>
                  Теги
                </div>
                {suggestions.tags.map(tag => (
                  <button key={tag} type="button" onMouseDown={() => pick(tag, true)} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '8px 12px', textAlign: 'left',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '13px', color: 'var(--text)',
                  }}>
                    <span style={{ fontSize: '12px' }}>#</span>
                    {tag}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </form>
  )
}
