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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 36px' }}>

      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
          {user.email}
        </p>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '26px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
          Профиль
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Personal data */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '28px 28px' }}>
          <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '22px' }}>
            Личные данные
          </p>
          <ProfileForm user={user} isSeller={user.role === 'SELLER'} />
        </div>

        {/* INN */}
        <div style={{ background: '#fff', borderRadius: '16px', border: `1.5px solid ${user.innVerified ? 'var(--line)' : '#fed7aa'}`, padding: '28px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.innVerified ? '#22c55e' : '#d97706', flexShrink: 0 }} />
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Верификация ИНН
            </p>
            {!user.innVerified && (
              <span style={{ fontSize: '11px', padding: '2px 9px', borderRadius: '999px', background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>
                Не выполнена
              </span>
            )}
            {user.innVerified && (
              <span style={{ fontSize: '11px', padding: '2px 9px', borderRadius: '999px', background: '#dcfce7', color: '#14532d', fontWeight: 700 }}>
                Верифицирован
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '20px', lineHeight: 1.6 }}>
            Верификация подтверждает вашу регистрацию в ФНС и повышает доверие покупателей.
          </p>
          <InnVerification currentInn={user.inn} isVerified={user.innVerified} companyName={user.companyName} />
        </div>

      </div>
    </div>
  )
}
