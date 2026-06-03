import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getIncomingOrders } from '@/actions/orders'
import OrderStatusButton from './OrderStatusButton'

const STATUS: Record<string, { label: string; dot: string; color: string }> = {
  PENDING:   { label: 'Ожидает',  dot: '#d97706', color: '#92400e' },
  ACTIVE:    { label: 'В работе', dot: '#3b82f6', color: '#1e40af' },
  COMPLETED: { label: 'Завершён', dot: '#22c55e', color: '#14532d' },
  CANCELLED: { label: 'Отменён', dot: '#ef4444', color: '#7f1d1d' },
  DISPUTED:  { label: 'Спор',    dot: '#8b5cf6', color: '#4c1d95' },
}

export default async function IncomingOrdersPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'SELLER' && session.role !== 'ADMIN') redirect('/dashboard')

  const orders = await getIncomingOrders()
  const pending = orders.filter(o => o.status === 'PENDING').length
  const active  = orders.filter(o => o.status === 'ACTIVE').length

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 36px' }}>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
          {pending > 0 && `${pending} ожидают · `}{active > 0 && `${active} в работе · `}Всего {orders.length}
        </p>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
          Входящие заказы
        </h1>
      </div>

      {orders.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '60px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '36px', marginBottom: '12px' }}>📬</p>
          <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px' }}>Заказов пока нет</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.6 }}>
            Когда покупатели оформят заказы на ваши услуги — они появятся здесь
          </p>
          <Link href="/dashboard/services/new" style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--ink)', color: '#fff', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
            Добавить услугу
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {orders.map(order => {
            const st = STATUS[order.status] ?? STATUS.PENDING
            const initials = order.buyer.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
            return (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} style={{
                display: 'block', background: '#fff', borderRadius: '14px', border: '1px solid var(--line)',
                padding: '18px 22px', textDecoration: 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>

                  {/* Buyer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px', flex: '0 0 auto' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--ink)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'var(--lime)', fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '13px',
                    }}>
                      {initials}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)', letterSpacing: '-0.01em' }}>{order.buyer.name}</p>
                      {order.buyer.phone && <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '1px' }}>{order.buyer.phone}</p>}
                      <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '1px' }}>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                    </div>
                  </div>

                  {/* Service + comment */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{order.service.category.name}</p>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)', marginBottom: '4px' }}>{order.service.title}</p>
                    {order.comment && (
                      <p style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.5 }}>«{order.comment}»</p>
                    )}
                  </div>

                  {/* Price + status + action */}
                  <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <p style={{ fontFamily: 'var(--ff-display)', fontSize: '20px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                      {Number(order.price).toLocaleString('ru-RU')} ₽
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: st.dot }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: st.color }}>{st.label}</span>
                    </div>
                    <OrderStatusButton orderId={order.id} currentStatus={order.status} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
