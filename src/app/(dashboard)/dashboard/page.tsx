import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { logout } from '@/actions/auth'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-out)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}>{value}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const roleLabel = session.role === 'BUYER' ? 'Покупатель' : session.role === 'SELLER' ? 'Поставщик' : 'Администратор'
  const initials = session.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Navbar */}
      <header style={{
        background: 'var(--surface)',
        boxShadow: '0 2px 12px rgba(174,184,198,0.45)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>HoReCa Hub</span>
          </div>

          {/* User + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right', display: 'none' }} className="user-info-desktop">
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{session.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{roleLabel}</p>
            </div>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '15px',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <form action={logout}>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
            Добро пожаловать, {session.name.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            {session.email} &middot; {roleLabel}
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}>
          <StatCard label="Услуги" value="0" />
          <StatCard label="Заказы" value="0" />
          <StatCard label="Отзывы" value="0" />
          <StatCard label="Рейтинг" value="—" />
        </div>

        {/* Account info card */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-out)',
          padding: '32px',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px' }}>
            Данные аккаунта
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Имя', value: session.name },
              { label: 'Email', value: session.email },
              { label: 'Роль', value: roleLabel },
              { label: 'ИНН', value: 'Не указан' },
            ].map(item => (
              <div key={item.label}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-out)',
          padding: '32px',
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
            Быстрые действия
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {(session.role === 'SELLER'
              ? ['Добавить услугу', 'Управление заказами', 'Верификация ИНН', 'Настройки профиля']
              : ['Найти услугу', 'Мои заказы', 'Избранное', 'Настройки профиля']
            ).map(action => (
              <button
                key={action}
                type="button"
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  transition: 'all 0.2s',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
