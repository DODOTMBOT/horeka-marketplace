'use client'

import { useTransition, useState } from 'react'
import { updateOrderStatus } from '@/actions/orders'

export default function OrderActions({
  orderId, currentStatus, isBuyer, isSeller,
}: {
  orderId: string; currentStatus: string; isBuyer: boolean; isSeller: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')

  const handle = (status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED', reason?: string) => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status, reason)
      if (result.error) alert(result.error)
    })
  }

  const btn = (label: string, status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED', bg: string, color = '#fff') => (
    <button onClick={() => handle(status)} disabled={pending} style={{
      width: '100%', padding: '11px', borderRadius: '50px',
      background: bg, color, fontSize: '14px', fontWeight: 700,
      cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.6 : 1,
      marginBottom: '8px', border: color !== '#fff' ? `1.5px solid ${bg}` : 'none',
    }}>
      {pending ? '...' : label}
    </button>
  )

  if (isSeller) {
    if (currentStatus === 'PENDING') return <div>{btn('Принять заказ', 'ACTIVE', '#2563eb')}{btn('Отклонить', 'CANCELLED', '#fee2e2', '#dc2626')}</div>
    if (currentStatus === 'ACTIVE') return <div>{btn('Завершить заказ', 'COMPLETED', '#16a34a')}{btn('Отменить', 'CANCELLED', 'var(--bg)', 'var(--text-muted)')}</div>
  }

  if (isBuyer) {
    if (currentStatus === 'PENDING') return (
      <div>{btn('Отменить заказ', 'CANCELLED', '#fee2e2', '#dc2626')}</div>
    )

    if (currentStatus === 'ACTIVE') {
      if (showDisputeForm) {
        return (
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>
              Опишите причину спора
            </p>
            <p style={{ fontSize: '12px', color: '#92400e', marginBottom: '12px', lineHeight: 1.5 }}>
              Администратор рассмотрит ситуацию и свяжется со сторонами в течение 24 часов.
            </p>
            <textarea
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              placeholder="Что именно пошло не так? Чем недовольны результатом?"
              rows={4}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1.5px solid #fde68a', background: '#fff',
                fontSize: '13px', lineHeight: 1.5, resize: 'vertical',
                boxSizing: 'border-box', outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={() => handle('DISPUTED', disputeReason)}
                disabled={pending || disputeReason.trim().length < 10}
                style={{
                  flex: 1, padding: '10px', borderRadius: '50px',
                  background: disputeReason.trim().length < 10 ? '#fde68a' : '#f59e0b',
                  color: '#fff', fontWeight: 700, fontSize: '13px',
                  border: 'none', cursor: disputeReason.trim().length < 10 ? 'not-allowed' : 'pointer',
                  opacity: pending ? 0.6 : 1,
                }}
              >
                {pending ? '...' : 'Открыть спор'}
              </button>
              <button
                onClick={() => { setShowDisputeForm(false); setDisputeReason('') }}
                style={{
                  padding: '10px 16px', borderRadius: '50px',
                  background: 'transparent', color: '#92400e',
                  border: '1.5px solid #fde68a', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        )
      }

      return (
        <div>
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '10px' }}>
            <p style={{ fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
              Если исполнитель нарушил условия — откройте спор. Менеджер рассмотрит ситуацию в течение 24 часов.
            </p>
          </div>
          <button
            onClick={() => setShowDisputeForm(true)}
            style={{
              width: '100%', padding: '11px', borderRadius: '50px',
              background: '#f59e0b', color: '#fff', fontSize: '14px', fontWeight: 700,
              border: 'none', cursor: 'pointer', marginBottom: '8px',
            }}
          >
            ⚠️ Открыть спор
          </button>
        </div>
      )
    }
  }

  return null
}
