import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import BecomeSellerForm from './BecomeSellerForm'

export default async function BecomeSellerPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'SELLER' || session.role === 'ADMIN') redirect('/dashboard/services/new')

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
          Смена роли
        </p>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: '32px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.04em', lineHeight: 1 }}>
          Стать исполнителем
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Left — explanation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Current role */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid var(--line)', padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🛒</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ваша роль сейчас</p>
                <p style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em' }}>Покупатель</p>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {['Заказывать услуги у исполнителей', 'Оставлять отзывы', 'Открывать споры'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Arrow */}
          <div style={{ textAlign: 'center', fontSize: '22px', color: 'var(--muted)' }}>↓</div>

          {/* New role */}
          <div style={{ background: 'var(--ink)', borderRadius: '16px', border: '1.5px solid var(--ink)', padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(215,255,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>⚡</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Станете</p>
                <p style={{ fontFamily: 'var(--ff-display)', fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>Исполнителем</p>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {[
                'Размещать услуги и получать заказы',
                'Принимать оплату через платформу',
                'Отвечать на отзывы покупателей',
                'Вести портфолио и профиль компании',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, padding: '0 4px' }}>
            После смены роли вы сможете создать первую услугу. Заказы, которые вы оформляли как покупатель, сохранятся.
          </p>
        </div>

        {/* Right — form */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--line)', padding: '28px 28px' }}>
          <p style={{ fontFamily: 'var(--ff-display)', fontWeight: 800, fontSize: '16px', color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: '22px' }}>
            Данные исполнителя
          </p>
          <BecomeSellerForm />
        </div>
      </div>
    </div>
  )
}
