'use client'

import { useState, useRef } from 'react'
import { saveNavbarConfig } from '@/actions/siteConfig'
import type { NavbarConfig } from '@/lib/siteConfig'
import { LogoMark } from '@/components/Logo'

export default function NavbarEditor({ initial }: { initial: NavbarConfig }) {
  const [cfg, setCfg]       = useState<NavbarConfig>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (patch: Partial<NavbarConfig>) => {
    setCfg(c => ({ ...c, ...patch }))
    setSaved(false)
  }

  async function handleLogoUpload(file: File) {
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', 'logos')
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка загрузки')
      set({ logoImageUrl: data.url })
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    setSaving(true)
    setError('')
    const res = await saveNavbarConfig(cfg)
    setSaving(false)
    if (res.error) setError(res.error)
    else setSaved(true)
  }

  const showImg  = !!cfg.logoImageUrl
  const showIcon = !showImg && cfg.showIcon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* ── Live preview bar ── */}
      <div style={{
        background: 'var(--paper-2)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-xl)',
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid var(--line)',
          fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700,
          color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          Предпросмотр шапки
        </div>
        <div style={{
          background: 'var(--paper)',
          padding: '0 24px', height: '72px',
          display: 'flex', alignItems: 'center', gap: '24px',
          borderBottom: '1px solid var(--line)',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {showImg
              ? <img src={cfg.logoImageUrl} alt="" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
              : showIcon ? <LogoMark size={34} /> : null}
            {cfg.logoText && (
              <span style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '18px', color: 'var(--ink)', letterSpacing: '-0.04em' }}>
                {cfg.logoText}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {['Каталог', 'Поставщики', 'Вакансии'].map(l => (
              <div key={l} style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--ff-display)' }}>{l}</div>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <div style={{ padding: '7px 16px', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--ff-display)', fontWeight: 600 }}>Войти</div>
            <div style={{ padding: '7px 18px', borderRadius: 'var(--r-sm)', background: 'var(--ink)', fontSize: '12px', color: '#fff', fontFamily: 'var(--ff-display)', fontWeight: 700 }}>Начать</div>
          </div>
        </div>
      </div>

      {/* ── Settings grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

        {/* Logo upload */}
        <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-xl)', border: '1px solid var(--line)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Логотип
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>PNG, SVG, JPG — рекомендуется прозрачный фон</p>
          </div>

          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]) }} />

          {cfg.logoImageUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                background: '#fff', borderRadius: 'var(--r-lg)',
                border: '1px solid var(--line)',
                padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '72px',
              }}>
                <img src={cfg.logoImageUrl} alt="" style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => fileRef.current?.click()} style={{
                  flex: 1, padding: '9px', borderRadius: 'var(--r-md)',
                  border: '1.5px solid var(--line)', background: '#fff',
                  fontSize: '12px', fontWeight: 700, color: 'var(--ink)',
                  cursor: 'pointer', fontFamily: 'var(--ff-display)',
                }}>
                  Заменить
                </button>
                <button onClick={() => set({ logoImageUrl: '' })} style={{
                  flex: 1, padding: '9px', borderRadius: 'var(--r-md)',
                  border: '1.5px solid #fecaca', background: '#fef2f2',
                  fontSize: '12px', fontWeight: 700, color: '#dc2626',
                  cursor: 'pointer', fontFamily: 'var(--ff-display)',
                }}>
                  Удалить
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                width: '100%', padding: '24px 16px',
                border: `2px dashed ${uploading ? 'var(--blue)' : 'var(--line)'}`,
                borderRadius: 'var(--r-lg)',
                background: uploading ? '#f0f4ff' : '#fff',
                cursor: uploading ? 'wait' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '28px', lineHeight: 1 }}>{uploading ? '⏳' : '🖼️'}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--ff-display)' }}>
                {uploading ? 'Загружаю...' : 'Загрузить файл'}
              </span>
            </button>
          )}
        </div>

        {/* Text + icon */}
        <div style={{ background: 'var(--paper-2)', borderRadius: 'var(--r-xl)', border: '1px solid var(--line)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Текст и иконка
          </p>

          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px', fontFamily: 'var(--ff-display)' }}>
              Название
            </p>
            <input
              value={cfg.logoText}
              onChange={e => set({ logoText: e.target.value })}
              placeholder="unit one"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)',
                border: '1.5px solid var(--line)', background: '#fff',
                fontSize: '15px', fontWeight: 800, color: 'var(--ink)',
                fontFamily: 'var(--ff-display)', letterSpacing: '-0.04em',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '5px' }}>Пусто — скрыть текст</p>
          </div>

          {!cfg.logoImageUrl && (
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px', fontFamily: 'var(--ff-display)' }}>
                SVG-иконка UO
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {([{ val: true, label: 'Вкл' }, { val: false, label: 'Выкл' }] as const).map(opt => (
                  <button
                    key={String(opt.val)}
                    onClick={() => set({ showIcon: opt.val })}
                    style={{
                      flex: 1, padding: '9px', borderRadius: 'var(--r-md)',
                      border: `1.5px solid ${cfg.showIcon === opt.val ? 'var(--ink)' : 'var(--line)'}`,
                      background: cfg.showIcon === opt.val ? 'var(--ink)' : '#fff',
                      color: cfg.showIcon === opt.val ? '#fff' : 'var(--muted)',
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'var(--ff-display)', transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '6px' }}>
                При загруженном логотипе иконка скрывается
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--r-md)',
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#dc2626', fontSize: '13px', fontWeight: 600,
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        style={{
          width: '100%', padding: '14px',
          borderRadius: 'var(--r-md)',
          background: saved ? '#16a34a' : saving ? 'var(--line)' : 'var(--ink)',
          color: (saving && !saved) ? 'var(--muted)' : '#fff',
          fontSize: '14px', fontWeight: 800,
          border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'background 0.2s',
          fontFamily: 'var(--ff-display)', letterSpacing: '-0.01em',
        }}
      >
        {saving ? 'Сохраняю...' : saved ? '✓ Сохранено' : 'Сохранить шапку'}
      </button>
    </div>
  )
}
