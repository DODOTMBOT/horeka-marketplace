'use client'

import { useState, useTransition } from 'react'
import { savePackageTiers } from '@/actions/siteConfig'
import type { PackageTier } from '@/lib/siteConfig'

export function PackageTiersForm({ initial }: { initial: PackageTier[] }) {
  const [tiers, setTiers] = useState<PackageTier[]>(initial)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function add() {
    setTiers(prev => [...prev, { key: `tier_${Date.now()}`, label: '' }])
  }

  function remove(i: number) {
    setTiers(prev => prev.filter((_, j) => j !== i))
  }

  function update(i: number, field: keyof PackageTier, value: string) {
    setTiers(prev => prev.map((t, j) => j === i ? { ...t, [field]: value } : t))
  }

  function save() {
    startTransition(async () => {
      const res = await savePackageTiers(tiers)
      if (res.error) { setStatus('error'); setErrorMsg(res.error) }
      else { setStatus('ok'); setTimeout(() => setStatus('idle'), 2500) }
    })
  }

  const inp: React.CSSProperties = {
    padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb',
    fontSize: '13px', color: '#111827', background: '#fff', outline: 'none',
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Пакеты услуг</h3>
        <button type="button" onClick={add} style={{ padding: '6px 12px', borderRadius: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          + Добавить
        </button>
      </div>

      {tiers.length === 0 && (
        <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>Нет пакетов</p>
      )}

      {tiers.map((tier, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'center' }}>
          <input
            value={tier.key}
            onChange={e => update(i, 'key', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            placeholder="ключ (basic)"
            style={{ ...inp, fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}
          />
          <input
            value={tier.label}
            onChange={e => update(i, 'label', e.target.value)}
            placeholder="Название (Базовый)"
            style={inp}
          />
          <button type="button" onClick={() => remove(i)} style={{ padding: '8px 10px', borderRadius: '6px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '12px', cursor: 'pointer' }}>
            ×
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
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
