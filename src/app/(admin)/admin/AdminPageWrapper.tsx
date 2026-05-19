'use client'

import { usePathname } from 'next/navigation'

export default function AdminPageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} style={{ display: 'flex', flex: 1, animation: 'adminPageIn 0.18s ease both' }}>
      {children}
    </div>
  )
}
