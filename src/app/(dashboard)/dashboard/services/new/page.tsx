import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { getCategories } from '@/actions/services'
import ServiceForm from './ServiceForm'

export default async function NewServicePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'BUYER') redirect('/dashboard/become-seller')
  if (session.role !== 'SELLER' && session.role !== 'ADMIN') redirect('/dashboard')

  const categories = await getCategories()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <header style={{
        background: '#fff', borderBottom: '1px solid var(--line)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '0 28px',
          height: '60px', display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <Link href="/dashboard/services" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', color: 'var(--muted)', fontWeight: 500, textDecoration: 'none',
          }}>
            ← Мои услуги
          </Link>
          <span style={{ color: 'var(--line)' }}>›</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Новое объявление</span>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 28px 60px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: 'var(--ff-display)', fontWeight: 800,
            fontSize: '36px', color: 'var(--ink)',
            letterSpacing: '-0.04em', marginBottom: '6px',
          }}>
            Новое объявление
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Заполните карточку — она появится в каталоге сразу после публикации
          </p>
        </div>

        <ServiceForm categories={categories} />
      </main>
    </div>
  )
}
