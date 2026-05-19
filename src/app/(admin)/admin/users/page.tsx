import AdminNav from '../AdminNav'
import { getAdminUsers, setUserRole, setUserBlocked, setInnVerified } from '@/actions/admin'
import { ActionButton } from '../AdminActions'
import type { UserRole } from '@prisma/client'

const roleStyle: Record<string, { label: string; color: string; bg: string }> = {
  BUYER:  { label: 'Покупатель',     color: '#2563eb', bg: '#eff6ff' },
  SELLER: { label: 'Продавец',       color: '#16a34a', bg: '#f0fdf4' },
  ADMIN:  { label: 'Администратор',  color: '#7c3aed', bg: '#f5f3ff' },
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string }>
}) {
  const params = await searchParams
  const users = await getAdminUsers(params.search, params.role)

  return (
    <>
      <AdminNav active="/admin/users" />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>

        {/* Topbar */}
        <div style={{ padding: '16px 28px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>Пользователи</h1>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{users.length} записей</p>
          </div>
        </div>

        <div style={{ padding: '20px 28px' }}>
          {/* Filters */}
          <form method="GET" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Поиск по имени, email, ИНН..."
              style={{
                padding: '7px 12px', borderRadius: '6px', border: '1px solid #e5e7eb',
                fontSize: '13px', width: '280px', outline: 'none', background: '#fff',
                color: '#111827',
              }}
            />
            <select
              name="role"
              defaultValue={params.role ?? 'ALL'}
              style={{
                padding: '7px 12px', borderRadius: '6px', border: '1px solid #e5e7eb',
                fontSize: '13px', background: '#fff', color: '#374151', cursor: 'pointer',
              }}
            >
              <option value="ALL">Все роли</option>
              <option value="BUYER">Покупатели</option>
              <option value="SELLER">Продавцы</option>
              <option value="ADMIN">Администраторы</option>
            </select>
            <button type="submit" style={{
              padding: '7px 16px', borderRadius: '6px',
              background: '#111827', color: '#fff', border: 'none',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              Применить
            </button>
            {(params.search || (params.role && params.role !== 'ALL')) && (
              <a href="/admin/users" style={{
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
                  {['Пользователь', 'Email', 'Роль', 'Компания', 'Статистика', 'ИНН', 'Дата', 'Действия'].map(h => (
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
                {users.map((u, i) => {
                  const rs = roleStyle[u.role]
                  return (
                    <tr key={u.id} style={{
                      borderBottom: i < users.length - 1 ? '1px solid #f3f4f6' : 'none',
                      opacity: u.blocked ? 0.5 : 1,
                      background: u.blocked ? '#fafafa' : '#fff',
                    }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                            background: u.blocked ? '#dc2626' : '#16a34a',
                          }} />
                          <span style={{ fontWeight: 600, color: '#111827' }}>{u.name ?? '—'}</span>
                          {u.blocked && (
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#dc2626', letterSpacing: '0.04em' }}>BLOCK</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#6b7280' }}>{u.email}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px',
                          background: rs.bg, color: rs.color, letterSpacing: '0.02em',
                        }}>
                          {rs.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#374151', fontSize: '12px' }}>
                        {u.companyName ?? <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {u._count.services} усл. · {u._count.orders} зак.
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        {u.innVerified ? (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>Верифицирован</span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Не верифицирован</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {u.role !== 'ADMIN' && (
                            <ActionButton
                              label={u.role === 'SELLER' ? 'Снять продавца' : 'В продавцы'}
                              action={async () => {
                                'use server'
                                return setUserRole(u.id, (u.role === 'SELLER' ? 'BUYER' : 'SELLER') as UserRole)
                              }}
                              variant={u.role === 'SELLER' ? 'warning' : 'primary'}
                              size="xs"
                            />
                          )}
                          {!u.innVerified && (
                            <ActionButton
                              label="Верифиц. ИНН"
                              action={async () => {
                                'use server'
                                return setInnVerified(u.id, true)
                              }}
                              variant="success"
                              size="xs"
                            />
                          )}
                          <ActionButton
                            label={u.blocked ? 'Разблокировать' : 'Заблокировать'}
                            action={async () => {
                              'use server'
                              return setUserBlocked(u.id, !u.blocked)
                            }}
                            confirm={u.blocked ? undefined : `Заблокировать ${u.name ?? u.email}?`}
                            variant={u.blocked ? 'success' : 'danger'}
                            size="xs"
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                      Пользователи не найдены
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
