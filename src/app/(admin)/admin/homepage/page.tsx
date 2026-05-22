import AdminNav from '../AdminNav'
import AdminTopbar from '../AdminTopbar'
import { getHomepageConfig } from '@/lib/siteConfig'
import HomepageEditor from './HomepageEditor'

export default async function AdminHomepagePage() {
  const config = await getHomepageConfig()

  return (
    <>
      <AdminNav active="/admin/homepage" />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <AdminTopbar title="Главная страница" subtitle="Изменения публикуются сразу после сохранения" />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <HomepageEditor initial={config} />
        </div>
      </main>
    </>
  )
}
