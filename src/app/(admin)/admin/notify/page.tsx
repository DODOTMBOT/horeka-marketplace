import AdminNav from '../AdminNav'
import { getAdminUsers2 } from '@/actions/admin'
import { NotifyForm } from './NotifyForm'

export default async function AdminNotifyPage() {
  const users = await getAdminUsers2()

  return (
    <>
      <AdminNav active="/admin/notify" />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>
        <div style={{ padding: '16px 28px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>Уведомления</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>Отправить уведомление пользователям</p>
        </div>

        <div style={{ padding: '20px 28px', maxWidth: '560px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '24px' }}>
            <NotifyForm users={users} />
          </div>

          <div style={{ marginTop: '16px', padding: '14px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.6 }}>
              <strong style={{ color: '#374151' }}>Все пользователи</strong> — уведомление получат все зарегистрированные аккаунты.<br />
              Уведомления появляются в разделе «Уведомления» в личном кабинете.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
