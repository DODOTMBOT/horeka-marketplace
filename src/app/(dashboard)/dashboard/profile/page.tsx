import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getProfileData } from '@/actions/profile'
import ProfileForm from './ProfileForm'
import InnVerification from '../InnVerification'

function ReqField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{label}</p>
      <p style={{ fontSize: '14px', color: value ? 'var(--ink)' : 'var(--muted)', fontWeight: value ? 500 : 400 }}>{value || '—'}</p>
    </div>
  )
}

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await getProfileData()
  if (!user) redirect('/login')

  const isSeller = user.role === 'SELLER' || user.role === 'ADMIN'

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
          <ProfileForm user={user} isSeller={isSeller} />
        </div>

        {/* Seller business data */}
        {isSeller && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '28px 28px' }}>
            <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: '22px' }}>
              Реквизиты
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <ReqField label="Тип бизнеса" value={
                  user.businessType === 'SELF_EMPLOYED' ? 'Самозанятый'
                  : user.businessType === 'IP' ? 'ИП'
                  : user.businessType === 'COMPANY' ? 'ООО'
                  : '—'
                } />
                <ReqField label="ИНН" value={user.inn} />
                <ReqField label="Компания / ФИО" value={user.companyName} />
                {user.ogrn && <ReqField label="ОГРН / ОГРНИП" value={user.ogrn} />}
                {user.kpp && <ReqField label="КПП" value={user.kpp} />}
                {user.legalAddress && <ReqField label="Юр. адрес" value={user.legalAddress} />}
              </div>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                  Банковские реквизиты
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <ReqField label="Расчётный счёт" value={user.bankAccount} />
                  <ReqField label="БИК" value={user.bankBik} />
                  <ReqField label="Банк" value={user.bankName} />
                  {user.bankCorrAccount && <ReqField label="Корр. счёт" value={user.bankCorrAccount} />}
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
                Для изменения реквизитов напишите в поддержку.
              </p>
            </div>
          </div>
        )}

        {/* Buyer: offer to become seller */}
        {!isSeller && (
          <div style={{ background: 'var(--ink)', borderRadius: '16px', border: '1px solid var(--ink)', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '16px', color: '#fff', letterSpacing: '-0.03em', marginBottom: '4px' }}>
                Хотите размещать услуги?
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                Станьте исполнителем — добавьте реквизиты и создайте первое предложение
              </p>
            </div>
            <a href="/dashboard/become-seller" style={{
              padding: '11px 22px', borderRadius: '10px', background: 'var(--lime)',
              color: 'var(--ink)', fontSize: '13px', fontWeight: 800,
              textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              fontFamily: 'var(--ff-display)', letterSpacing: '-0.01em',
            }}>
              Стать исполнителем →
            </a>
          </div>
        )}

        {/* INN */}
        {isSeller && (
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
        )}

      </div>
    </div>
  )
}
