import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getIncomingOrders } from '@/actions/orders'
import DashboardNav from '@/components/DashboardNav'
import OrderStatusButton from './OrderStatusButton'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Ожидает принятия', color: '#d97706', bg: '#fffbeb' },
  ACTIVE:    { label: 'В работе',         color: '#2563eb', bg: '#eff6ff' },
  COMPLETED: { label: 'Завершён',         color: '#16a34a', bg: '#f0fdf4' },
  CANCELLED: { label: 'Отменён',         color: '#dc2626', bg: '#fef2f2' },
  DISPUTED:  { label: 'Спор',            color: '#7c3aed', bg: '#f5f3ff' },
}

export default async function IncomingOrdersPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'SELLER' && session.role !== 'ADMIN') redirect('/dashboard')

  const orders = await getIncomingOrders()
  const pending = orders.filter(o => o.status === 'PENDING').length
  const active = orders.filter(o => o.status === 'ACTIVE').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardNav active="incoming" />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Входящие заказы</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {pending > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}>{pending} ожидают · </span>}
            {active > 0 && <span style={{ color: '#2563eb', fontWeight: 600 }}>{active} в работе · </span>}
            Всего {orders.length}
          </p>
        </div>

        {orders.length === 0 ? (
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-out)', padding: '60px 32px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>📬</p>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
              Заказов пока нет
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Когда покупатели оформят заказы на ваши услуги — они появятся здесь
            </p>
            <Link href="/dashboard/services/new" style={{
              padding: '12px 28px', borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)', color: '#fff', fontSize: '15px', fontWeight: 700,
              boxShadow: '4px 4px 12px rgba(249,115,22,0.35)',
            }}>
              Добавить услугу
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map(order => {
              const st = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
              const buyerInitials = order.buyer.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
              return (
                <div key={order.id} style={{
                  background: 'var(--surface)', borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-out)', padding: '20px 24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Buyer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '200px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                        background: 'var(--primary)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px',
                      }}>
                        {buyerInitials}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{order.buyer.name}</p>
                        {order.buyer.phone && (
                          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.buyer.phone}</p>
                        )}
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>

                    {/* Service */}
                    <div style={{ flex: 2, minWidth: '200px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '2px' }}>{order.service.category.name}</p>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>
                        {order.service.title}
                      </p>
                      {order.comment && (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          «{order.comment}»
                        </p>
                      )}
                    </div>

                    {/* Price + status */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
                        {Number(order.price).toLocaleString('ru-RU')} ₽
                      </p>
                      <span style={{
                        padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                        color: st.color, background: st.bg, display: 'inline-block', marginBottom: '10px',
                      }}>
                        {st.label}
                      </span>
                      <OrderStatusButton orderId={order.id} currentStatus={order.status} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
