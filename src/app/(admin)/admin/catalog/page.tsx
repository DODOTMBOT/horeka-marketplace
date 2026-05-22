import AdminNav from '../AdminNav'
import AdminTopbar from '../AdminTopbar'
import { getCatalogConfig } from '@/lib/siteConfig'
import CatalogEditor from './CatalogEditor'

export default async function AdminCatalogPage() {
  const config = await getCatalogConfig()

  return (
    <>
      <AdminNav active="/admin/catalog" />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <AdminTopbar title="Каталог" subtitle="Настройка блоков форматов на странице каталога" />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <CatalogEditor initial={config} />
        </div>
      </main>
    </>
  )
}
