import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
})

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://unit-one.ru'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'HoReCa Hub — маркетплейс для ресторанов и отелей',
    template: '%s | HoReCa Hub',
  },
  description: 'Проверенные поставщики продуктов, оборудования и услуг для ресторанов, отелей и кафе. Только верифицированные компании.',
  keywords: ['HoReCa', 'поставщики', 'рестораны', 'отели', 'кафе', 'оборудование', 'маркетплейс'],
  openGraph: {
    siteName: 'HoReCa Hub',
    locale: 'ru_RU',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
