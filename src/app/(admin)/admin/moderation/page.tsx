import AdminNav from '../AdminNav'
import { getAdminModeration, approveService, rejectService } from '@/actions/admin'
import { ActionButton } from '../AdminActions'
import Link from 'next/link'

export default async function AdminModerationPage() {
  const services = await getAdminModeration()

  return (
    <>
      <AdminNav active="/admin/moderation" />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>
        <div style={{ padding: '16px 28px', background: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>Модерация услуг</h1>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{services.length} ожидают проверки</p>
          </div>
          {services.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', borderRadius: '6px', background: '#fffbeb', border: '1px solid #fde68a' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706' }}>{services.length} услуг на проверке</span>
            </div>
          )}
        </div>

        <div style={{ padding: '20px 28px' }}>
          {services.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '60px', textAlign: 'center' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>✓</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>Очередь пуста</p>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>Все услуги проверены</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {services.map(svc => (
                <div key={svc.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', padding: '2px 7px' }}>
                          DRAFT
                        </span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{svc.category.name}</span>
                        {svc.seller.innVerified && (
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '2px 7px' }}>
                            ИНН ✓
                          </span>
                        )}
                      </div>

                      <Link href={`/catalog/${svc.id}`} target="_blank" style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '6px', lineHeight: 1.3 }}>
                          {svc.title}
                        </h3>
                      </Link>

                      <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, marginBottom: '12px',
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {svc.description}
                      </p>

                      <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#9ca3af' }}>
                        <span>Продавец: <strong style={{ color: '#374151' }}>{svc.seller.companyName || svc.seller.name}</strong></span>
                        <span>{svc.seller.email}</span>
                        <span>Цена: <strong style={{ color: '#374151' }}>{Number(svc.price).toLocaleString('ru-RU')} ₽</strong></span>
                        <span>Изображений: {svc.images.length}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '140px' }}>
                      <ActionButton
                        label="Опубликовать"
                        action={async () => {
                          'use server'
                          return approveService(svc.id)
                        }}
                        variant="success"
                        size="sm"
                      />
                      <ActionButton
                        label="Отклонить"
                        action={async () => {
                          'use server'
                          return rejectService(svc.id)
                        }}
                        confirm="Отклонить услугу? Продавец получит уведомление."
                        variant="danger"
                        size="sm"
                      />
                      <Link href={`/catalog/${svc.id}`} target="_blank" style={{
                        padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                        background: '#f3f4f6', color: '#374151', textDecoration: 'none', textAlign: 'center',
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
