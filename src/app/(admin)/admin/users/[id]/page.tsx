import AdminNav from '../../AdminNav'
import { getAdminUserDetail } from '@/actions/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const statusStyle: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Ожидает',  color: '#d97706' },
  ACTIVE:    { label: 'В работе', color: '#2563eb' },
  COMPLETED: { label: 'Завершён', color: '#16a34a' },
  CANCELLED: { label: 'Отменён',  color: '#888'    },
  DISPUTED:  { label: 'Спор',     color: '#dc2626' },
}

const serviceStatusStyle: Record<string, { label: string; color: string }> = {
  ACTIVE:   { label: 'Активна',  color: '#16a34a' },
  DRAFT:    { label: 'Черновик', color: '#d97706' },
  PAUSED:   { label: 'Пауза',    color: '#2563eb' },
  ARCHIVED: { label: 'Архив',    color: '#aaa'    },
}

const roleStyle: Record<string, { label: string; color: string }> = {
  BUYER:  { label: 'Покупатель',    color: '#2563eb' },
  SELLER: { label: 'Продавец',      color: '#16a34a' },
  ADMIN:  { label: 'Администратор', color: '#7c3aed' },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-card" style={{ marginBottom: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '2px solid #111' }}>
        <p style={{ fontSize: '9px', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</p>
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
      <main className="admin-main">
        {/* Header */}
        <div style={{ padding: '14px 28px', background: '#fff', borderBottom: '2px solid #111', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/admin/users" style={{ color: '#aaa', textDecoration: 'none', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>← Пользователи</Link>
          <div style={{ width: '1px', height: '20px', background: '#e0e0e0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '3px', objectFit: 'cover', border: '1.5px solid #e8e8e8' }} />
              : <div style={{ width: '36px', height: '36px', borderRadius: '3px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900, color: '#fff', fontFamily: 'Impact, "Arial Black", sans-serif', fontStyle: 'italic' }}>{user.name[0]}</div>
            }
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Impact, "Arial Black", sans-serif', fontStyle: 'italic', fontSize: '20px', fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: '-0.2px' }}>{user.name}</h1>
                <span style={{ fontSize: '10px', fontWeight: 800, color: role.color, border: `1.5px solid currentColor`, borderRadius: '3px', padding: '2px 7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{role.label}</span>
                {user.blocked && <span style={{ fontSize: '10px', fontWeight: 800, color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '3px', padding: '2px 7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Заблокирован</span>}
              </div>
              <p style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{user.email} · {user.phone ?? 'тел. не указан'} · с {new Date(user.createdAt).toLocaleDateString('ru-RU')}</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 28px' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Услуг',   value: user._count.services },
              { label: 'Заказов', value: user._count.orders },
              { label: 'Отзывов', value: user._count.reviews },
              { label: 'ИНН',     value: user.innVerified ? '✓' : '—' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: '6px', padding: '16px 18px' }}>
                <p style={{ fontSize: '9px', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{s.label}</p>
                <p className="admin-metric-num" style={{ fontSize: '26px' }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              {user.services.length > 0 && (
                <Section title={`Услуги (${user._count.services})`}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      {user.services.map((svc, i) => {
                        const ss = serviceStatusStyle[svc.status]
                        return (
                          <tr key={svc.id} style={{ borderBottom: i < user.services.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                            <td style={{ padding: '8px 14px' }}>
                              <Link href={`/catalog/${svc.id}`} target="_blank" style={{ color: '#111', fontWeight: 600, textDecoration: 'none', fontSize: '12px' }}>
                                {svc.title}
                              </Link>
                              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{svc.category.name} · {svc._count.orders} заказов</div>
                            </td>
                            <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: ss.color }}>{ss.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </Section>
              )}

              {user.orders.length > 0 && (
                <Section title={`Заказы (${user._count.orders})`}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <tbody>
                      {user.orders.map((order, i) => {
                        const ss = statusStyle[order.status]
                        return (
                          <tr key={order.id} style={{ borderBottom: i < user.orders.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                            <td style={{ padding: '8px 14px' }}>
                              <div style={{ color: '#111', fontWeight: 600 }}>{order.service.title}</div>
                              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{new Date(order.createdAt).toLocaleDateString('ru-RU')} · {Number(order.price).toLocaleString('ru-RU')} ₽</div>
                            </td>
                            <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: ss.color }}>{ss.label}</span>
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
              {user.reviews.length > 0 && (
                <Section title={`Отзывы (${user._count.reviews})`}>
                  <div style={{ padding: '4px 0' }}>
                    {user.reviews.map((r, i) => (
                      <div key={r.id} style={{ padding: '10px 14px', borderBottom: i < user.reviews.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <Link href={`/catalog/${r.service.id}`} target="_blank" style={{ fontSize: '12px', color: '#111', textDecoration: 'underline', fontWeight: 600 }}>
                            {r.service.title}
                          </Link>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>{'★'.repeat(r.rating)}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.5 }}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              <Section title="Последняя активность">
                <div style={{ padding: '4px 0' }}>
                  {user.activityLogs.map((log, i) => (
                    <div key={log.id} style={{ padding: '8px 14px', borderBottom: i < user.activityLogs.length - 1 ? '1px solid #f0f0f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#444' }}>{log.action}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#aaa' }}>{new Date(log.createdAt).toLocaleDateString('ru-RU')}</div>
                        <div style={{ fontSize: '10px', color: '#ccc', fontFamily: 'monospace' }}>{log.ip}</div>
                      </div>
                    </div>
                  ))}
                  {user.activityLogs.length === 0 && (
                    <p style={{ padding: '16px 14px', fontSize: '12px', color: '#bbb' }}>Активности нет</p>
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
