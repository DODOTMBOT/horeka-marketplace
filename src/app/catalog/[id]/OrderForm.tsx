'use client'

import { useActionState } from 'react'
import { createOrder } from '@/actions/orders'
import type { CreateOrderState } from '@/actions/orders'

const initial: CreateOrderState = {}

export default function OrderForm({ serviceId, price, packageTier, packageName }: {
  serviceId: string
  price: number
  packageTier?: string
  packageName?: string
}) {
  const [state, action, pending] = useActionState(createOrder, initial)

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="price" value={price} />
      {packageTier && <input type="hidden" name="packageTier" value={packageTier} />}

      <textarea
        name="comment"
        placeholder="Комментарий к заказу (необязательно)..."
        rows={3}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 'var(--r-md)',
          border: '1.5px solid var(--line)', background: 'var(--paper-2)',
          fontSize: '13px', color: 'var(--ink)', resize: 'none',
          fontFamily: 'var(--ff-display)', outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--ink)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
      />

      {state.error && (
        <p style={{ color: '#dc2626', fontSize: '13px' }}>{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="order-btn"
        style={{
          padding: '14px 20px', borderRadius: 'var(--r-md)',
          background: pending ? 'var(--line)' : 'var(--ink)',
          color: pending ? 'var(--muted)' : '#fff',
          fontSize: '14px', fontWeight: 800, letterSpacing: '-0.01em',
          border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {pending ? 'Оформляю...' : (
          <>
            {packageName ? `Заказать — ${packageName}` : 'Заказать услугу'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </>
        )}
      </button>
    </form>
  )
}
