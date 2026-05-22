import AdminNav from '../AdminNav'
import AdminTopbar from '../AdminTopbar'
import { getAdminReviews, adminDeleteReview } from '@/actions/admin'
import { ActionButton } from '../AdminActions'
import Link from 'next/link'

function RatingBar({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            width: '7px', height: '7px', borderRadius: '1px',
            background: i <= rating ? '#f59e0b' : '#e8e8e8',
          }} />
        ))}
      </div>
      <span style={{ fontSize: '12px', fontWeight: 800, color: '#111' }}>{rating}.0</span>
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
      <main className="admin-main">
        <AdminTopbar title="Отзывы" subtitle={`${reviews.length} записей`} />

        <div style={{ padding: '20px 28px' }}>
          {/* Rating summary */}
          <div className="admin-card" style={{ display: 'grid', gridTemplateColumns: '140px 1fr', marginBottom: '16px' }}>
            <div style={{ padding: '20px', borderRight: '1.5px solid #f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p className="admin-metric-num" style={{ fontSize: '40px' }}>{avgRating}</p>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '6px' }}>Рейтинг</p>
              <p style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>{reviews.length} отзывов</p>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
              {dist.map(({ rating, count }) => {
                const pct = reviews.length ? (count / reviews.length) * 100 : 0
                return (
                  <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#888', width: '10px', textAlign: 'right' }}>{rating}</span>
                    <div style={{ flex: 1, height: '5px', background: '#f0f0f0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: rating >= 4 ? '#111' : rating === 3 ? '#888' : '#dc2626', borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#bbb', width: '22px' }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {['Автор', 'Услуга', 'Оценка', 'Комментарий', 'Дата', 'Действия'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review.id}>
                    <td style={{ fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>{review.author.name ?? '—'}</td>
                    <td style={{ maxWidth: '200px' }}>
                      <Link href={`/catalog/${review.service.id}`} target="_blank" style={{
                        color: '#111', textDecoration: 'underline', fontWeight: 600, fontSize: '13px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {review.service.title}
                      </Link>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}><RatingBar rating={review.rating} /></td>
                    <td style={{ maxWidth: '360px', color: '#666', fontSize: '12px' }}>
                      <div style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                        {review.comment || <em style={{ color: '#ccc' }}>Без комментария</em>}
                      </div>
                    </td>
                    <td style={{ color: '#bbb', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td>
                      <ActionButton label="Удалить" action={async () => { 'use server'; return adminDeleteReview(review.id) }} confirm="Удалить этот отзыв?" variant="danger" size="xs" />
                    </td>
                  </tr>
                ))}
                {reviews.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#bbb', fontSize: '13px' }}>Отзывов пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
