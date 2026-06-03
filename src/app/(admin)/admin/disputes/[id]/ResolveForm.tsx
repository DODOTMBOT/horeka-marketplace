'use client'

import { useTransition, useState } from 'react'
import { resolveDispute } from '@/actions/disputes'
import { useRouter } from 'next/navigation'

export default function ResolveForm({ disputeId }: { disputeId: string }) {
  const [pending, startTransition] = useTransition()
  const [resolution, setResolution] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handle = (outcome: 'CONFIRMED' | 'REJECTED') => {
    if (!resolution.trim()) { setError('Укажите текст решения'); return }
    setError('')
    startTransition(async () => {
      const r = await resolveDispute(disputeId, outcome, resolution)
      if (r?.error) setError(r.error)
      else router.refresh()
    })
  }

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '24px' }}>
      <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
        Решение модератора
      </p>

      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
        Комментарий / решение
      </p>
      <textarea
        value={resolution}
        onChange={e => setResolution(e.target.value)}
        placeholder="Опишите принятое решение и его обоснование..."
        rows={4}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: '8px',
          border: '1.5px solid var(--line)', fontSize: '13px', lineHeight: 1.5,
          resize: 'vertical', boxSizing: 'border-box', outline: 'none',
          fontFamily: 'inherit', marginBottom: '14px',
        }}
      />

      {error && <p style={{ fontSize: '12px', color: '#dc2626', marginBottom: '10px' }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          onClick={() => handle('CONFIRMED')}
          disabled={pending}
          style={{
            padding: '12px', borderRadius: '10px',
            background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '13px',
            border: 'none', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1,
            fontFamily: 'var(--ff-display)', letterSpacing: '-0.01em',
          }}
        >
          {pending ? '...' : '✓ Подтвердить спор'}
        </button>
        <button
          onClick={() => handle('REJECTED')}
          disabled={pending}
          style={{
            padding: '12px', borderRadius: '10px',
            background: 'transparent', color: '#dc2626', fontWeight: 700, fontSize: '13px',
            border: '1.5px solid #fecaca', cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? '...' : '✕ Отклонить спор'}
        </button>
      </div>

      <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--paper-2)', borderRadius: '8px' }}>
        <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>
          <strong>Подтвердить</strong> — возврат покупателю, заказ отменяется.<br/>
          <strong>Отклонить</strong> — спор закрыт, выплата исполнителю разрешена.
        </p>
      </div>
    </div>
  )
}
