import AdminNav from '../AdminNav'
import { getAdminReviews, adminDeleteReview } from '@/actions/admin'
import { ActionButton } from '../AdminActions'
import Link from 'next/link'

function RatingBar({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '1px',
            background: i <= rating ? '#f59e0b' : '#e5e7eb',
          }} />
        ))}
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>{rating}.0</span>
    </div>
  )
}

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews()

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2)
    : '—'
  const dist = [5,4,3,2,1].map(r => ({ rating: r, count: reviews.filter(x => x.rating === r).length }))

  return (
    <>
      <AdminNav active="/admin/reviews" />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>

        {/* Topbar */}
        <div style={{ padding: '16px 28px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>Отзывы</h1>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{reviews.length} записей</p>
          </div>
        </div>

        <div style={{ padding: '20px 28px' }}>

          {/* Rating summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '0', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '20px 22px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: '40px', fontWeight: 800, color: '#111827', lineHeight: 1, letterSpacing: '-1px' }}>{avgRating}</p>
              <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Средняя оценка</p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{reviews.length} отзывов</p>
            </div>
            <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
              {dist.map(({ rating, count }) => {
                const pct = reviews.length ? (count / reviews.length) * 100 : 0
                return (
                  <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', width: '12px', textAlign: 'right' }}>{rating}</span>
                    <div style={{ flex: 1, height: '6px', background: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: rating >= 4 ? '#f59e0b' : rating === 3 ? '#d97706' : '#dc2626', borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#9ca3af', width: '24px' }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Автор', 'Услуга', 'Оценка', 'Комментарий', 'Дата', 'Действия'].map(h => (
                    <th key={h} style={{
                      padding: '9px 14px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 600, color: '#6b7280',
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                      background: '#f9fafb', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviews.map((review, i) => (
                  <tr key={review.id} style={{ borderBottom: i < reviews.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>
                      {review.author.name ?? '—'}
                    </td>
                    <td style={{ padding: '10px 14px', maxWidth: '200px' }}>
                      <Link href={`/catalog/${review.service.id}`} target="_blank" style={{
                        color: '#2563eb', textDecoration: 'none', fontWeight: 500, fontSize: '13px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {review.service.title}
                      </Link>
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <RatingBar rating={review.rating} />
                    </td>
                    <td style={{ padding: '10px 14px', maxWidth: '360px', color: '#6b7280' }}>
                      <div style={{
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden', lineHeight: 1.5, fontSize: '12px',
                      }}>
                        {review.comment || <em style={{ color: '#d1d5db' }}>Без комментария</em>}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <ActionButton
                        label="Удалить"
                        action={async () => {
                          'use server'
                          return adminDeleteReview(review.id)
                        }}
                        confirm="Удалить этот отзыв?"
                        variant="danger"
                        size="xs"
                      />
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                      Отзывов пока нет
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
