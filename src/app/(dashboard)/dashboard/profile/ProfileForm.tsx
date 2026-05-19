'use client'

import { useActionState, useState, useRef } from 'react'
import { updateProfile, removePortfolioImage } from '@/actions/profile'
import type { UpdateProfileState } from '@/actions/profile'
import { compressAndUpload } from '@/lib/compress'

const initial: UpdateProfileState = {}

type UserData = {
  name: string
  phone: string | null
  bio: string | null
  avatarUrl: string | null
  portfolioUrls: string[]
}

export default function ProfileForm({ user, isSeller }: { user: UserData; isSeller: boolean }) {
  const [state, action, pending] = useActionState(updateProfile, initial)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(user.portfolioUrls)
  const [portfolioUploading, setPortfolioUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const portfolioRef = useRef<HTMLInputElement>(null)
  const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const url = await compressAndUpload(file, 'avatars')
      setAvatarUrl(url)
    } catch {
      alert('Ошибка загрузки фото')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handlePortfolio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (portfolioUrls.length >= 12) { alert('Максимум 12 изображений'); return }
    setPortfolioUploading(true)
    try {
      const url = await compressAndUpload(file, 'portfolio')
      // Save to DB via action
      const fd = new FormData()
      fd.append('portfolioUrl', url)
      const res = await fetch('/api/portfolio', { method: 'POST', body: fd })
      if (res.ok) setPortfolioUrls(prev => [...prev, url])
      else alert('Ошибка сохранения')
    } catch {
      alert('Ошибка загрузки фото')
    } finally {
      setPortfolioUploading(false)
      if (portfolioRef.current) portfolioRef.current.value = ''
    }
  }

  const handleRemovePortfolio = async (url: string) => {
    const result = await removePortfolioImage(url)
    if (result.error) alert(result.error)
    else setPortfolioUrls(prev => prev.filter(u => u !== url))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 16px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', background: 'var(--bg)',
    fontSize: '14px', color: 'var(--text)',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px',
  }

  return (
    <form action={action}>
      {/* Hidden avatarUrl — sent as string, not file binary */}
      <input type="hidden" name="avatarUrl" value={avatarUrl ?? ''} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            onClick={() => !avatarUploading && fileRef.current?.click()}
            style={{
              width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
              background: avatarUrl ? 'transparent' : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '26px', fontWeight: 700,
              cursor: avatarUploading ? 'wait' : 'pointer', overflow: 'hidden',
              border: '2px solid var(--border)',
              position: 'relative',
            }}
          >
            {avatarUrl
              ? <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : initials}
            {avatarUploading && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '11px', fontWeight: 600,
              }}>
                ...
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg)', border: '1.5px solid var(--border)',
                fontSize: '13px', fontWeight: 600, color: 'var(--text)',
                display: 'block', marginBottom: '4px', cursor: avatarUploading ? 'wait' : 'pointer',
              }}
            >
              {avatarUploading ? 'Загружаю...' : 'Изменить фото'}
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>JPG, PNG, WebP · автосжатие до 1200px</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label style={labelStyle}>Имя *</label>
          <input type="text" name="name" defaultValue={user.name} required style={inputStyle} />
          {state.errors?.name?.[0] && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{state.errors.name[0]}</p>}
        </div>

        {/* Phone */}
        <div>
          <label style={labelStyle}>Телефон</label>
          <input type="tel" name="phone" defaultValue={user.phone ?? ''} placeholder="+7 900 000-00-00" style={inputStyle} />
          {state.errors?.phone?.[0] && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{state.errors.phone[0]}</p>}
        </div>

        {/* Bio */}
        <div>
          <label style={labelStyle}>О себе{isSeller && ' / О компании'}</label>
          <textarea
            name="bio"
            defaultValue={user.bio ?? ''}
            placeholder={isSeller ? 'Расскажите о вашей компании, опыте, преимуществах...' : 'Краткая информация о себе...'}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
          {state.errors?.bio?.[0] && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{state.errors.bio[0]}</p>}
        </div>

        {state.success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', padding: '12px 16px' }}>
            <p style={{ color: '#16a34a', fontWeight: 600, fontSize: '14px' }}>✓ Профиль сохранён</p>
          </div>
        )}
        {state.error && <p style={{ color: '#dc2626', fontSize: '13px' }}>{state.error}</p>}

        <button
          type="submit"
          disabled={pending || avatarUploading}
          style={{
            padding: '12px 28px', borderRadius: '50px', alignSelf: 'flex-start',
            background: (pending || avatarUploading) ? 'var(--border)' : 'var(--primary)',
            color: '#fff', fontSize: '14px', fontWeight: 700,
            boxShadow: (pending || avatarUploading) ? 'none' : '0 2px 8px rgba(249,115,22,0.30)',
            cursor: (pending || avatarUploading) ? 'not-allowed' : 'pointer',
          }}
        >
          {pending ? 'Сохраняю...' : 'Сохранить'}
        </button>
      </div>

      {/* Portfolio (sellers only) */}
      {isSeller && (
        <div style={{ marginTop: '32px', paddingTop: '28px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Портфолио</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Фото сжимаются автоматически</p>
            </div>
            <button
              type="button"
              onClick={() => portfolioRef.current?.click()}
              disabled={portfolioUploading || portfolioUrls.length >= 12}
              style={{
                padding: '8px 16px', borderRadius: '50px',
                background: 'var(--bg)', border: '1.5px solid var(--border)',
                fontSize: '13px', fontWeight: 600, color: 'var(--text)',
                cursor: (portfolioUploading || portfolioUrls.length >= 12) ? 'not-allowed' : 'pointer',
              }}
            >
              {portfolioUploading ? 'Загружаю...' : `+ Добавить фото (${portfolioUrls.length}/12)`}
            </button>
            <input ref={portfolioRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePortfolio} />
          </div>
          {portfolioUrls.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Нет фотографий. Добавьте примеры работ.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
              {portfolioUrls.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border)' }} />
                  <button
                    type="button"
                    onClick={() => handleRemovePortfolio(url)}
                    style={{
                      position: 'absolute', top: '4px', right: '4px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: 'rgba(220,38,38,0.9)', color: '#fff', fontSize: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 'none', cursor: 'pointer',
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  )
}
