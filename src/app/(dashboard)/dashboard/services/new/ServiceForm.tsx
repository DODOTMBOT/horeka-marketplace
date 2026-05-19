'use client'

import { useActionState, useState, useRef } from 'react'
import { createService } from '@/actions/services'
import type { CreateServiceState, ServicePackage } from '@/actions/services'
import dynamic from 'next/dynamic'

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false })

const initial: CreateServiceState = {}

const TIER_LABELS: Record<string, string> = {
  basic: 'Базовый',
  standard: 'Стандарт',
  premium: 'Премиум',
}

function PackageEditor({
  packages,
  onChange,
}: {
  packages: ServicePackage[]
  onChange: (pkgs: ServicePackage[]) => void
}) {
  const tiers: ('basic' | 'standard' | 'premium')[] = ['basic', 'standard', 'premium']
  const [active, setActive] = useState(0)
  const pkg = packages[active]

  const update = (field: keyof ServicePackage, value: string | number) => {
    const next = packages.map((p, i) => i === active ? { ...p, [field]: value } : p)
    onChange(next)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: 'none', background: 'var(--bg)', boxShadow: 'var(--shadow-in)',
    fontSize: '14px', color: 'var(--text)',
  }

  return (
    <div style={{
      background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-in)', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        {tiers.map((tier, i) => (
          <button key={tier} type="button" onClick={() => setActive(i)} style={{
            flex: 1, padding: '10px 8px', fontSize: '13px', fontWeight: 600,
            color: active === i ? 'var(--primary)' : 'var(--text-muted)',
            background: active === i ? '#fff3eb' : 'transparent',
            borderBottom: active === i ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            {TIER_LABELS[tier]}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Название пакета
          </label>
          <input
            type="text"
            value={pkg.name}
            onChange={e => update('name', e.target.value)}
            placeholder={`Например: "${TIER_LABELS[pkg.tier]}"`}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Что входит
          </label>
          <textarea
            value={pkg.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Опишите, что входит в этот пакет..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Цена (₽)
            </label>
            <input
              type="number"
              value={pkg.price || ''}
              onChange={e => update('price', Number(e.target.value))}
              placeholder="0"
              min="0"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Срок (дней)
            </label>
            <input
              type="number"
              value={pkg.deliveryDays || ''}
              onChange={e => update('deliveryDays', Number(e.target.value))}
              placeholder="7"
              min="1"
              style={inputStyle}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ServiceForm({ categories }: { categories: { id: string; name: string; icon: string | null }[] }) {
  const [state, action, pending] = useActionState(createService, initial)
  const [description, setDescription] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [usePackages, setUsePackages] = useState(false)
  const [packages, setPackages] = useState<ServicePackage[]>([
    { tier: 'basic', name: 'Базовый', description: '', price: 0, deliveryDays: 7 },
    { tier: 'standard', name: 'Стандарт', description: '', price: 0, deliveryDays: 14 },
    { tier: 'premium', name: 'Премиум', description: '', price: 0, deliveryDays: 21 },
  ])
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImages = async (files: FileList | null) => {
    if (!files) return
    setUploading(true)
    for (const file of Array.from(files)) {
      try {
        const { compressAndUpload } = await import('@/lib/compress')
        const url = await compressAndUpload(file, 'services')
        setImageUrls(prev => [...prev, url])
      } catch {
        alert(`Ошибка загрузки ${file.name}`)
      }
    }
    setUploading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 16px', borderRadius: 'var(--radius-sm)',
    border: 'none', background: 'var(--bg)', boxShadow: 'var(--shadow-in)',
    fontSize: '14px', color: 'var(--text)',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    display: 'block', marginBottom: '8px',
  }

  const field = (name: string) => ({
    error: state.errors?.[name]?.[0],
  })

  return (
    <form action={action}>
      {/* Hidden fields */}
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="packages" value={usePackages ? JSON.stringify(packages) : ''} />
      {imageUrls.map((url, i) => (
        <input key={i} type="hidden" name={`imageUrl_${i}`} value={url} />
      ))}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main info */}
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-out)', padding: '28px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              Основная информация
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Название услуги *</label>
                <input type="text" name="title" required placeholder="Например: Поставка свежих овощей и фруктов" style={inputStyle} />
                {field('title').error && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{field('title').error}</p>}
              </div>

              <div>
                <label style={labelStyle}>Категория *</label>
                <select name="categoryId" required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Выберите категорию</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                {field('categoryId').error && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{field('categoryId').error}</p>}
              </div>

              <div>
                <label style={labelStyle}>Описание *</label>
                <RichEditor
                  name="description-editor"
                  placeholder="Опишите вашу услугу подробно: что включает, для кого подходит, ваши преимущества..."
                  onChange={setDescription}
                />
                {field('description').error && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{field('description').error}</p>}
              </div>

              <div>
                <label style={labelStyle}>Теги (через запятую)</label>
                <input type="text" name="tags" placeholder="доставка, опт, без посредников" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Images */}
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-out)', padding: '28px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
              Фотографии
            </h2>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleImages(e.target.files)} />
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)',
                padding: '32px', textAlign: 'center', cursor: 'pointer',
                background: 'var(--bg)', marginBottom: imageUrls.length ? '16px' : 0,
              }}
            >
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>📷</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                {uploading ? 'Загружаю...' : 'Нажмите для выбора фото'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>JPEG, PNG, WebP · до 5 МБ каждый</p>
            </div>
            {imageUrls.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {imageUrls.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    <button
                      type="button"
                      onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))}
                      style={{
                        position: 'absolute', top: '-6px', right: '-6px',
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#ef4444', color: '#fff', fontSize: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pricing */}
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-out)', padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Цена</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={usePackages}
                  onChange={e => setUsePackages(e.target.checked)}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>3 пакета</span>
              </label>
            </div>

            {usePackages ? (
              <PackageEditor packages={packages} onChange={setPackages} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Цена *</label>
                  <input type="number" name="price" required min="0" placeholder="0" style={inputStyle} />
                  {field('price').error && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{field('price').error}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Единица</label>
                  <select name="priceUnit" style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="разово">Разово</option>
                    <option value="в месяц">В месяц</option>
                    <option value="в час">В час</option>
                    <option value="за кг">За кг</option>
                    <option value="за единицу">За единицу</option>
                    <option value="по запросу">По запросу</option>
                  </select>
                </div>
              </div>
            )}
            {usePackages && (
              <input type="hidden" name="price" value={packages[0].price || 0} />
            )}
          </div>

          {/* Status */}
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-out)', padding: '24px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>
              Статус
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: 'ACTIVE', label: 'Опубликовать', desc: 'Сразу видна в каталоге' },
                { value: 'DRAFT', label: 'Черновик', desc: 'Сохранить, не публикуя' },
              ].map(opt => (
                <label key={opt.value} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '12px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)', boxShadow: 'var(--shadow-in)',
                  cursor: 'pointer',
                }}>
                  <input type="radio" name="status" value={opt.value} defaultChecked={opt.value === 'ACTIVE'} style={{ marginTop: '2px' }} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{opt.label}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          {state.error && (
            <p style={{ color: '#dc2626', fontSize: '13px', textAlign: 'center' }}>{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending || uploading}
            style={{
              padding: '14px', borderRadius: 'var(--radius-sm)',
              background: pending || uploading ? '#fdba74' : 'var(--primary)',
              color: '#fff', fontSize: '15px', fontWeight: 700,
              boxShadow: pending || uploading ? 'none' : '4px 4px 12px rgba(249,115,22,0.35)',
              cursor: pending || uploading ? 'not-allowed' : 'pointer',
            }}
          >
            {pending ? 'Сохраняю...' : uploading ? 'Загружаю фото...' : 'Создать услугу'}
          </button>
        </div>
      </div>
    </form>
  )
}
