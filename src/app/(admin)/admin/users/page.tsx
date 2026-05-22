import AdminNav from '../AdminNav'
import AdminTopbar from '../AdminTopbar'
import { getAdminUsers, setUserRole, setUserBlocked, setInnVerified } from '@/actions/admin'
import { ActionButton } from '../AdminActions'
import Link from 'next/link'
import type { UserRole } from '@prisma/client'

const roleStyle: Record<string, { label: string; color: string; bg: string }> = {
  BUYER:  { label: 'Покупатель',    color: '#2563eb', bg: '#eff6ff' },
  SELLER: { label: 'Продавец',      color: '#16a34a', bg: '#f0fdf4' },
  ADMIN:  { label: 'Администратор', color: '#7c3aed', bg: '#f5f3ff' },
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
      <main className="admin-main">
        <AdminTopbar
          title="Пользователи"
          subtitle={`${users.length} записей`}
          actions={
            <a href="/api/admin/export?type=users" style={{
              padding: '7px 14px', borderRadius: '4px', border: '1.5px solid #e0e0e0',
              fontSize: '12px', fontWeight: 700, color: '#555', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px', background: '#fff',
              letterSpacing: '0.03em',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              CSV
            </a>
          }
        />

        <div style={{ padding: '20px 28px' }}>
          <form method="GET" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input name="search" defaultValue={params.search} placeholder="Поиск по имени, email, ИНН..."
              className="admin-filter-input" style={{ width: '280px' }} />
            <select name="role" defaultValue={params.role ?? 'ALL'} className="admin-filter-select">
              <option value="ALL">Все роли</option>
              <option value="BUYER">Покупатели</option>
              <option value="SELLER">Продавцы</option>
              <option value="ADMIN">Администраторы</option>
            </select>
            <button type="submit" className="admin-btn-apply">Применить</button>
            {(params.search || (params.role && params.role !== 'ALL')) && (
              <a href="/admin/users" style={{
                padding: '8px 12px', borderRadius: '4px', border: '1.5px solid #e0e0e0',
                fontSize: '13px', color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', background: '#fff',
              }}>
                Сбросить
              </a>
            )}
          </form>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {['Пользователь', 'Email', 'Роль', 'Компания', 'Статистика', 'ИНН', 'Дата', 'Действия'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rs = roleStyle[u.role]
                  return (
                    <tr key={u.id} style={{ opacity: u.blocked ? 0.55 : 1 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: u.blocked ? '#dc2626' : '#16a34a' }} />
                          <Link href={`/admin/users/${u.id}`} style={{ fontWeight: 700, color: '#111', textDecoration: 'none' }}>
                            {u.name ?? '—'}
                          </Link>
                          {u.blocked && <span style={{ fontSize: '9px', fontWeight: 800, color: '#dc2626', letterSpacing: '0.06em', background: '#fef2f2', padding: '2px 5px', borderRadius: '2px' }}>БЛОК</span>}
                        </div>
                      </td>
                      <td style={{ color: '#888', fontSize: '12px' }}>{u.email}</td>
                      <td>
                        <span style={{
                          fontSize: '10px', fontWeight: 800, padding: '3px 7px', borderRadius: '3px',
                          background: rs.bg, color: rs.color, letterSpacing: '0.03em', textTransform: 'uppercase',
                        }}>
                          {rs.label}
                        </span>
                      </td>
                      <td style={{ color: '#555', fontSize: '12px' }}>
                        {u.companyName ?? <span style={{ color: '#ddd' }}>—</span>}
                      </td>
                      <td style={{ color: '#888', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {u._count.services} усл. · {u._count.orders} зак.
                      </td>
                      <td>
                        {u.innVerified
                          ? <span style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a', letterSpacing: '0.04em' }}>ВЕРИФИЦИРОВАН</span>
                          : <span style={{ fontSize: '10px', color: '#ccc', fontWeight: 600 }}>Нет</span>}
                      </td>
                      <td style={{ color: '#aaa', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {u.role !== 'ADMIN' && (
                            <ActionButton
                              label={u.role === 'SELLER' ? 'Снять продавца' : 'В продавцы'}
                              action={async () => { 'use server'; return setUserRole(u.id, (u.role === 'SELLER' ? 'BUYER' : 'SELLER') as UserRole) }}
                              variant={u.role === 'SELLER' ? 'warning' : 'primary'} size="xs"
                            />
                          )}
                          {!u.innVerified && (
                            <ActionButton
                              label="Верифиц. ИНН"
                              action={async () => { 'use server'; return setInnVerified(u.id, true) }}
                              variant="success" size="xs"
                            />
                          )}
                          <ActionButton
                            label={u.blocked ? 'Разблокировать' : 'Заблокировать'}
                            action={async () => { 'use server'; return setUserBlocked(u.id, !u.blocked) }}
                            confirm={u.blocked ? undefined : `Заблокировать ${u.name ?? u.email}?`}
                            variant={u.blocked ? 'success' : 'danger'} size="xs"
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {users.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#bbb', fontSize: '13px' }}>Пользователи не найдены</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
