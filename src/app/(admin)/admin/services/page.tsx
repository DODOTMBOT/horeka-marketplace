import AdminNav from '../AdminNav'
import AdminTopbar from '../AdminTopbar'
import { getAdminServices, setServiceStatus, adminDeleteService } from '@/actions/admin'
import { ActionButton } from '../AdminActions'
import Link from 'next/link'

const statusStyle: Record<string, { label: string; color: string; dot: string }> = {
  ACTIVE:   { label: 'Активна',  color: '#16a34a', dot: '#16a34a' },
  DRAFT:    { label: 'Черновик', color: '#d97706', dot: '#f59e0b' },
  PAUSED:   { label: 'Пауза',    color: '#2563eb', dot: '#3b82f6' },
  ARCHIVED: { label: 'Архив',    color: '#888',    dot: '#ccc' },
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
      <main className="admin-main">
        <AdminTopbar title="Услуги" subtitle={`${services.length} записей`} />

        <div style={{ padding: '20px 28px' }}>
          <form method="GET" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input name="search" defaultValue={params.search} placeholder="Поиск по названию..."
              className="admin-filter-input" style={{ width: '280px' }} />
            <select name="status" defaultValue={params.status ?? 'ALL'} className="admin-filter-select">
              <option value="ALL">Все статусы</option>
              <option value="ACTIVE">Активные</option>
              <option value="DRAFT">Черновики</option>
              <option value="PAUSED">На паузе</option>
              <option value="ARCHIVED">Архив</option>
            </select>
            <button type="submit" className="admin-btn-apply">Применить</button>
            {(params.search || (params.status && params.status !== 'ALL')) && (
              <a href="/admin/services" style={{
                padding: '8px 12px', borderRadius: '4px', border: '1.5px solid #e0e0e0',
                fontSize: '13px', color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', background: '#fff',
              }}>Сбросить</a>
            )}
          </form>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {['Услуга', 'Продавец', 'Категория', 'Статус', 'Активность', 'Дата', 'Действия'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map(svc => {
                  const ss = statusStyle[svc.status]
                  return (
                    <tr key={svc.id}>
                      <td style={{ maxWidth: '260px' }}>
                        <Link href={`/catalog/${svc.id}`} target="_blank" style={{
                          fontWeight: 700, color: '#111', textDecoration: 'none',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4,
                        }}>
                          {svc.title}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#111', fontSize: '13px' }}>{svc.seller.name}</div>
                        {svc.seller.companyName && <div style={{ fontSize: '10px', color: '#aaa' }}>{svc.seller.companyName}</div>}
                      </td>
                      <td style={{ color: '#888', fontSize: '12px' }}>{svc.category?.name ?? '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: ss.dot, flexShrink: 0 }} />
                          <span style={{ fontSize: '11px', fontWeight: 700, color: ss.color }}>{ss.label}</span>
                        </div>
                      </td>
                      <td style={{ color: '#888', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {svc._count.orders} зак. · {svc._count.reviews} отз.
                      </td>
                      <td style={{ color: '#bbb', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(svc.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {svc.status !== 'ACTIVE' && (
                            <ActionButton label="Активировать" action={async () => { 'use server'; return setServiceStatus(svc.id, 'ACTIVE') }} variant="success" size="xs" />
                          )}
                          {svc.status === 'ACTIVE' && (
                            <ActionButton label="В архив" action={async () => { 'use server'; return setServiceStatus(svc.id, 'ARCHIVED') }} variant="warning" size="xs" />
                          )}
                          <ActionButton label="Удалить" action={async () => { 'use server'; return adminDeleteService(svc.id) }} confirm={`Удалить «${svc.title}»?`} variant="danger" size="xs" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {services.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#bbb', fontSize: '13px' }}>Услуги не найдены</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
