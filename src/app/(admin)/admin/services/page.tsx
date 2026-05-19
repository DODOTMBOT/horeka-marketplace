import AdminNav from '../AdminNav'
import { getAdminServices, setServiceStatus, adminDeleteService } from '@/actions/admin'
import { ActionButton } from '../AdminActions'
import Link from 'next/link'

const statusStyle: Record<string, { label: string; color: string; dot: string }> = {
  ACTIVE:   { label: 'Активна',   color: '#16a34a', dot: '#16a34a' },
  DRAFT:    { label: 'Черновик',  color: '#d97706', dot: '#f59e0b' },
  PAUSED:   { label: 'Пауза',     color: '#2563eb', dot: '#3b82f6' },
  ARCHIVED: { label: 'Архив',     color: '#6b7280', dot: '#9ca3af' },
}

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const params = await searchParams
  const services = await getAdminServices(params.status, params.search)

  return (
    <>
      <AdminNav active="/admin/services" />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>

        {/* Topbar */}
        <div style={{ padding: '16px 28px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>Услуги</h1>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{services.length} записей</p>
          </div>
        </div>

        <div style={{ padding: '20px 28px' }}>

          {/* Filters */}
          <form method="GET" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Поиск по названию..."
              style={{
                padding: '7px 12px', borderRadius: '6px', border: '1px solid #e5e7eb',
                fontSize: '13px', width: '280px', outline: 'none', background: '#fff', color: '#111827',
              }}
            />
            <select
              name="status"
              defaultValue={params.status ?? 'ALL'}
              style={{
                padding: '7px 12px', borderRadius: '6px', border: '1px solid #e5e7eb',
                fontSize: '13px', background: '#fff', color: '#374151', cursor: 'pointer',
              }}
            >
              <option value="ALL">Все статусы</option>
              <option value="ACTIVE">Активные</option>
              <option value="DRAFT">Черновики</option>
              <option value="PAUSED">На паузе</option>
              <option value="ARCHIVED">Архив</option>
            </select>
            <button type="submit" style={{
              padding: '7px 16px', borderRadius: '6px',
              background: '#111827', color: '#fff', border: 'none',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              Применить
            </button>
            {(params.search || (params.status && params.status !== 'ALL')) && (
              <a href="/admin/services" style={{
                padding: '7px 12px', borderRadius: '6px', border: '1px solid #e5e7eb',
                fontSize: '13px', color: '#6b7280', textDecoration: 'none', display: 'flex', alignItems: 'center',
              }}>
                Сбросить
              </a>
            )}
          </form>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Услуга', 'Продавец', 'Категория', 'Статус', 'Активность', 'Дата', 'Действия'].map(h => (
                    <th key={h} style={{
                      padding: '9px 14px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 600, color: '#6b7280',
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                      background: '#f9fafb', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((svc, i) => {
                  const ss = statusStyle[svc.status]
                  return (
                    <tr key={svc.id} style={{ borderBottom: i < services.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '10px 14px', maxWidth: '260px' }}>
                        <Link href={`/catalog/${svc.id}`} target="_blank" style={{
                          fontWeight: 600, color: '#111827', textDecoration: 'none',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          lineHeight: 1.4,
                        }}>
                          {svc.title}
                        </Link>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 500, color: '#111827' }}>{svc.seller.name}</div>
                        {svc.seller.companyName && (
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{svc.seller.companyName}</div>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: '12px' }}>
                        {svc.category?.name ?? '—'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ss.dot, flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', fontWeight: 600, color: ss.color }}>{ss.label}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {svc._count.orders} зак. · {svc._count.reviews} отз.
                      </td>
                      <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(svc.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {svc.status !== 'ACTIVE' && (
                            <ActionButton
                              label="Активировать"
                              action={async () => {
                                'use server'
                                return setServiceStatus(svc.id, 'ACTIVE')
                              }}
                              variant="success"
                              size="xs"
                            />
                          )}
                          {svc.status === 'ACTIVE' && (
                            <ActionButton
                              label="В архив"
                              action={async () => {
                                'use server'
                                return setServiceStatus(svc.id, 'ARCHIVED')
                              }}
                              variant="warning"
                              size="xs"
                            />
                          )}
                          <ActionButton
                            label="Удалить"
                            action={async () => {
                              'use server'
                              return adminDeleteService(svc.id)
                            }}
                            confirm={`Удалить «${svc.title}»? Необратимо.`}
                            variant="danger"
                            size="xs"
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {services.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                      Услуги не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
