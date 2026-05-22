'use client'

import { useState, useTransition } from 'react'
import { savePriceUnits } from '@/actions/siteConfig'

export function PriceUnitsForm({ initial }: { initial: string[] }) {
  const [units, setUnits] = useState<string[]>(initial)
  const [newUnit, setNewUnit] = useState('')
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function add() {
    const trimmed = newUnit.trim()
    if (!trimmed || units.includes(trimmed)) return
    setUnits(prev => [...prev, trimmed])
    setNewUnit('')
  }

  function remove(i: number) {
    setUnits(prev => prev.filter((_, j) => j !== i))
  }

  function save() {
    startTransition(async () => {
      const res = await savePriceUnits(units)
      if (res.error) { setStatus('error'); setErrorMsg(res.error) }
      else { setStatus('ok'); setTimeout(() => setStatus('idle'), 2500) }
    })
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Единицы цены</h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {units.map((u, i) => (
          <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '20px', background: '#f3f4f6', border: '1px solid #e5e7eb', fontSize: '13px', color: '#374151' }}>
            {u}
            <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}>×</button>
          </div>
        ))}
        {units.length === 0 && <p style={{ fontSize: '13px', color: '#9ca3af' }}>Нет единиц</p>}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={newUnit}
          onChange={e => setNewUnit(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Новая единица (напр. за кг)"
          style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px', color: '#111827', outline: 'none' }}
        />
        <button type="button" onClick={add} style={{ padding: '8px 14px', borderRadius: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          + Добавить
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {status === 'ok' && <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>✓ Сохранено</span>}
        {status === 'error' && <span style={{ fontSize: '12px', color: '#dc2626' }}>{errorMsg}</span>}
        {status === 'idle' && <span />}
        <button type="button" onClick={save} disabled={isPending} style={{ padding: '8px 16px', borderRadius: '6px', background: isPending ? '#e5e7eb' : '#111827', color: '#fff', fontSize: '13px', fontWeight: 600, border: 'none', cursor: isPending ? 'not-allowed' : 'pointer' }}>
          {isPending ? 'Сохраняю...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}
