'use client'

import { useState, useTransition } from 'react'
import { markSellerPaid } from '@/actions/admin'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Ожидает',   color: '#d97706' },
  ACTIVE:    { label: 'В работе',  color: '#2563eb' },
  COMPLETED: { label: 'Завершён',  color: '#16a34a' },
  CANCELLED: { label: 'Отменён',   color: '#888'    },
  DISPUTED:  { label: 'Спор',      color: '#dc2626' },
}

type Order = {
  id: string
  price: unknown
  status: string
  updatedAt: Date
  sellerPaidAt?: Date | null
  service: {
    title: string
    seller: { id: string; name: string; companyName?: string | null; phone?: string | null; email?: string | null }
  }
  buyer: { id: string; name: string }
}

function fmt(n: unknown) {
  return Number(n).toLocaleString('ru-RU')
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? STATUS_LABELS.PENDING
  return (
    <span style={{ fontSize: '10px', fontWeight: 700, color: s.color, border: `1.5px solid currentColor`, padding: '2px 6px', borderRadius: '3px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {s.label}
    </span>
  )
}

function Row({ order, onPaid }: { order: Order; onPaid: (id: string) => void }) {
  const [pending, startTransition] = useTransition()
  const seller = order.service.seller

  return (
    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>{order.service.title}</p>
        <p style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px' }}>Покупатель: {order.buyer.name}</p>
        <StatusBadge status={order.status} />
      </td>
      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>{seller.companyName ?? seller.name}</p>
        {seller.phone && <p style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{seller.phone}</p>}
        {seller.email && <p style={{ fontSize: '11px', color: '#888' }}>{seller.email}</p>}
      </td>
      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
        <p style={{ fontFamily: 'Impact, "Arial Black", sans-serif', fontStyle: 'italic', fontSize: '20px', fontWeight: 900, color: '#111' }}>{fmt(order.price)} ₽</p>
        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{fmtDate(order.updatedAt)}</p>
      </td>
      <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'center' }}>
        <button
          disabled={pending}
          onClick={() => startTransition(async () => {
            await markSellerPaid(order.id)
            onPaid(order.id)
          })}
          style={{
            padding: '6px 14px', borderRadius: '3px', border: '1.5px solid #111',
            cursor: pending ? 'not-allowed' : 'pointer',
            background: pending ? '#f5f5f5' : '#111',
            color: pending ? '#aaa' : '#fff',
            fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            transition: 'all 0.15s',
          }}
        >
          {pending ? '...' : '✓ Переведено'}
        </button>
      </td>
    </tr>
  )
}

export default function PayoutsClient({
  initialPending,
  initialDone,
  pendingTotal,
}: {
  initialPending: Order[]
  initialDone: Order[]
  pendingTotal: number
}) {
  const [pending, setPending] = useState(initialPending)
  const [done, setDone] = useState(initialDone)
  const [tab, setTab] = useState<'pending' | 'done'>('pending')

  function handlePaid(id: string) {
    const order = pending.find(o => o.id === id)
    if (!order) return
    setPending(p => p.filter(o => o.id !== id))
    setDone(d => [{ ...order, sellerPaidAt: new Date() }, ...d])
  }

  const currentTotal = pending.reduce((s, o) => s + Number(o.price), 0)

  return (
    <div>
      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'К выплате',          value: `${currentTotal.toLocaleString('ru-RU')} ₽`,                                    sub: `${pending.length} заказ${pending.length === 1 ? '' : pending.length < 5 ? 'а' : 'ов'}`, accent: pending.length > 0 ? '#dc2626' : '#16a34a' },
          { label: 'Уже выплачено',       value: `${done.reduce((s, o) => s + Number(o.price), 0).toLocaleString('ru-RU')} ₽`,  sub: `${done.length} операций`,       accent: '#2563eb' },
          { label: 'Первоначальный долг', value: `${pendingTotal.toLocaleString('ru-RU')} ₽`,                                   sub: 'до начала сессии',               accent: 'var(--primary)' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: '6px', padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: c.accent }} />
            <p style={{ fontSize: '9px', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>{c.label}</p>
            <p style={{ fontFamily: 'Impact, "Arial Black", sans-serif', fontStyle: 'italic', fontSize: '26px', fontWeight: 900, color: '#111', lineHeight: 1 }}>{c.value}</p>
            <p style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ marginBottom: '12px' }}>
        {([['pending', `К выплате (${pending.length})`], ['done', `История (${done.length})`]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`admin-tab${tab === key ? ' active' : ''}`}>{label}</button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        {tab === 'pending' && (
          pending.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Impact, "Arial Black", sans-serif', fontStyle: 'italic', fontSize: '28px', fontWeight: 900, color: '#16a34a', textTransform: 'uppercase', marginBottom: '6px' }}>Все выплачено</p>
              <p style={{ fontSize: '13px', color: '#aaa' }}>Нет ожидающих переводов</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  {['Услуга / покупатель', 'Исполнитель', 'Сумма', 'Действие'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {pending.map(o => <Row key={o.id} order={o} onPaid={handlePaid} />)}
              </tbody>
            </table>
          )
        )}

        {tab === 'done' && (
          done.length === 0 ? (
            <p style={{ padding: '48px', fontSize: '13px', color: '#aaa', textAlign: 'center' }}>Нет истории выплат</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  {['Услуга / покупатель', 'Исполнитель', 'Сумма', 'Дата перевода'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {done.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '2px' }}>{o.service.title}</p>
                      <p style={{ fontSize: '11px', color: '#aaa' }}>{o.buyer.name}</p>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontSize: '13px', color: '#555' }}>{o.service.seller.companyName ?? o.service.seller.name}</p>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontFamily: 'Impact, "Arial Black", sans-serif', fontStyle: 'italic', fontSize: '16px', fontWeight: 900, color: '#111' }}>{fmt(o.price)} ₽</p>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '12px', color: '#888' }}>{o.sellerPaidAt ? fmtDate(o.sellerPaidAt) : '—'}</p>
                      <p style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>✓ Переведено</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  )
}
