'use client'

import { useState } from 'react'
import { saveCatalogConfig } from '@/actions/siteConfig'
import type { CatalogConfig, FormatBlock } from '@/lib/catalogDefaults'

const COLORS = ['#3D5AFE', '#0F0F12', '#FF6B5C', '#D7FF3A', '#16a34a', '#7c3aed', '#ea580c']

function FormatBlockEditor({
  block,
  onChange,
}: {
  block: FormatBlock
  onChange: (b: FormatBlock) => void
}) {
  const isLight = block.textColor === 'light'
  const textMain = isLight ? '#fff' : '#0F0F12'
  const textSub = isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      {/* Live preview */}
      <div style={{
        background: block.bgColor, borderRadius: '16px', padding: '24px',
        width: '220px', flexShrink: 0,
      }}>
        <p style={{ fontFamily: 'monospace', fontSize: '9px', color: textSub, letterSpacing: '0.1em', marginBottom: '12px' }}>
          {block.key === 'digital' ? '01' : block.key === 'service' ? '02' : '03'} / 03
        </p>
        <p style={{ fontWeight: 800, fontSize: '22px', color: textMain, letterSpacing: '-0.04em', marginBottom: '3px', lineHeight: 1 }}>
          {block.title || 'Заголовок'}
        </p>
        <p style={{ fontSize: '11px', color: textSub, marginBottom: '10px' }}>{block.subtitle}</p>
        <p style={{ fontSize: '11px', color: textSub, lineHeight: 1.5, marginBottom: '14px' }}>{block.description}</p>
        <div style={{
          padding: '10px 12px', borderRadius: '10px',
          background: isLight ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
          marginBottom: '12px',
        }}>
          <p style={{ fontWeight: 900, fontSize: '20px', color: textMain, lineHeight: 1, letterSpacing: '-0.04em' }}>{block.stat}</p>
          <p style={{ fontSize: '9px', color: textSub, fontFamily: 'monospace', letterSpacing: '0.04em', marginBottom: '8px' }}>{block.statLabel.toUpperCase()}</p>
          <p style={{ fontWeight: 700, fontSize: '12px', color: textMain }}>{block.priceHint}</p>
          <p style={{ fontSize: '10px', color: textSub }}>{block.timeHint}</p>
        </div>
        <p style={{ fontWeight: 700, fontSize: '12px', color: textMain }}>Перейти →</p>
      </div>

      {/* Fields */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <label style={{ gridColumn: '1/-1' }}>
          <p style={labelStyle}>Заголовок</p>
          <input className="admin-filter-input" style={{ width: '100%' }} value={block.title}
            onChange={e => onChange({ ...block, title: e.target.value })} />
        </label>
        <label>
          <p style={labelStyle}>Подзаголовок</p>
          <input className="admin-filter-input" style={{ width: '100%' }} value={block.subtitle}
            onChange={e => onChange({ ...block, subtitle: e.target.value })} />
        </label>
        <label>
          <p style={labelStyle}>Ключ (slug)</p>
          <input className="admin-filter-input" style={{ width: '100%' }} value={block.key}
            onChange={e => onChange({ ...block, key: e.target.value })} />
        </label>
        <label style={{ gridColumn: '1/-1' }}>
          <p style={labelStyle}>Описание</p>
          <textarea className="admin-filter-input" style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
            value={block.description}
            onChange={e => onChange({ ...block, description: e.target.value })} />
        </label>
        <label>
          <p style={labelStyle}>Цвет фона</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => onChange({ ...block, bgColor: c })} style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: c, border: block.bgColor === c ? '2px solid #111' : '2px solid transparent',
                cursor: 'pointer', outline: block.bgColor === c ? '1px solid #fff' : 'none',
                outlineOffset: '-3px',
              }} />
            ))}
            <input type="color" value={block.bgColor}
              onChange={e => onChange({ ...block, bgColor: e.target.value })}
              style={{ width: '24px', height: '24px', padding: 0, border: '1.5px solid #e0e0e0', borderRadius: '6px', cursor: 'pointer' }} />
          </div>
        </label>
        <label>
          <p style={labelStyle}>Текст</p>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            {(['light', 'dark'] as const).map(v => (
              <button key={v} onClick={() => onChange({ ...block, textColor: v })} style={{
                padding: '5px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                background: block.textColor === v ? '#111' : '#f0f0f0',
                color: block.textColor === v ? '#fff' : '#666',
                border: 'none', cursor: 'pointer',
              }}>{v === 'light' ? 'Светлый' : 'Тёмный'}</button>
            ))}
          </div>
        </label>
        <label>
          <p style={labelStyle}>Число (stat)</p>
          <input className="admin-filter-input" style={{ width: '100%' }} value={block.stat}
            onChange={e => onChange({ ...block, stat: e.target.value })} />
        </label>
        <label>
          <p style={labelStyle}>Подпись числа</p>
          <input className="admin-filter-input" style={{ width: '100%' }} value={block.statLabel}
            onChange={e => onChange({ ...block, statLabel: e.target.value })} />
        </label>
        <label>
          <p style={labelStyle}>Цена (подсказка)</p>
          <input className="admin-filter-input" style={{ width: '100%' }} value={block.priceHint}
            onChange={e => onChange({ ...block, priceHint: e.target.value })} />
        </label>
        <label>
          <p style={labelStyle}>Срок (подсказка)</p>
          <input className="admin-filter-input" style={{ width: '100%' }} value={block.timeHint}
            onChange={e => onChange({ ...block, timeHint: e.target.value })} />
        </label>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 800, color: '#999',
  textTransform: 'uppercase', letterSpacing: '0.08em',
  marginBottom: '5px',
}

export default function CatalogEditor({ initial }: { initial: CatalogConfig }) {
  const [cfg, setCfg] = useState<CatalogConfig>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(0)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')
    const res = await saveCatalogConfig(cfg)
    setSaving(false)
    if (res.error) { setError(res.error) } else { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  function updateFormat(i: number, block: FormatBlock) {
    const next = [...cfg.formats]
    next[i] = block
    setCfg({ ...cfg, formats: next })
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', borderBottom: '1px solid #e8e8e8', background: '#fafafa',
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setActiveTab(-1)} style={{
            padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
            background: activeTab === -1 ? '#111' : '#fff', color: activeTab === -1 ? '#fff' : '#666',
            border: '1.5px solid #e0e0e0', cursor: 'pointer',
          }}>Шапка</button>
          {cfg.formats.map((f, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
              background: activeTab === i ? '#111' : '#fff', color: activeTab === i ? '#fff' : '#666',
              border: '1.5px solid #e0e0e0', cursor: 'pointer',
            }}>{f.title || `Блок ${i + 1}`}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {error && <span style={{ fontSize: '12px', color: '#dc2626' }}>{error}</span>}
          {saved && <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>✓ Сохранено</span>}
          <a href="/catalog" target="_blank" rel="noopener" style={{
            padding: '7px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
            background: '#fff', color: '#666', border: '1.5px solid #e0e0e0', textDecoration: 'none',
          }}>Открыть ↗</a>
          <button onClick={handleSave} disabled={saving} className="admin-btn-apply">
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {activeTab === -1 ? (
          <div style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label>
              <p style={labelStyle}>Заголовок страницы</p>
              <input className="admin-filter-input" style={{ width: '100%' }}
                value={cfg.headline} onChange={e => setCfg({ ...cfg, headline: e.target.value })} />
            </label>
            <label>
              <p style={labelStyle}>Подзаголовок / подсказка</p>
              <input className="admin-filter-input" style={{ width: '100%' }}
                value={cfg.subheadline} onChange={e => setCfg({ ...cfg, subheadline: e.target.value })} />
            </label>
          </div>
        ) : (
          <FormatBlockEditor
            block={cfg.formats[activeTab]}
            onChange={b => updateFormat(activeTab, b)}
          />
        )}
      </div>
    </div>
  )
}
