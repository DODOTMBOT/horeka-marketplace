import AdminNav from '../AdminNav'
import AdminTopbar from '../AdminTopbar'
import { getNavbarConfig } from '@/lib/siteConfig'
import NavbarEditor from './NavbarEditor'

export default async function AdminNavbarPage() {
  const config = await getNavbarConfig()
  return (
    <>
      <AdminNav active="/admin/navbar" />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <AdminTopbar title="Шапка сайта" subtitle="Логотип и название отображаются на всех страницах" />
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ maxWidth: '720px' }}>
            <NavbarEditor initial={config} />
          </div>
        </div>
      </main>
    </>
  )
}
