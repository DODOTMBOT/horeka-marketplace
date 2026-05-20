import AdminNav from '../AdminNav'
import { getAdminCategories, deleteCategory } from '@/actions/admin'
import { ActionButton } from '../AdminActions'
import { CategoryForms } from './CategoryForms'

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories()

  return (
    <>
      <AdminNav active="/admin/categories" />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f9fafb' }}>
        <div style={{ padding: '16px 28px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', letterSpacing: '-0.2px' }}>Категории</h1>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{categories.length} категорий</p>
        </div>

        <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Иконка', 'Название', 'Slug', 'Услуг', 'Действия'].map(h => (
                    <th key={h} style={{
                      padding: '9px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 600,
                      color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase', background: '#f9fafb',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={cat.id} style={{ borderBottom: i < categories.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '10px 14px', fontSize: '22px' }}>{cat.icon ?? '📦'}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{cat.name}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '12px', color: '#9ca3af' }}>{cat.slug}</td>
                    <td style={{ padding: '10px 14px', color: '#6b7280' }}>{cat._count.services}</td>
                    <td style={{ padding: '10px 14px' }}>
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
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                      Категорий нет
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Forms */}
          <CategoryForms categories={categories.map(c => ({ id: c.id, name: c.name, icon: c.icon, slug: c.slug }))} />
        </div>
      </main>
    </>
  )
}
