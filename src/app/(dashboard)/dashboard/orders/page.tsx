import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getMyOrders } from '@/actions/orders'
import DashboardNav from '@/components/DashboardNav'

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Ожидает',    color: '#d97706', bg: '#fffbeb' },
  ACTIVE:    { label: 'В работе',   color: '#2563eb', bg: '#eff6ff' },
  COMPLETED: { label: 'Завершён',   color: '#16a34a', bg: '#f0fdf4' },
  CANCELLED: { label: 'Отменён',    color: '#dc2626', bg: '#fef2f2' },
  DISPUTED:  { label: 'Спор',       color: '#7c3aed', bg: '#f5f3ff' },
}

export default async function MyOrdersPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const orders = await getMyOrders()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardNav active="orders" />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Мои заказы</h1>
          <p style={{ color: 'var(--text-muted)' }}>{orders.length} заказов</p>
        </div>

        {orders.length === 0 ? (
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-out)', padding: '60px 32px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</p>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
              Заказов пока нет
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Найдите нужную услугу в каталоге</p>
            <Link href="/catalog" style={{
              padding: '12px 28px', borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)', color: '#fff', fontSize: '15px', fontWeight: 700,
              boxShadow: '4px 4px 12px rgba(249,115,22,0.35)',
            }}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map(order => {
              const st = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
              return (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--surface)', borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-out)', padding: '20px 24px',
                    display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
                    cursor: 'pointer',
                  }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '12px', flexShrink: 0,
                      background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', fontSize: '24px',
                    }}>
                      {order.service.images[0]
                        ? <img src={order.service.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : order.service.category.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                          {order.service.title}
                        </p>
                        <span style={{
                          padding: '2px 10px', borderRadius: '20px',
                          fontSize: '11px', fontWeight: 600,
                          color: st.color, background: st.bg,
                        }}>
                          {st.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {order.service.seller.companyName ?? order.service.seller.name}
                        {' · '}
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        {order.status === 'COMPLETED' && !order.review && (
                          <span style={{ color: 'var(--primary)', fontWeight: 600, marginLeft: '8px' }}>
                            · Оставьте отзыв
                          </span>
                        )}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                        {Number(order.price).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
