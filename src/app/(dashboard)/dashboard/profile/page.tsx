import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getProfileData } from '@/actions/profile'
import ProfileForm from './ProfileForm'
import InnVerification from '../InnVerification'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await getProfileData()
  if (!user) redirect('/login')

  return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Профиль</h1>
          <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Profile form */}
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-out)', padding: '32px',
          }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '24px' }}>
              Личные данные
            </h2>
            <ProfileForm user={user} isSeller={user.role === 'SELLER'} />
          </div>

          {/* INN Verification */}
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-out)', padding: '32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                Верификация ИНН
              </h2>
              {!user.innVerified && (
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                  borderRadius: '20px', background: '#fff7ed',
                  border: '1px solid #fed7aa', color: '#ea580c',
                }}>
                  Не верифицирован
                </span>
              )}
            </div>
            <InnVerification
              currentInn={user.inn}
              isVerified={user.innVerified}
              companyName={user.companyName}
            />
          </div>
        </div>
      </main>
  )
}
