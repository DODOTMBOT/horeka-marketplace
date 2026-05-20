import AdminNav from '../../AdminNav'
import { getAdminUserDetail } from '@/actions/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const statusStyle: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Ожидает',  color: '#d97706' },
  ACTIVE:    { label: 'В работе', color: '#2563eb' },
  COMPLETED: { label: 'Завершён', color: '#16a34a' },
  CANCELLED: { label: 'Отменён',  color: '#6b7280' },
  DISPUTED:  { label: 'Спор',     color: '#dc2626' },
}

const serviceStatusStyle: Record<string, { label: string; color: string }> = {
  ACTIVE:   { label: 'Активна',  color: '#16a34a' },
  DRAFT:    { label: 'Черновик', color: '#d97706' },
  PAUSED:   { label: 'Пауза',    color: '#6b7280' },
  ARCHIVED: { label: 'Архив',    color: '#9ca3af' },
}

const roleStyle: Record<string, { label: string; color: string; bg: string }> = {
  BUYER:  { label: 'Покупатель',    color: '#2563eb', bg: '#eff6ff' },
  SELLER: { label: 'Продавец',      color: '#16a34a', bg: '#f0fdf4' },
  ADMIN:  { label: 'Администратор', color: '#7c3aed', bg: '#f5f3ff' },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      </div>
      {children}
    </div>
  )
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAdminUserDetail(id)
  if (!user) notFound()

  const role = roleStyle[user.role]

  return (
    <>
      <AdminNav active="/admin/users" />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>
        {/* Header */}
        <div style={{ padding: '16px 28px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/admin/users" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px' }}>← Пользователи</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#9ca3af' }}>{user.name[0]}</div>
            }
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{user.name}</h1>
                <span style={{ fontSize: '11px', fontWeight: 700, color: role.color, background: role.bg, borderRadius: '4px', padding: '2px 7px' }}>{role.label}</span>
                {user.blocked && <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', background: '#fef2f2', borderRadius: '4px', padding: '2px 7px' }}>ЗАБЛОКИРОВАН</span>}
              </div>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>{user.email} · {user.phone ?? 'тел. не указан'} · с {new Date(user.createdAt).toLocaleDateString('ru-RU')}</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 28px' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Услуг', value: user._count.services },
              { label: 'Заказов', value: user._count.orders },
              { label: 'Отзывов', value: user._count.reviews },
              { label: 'ИНН', value: user.innVerified ? '✓ Верифицирован' : '— Не проверен' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
                <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{s.label}</p>
                <p style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              {/* Services */}
              {user.services.length > 0 && (
                <Section title={`Услуги (${user._count.services})`}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      {user.services.map((svc, i) => {
                        const ss = serviceStatusStyle[svc.status]
                        return (
                          <tr key={svc.id} style={{ borderBottom: i < user.services.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                            <td style={{ padding: '8px 14px' }}>
                              <Link href={`/catalog/${svc.id}`} target="_blank" style={{ color: '#111827', fontWeight: 500, textDecoration: 'none', fontSize: '12px' }}>
                                {svc.title}
                              </Link>
                              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{svc.category.name} · {svc._count.orders} заказов</div>
                            </td>
                            <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: ss.color }}>{ss.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </Section>
              )}

              {/* Orders */}
              {user.orders.length > 0 && (
                <Section title={`Заказы (${user._count.orders})`}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      {user.orders.map((order, i) => {
                        const ss = statusStyle[order.status]
                        return (
                          <tr key={order.id} style={{ borderBottom: i < user.orders.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                            <td style={{ padding: '8px 14px' }}>
                              <div style={{ color: '#111827', fontWeight: 500 }}>{order.service.title}</div>
                              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{new Date(order.createdAt).toLocaleDateString('ru-RU')} · {Number(order.price).toLocaleString('ru-RU')} ₽</div>
                            </td>
                            <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: ss.color }}>{ss.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </Section>
              )}
            </div>

            <div>
              {/* Reviews */}
              {user.reviews.length > 0 && (
                <Section title={`Отзывы (${user._count.reviews})`}>
                  <div style={{ padding: '4px 0' }}>
                    {user.reviews.map((r, i) => (
                      <div key={r.id} style={{ padding: '10px 14px', borderBottom: i < user.reviews.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <Link href={`/catalog/${r.service.id}`} target="_blank" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                            {r.service.title}
                          </Link>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>{'★'.repeat(r.rating)}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Activity log */}
              <Section title="Последняя активность">
                <div style={{ padding: '4px 0' }}>
                  {user.activityLogs.map((log, i) => (
                    <div key={log.id} style={{ padding: '8px 14px', borderBottom: i < user.activityLogs.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#374151' }}>{log.action}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{new Date(log.createdAt).toLocaleDateString('ru-RU')}</div>
                        <div style={{ fontSize: '10px', color: '#d1d5db', fontFamily: 'monospace' }}>{log.ip}</div>
                      </div>
                    </div>
                  ))}
                  {user.activityLogs.length === 0 && (
                    <p style={{ padding: '16px 14px', fontSize: '12px', color: '#9ca3af' }}>Активности нет</p>
                  )}
                </div>
              </Section>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
