'use client'

import { useTransition } from 'react'
import { updateOrderStatus } from '@/actions/orders'

export default function OrderStatusButton({
  orderId,
  currentStatus,
  isBuyer = false,
}: {
  orderId: string
  currentStatus: string
  isBuyer?: boolean
}) {
  const [pending, startTransition] = useTransition()

  const handle = (status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED') => {
    if (status === 'DISPUTED' && !confirm('Открыть спор? Это значит, что у вас есть претензия к выполнению заказа. Обратитесь в поддержку после открытия спора.')) return
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status)
      if (result.error) alert(result.error)
    })
  }

  const btn = (label: string, status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED', bg: string, color = '#fff'): React.JSX.Element => (
    <button onClick={() => handle(status)} disabled={pending} style={{
      padding: '7px 16px', borderRadius: '50px',
      fontSize: '12px', fontWeight: 700, color,
      background: bg, cursor: pending ? 'not-allowed' : 'pointer',
      opacity: pending ? 0.6 : 1, border: color !== '#fff' ? `1px solid ${bg}` : 'none',
    }}>
      {pending ? '...' : label}
    </button>
  )

  // Seller actions
  if (!isBuyer) {
    if (currentStatus === 'PENDING') return (
      <div style={{ display: 'flex', gap: '6px' }}>
        {btn('Принять', 'ACTIVE', '#2563eb')}
        {btn('Отклонить', 'CANCELLED', '#fee2e2', '#dc2626')}
      </div>
    )
    if (currentStatus === 'ACTIVE') return (
      <div style={{ display: 'flex', gap: '6px' }}>
        {btn('Завершить', 'COMPLETED', '#16a34a')}
        {btn('Отменить', 'CANCELLED', 'var(--bg)', 'var(--text-muted)')}
      </div>
    )
    return null
  }

  // Buyer actions
  if (currentStatus === 'PENDING') return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {btn('Отменить заказ', 'CANCELLED', '#fee2e2', '#dc2626')}
    </div>
  )
  if (currentStatus === 'ACTIVE') return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {btn('⚠️ Открыть спор', 'DISPUTED', '#fef3c7', '#92400e')}
    </div>
  )
  return null
}
