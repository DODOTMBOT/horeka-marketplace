'use client'

import { useActionState, useState, useRef } from 'react'
import { updateService } from '@/actions/services'
import type { CreateServiceState, ServicePackage } from '@/actions/services'
import dynamic from 'next/dynamic'

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false })

function PackageEditor({ packages, tiers, onChange }: { packages: ServicePackage[]; tiers: { key: string; label: string }[]; onChange: (p: ServicePackage[]) => void }) {
  const [active, setActive] = useState(0)
  const pkg = packages[active]
  const update = (field: keyof ServicePackage, value: string | number) =>
    onChange(packages.map((p, i) => i === active ? { ...p, [field]: value } : p))

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: '14px', color: 'var(--text)',
  }
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {tiers.map((tier, i) => (
          <button key={tier.key} type="button" onClick={() => setActive(i)} style={{
            flex: 1, padding: '10px 8px', fontSize: '13px', fontWeight: 600,
            color: active === i ? 'var(--primary)' : 'var(--text-muted)',
            background: active === i ? 'var(--primary-light)' : 'transparent',
            borderBottom: active === i ? '2px solid var(--primary)' : '2px solid transparent',
          }}>
            {tier.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="text" value={pkg.name} onChange={e => update('name', e.target.value)} placeholder="Название пакета" style={inp} />
        <textarea value={pkg.description} onChange={e => update('description', e.target.value)} placeholder="Что входит..." rows={3} style={{ ...inp, resize: 'vertical' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input type="number" value={pkg.price || ''} onChange={e => update('price', Number(e.target.value))} placeholder="Цена ₽" min="0" style={inp} />
          <input type="number" value={pkg.deliveryDays || ''} onChange={e => update('deliveryDays', Number(e.target.value))} placeholder="Дней" min="1" style={inp} />
        </div>
      </div>
    </div>
  )
}

type Props = {
  service: {
    id: string; title: string; description: string; price: number
    priceUnit: string; status: string; images: string[]; tags: string[]
    packages: ServicePackage[] | null; categoryId: string
  }
  categories: { id: string; name: string; icon: string | null }[]
  packageTiers: { key: string; label: string }[]
  priceUnits: string[]
}

export default function EditServiceForm({ service, categories, packageTiers, priceUnits }: Props) {
  const [state, action, pending] = useActionState(updateService, {} as CreateServiceState)
  const [description, setDescription] = useState(service.description)
  const [imageUrls, setImageUrls] = useState<string[]>(service.images)
  const [uploading, setUploading] = useState(false)
  const [usePackages, setUsePackages] = useState(!!service.packages?.length)
  const [packages, setPackages] = useState<ServicePackage[]>(
    service.packages ?? packageTiers.map((t, i) => ({ tier: t.key, name: t.label, description: '', price: 0, deliveryDays: (i + 1) * 7 }))
  )
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImages = async (files: FileList | null) => {
    if (!files) return
    setUploading(true)
    for (const file of Array.from(files)) {
      try {
        const { compressAndUpload } = await import('@/lib/compress')
        const url = await compressAndUpload(file, 'services')
        setImageUrls(prev => [...prev, url])
      } catch { alert(`Ошибка загрузки ${file.name}`) }
    }
    setUploading(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 16px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: '14px', color: 'var(--text)',
  }
  const lbl: React.CSSProperties = {
    fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px',
  }

  return (
    <form action={action}>
      <input type="hidden" name="id" value={service.id} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="packages" value={usePackages ? JSON.stringify(packages) : ''} />
      {imageUrls.map((url, i) => <input key={i} type="hidden" name={`imageUrl_${i}`} value={url} />)}

      <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>Основная информация</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={lbl}>Название *</label>
                <input type="text" name="title" defaultValue={service.title} required style={inp} />
                {state.errors?.title?.[0] && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{state.errors.title[0]}</p>}
              </div>
              <div>
                <label style={lbl}>Категория *</label>
                <select name="categoryId" defaultValue={service.categoryId} required style={{ ...inp, cursor: 'pointer' }}>
                  <option value="">Выберите категорию</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Описание *</label>
                <RichEditor name="desc-editor" placeholder="Описание..." onChange={setDescription} initialContent={service.description} />
                {state.errors?.description?.[0] && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{state.errors.description[0]}</p>}
              </div>
              <div>
                <label style={lbl}>Теги (через запятую)</label>
                <input type="text" name="tags" defaultValue={service.tags.join(', ')} style={inp} />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Фотографии</h2>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleImages(e.target.files)} />
            <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', padding: '24px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg)', marginBottom: imageUrls.length ? '16px' : 0 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{uploading ? 'Загружаю...' : '+ Добавить фото'}</p>
            </div>
            {imageUrls.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {imageUrls.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    <button type="button" onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Цена</h2>
              {packageTiers.length > 0 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={usePackages} onChange={e => setUsePackages(e.target.checked)} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{packageTiers.length} пакета</span>
                </label>
              )}
            </div>
            {usePackages ? (
              <PackageEditor packages={packages} tiers={packageTiers} onChange={setPackages} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="number" name="price" defaultValue={service.price} required min="0" style={inp} />
                <select name="priceUnit" defaultValue={service.priceUnit} style={{ ...inp, cursor: 'pointer' }}>
                  {priceUnits.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            )}
            {usePackages && <input type="hidden" name="price" value={packages[0].price || 0} />}
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>Статус</h2>
            {[{ value: 'ACTIVE', label: 'Опубликовано' }, { value: 'DRAFT', label: 'Черновик' }, { value: 'PAUSED', label: 'Приостановлено' }].map(opt => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: '4px' }}>
                <input type="radio" name="status" value={opt.value} defaultChecked={service.status === opt.value} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{opt.label}</span>
              </label>
            ))}
          </div>

          {state.error && <p style={{ color: '#dc2626', fontSize: '13px' }}>{state.error}</p>}
          <button type="submit" disabled={pending || uploading} style={{
            padding: '14px', borderRadius: '50px',
            background: (pending || uploading) ? 'var(--border)' : 'var(--primary)',
            color: '#fff', fontSize: '15px', fontWeight: 700,
            cursor: (pending || uploading) ? 'not-allowed' : 'pointer',
            boxShadow: (pending || uploading) ? 'none' : '0 2px 8px rgba(249,115,22,0.30)',
          }}>
            {pending ? 'Сохраняю...' : uploading ? 'Загружаю фото...' : 'Сохранить изменения'}
          </button>
        </div>
      </div>
    </form>
  )
}
