import Navbar from '@/components/Navbar'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Вакансии HoReCa | Unit One',
  description: 'Работа в ресторанной индустрии: шеф-повара, бармены, официанты, управляющие. Скоро на Unit One.',
}

const roles = [
  { icon: '👨‍🍳', title: 'Шеф-повара', count: '120+' },
  { icon: '🍸', title: 'Бармены', count: '85+' },
  { icon: '🍽️', title: 'Официанты', count: '200+' },
  { icon: '📋', title: 'Управляющие', count: '40+' },
  { icon: '🧁', title: 'Кондитеры', count: '60+' },
  { icon: '🚚', title: 'Курьеры', count: '150+' },
]

export default function JobsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Back */}
        <Link href="/" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '32px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          На главную
        </Link>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: '16px', padding: '48px 40px',
          border: '1px solid #bfdbfe',
          textAlign: 'center', marginBottom: '40px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '160px', opacity: 0.08, userSelect: 'none', lineHeight: 1 }}>👨‍🍳</div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '50px',
            padding: '5px 14px', marginBottom: '20px',
            fontSize: '12px', fontWeight: 700, color: '#2563eb',
          }}>
            🔔 Раздел в разработке
          </div>

          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800,
            color: '#1e3a8a', letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: 1.2,
          }}>
            Вакансии в HoReCa
          </h1>
          <p style={{ fontSize: '15px', color: '#3b82f6', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 28px' }}>
            Работодатели размещают вакансии, специалисты откликаются. Запускаем совсем скоро.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{
              padding: '11px 24px', borderRadius: '50px',
              background: '#2563eb', color: '#fff',
              fontSize: '14px', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
            }}>
              Вернуться на главную
            </Link>
            <Link href="/catalog" style={{
              padding: '11px 24px', borderRadius: '50px',
              background: '#fff', color: '#2563eb',
              fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              border: '1px solid #bfdbfe',
            }}>
              Маркетплейс услуг
            </Link>
          </div>
        </div>

        {/* Role preview */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px', letterSpacing: '-0.2px' }}>
            Что появится в разделе
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {roles.map(r => (
              <div key={r.title} style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '18px 16px',
                display: 'flex', alignItems: 'center', gap: '12px',
                opacity: 0.7,
              }}>
                <span style={{ fontSize: '28px', lineHeight: 1 }}>{r.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{r.title}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.count} вакансий*</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>* прогнозируемые данные</p>
        </div>

        {/* How it will work */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>Как будет работать</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { n: '1', title: 'Работодатель размещает вакансию', desc: 'Описание позиции, требования, условия, зарплатная вилка' },
              { n: '2', title: 'Соискатель откликается', desc: 'Отправляет резюме и портфолио прямо через платформу' },
              { n: '3', title: 'Переписка и оффер', desc: 'Общение в чате, согласование условий, выход на работу' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 800, color: '#2563eb',
                }}>
                  {step.n}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>{step.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <footer style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '28px 24px', textAlign: 'center', marginTop: '24px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>© 2026 Unit One — платформа для профессионалов HoReCa</p>
      </footer>
    </div>
  )
}
