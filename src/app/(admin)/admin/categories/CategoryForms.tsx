'use client'

import { useActionState, useState } from 'react'
import { createCategory, updateCategory } from '@/actions/admin'

type Category = { id: string; name: string; icon: string | null; slug: string; format: string }

const FORMAT_OPTIONS = [
  { key: 'digital',  label: 'Инструменты', color: '#3D5AFE' },
  { key: 'service',  label: 'Специалист',  color: '#0F0F12' },
  { key: 'project',  label: 'Проект',      color: '#FF6B5C' },
]

function FormatPicker({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {FORMAT_OPTIONS.map(f => (
        <button
          key={f.key}
          type="button"
          onClick={() => onChange(f.key)}
          style={{
            flex: 1, padding: '7px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
            background: value === f.key ? f.color : '#f5f5f5',
            color: value === f.key ? '#fff' : '#666',
            border: `1.5px solid ${value === f.key ? f.color : '#e5e7eb'}`,
            cursor: 'pointer', transition: 'all 0.12s',
          }}
        >
          {f.label}
        </button>
      ))}
      <input type="hidden" name={name} value={value} />
    </div>
  )
}

export function CategoryForms({ categories }: { categories: Category[] }) {
  const [createState, createAction, createPending] = useActionState(createCategory, { error: undefined, success: undefined } as { error?: string; success?: boolean })
  const [editState, editAction, editPending] = useActionState(updateCategory, { error: undefined, success: undefined } as { error?: string; success?: boolean })
  const [editing, setEditing] = useState<Category | null>(null)
  const [createFormat, setCreateFormat] = useState('service')
  const [editFormat, setEditFormat] = useState('service')

  const inputStyle = {
    padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '6px',
    fontSize: '13px', outline: 'none', width: '100%',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Create form */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>Новая категория</p>
        <form action={createAction} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Формат</p>
            <FormatPicker name="format" value={createFormat} onChange={setCreateFormat} />
          </div>
          <input name="name" placeholder="Название" required style={inputStyle} />
          <input name="icon" placeholder="Иконка (эмодзи)" style={inputStyle} />
          {createState.error && <p style={{ fontSize: '12px', color: '#dc2626' }}>{createState.error}</p>}
          {createState.success && <p style={{ fontSize: '12px', color: '#16a34a' }}>Категория создана</p>}
          <button type="submit" disabled={createPending} style={{
            padding: '8px', borderRadius: '6px', background: '#111827', color: '#fff',
            border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, opacity: createPending ? 0.6 : 1,
          }}>
            {createPending ? 'Создание...' : 'Создать'}
          </button>
        </form>
      </div>

      {/* Edit buttons */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Изменить категорию</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {categories.map(cat => {
            const fmt = FORMAT_OPTIONS.find(f => f.key === cat.format)
            return (
              <button key={cat.id} onClick={() => { setEditing(cat); setEditFormat(cat.format || 'service') }} style={{
                padding: '7px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 500,
                background: editing?.id === cat.id ? '#f3f4f6' : 'transparent',
                border: '1px solid ' + (editing?.id === cat.id ? '#e5e7eb' : 'transparent'),
                cursor: 'pointer', textAlign: 'left', color: '#374151',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span>{cat.icon}</span>
                <span style={{ flex: 1 }}>{cat.name}</span>
                {fmt && (
                  <span style={{
                    fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                    background: fmt.color, color: '#fff', letterSpacing: '0.04em',
                  }}>{fmt.label}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{ background: '#fff', border: '1px solid #2563eb', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Изменить: {editing.name}</p>
            <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '20px', lineHeight: 1, padding: '0 4px' }}>×</button>
          </div>
          <form action={editAction} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="hidden" name="id" value={editing.id} />
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Формат</p>
              <FormatPicker name="format" value={editFormat} onChange={setEditFormat} />
            </div>
            <input name="name" defaultValue={editing.name} required style={inputStyle} />
            <input name="icon" defaultValue={editing.icon ?? ''} placeholder="Иконка" style={inputStyle} />
            {editState.error && <p style={{ fontSize: '12px', color: '#dc2626' }}>{editState.error}</p>}
            {editState.success && <p style={{ fontSize: '12px', color: '#16a34a' }}>Сохранено</p>}
            <button type="submit" disabled={editPending} style={{
              padding: '8px', borderRadius: '6px', background: '#2563eb', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, opacity: editPending ? 0.6 : 1,
            }}>
              {editPending ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
