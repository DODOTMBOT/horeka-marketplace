import Navbar from '@/components/Navbar'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Поставщики HoReCa | Unit One',
  description: 'Продукты питания, напитки и оборудование от проверенных поставщиков для ресторанов и кафе. Скоро на Unit One.',
}

const categories = [
  { icon: '🥩', title: 'Мясо и птица', desc: 'Говядина, свинина, курица, дичь' },
  { icon: '🐟', title: 'Рыба и морепродукты', desc: 'Охлаждённая и замороженная рыба' },
  { icon: '🥦', title: 'Овощи и фрукты', desc: 'Свежие и замороженные продукты' },
  { icon: '🧀', title: 'Молочная продукция', desc: 'Сыры, молоко, сливки, масло' },
  { icon: '🍷', title: 'Напитки и алкоголь', desc: 'Вино, пиво, безалкогольные' },
  { icon: '🫙', title: 'Бакалея и консервы', desc: 'Масла, соусы, специи, крупы' },
  { icon: '🍳', title: 'Кухонное оборудование', desc: 'Плиты, холодильники, посуда' },
  { icon: '🪑', title: 'Мебель и интерьер', desc: 'Столы, стулья, барные стойки' },
]

export default function SuppliersPage() {
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
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: '16px', padding: '48px 40px',
          border: '1px solid #bbf7d0',
          textAlign: 'center', marginBottom: '40px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '160px', opacity: 0.08, userSelect: 'none', lineHeight: 1 }}>🥩</div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#dcfce7', border: '1px solid #86efac', borderRadius: '50px',
            padding: '5px 14px', marginBottom: '20px',
            fontSize: '12px', fontWeight: 700, color: '#16a34a',
          }}>
            🔔 Раздел в разработке
          </div>

          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800,
            color: '#14532d', letterSpacing: '-0.5px', marginBottom: '12px', lineHeight: 1.2,
          }}>
            Поставщики для HoReCa
          </h1>
          <p style={{ fontSize: '15px', color: '#16a34a', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 28px' }}>
            Продукты питания, напитки и оборудование от проверенных поставщиков. Запускаем совсем скоро.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{
              padding: '11px 24px', borderRadius: '50px',
              background: '#16a34a', color: '#fff',
              fontSize: '14px', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
            }}>
              Вернуться на главную
            </Link>
            <Link href="/catalog" style={{
              padding: '11px 24px', borderRadius: '50px',
              background: '#fff', color: '#16a34a',
              fontSize: '14px', fontWeight: 600, textDecoration: 'none',
              border: '1px solid #bbf7d0',
            }}>
              Маркетплейс услуг
            </Link>
          </div>
        </div>

        {/* Categories preview */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px', letterSpacing: '-0.2px' }}>
            Категории поставщиков
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {categories.map(cat => (
              <div key={cat.title} style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '16px',
                display: 'flex', alignItems: 'center', gap: '14px',
                opacity: 0.75,
              }}>
                <span style={{ fontSize: '32px', lineHeight: 1, flexShrink: 0 }}>{cat.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{cat.title}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* For suppliers */}
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Вы поставщик?</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
            Регистрируйтесь первым, чтобы получить приоритетное размещение и бесплатный период при запуске раздела.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/register?role=SELLER" style={{
              padding: '10px 20px', borderRadius: '8px',
              background: '#16a34a', color: '#fff',
              fontSize: '13px', fontWeight: 600, textDecoration: 'none',
            }}>
              Зарегистрироваться
            </Link>
            <Link href="/catalog" style={{
              padding: '10px 20px', borderRadius: '8px',
              background: 'var(--bg)', color: 'var(--text)',
              fontSize: '13px', fontWeight: 600, textDecoration: 'none',
              border: '1px solid var(--border)',
            }}>
              Посмотреть маркетплейс услуг
            </Link>
          </div>
        </div>

      </div>

      <footer style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '28px 24px', textAlign: 'center', marginTop: '24px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>© 2026 Unit One — платформа для профессионалов HoReCa</p>
      </footer>
    </div>
  )
}
