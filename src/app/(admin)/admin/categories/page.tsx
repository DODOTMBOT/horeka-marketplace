import AdminNav from '../AdminNav'
import AdminTopbar from '../AdminTopbar'
import { getAdminCategories, deleteCategory } from '@/actions/admin'
import { ActionButton } from '../AdminActions'
import { CategoryForms } from './CategoryForms'
import { PackageTiersForm } from './PackageTiersForm'
import { PriceUnitsForm } from './PriceUnitsForm'
import { getPackageTiers, getPriceUnits } from '@/lib/siteConfig'

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'categories' } = await searchParams
  const [categories, packageTiers, priceUnits] = await Promise.all([
    getAdminCategories(),
    getPackageTiers(),
    getPriceUnits(),
  ])

  const tabs = [
    { key: 'categories', label: 'Категории' },
    { key: 'packages',   label: 'Пакеты услуг' },
    { key: 'units',      label: 'Единицы цены' },
  ]

  return (
    <>
      <AdminNav active="/admin/categories" />
      <main className="admin-main">
        <AdminTopbar
          title="Категории"
          subtitle="Категории, пакеты и единицы цены"
          actions={
            <div className="admin-tabs">
              {tabs.map(t => (
                <a key={t.key} href={`/admin/categories?tab=${t.key}`} className={`admin-tab${tab === t.key ? ' active' : ''}`}>{t.label}</a>
              ))}
            </div>
          }
        />

        {tab === 'categories' && (
          <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', alignItems: 'start' }}>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    {['Иконка', 'Название', 'Slug', 'Формат', 'Услуг', 'Действия'].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, i) => (
                    <tr key={cat.id} style={{ borderBottom: i < categories.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <td style={{ fontSize: '20px', padding: '10px 16px' }}>{cat.icon ?? '📦'}</td>
                      <td style={{ fontWeight: 700, color: '#111', padding: '10px 16px' }}>{cat.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#aaa', padding: '10px 16px' }}>{cat.slug}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.04em',
                          background: cat.format === 'digital' ? '#3D5AFE' : cat.format === 'project' ? '#FF6B5C' : '#0F0F12',
                          color: '#fff',
                        }}>
                          {cat.format === 'digital' ? 'Инструменты' : cat.format === 'project' ? 'Проект' : 'Специалист'}
                        </span>
                      </td>
                      <td style={{ color: '#888', padding: '10px 16px' }}>{cat._count.services}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <ActionButton
                          label="Удалить"
                          action={async () => {
                            'use server'
                            return deleteCategory(cat.id)
                          }}
                          confirm={`Удалить «${cat.name}»? Это возможно только если в ней нет услуг.`}
                          variant="danger"
                          size="xs"
                        />
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#bbb', fontSize: '13px' }}>Категорий нет</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <CategoryForms categories={categories.map(c => ({ id: c.id, name: c.name, icon: c.icon, slug: c.slug, format: c.format ?? 'service' }))} />
          </div>
        )}

        {tab === 'packages' && (
          <div style={{ padding: '20px 28px', maxWidth: '600px' }}>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px', lineHeight: 1.7 }}>
              Управляйте пакетами услуг. Эти пакеты будут доступны продавцам при создании и редактировании услуг.
            </p>
            <PackageTiersForm initial={packageTiers} />
          </div>
        )}

        {tab === 'units' && (
          <div style={{ padding: '20px 28px', maxWidth: '600px' }}>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px', lineHeight: 1.7 }}>
              Управляйте единицами цены. Продавцы выбирают из этого списка при указании цены на услугу.
            </p>
            <PriceUnitsForm initial={priceUnits} />
          </div>
        )}
      </main>
    </>
  )
}
