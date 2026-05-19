'use client'

import { useActionState } from 'react'
import { createOrder } from '@/actions/orders'
import type { CreateOrderState } from '@/actions/orders'

const initial: CreateOrderState = {}

export default function OrderForm({
  serviceId,
  price,
  packageTier,
  packageName,
}: {
  serviceId: string
  price: number
  packageTier?: string
  packageName?: string
}) {
  const [state, action, pending] = useActionState(createOrder, initial)

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="price" value={price} />
      {packageTier && <input type="hidden" name="packageTier" value={packageTier} />}

      <textarea
        name="comment"
        placeholder="Комментарий к заказу (необязательно)..."
        rows={3}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          border: 'none', background: 'var(--bg)', boxShadow: 'var(--shadow-in)',
          fontSize: '13px', color: 'var(--text)', resize: 'none',
        }}
      />

      {state.error && (
        <p style={{ color: '#dc2626', fontSize: '13px' }}>{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{
          padding: '14px', borderRadius: 'var(--radius-sm)',
          background: pending ? '#fdba74' : 'var(--primary)',
          color: '#fff', fontSize: '15px', fontWeight: 700,
          cursor: pending ? 'not-allowed' : 'pointer',
          boxShadow: pending ? 'none' : '4px 4px 12px rgba(249,115,22,0.35)',
        }}
      >
        {pending ? 'Оформляю...' : packageName ? `Заказать — ${packageName}` : 'Заказать услугу'}
      </button>
    </form>
  )
}
