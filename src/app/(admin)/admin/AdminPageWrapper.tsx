'use client'

import { usePathname } from 'next/navigation'

export default function AdminPageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        @keyframes adminPageIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div key={pathname} style={{
        display: 'flex', flex: 1,
        animation: 'adminPageIn 0.22s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        {children}
      </div>
    </>
  )
}
