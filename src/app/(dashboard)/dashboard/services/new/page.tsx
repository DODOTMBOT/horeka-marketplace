import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getCategories } from '@/actions/services'
import ServiceForm from './ServiceForm'

export default async function NewServicePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'SELLER' && session.role !== 'ADMIN') redirect('/dashboard')

  const categories = await getCategories()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        boxShadow: '0 2px 12px rgba(174,184,198,0.45)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
          height: '64px', display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500,
          }}>
            ← Кабинет
          </Link>
          <span style={{ color: 'var(--border)' }}>›</span>
          <Link href="/dashboard/services" style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Мои услуги
          </Link>
          <span style={{ color: 'var(--border)' }}>›</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Новая услуга</span>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
            Создать услугу
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Заполните карточку — она появится в каталоге для покупателей
          </p>
        </div>

        <ServiceForm categories={categories} />
      </main>
    </div>
  )
}
