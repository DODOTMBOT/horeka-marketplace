import AdminNav from '../AdminNav'
import AdminTopbar from '../AdminTopbar'
import { getAdminModeration, approveService, rejectService } from '@/actions/admin'
import { ActionButton } from '../AdminActions'
import Link from 'next/link'

export default async function AdminModerationPage() {
  const services = await getAdminModeration()

  return (
    <>
      <AdminNav active="/admin/moderation" />
      <main className="admin-main">
        <AdminTopbar
          title="Модерация"
          subtitle={`${services.length} ожидают проверки`}
          alert={services.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 10px', borderRadius: '3px', background: '#fffbeb', border: '1.5px solid #fde68a' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#d97706' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#d97706' }}>{services.length} на проверке</span>
            </div>
          ) : undefined}
        />

        <div style={{ padding: '20px 28px' }}>
          {services.length === 0 ? (
            <div className="admin-card" style={{ padding: '60px', textAlign: 'center' }}>
              <p style={{
                fontFamily: 'Impact, "Arial Black", sans-serif',
                fontStyle: 'italic', fontSize: '32px', fontWeight: 900,
                color: '#111', textTransform: 'uppercase', marginBottom: '8px',
              }}>Очередь пуста</p>
              <p style={{ fontSize: '13px', color: '#aaa' }}>Все услуги проверены</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {services.map(svc => (
                <div key={svc.id} className="admin-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#d97706', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '3px', padding: '3px 7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          ЧЕРНОВИК
                        </span>
                        <span style={{ fontSize: '11px', color: '#aaa', fontWeight: 600 }}>{svc.category.name}</span>
                        {svc.seller.innVerified && (
                          <span style={{ fontSize: '9px', fontWeight: 800, color: '#16a34a', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '3px', padding: '3px 7px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            ИНН ✓
                          </span>
                        )}
                      </div>
                      <Link href={`/catalog/${svc.id}`} target="_blank" style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', marginBottom: '6px', lineHeight: 1.3, letterSpacing: '-0.3px' }}>
                          {svc.title}
                        </h3>
                      </Link>
                      <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, marginBottom: '12px',
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {svc.description}
                      </p>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '11px', color: '#aaa', flexWrap: 'wrap' }}>
                        <span>Продавец: <strong style={{ color: '#111', fontWeight: 700 }}>{svc.seller.companyName || svc.seller.name}</strong></span>
                        <span>{svc.seller.email}</span>
                        <span>Цена: <strong style={{ color: '#111', fontWeight: 800, fontFamily: 'Impact, "Arial Black", sans-serif', fontStyle: 'italic' }}>{Number(svc.price).toLocaleString('ru-RU')} ₽</strong></span>
                        <span>Изображений: {svc.images.length}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '130px' }}>
                      <ActionButton label="Опубликовать" action={async () => { 'use server'; return approveService(svc.id) }} variant="success" size="sm" />
                      <ActionButton label="Отклонить" action={async () => { 'use server'; return rejectService(svc.id) }} confirm="Отклонить услугу? Продавец получит уведомление." variant="danger" size="sm" />
                      <Link href={`/catalog/${svc.id}`} target="_blank" style={{
                        padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
                        background: '#f5f5f5', color: '#555', textDecoration: 'none', textAlign: 'center',
                        border: '1.5px solid #e8e8e8',
                      }}>
                        Предпросмотр
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
