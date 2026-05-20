import AdminNav from '../AdminNav'
import { getAdminLogs } from '@/actions/admin'
import Link from 'next/link'

const ACTION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  LOGIN:                  { label: 'Вход',             color: '#16a34a', bg: '#f0fdf4' },
  LOGOUT:                 { label: 'Выход',            color: '#6b7280', bg: '#f9fafb' },
  REGISTER:               { label: 'Регистрация',      color: '#2563eb', bg: '#eff6ff' },
  SERVICE_CREATE:         { label: 'Услуга создана',   color: '#7c3aed', bg: '#f5f3ff' },
  SERVICE_EDIT:           { label: 'Услуга изменена',  color: '#d97706', bg: '#fffbeb' },
  SERVICE_DELETE:         { label: 'Услуга удалена',   color: '#dc2626', bg: '#fef2f2' },
  SERVICE_VIEW:           { label: 'Просмотр услуги',  color: '#9ca3af', bg: '#f9fafb' },
  ORDER_CREATE:           { label: 'Заказ создан',     color: '#0891b2', bg: '#ecfeff' },
  ORDER_STATUS:           { label: 'Статус заказа',    color: '#d97706', bg: '#fffbeb' },
  ORDER_DISPUTE:          { label: 'Спор открыт',      color: '#dc2626', bg: '#fef2f2' },
  REVIEW_CREATE:          { label: 'Отзыв оставлен',   color: '#f59e0b', bg: '#fffbeb' },
  REVIEW_DELETE:          { label: 'Отзыв удалён',     color: '#dc2626', bg: '#fef2f2' },
  MESSAGE_SEND:           { label: 'Сообщение',        color: '#6b7280', bg: '#f9fafb' },
  PROFILE_UPDATE:         { label: 'Профиль обновлён', color: '#2563eb', bg: '#eff6ff' },
  INN_VERIFY:             { label: 'ИНН проверен',     color: '#16a34a', bg: '#f0fdf4' },
  FAVORITE_ADD:           { label: 'В избранное',      color: '#ec4899', bg: '#fdf2f8' },
  FAVORITE_REMOVE:        { label: 'Из избранного',    color: '#9ca3af', bg: '#f9fafb' },
  ADMIN_BLOCK_USER:       { label: 'Блок пользователя',color: '#dc2626', bg: '#fef2f2' },
  ADMIN_SET_ROLE:         { label: 'Смена роли',       color: '#7c3aed', bg: '#f5f3ff' },
  ADMIN_DELETE_REVIEW:    { label: 'Удалён отзыв',     color: '#dc2626', bg: '#fef2f2' },
  ADMIN_RESOLVE_DISPUTE:  { label: 'Спор разрешён',    color: '#16a34a', bg: '#f0fdf4' },
  ADMIN_INN_VERIFY:       { label: 'ИНН верифицирован',color: '#16a34a', bg: '#f0fdf4' },
}

const ALL_ACTIONS = Object.keys(ACTION_LABELS)

function ActionBadge({ action }: { action: string }) {
  const s = ACTION_LABELS[action] ?? { label: action, color: '#6b7280', bg: '#f3f4f6' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
      fontSize: '11px', fontWeight: 700, color: s.color, background: s.bg,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

function MetaPreview({ meta }: { meta: unknown }) {
  if (!meta || typeof meta !== 'object') return null
  const entries = Object.entries(meta as Record<string, unknown>).slice(0, 3)
  if (!entries.length) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '3px' }}>
      {entries.map(([k, v]) => (
        <span key={k} style={{ fontSize: '10px', color: '#9ca3af', background: '#f3f4f6', borderRadius: '3px', padding: '1px 5px' }}>
          {k}: {String(v).slice(0, 40)}
        </span>
      ))}
    </div>
  )
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; page?: string; user?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const action = params.action
  const userId = params.user

  const { logs, total, pages } = await getAdminLogs({ action, userId, page })

  const buildHref = (p: Record<string, string | undefined>) => {
    const q = new URLSearchParams()
    const merged = { action, page: String(page), user: userId, ...p }
    Object.entries(merged).forEach(([k, v]) => { if (v && v !== 'undefined') q.set(k, v) })
    return `/admin/logs?${q.toString()}`
  }

  return (
    <>
      <AdminNav active="/admin/logs" />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>

        {/* Topbar */}
        <div style={{ padding: '16px 28px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>Логи активности</h1>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{total} записей</p>
          </div>
          {userId && (
            <Link href="/admin/logs" style={{ fontSize: '12px', color: '#6b7280', padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#fff' }}>
              Сбросить фильтр пользователя
            </Link>
          )}
        </div>

        <div style={{ padding: '20px 28px' }}>

          {/* Action filter tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <Link href={buildHref({ action: undefined, page: '1' })} style={{
              padding: '5px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, textDecoration: 'none',
              background: !action ? '#111827' : '#fff', color: !action ? '#fff' : '#6b7280',
              border: '1px solid #e5e7eb',
            }}>Все</Link>
            {ALL_ACTIONS.map(a => {
              const s = ACTION_LABELS[a]
              const isActive = action === a
              return (
                <Link key={a} href={buildHref({ action: a, page: '1' })} style={{
                  padding: '5px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, textDecoration: 'none',
                  background: isActive ? '#111827' : '#fff',
                  color: isActive ? '#fff' : s.color,
                  border: `1px solid ${isActive ? '#111827' : '#e5e7eb'}`,
                  whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </Link>
              )
            })}
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Время (МСК)', 'Пользователь', 'Действие', 'Детали', 'IP'].map(h => (
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
                {logs.map((log, i) => (
                  <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: '#9ca3af', fontSize: '12px' }}>
                      {new Date(log.createdAt).toLocaleDateString('ru-RU')}{' '}
                      <span style={{ color: '#d1d5db' }}>
                        {new Date(log.createdAt).toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {log.user ? (
                        <Link href={buildHref({ user: log.user.id, page: '1' })} style={{ textDecoration: 'none' }}>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: '13px' }}>{log.user.name}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{log.user.email}</div>
                        </Link>
                      ) : (
                        <span style={{ color: '#d1d5db', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <ActionBadge action={log.action} />
                    </td>
                    <td style={{ padding: '10px 14px', maxWidth: '280px' }}>
                      {log.target && (
                        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.target}
                        </div>
                      )}
                      <MetaPreview meta={log.meta} />
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      {log.ip ?? '—'}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                      Логов нет
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '16px' }}>
              {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => (
                <Link key={p} href={buildHref({ page: String(p) })} style={{
                  padding: '6px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 600,
                  background: p === page ? '#111827' : '#fff',
                  color: p === page ? '#fff' : '#6b7280',
                  border: '1px solid #e5e7eb', textDecoration: 'none',
                }}>
                  {p}
                </Link>
              ))}
            </div>
          )}

        </div>
      </main>
    </>
  )
}
