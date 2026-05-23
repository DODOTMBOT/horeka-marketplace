'use client'

import { useActionState, useState, useRef, useCallback } from 'react'
import { createService } from '@/actions/services'
import type { CreateServiceState } from '@/actions/services'

const initial: CreateServiceState = {}

const FORMAT_OPTIONS = [
  {
    key: 'digital',
    label: 'Инструменты',
    hint: 'Шаблоны, курсы, цифровые продукты',
    bgColor: '#3D5AFE',
    num: '01',
  },
  {
    key: 'service',
    label: 'Специалист',
    hint: 'Услуга под задачу, разовая работа',
    bgColor: '#0F0F12',
    num: '02',
  },
  {
    key: 'project',
    label: 'Проект',
    hint: 'Комплексная работа под ключ',
    bgColor: '#FF6B5C',
    num: '03',
  },
]

function TagInput({ onChange }: { onChange: (tags: string[]) => void }) {
  const [tags, setTags] = useState<string[]>([])
  const [input, setInput] = useState('')

  const addTag = useCallback((raw: string) => {
    const parts = raw.split(/[\s,]+/).map(t => t.trim().toLowerCase()).filter(Boolean)
    if (!parts.length) return
    setTags(prev => {
      const next = [...prev]
      for (const p of parts) if (!next.includes(p)) next.push(p)
      onChange(next)
      return next
    })
    setInput('')
  }, [onChange])

  const removeTag = (i: number) => {
    setTags(prev => {
      const next = prev.filter((_, j) => j !== i)
      onChange(next)
      return next
    })
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === ',' || e.key === 'Enter') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center',
      padding: '10px 12px', borderRadius: 'var(--r-md)',
      border: '1.5px solid var(--line)', background: '#fff',
      cursor: 'text', minHeight: '44px',
    }} onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
      {tags.map((tag, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '3px 10px', borderRadius: '999px',
          background: 'var(--ink)', color: '#fff',
          fontFamily: 'var(--ff-mono)', fontSize: '11px', fontWeight: 600,
          letterSpacing: '0.02em',
        }}>
          {tag}
          <button type="button" onClick={() => removeTag(i)} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer', padding: '0 0 0 2px', fontSize: '14px', lineHeight: 1, display: 'flex',
          }}>×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { if (input.trim()) addTag(input) }}
        placeholder={tags.length === 0 ? 'Введите тег и нажмите пробел или запятую' : ''}
        style={{
          border: 'none', outline: 'none', fontSize: '14px',
          color: 'var(--ink)', background: 'transparent',
          flex: 1, minWidth: '140px',
        }}
      />
    </div>
  )
}

function PriceInput({ onChange }: { onChange: (v: number) => void }) {
  const [display, setDisplay] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '')
    const num = Number(raw)
    setDisplay(raw ? num.toLocaleString('ru-RU') : '')
    onChange(num)
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder="0"
        style={{
          width: '100%', padding: '12px 48px 12px 16px',
          borderRadius: 'var(--r-md)', border: '1.5px solid var(--line)',
          background: '#fff', fontSize: '18px', fontWeight: 700,
          color: 'var(--ink)', outline: 'none', letterSpacing: '-0.02em',
        }}
      />
      <span style={{
        position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
        fontSize: '18px', fontWeight: 700, color: 'var(--muted)',
      }}>₽</span>
    </div>
  )
}

function ServicePreview({
  title, format, category, tags, price, images, description,
}: {
  title: string
  format: string
  category: string
  tags: string[]
  price: number
  images: string[]
  description: string
}) {
  const fmt = FORMAT_OPTIONS.find(f => f.key === format)

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--line)',
      borderRadius: 'var(--r-lg)', overflow: 'hidden',
      maxWidth: '260px',
    }}>
      {/* Image */}
      <div style={{
        width: '100%', height: '175px',
        background: images[0] ? 'transparent' : '#f5f5f5',
        position: 'relative', overflow: 'hidden',
      }}>
        {images[0] ? (
          <img src={images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '44px', color: '#ccc' }}>
            📷
          </div>
        )}
        {/* Format badge */}
        {fmt && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: fmt.bgColor, borderRadius: '4px', padding: '3px 8px',
            fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.06em',
          }}>
            {fmt.label}
          </div>
        )}
        {category && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(0,0,0,0.55)', borderRadius: '4px', padding: '3px 8px',
            fontSize: '10px', fontWeight: 600, color: '#fff',
          }}>
            {category}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '13px 14px 15px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h3 style={{
          fontSize: '14px', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.4,
          letterSpacing: '-0.1px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {title || <span style={{ color: '#ccc' }}>Название услуги</span>}
        </h3>

        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {tags.slice(0, 3).map((tag, i) => (
              <span key={i} style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '999px',
                background: 'var(--paper-2)', color: 'var(--muted)',
                fontFamily: 'var(--ff-mono)', fontWeight: 600,
              }}>{tag}</span>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--line)',
        }}>
          <span style={{ fontSize: '11px', color: '#ccc' }}>Нет отзывов</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
            <span style={{ fontSize: '10px', color: 'var(--muted)', marginRight: '1px' }}>от </span>
            <span style={{
              fontSize: '17px', fontWeight: 900, color: 'var(--ink)',
              fontFamily: 'var(--ff-display)', letterSpacing: '-0.5px',
            }}>
              {price > 0 ? price.toLocaleString('ru-RU') : '—'}
            </span>
            {price > 0 && <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginLeft: '2px' }}>₽</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ServiceForm({
  categories,
}: {
  categories: { id: string; name: string; icon: string | null; format: string }[]
}) {
  const [state, action, pending] = useActionState(createService, initial)
  const [description, setDescription] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [format, setFormat] = useState('service')
  const [tags, setTags] = useState<string[]>([])
  const [price, setPrice] = useState(0)
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const digitalFileRef = useRef<HTMLInputElement>(null)
  const [digitalFiles, setDigitalFiles] = useState<{ name: string; url: string; size: number }[]>([])
  const [uploadingDigital, setUploadingDigital] = useState(false)

  const filteredCategories = categories.filter(c => c.format === format)
  const selectedCategory = categories.find(c => c.id === categoryId)

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleImages(e.dataTransfer.files)
  }

  const handleDigitalFiles = async (files: FileList | null) => {
    if (!files) return
    setUploadingDigital(true)
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', 'files')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) {
          setDigitalFiles(prev => [...prev, { name: file.name, url: data.url, size: file.size }])
        } else {
          alert(`Ошибка: ${data.error ?? 'неизвестная ошибка'}`)
        }
      } catch {
        alert(`Ошибка загрузки ${file.name}`)
      }
    }
    setUploadingDigital(false)
  }

  const label = (text: string) => (
    <p style={{
      fontSize: '11px', fontWeight: 700, color: 'var(--muted)',
      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
    }}>{text}</p>
  )

  return (
    <form action={action}>
      {/* Hidden */}
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="format" value={format} />
      <input type="hidden" name="status" value="ACTIVE" />
      <input type="hidden" name="price" value={price || 0} />
      <input type="hidden" name="priceUnit" value="разово" />
      <input type="hidden" name="tags" value={tags.join(',')} />
      {imageUrls.map((url, i) => (
        <input key={i} type="hidden" name={`imageUrl_${i}`} value={url} />
      ))}
      <input type="hidden" name="digitalFiles" value={JSON.stringify(digitalFiles)} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '28px', alignItems: 'start' }}>
        {/* ── Left: form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* 1. Название */}
          <div>
            {label('1. Название услуги')}
            <input
              type="text" name="title" required
              placeholder="Например: Поставка свежих овощей и фруктов"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: 'var(--r-md)', border: '1.5px solid var(--line)',
                fontSize: '16px', fontWeight: 600, color: 'var(--ink)',
                background: '#fff', outline: 'none',
              }}
            />
            {state.errors?.title?.[0] && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{state.errors.title[0]}</p>}
          </div>

          {/* 2. Формат */}
          <div>
            {label('2. Формат')}
            <div style={{ display: 'flex', gap: '10px' }}>
              {FORMAT_OPTIONS.map(f => {
                const active = format === f.key
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => { setFormat(f.key); setCategoryId('') }}
                    style={{
                      flex: 1, padding: '16px 14px', borderRadius: 'var(--r-lg)',
                      background: active ? f.bgColor : '#fff',
                      border: `2px solid ${active ? f.bgColor : 'var(--line)'}`,
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <p style={{ fontFamily: 'var(--ff-mono)', fontSize: '9px', fontWeight: 600, color: active ? 'rgba(255,255,255,0.5)' : 'var(--muted)', letterSpacing: '0.1em', marginBottom: '6px' }}>{f.num}</p>
                    <p style={{ fontWeight: 800, fontSize: '15px', color: active ? '#fff' : 'var(--ink)', letterSpacing: '-0.03em', marginBottom: '3px' }}>{f.label}</p>
                    <p style={{ fontSize: '11px', color: active ? 'rgba(255,255,255,0.6)' : 'var(--muted)', lineHeight: 1.4 }}>{f.hint}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Категория */}
          <div>
            {label('3. Категория')}
            {filteredCategories.length === 0 ? (
              <div style={{
                padding: '14px 16px', borderRadius: 'var(--r-md)',
                border: '1.5px dashed var(--line)', background: 'var(--paper-2)',
                fontSize: '13px', color: 'var(--muted)', textAlign: 'center',
              }}>
                Нет категорий для этого формата — создайте их в{' '}
                <a href="/admin/categories" style={{ color: 'var(--blue)', fontWeight: 600 }}>Админке → Категории</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {filteredCategories.map(cat => {
                  const active = categoryId === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(active ? '' : cat.id)}
                      style={{
                        padding: '8px 16px', borderRadius: '999px',
                        background: active ? 'var(--ink)' : '#fff',
                        border: `1.5px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
                        color: active ? '#fff' : 'var(--ink)',
                        fontSize: '13px', fontWeight: active ? 700 : 500,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                        transition: 'all 0.12s',
                      }}
                    >
                      {cat.icon && <span>{cat.icon}</span>}
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            )}
            <input type="hidden" name="categoryId" value={categoryId} required />
            {state.errors?.categoryId?.[0] && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '6px' }}>{state.errors.categoryId[0]}</p>}
          </div>

          {/* 4. Краткое описание */}
          <div>
            {label('4. Краткое описание')}
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>
              До 160 символов — показывается на карточке в каталоге
            </p>
            <textarea
              placeholder="Одна-две фразы о услуге: суть, для кого, главное преимущество..."
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, 160))}
              rows={3}
              maxLength={160}
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: 'var(--r-md)', border: '1.5px solid var(--line)',
                fontSize: '14px', color: 'var(--ink)', background: '#fff',
                outline: 'none', resize: 'none', lineHeight: 1.65,
                fontFamily: 'var(--ff-display)',
              }}
            />
            <p style={{ fontSize: '11px', color: description.length > 140 ? '#dc2626' : 'var(--muted)', textAlign: 'right', marginTop: '4px' }}>
              {description.length}/160
            </p>
            {state.errors?.description?.[0] && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{state.errors.description[0]}</p>}
          </div>

          {/* 4b. Полное описание */}
          <div>
            {label('4б. Полное описание')}
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px' }}>
              Подробно — видно только на странице объявления
            </p>
            <textarea
              name="fullDescription"
              placeholder="Опишите услугу подробно: что включает, этапы работы, для кого подходит, ваши преимущества, примеры работ..."
              rows={10}
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: 'var(--r-md)', border: '1.5px solid var(--line)',
                fontSize: '14px', color: 'var(--ink)', background: '#fff',
                outline: 'none', resize: 'vertical', lineHeight: 1.75,
                fontFamily: 'var(--ff-display)',
              }}
            />
          </div>

          {/* 5. Теги */}
          <div>
            {label('5. Теги')}
            <TagInput onChange={setTags} />
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '5px' }}>
              Введите тег и нажмите <kbd style={{ background: 'var(--paper-2)', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>пробел</kbd> или <kbd style={{ background: 'var(--paper-2)', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>,</kbd>
            </p>
          </div>

          {/* 6. Фото */}
          <div>
            {label('6. Фотографии')}
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleImages(e.target.files)} />
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${uploading ? 'var(--blue)' : 'var(--line)'}`,
                borderRadius: 'var(--r-lg)', padding: '28px',
                textAlign: 'center', cursor: 'pointer',
                background: uploading ? 'var(--blue-soft)' : 'var(--paper-2)',
                transition: 'all 0.15s',
                marginBottom: imageUrls.length ? '12px' : 0,
              }}
            >
              <p style={{ fontSize: '28px', marginBottom: '6px' }}>📷</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', marginBottom: '3px' }}>
                {uploading ? 'Загружаю...' : 'Нажмите или перетащите фото'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>JPEG, PNG, WebP · до 5 МБ</p>
            </div>
            {imageUrls.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {imageUrls.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--r-md)' }} />
                    <button
                      type="button"
                      onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))}
                      style={{
                        position: 'absolute', top: '-6px', right: '-6px',
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#ef4444', color: '#fff', fontSize: '12px', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. Цена */}
          <div>
            {label('7. Цена')}
            <PriceInput onChange={setPrice} />
            {state.errors?.price?.[0] && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{state.errors.price[0]}</p>}
          </div>

          {/* Цифровые файлы — только для формата Инструменты */}
          {format === 'digital' && (
            <div style={{
              border: '2px solid var(--blue)',
              borderRadius: 'var(--r-lg)',
              padding: '20px 22px',
              background: 'var(--blue-soft)',
            }}>
              <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--blue)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
                Файлы для покупателя
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                Загрузите файлы, которые покупатель получит автоматически после оплаты. PDF, XLSX, DOCX, ZIP — до 50 МБ каждый.
              </p>

              <input
                ref={digitalFileRef}
                type="file"
                multiple
                accept=".pdf,.xlsx,.docx,.zip,.csv,.txt"
                style={{ display: 'none' }}
                onChange={e => handleDigitalFiles(e.target.files)}
              />

              {digitalFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  {digitalFiles.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#fff', borderRadius: 'var(--r-sm)',
                      padding: '10px 14px', border: '1px solid var(--line)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <span style={{ fontSize: '18px', flexShrink: 0 }}>
                          {f.name.endsWith('.pdf') ? '📄' : f.name.endsWith('.zip') ? '🗜️' : f.name.endsWith('.xlsx') ? '📊' : '📝'}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{(f.size / 1024).toFixed(0)} КБ</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDigitalFiles(prev => prev.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', color: 'var(--coral)', fontSize: '18px', cursor: 'pointer', flexShrink: 0, lineHeight: 1 }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => digitalFileRef.current?.click()}
                disabled={uploadingDigital}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', borderRadius: 'var(--r-sm)',
                  background: uploadingDigital ? 'var(--line)' : 'var(--blue)',
                  color: '#fff', border: 'none', cursor: uploadingDigital ? 'not-allowed' : 'pointer',
                  fontSize: '13px', fontWeight: 700, fontFamily: 'var(--ff-display)',
                }}
              >
                {uploadingDigital ? 'Загружаю...' : '+ Добавить файл'}
              </button>
            </div>
          )}

          {/* Спецпроект */}
          <div style={{
            border: '2px solid #e16919',
            borderRadius: 'var(--r-lg)',
            padding: '20px 22px',
            background: 'rgba(225,105,25,0.04)',
          }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: 'pointer' }}>
              <input type="checkbox" name="brand" value="dodo"
                style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#e16919', flexShrink: 0, cursor: 'pointer' }}
              />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#e16919', letterSpacing: '-0.02em', marginBottom: '3px' }}>
                  Спецпроект Додо Пицца
                </p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
                  Отметьте, если ваша услуга направлена на франчайзи Додо Пицца. Услуга появится на брендированной странице додо.
                </p>
              </div>
            </label>
          </div>

          {/* Submit */}
          {state.error && <p style={{ color: '#dc2626', fontSize: '13px' }}>{state.error}</p>}

          <button
            type="submit"
            disabled={pending || uploading || !categoryId}
            style={{
              padding: '16px', borderRadius: 'var(--r-md)',
              background: pending || uploading || !categoryId ? 'var(--line)' : 'var(--ink)',
              color: pending || uploading || !categoryId ? 'var(--muted)' : '#fff',
              fontSize: '15px', fontWeight: 800, letterSpacing: '-0.01em',
              border: 'none', cursor: pending || uploading || !categoryId ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {pending ? 'Публикую...' : uploading ? 'Загружаю фото...' : (
              <>
                Опубликовать
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </div>

        {/* ── Right: live preview ── */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, color: 'var(--muted)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px',
          }}>Предпросмотр</p>
          <ServicePreview
            title={title}
            format={format}
            category={selectedCategory ? `${selectedCategory.icon ?? ''} ${selectedCategory.name}` : ''}
            tags={tags}
            price={price}
            images={imageUrls}
            description={description}
          />
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            Так карточка выглядит в каталоге. Добавьте фото для лучшего результата.
          </p>
        </div>
      </div>
    </form>
  )
}
