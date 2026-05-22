import AdminNav from '../AdminNav'
import AdminTopbar from '../AdminTopbar'
import { getAdminUsers2 } from '@/actions/admin'
import { NotifyForm } from './NotifyForm'

export default async function AdminNotifyPage() {
  const users = await getAdminUsers2()

  return (
    <>
      <AdminNav active="/admin/notify" />
      <main className="admin-main">
        <AdminTopbar title="Уведомления" subtitle="Отправить сообщение пользователям" />

        <div style={{ padding: '20px 28px', maxWidth: '560px' }}>
          <div className="admin-card" style={{ padding: '24px' }}>
            <p style={{ fontSize: '9px', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Новое уведомление</p>
            <NotifyForm users={users} />
          </div>

          <div style={{ marginTop: '10px', padding: '14px 16px', background: '#fafafa', border: '1.5px solid #e8e8e8', borderRadius: '3px' }}>
            <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.7 }}>
              <strong style={{ color: '#111', fontWeight: 700 }}>Все пользователи</strong> — уведомление получат все зарегистрированные аккаунты.<br />
              Уведомления появляются в разделе «Уведомления» в личном кабинете.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
