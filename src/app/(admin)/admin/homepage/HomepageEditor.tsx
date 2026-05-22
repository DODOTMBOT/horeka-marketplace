'use client'

import { useState, useTransition } from 'react'
import { saveHomepageConfig } from '@/actions/siteConfig'
import type { HomepageConfig, SectionBlock } from '@/lib/siteConfig'
import type { GridSection, GridCategoryCard, HeroV2 } from '@/lib/homepageDefaults'
import { DEFAULT_GRID_SECTIONS, DEFAULT_HERO_V2 } from '@/lib/homepageDefaults'

/* ─── Shared field components ─────────────────────────────────────────── */
function Field({ label, value, onChange, multiline, hint, mono }: {
  label: string; value: string; onChange: (v: string) => void
  multiline?: boolean; hint?: string; mono?: boolean
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '7px',
    border: '1.5px solid #e5e7eb', fontSize: '13px', color: '#111827',
    background: '#fff', boxSizing: 'border-box', fontFamily: mono ? 'monospace' : 'inherit',
  }
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
        {label}
      </label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} style={inputStyle} />
      }
      {hint && <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>{hint}</p>}
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '44px', height: '38px', borderRadius: '7px', border: '1px solid #e5e7eb', cursor: 'pointer', padding: '2px' }} />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} style={{
          flex: 1, padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #e5e7eb',
          fontSize: '13px', color: '#111827', background: '#fff',
        }} />
        <div style={{ width: '38px', height: '38px', borderRadius: '7px', background: value, border: '1px solid #e5e7eb', flexShrink: 0 }} />
      </div>
    </div>
  )
}

function Sep({ title }: { title: string }) {
  return (
    <p style={{
      fontSize: '10px', fontWeight: 800, color: '#9ca3af',
      textTransform: 'uppercase', letterSpacing: '0.1em',
      margin: '24px 0 12px', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6',
    }}>{title}</p>
  )
}

/* ─── Hero editor ─────────────────────────────────────────────────────── */
function HeroEditor({ hero, onChange }: { hero: HeroV2; onChange: (h: HeroV2) => void }) {
  function upd(key: keyof HeroV2, v: string) { onChange({ ...hero, [key]: v }) }
  return (
    <div style={{ padding: '24px 32px', maxWidth: '700px' }}>
      {/* Live preview */}
      <div style={{
        background: '#f6f4ed', borderRadius: '12px', padding: '24px', marginBottom: '28px',
        border: '1px solid #dedacb',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: '#3D5AFE', borderRadius: '999px', padding: '4px 12px', marginBottom: '16px',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#D7FF3A', display: 'inline-block' }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.07em' }}>{hero.badge || 'BADGE'}</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: '28px', lineHeight: 0.95, letterSpacing: '-0.04em', color: '#0F0F12', marginBottom: '12px' }}>
          <div>{hero.titleLine1}</div>
          <div>{hero.titleLine2}</div>
          <div>
            <span style={{ color: '#3D5AFE' }}>{hero.titleAccent} </span>
            <span style={{ background: '#D7FF3A', padding: '0 4px', borderRadius: '3px' }}>{hero.titleHighlight}</span>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: '#7A7568', lineHeight: 1.5, maxWidth: '360px' }}>{hero.description}</p>
      </div>

      <Sep title="Бейдж" />
      <Field label="Текст бейджа" value={hero.badge} onChange={v => upd('badge', v)} hint='Например: B2B МАРКЕТПЛЕЙС · HORECA · РОССИЯ' />

      <Sep title="Заголовок" />
      <Field label="Строка 1" value={hero.titleLine1} onChange={v => upd('titleLine1', v)} />
      <Field label="Строка 2" value={hero.titleLine2} onChange={v => upd('titleLine2', v)} />
      <Field label="Акцент (синий цвет)" value={hero.titleAccent} onChange={v => upd('titleAccent', v)} hint='Например: в ОДНОМ' />
      <Field label="Выделение (лаймовый фон)" value={hero.titleHighlight} onChange={v => upd('titleHighlight', v)} hint='Например: окне.' />

      <Sep title="Описание" />
      <Field label="Подзаголовок" value={hero.description} onChange={v => upd('description', v)} multiline />

      <Sep title="AI-ассистент" />
      <Field label="Пример запроса пользователя" value={hero.aiQuery} onChange={v => upd('aiQuery', v)} multiline hint='Текст в тёмной карточке справа' />
      <Field label="Чипы подсказок (через запятую)" value={hero.aiChips} onChange={v => upd('aiChips', v)} mono hint='Например: ПОСТАВЩИК КОФЕ,БАНКЕТНАЯ МЕБЕЛЬ,КОФЕ-МАШИНЫ' />
    </div>
  )
}

/* ─── Grid section editor ──────────────────────────────────────────────── */
function CategoryCardEditor({ card, onChange, onRemove, index }: {
  card: GridCategoryCard; onChange: (c: GridCategoryCard) => void; onRemove: () => void; index: number
}) {
  return (
    <div style={{ border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Карточка {index + 1}</span>
        <button onClick={onRemove} style={{ fontSize: '12px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>× убрать</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <Field label="Название" value={card.name} onChange={v => onChange({ ...card, name: v })} />
        <Field label="Slug категории (URL)" value={card.categorySlug ?? ''} onChange={v => onChange({ ...card, categorySlug: v })} hint='/catalog?category=...' />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <Field label="Подсказка" value={card.hint} onChange={v => onChange({ ...card, hint: v })} hint='мясо, рыба, овощи' />
        <Field label="Число" value={String(card.count)} onChange={v => onChange({ ...card, count: v })} />
      </div>
    </div>
  )
}

function GridSectionEditor({ section, onChange }: { section: GridSection; onChange: (s: GridSection) => void }) {
  function upd<K extends keyof GridSection>(key: K, v: GridSection[K]) { onChange({ ...section, [key]: v }) }
  function updateCard(i: number, card: GridCategoryCard) {
    const cats = [...section.categories]; cats[i] = card; upd('categories', cats)
  }
  function removeCard(i: number) {
    upd('categories', section.categories.filter((_, idx) => idx !== i))
  }
  function addCard() {
    upd('categories', [...section.categories, { name: 'Новая', hint: 'описание', count: 0, categorySlug: '' }])
  }

  const isLight = section.textColor === 'light'

  return (
    <div>
      {/* Preview */}
      <div style={{
        background: section.bgColor, borderRadius: '10px', padding: '18px 20px',
        marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px',
      }}>
        <div>
          <p style={{ fontSize: '18px', fontWeight: 800, color: isLight ? '#fff' : '#0F0F12', letterSpacing: '-0.03em' }}>{section.title}</p>
          <p style={{ fontSize: '12px', color: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', marginTop: '3px' }}>{section.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {section.categories.map((c, i) => (
            <div key={i} style={{
              background: isLight ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
              borderRadius: '8px', padding: '8px 12px',
            }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: isLight ? '#fff' : '#0F0F12' }}>{c.name}</p>
              <p style={{ fontSize: '18px', fontWeight: 900, color: isLight ? '#fff' : '#0F0F12', lineHeight: 1 }}>{c.count}</p>
            </div>
          ))}
        </div>
      </div>

      <Sep title="Заголовок секции" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Field label="Название" value={section.title} onChange={v => upd('title', v)} />
        <Field label="Подзаголовок" value={section.subtitle} onChange={v => upd('subtitle', v)} />
      </div>

      <Sep title="Внешний вид" />
      <ColorField label="Цвет фона" value={section.bgColor} onChange={v => upd('bgColor', v)} />
      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
          Текст на фоне
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['light', 'dark'] as const).map(opt => (
            <button key={opt} onClick={() => upd('textColor', opt)} style={{
              padding: '7px 16px', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
              border: '1.5px solid',
              borderColor: section.textColor === opt ? '#111827' : '#e5e7eb',
              background: section.textColor === opt ? '#111827' : '#fff',
              color: section.textColor === opt ? '#fff' : '#374151',
              cursor: 'pointer',
            }}>
              {opt === 'light' ? '☀ Светлый (белый текст)' : '◑ Тёмный (чёрный текст)'}
            </button>
          ))}
        </div>
      </div>

      <Sep title="Правая колонка" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Field label="Статистика" value={section.stats} onChange={v => upd('stats', v)} hint='699 поставщиков · 4.8' />
        <Field label="Ссылка CTA" value={section.ctaHref} onChange={v => upd('ctaHref', v)} />
      </div>

      <Sep title={`Карточки категорий (${section.categories.length})`} />
      {section.categories.map((card, i) => (
        <CategoryCardEditor key={i} card={card} index={i}
          onChange={c => updateCard(i, c)} onRemove={() => removeCard(i)} />
      ))}
      <button onClick={addCard} style={{
        width: '100%', padding: '9px', borderRadius: '8px',
        border: '1.5px dashed #d1d5db', background: 'transparent',
        fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer',
        marginTop: '4px',
      }}>
        + Добавить карточку
      </button>
    </div>
  )
}

/* ─── Legacy block editor (preserved) ─────────────────────────────────── */
const DEFAULT_NEW_BLOCK: SectionBlock = {
  titleLine1: 'НОВЫЙ РАЗДЕЛ', titleLine2: 'ПОДЗАГОЛОВОК',
  bgColor: '#6366f1', stat: '0', statLabel: 'позиций', rating: '5.0',
  description: 'Описание', ctaLabel: 'ПЕРЕЙТИ', ctaHref: '/',
}
function BlockEditor({ block, onChange }: { block: SectionBlock; onChange: (k: keyof SectionBlock, v: string) => void }) {
  return (
    <div>
      <Sep title="Заголовок" />
      <Field label="Строка 1" value={block.titleLine1} onChange={v => onChange('titleLine1', v)} />
      <Field label="Строка 2" value={block.titleLine2} onChange={v => onChange('titleLine2', v)} />
      <Sep title="Цвет фона" />
      <ColorField label="Цвет секции" value={block.bgColor} onChange={v => onChange('bgColor', v)} />
      <Sep title="Статистика" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Field label="Значение" value={block.stat} onChange={v => onChange('stat', v)} />
        <Field label="Рейтинг" value={block.rating} onChange={v => onChange('rating', v)} />
      </div>
      <Field label="Подпись" value={block.statLabel} onChange={v => onChange('statLabel', v)} />
      <Sep title="CTA" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Field label="Кнопка" value={block.ctaLabel} onChange={v => onChange('ctaLabel', v)} />
        <Field label="Ссылка" value={block.ctaHref} onChange={v => onChange('ctaHref', v)} />
      </div>
    </div>
  )
}

/* ─── Main editor ─────────────────────────────────────────────────────── */
type Tab = 'hero' | 'grid' | 'blocks'

export default function HomepageEditor({ initial }: { initial: HomepageConfig }) {
  const [cfg, setCfg] = useState<HomepageConfig>({
    ...initial,
    blocks: initial.blocks ?? [],
    heroV2: initial.heroV2 ?? DEFAULT_HERO_V2,
    gridSections: initial.gridSections && initial.gridSections.length > 0 ? initial.gridSections : DEFAULT_GRID_SECTIONS,
  })
  const [tab, setTab] = useState<Tab>('hero')
  const [selectedGrid, setSelectedGrid] = useState(0)
  const [selectedBlock, setSelectedBlock] = useState(0)
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleSave() {
    setError(''); setSaved(false)
    startTransition(async () => {
      const res = await saveHomepageConfig(cfg)
      if (res.error) setError(res.error)
      else setSaved(true)
    })
  }

  /* grid helpers */
  function updateGrid(i: number, s: GridSection) {
    const next = [...cfg.gridSections]; next[i] = s
    setCfg(p => ({ ...p, gridSections: next })); setSaved(false)
  }
  function addGrid() {
    const next = [...cfg.gridSections, { title: 'Новая секция', subtitle: '', bgColor: '#6366f1', textColor: 'light' as const, stats: '', ctaHref: '/catalog', categories: [] }]
    setCfg(p => ({ ...p, gridSections: next })); setSelectedGrid(next.length - 1); setSaved(false)
  }
  function deleteGrid(i: number) {
    if (cfg.gridSections.length <= 1) return
    const next = cfg.gridSections.filter((_, idx) => idx !== i)
    setCfg(p => ({ ...p, gridSections: next }))
    setSelectedGrid(j => Math.min(j, next.length - 1)); setSaved(false)
  }
  function moveGrid(i: number, dir: -1 | 1) {
    const to = i + dir; if (to < 0 || to >= cfg.gridSections.length) return
    const next = [...cfg.gridSections];
    [next[i], next[to]] = [next[to], next[i]]
    setCfg(p => ({ ...p, gridSections: next })); setSelectedGrid(to); setSaved(false)
  }

  /* block helpers */
  function updateBlock(i: number, key: keyof SectionBlock, v: string) {
    const next = [...cfg.blocks]; next[i] = { ...next[i], [key]: v }
    setCfg(p => ({ ...p, blocks: next })); setSaved(false)
  }
  function addBlock() {
    const next = [...cfg.blocks, { ...DEFAULT_NEW_BLOCK }]
    setCfg(p => ({ ...p, blocks: next })); setSelectedBlock(next.length - 1); setSaved(false)
  }
  function deleteBlock(i: number) {
    if (cfg.blocks.length <= 1) return
    const next = cfg.blocks.filter((_, idx) => idx !== i)
    setCfg(p => ({ ...p, blocks: next }))
    setSelectedBlock(j => Math.min(j, next.length - 1)); setSaved(false)
  }
  function moveBlock(i: number, dir: -1 | 1) {
    const to = i + dir; if (to < 0 || to >= cfg.blocks.length) return
    const next = [...cfg.blocks];
    [next[i], next[to]] = [next[to], next[i]]
    setCfg(p => ({ ...p, blocks: next })); setSelectedBlock(to); setSaved(false)
  }

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '8px 16px', fontSize: '12px', fontWeight: 700,
    border: 'none', cursor: 'pointer', background: 'transparent',
    color: tab === t ? '#111827' : '#9ca3af',
    borderBottom: `2px solid ${tab === t ? '#111827' : 'transparent'}`,
    transition: 'all 0.15s',
  })

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 57px)', overflow: 'hidden', flexDirection: 'column' }}>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#fff', paddingLeft: '16px', flexShrink: 0 }}>
        <button style={tabStyle('hero')} onClick={() => setTab('hero')}>Герой</button>
        <button style={tabStyle('grid')} onClick={() => setTab('grid')}>Секции ({cfg.gridSections.length})</button>
        <button style={tabStyle('blocks')} onClick={() => setTab('blocks')}>Устаревшие блоки ({cfg.blocks.length})</button>
        <a href="/" target="_blank" style={{
          marginLeft: 'auto', marginRight: '16px', alignSelf: 'center',
          fontSize: '12px', color: '#6b7280', textDecoration: 'none', fontWeight: 600,
        }}>Открыть сайт ↗</a>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* ── HERO tab ────────────────────────────────────────────────── */}
        {tab === 'hero' && (
          <div style={{ flex: 1, overflowY: 'auto', background: '#f9fafb', paddingBottom: '80px' }}>
            <HeroEditor hero={cfg.heroV2} onChange={h => { setCfg(p => ({ ...p, heroV2: h })); setSaved(false) }} />
          </div>
        )}

        {/* ── GRID tab ────────────────────────────────────────────────── */}
        {tab === 'grid' && (
          <>
            {/* Sidebar */}
            <div style={{ width: '220px', flexShrink: 0, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px', flex: 1, overflowY: 'auto' }}>
                {cfg.gridSections.map((s, i) => (
                  <div key={i} onClick={() => setSelectedGrid(i)} style={{
                    borderRadius: '8px', marginBottom: '4px', cursor: 'pointer', overflow: 'hidden',
                    border: selectedGrid === i ? '1.5px solid #111827' : '1.5px solid #e5e7eb',
                  }}>
                    <div style={{ height: '4px', background: s.bgColor }} />
                    <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>{s.categories.length} категории</p>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => moveGrid(i, -1)} disabled={i === 0} style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#fff', cursor: i === 0 ? 'not-allowed' : 'pointer', opacity: i === 0 ? 0.3 : 1, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>↑</button>
                        <button onClick={() => moveGrid(i, 1)} disabled={i === cfg.gridSections.length - 1} style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#fff', cursor: i === cfg.gridSections.length - 1 ? 'not-allowed' : 'pointer', opacity: i === cfg.gridSections.length - 1 ? 0.3 : 1, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>↓</button>
                        <button onClick={() => deleteGrid(i)} disabled={cfg.gridSections.length <= 1} style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #fecaca', background: '#fff', cursor: cfg.gridSections.length <= 1 ? 'not-allowed' : 'pointer', opacity: cfg.gridSections.length <= 1 ? 0.3 : 1, fontSize: '12px', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>×</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={addGrid} style={{ width: '100%', padding: '8px', borderRadius: '7px', border: '1.5px dashed #d1d5db', background: 'transparent', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>+ Добавить секцию</button>
              </div>
            </div>

            {/* Grid section editor */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#f9fafb', paddingBottom: '80px' }}>
              {cfg.gridSections[selectedGrid] && (
                <div style={{ padding: '24px 32px', maxWidth: '700px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                    Секция {selectedGrid + 1} из {cfg.gridSections.length}
                  </p>
                  <GridSectionEditor
                    section={cfg.gridSections[selectedGrid]}
                    onChange={s => updateGrid(selectedGrid, s)}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* ── BLOCKS tab (legacy) ──────────────────────────────────────── */}
        {tab === 'blocks' && (
          <>
            <div style={{ width: '220px', flexShrink: 0, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px', flex: 1, overflowY: 'auto' }}>
                {cfg.blocks.map((b, i) => (
                  <div key={i} onClick={() => setSelectedBlock(i)} style={{ borderRadius: '8px', marginBottom: '4px', cursor: 'pointer', overflow: 'hidden', border: selectedBlock === i ? '1.5px solid #111827' : '1.5px solid #e5e7eb' }}>
                    <div style={{ height: '4px', background: b.bgColor }} />
                    <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.titleLine1 || `Блок ${i + 1}`}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.titleLine2}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => moveBlock(i, -1)} disabled={i === 0} style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#fff', cursor: i === 0 ? 'not-allowed' : 'pointer', opacity: i === 0 ? 0.3 : 1, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>↑</button>
                        <button onClick={() => moveBlock(i, 1)} disabled={i === cfg.blocks.length - 1} style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #e5e7eb', background: '#fff', cursor: i === cfg.blocks.length - 1 ? 'not-allowed' : 'pointer', opacity: i === cfg.blocks.length - 1 ? 0.3 : 1, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>↓</button>
                        <button onClick={() => deleteBlock(i)} disabled={cfg.blocks.length <= 1} style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid #fecaca', background: '#fff', cursor: cfg.blocks.length <= 1 ? 'not-allowed' : 'pointer', opacity: cfg.blocks.length <= 1 ? 0.3 : 1, fontSize: '12px', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>×</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={addBlock} style={{ width: '100%', padding: '8px', borderRadius: '7px', border: '1.5px dashed #d1d5db', background: 'transparent', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>+ Добавить блок</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', background: '#f9fafb', paddingBottom: '80px' }}>
              {cfg.blocks.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <p style={{ fontSize: '13px', color: '#9ca3af' }}>Нет блоков</p>
                </div>
              ) : cfg.blocks[selectedBlock] ? (
                <div style={{ padding: '24px 32px', maxWidth: '700px' }}>
                  <BlockEditor block={cfg.blocks[selectedBlock]} onChange={(k, v) => updateBlock(selectedBlock, k, v)} />
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>

      {/* Save bar */}
      <div style={{
        background: '#fff', borderTop: '1px solid #e5e7eb',
        padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
      }}>
        <button onClick={handleSave} disabled={pending} style={{
          padding: '9px 28px', borderRadius: '7px',
          background: pending ? '#9ca3af' : '#111827',
          color: '#fff', fontSize: '14px', fontWeight: 700,
          border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
        }}>
          {pending ? 'Сохраняем...' : 'Сохранить и опубликовать'}
        </button>
        {saved && <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>✓ Изменения опубликованы на сайте</span>}
        {error && <span style={{ fontSize: '13px', color: '#dc2626' }}>{error}</span>}
      </div>
    </div>
  )
}
