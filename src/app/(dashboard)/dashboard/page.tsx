import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { getDashboardStats } from '@/actions/orders'
import InnVerification from './InnVerification'
import DashboardNav from '@/components/DashboardNav'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-out)', padding: '24px',
      display: 'flex', flexDirection: 'column', gap: '6px',
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

  const [user, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { inn: true, innVerified: true, companyName: true, role: true },
    }),
    getDashboardStats(),
  ])

  const roleLabel = session.role === 'BUYER' ? 'Покупатель' : session.role === 'SELLER' ? 'Исполнитель' : 'Администратор'
  const isSeller = session.role === 'SELLER' || session.role === 'ADMIN'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardNav active="dashboard" />

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
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px', marginBottom: '40px',
        }}>
          {isSeller ? (
            <>
              <StatCard label="Активных услуг" value={String(stats?.services ?? 0)} />
              <StatCard label="Заказов" value={String(stats?.orders ?? 0)} />
              <StatCard label="Отзывов" value={String(stats?.reviews ?? 0)} />
              <StatCard label="Рейтинг" value={stats?.rating ? `★ ${stats.rating}` : '—'} />
            </>
          ) : (
            <>
              <StatCard label="Заказов" value={String(stats?.orders ?? 0)} />
              <StatCard label="Отзывов" value={String(stats?.reviews ?? 0)} />
            </>
          )}
        </div>

        {/* Account info */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-out)', padding: '32px', marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px' }}>
            Данные аккаунта
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Имя', value: session.name },
              { label: 'Email', value: session.email },
              { label: 'Роль', value: roleLabel },
              {
                label: 'ИНН',
                value: user?.innVerified ? `${user.inn} ✓` : user?.inn ?? 'Не указан',
              },
            ].map(item => (
              <div key={item.label}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '14px', color: item.label === 'ИНН' && user?.innVerified ? '#16a34a' : 'var(--text)', fontWeight: 500 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* INN Verification */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-out)', padding: '32px', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              Верификация ИНН
            </h2>
            {!user?.innVerified && (
              <span style={{
                fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                borderRadius: '20px', background: '#fff7ed',
                border: '1px solid #fed7aa', color: '#ea580c',
              }}>
                Не верифицирован
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Верификация подтверждает вашу регистрацию в ФНС и повышает доверие покупателей.
          </p>
          <InnVerification
            currentInn={user?.inn ?? null}
            isVerified={user?.innVerified ?? false}
            companyName={user?.companyName ?? null}
          />
        </div>

        {/* Quick actions */}
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-out)', padding: '32px',
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
            Быстрые действия
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {(isSeller
              ? [
                  { label: '+ Добавить услугу', href: '/dashboard/services/new', primary: true },
                  { label: 'Мои услуги', href: '/dashboard/services', primary: false },
                  { label: 'Входящие заказы', href: '/dashboard/orders/incoming', primary: false },
                  { label: 'Профиль', href: '/dashboard/profile', primary: false },
                ]
              : [
                  { label: 'Найти услугу', href: '/catalog', primary: true },
                  { label: 'Мои заказы', href: '/dashboard/orders', primary: false },
                  { label: 'Профиль', href: '/dashboard/profile', primary: false },
                ]
            ).map(({ label, href, primary }) => (
              <a key={href} href={href} style={{
                padding: '10px 20px', borderRadius: 'var(--radius-sm)',
                background: primary ? 'var(--primary)' : 'var(--bg)',
                boxShadow: primary ? '3px 3px 8px rgba(249,115,22,0.30)' : 'var(--shadow-sm)',
                fontSize: '13px', fontWeight: 600,
                color: primary ? '#fff' : 'var(--text)',
                textDecoration: 'none', display: 'inline-block',
              }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
