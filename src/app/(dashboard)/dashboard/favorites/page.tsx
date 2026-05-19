import DashboardNav from '@/components/DashboardNav'
import ServiceCard from '@/components/ServiceCard'
import { getFavorites } from '@/actions/favorites'
import Link from 'next/link'

export default async function FavoritesPage() {
  const favorites = await getFavorites()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardNav active="favorites" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
            Избранное
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            {favorites.length} {favorites.length === 1 ? 'услуга' : favorites.length < 5 ? 'услуги' : 'услуг'}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '60px 32px',
            textAlign: 'center', boxShadow: 'var(--shadow-card)',
          }}>
            <p style={{ fontSize: '40px', marginBottom: '16px' }}>🤍</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
              Нет избранных услуг
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
              Нажимайте ❤️ на карточках, чтобы сохранять интересные предложения
            </p>
            <Link href="/catalog" style={{
              display: 'inline-block', padding: '10px 24px', borderRadius: '50px',
              background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '14px',
            }}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            {favorites.map(f => (
              <ServiceCard key={f.id} service={f.service} isFavorited={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
