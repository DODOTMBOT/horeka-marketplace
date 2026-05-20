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
    default: 'Unit One — платформа для профессионалов HoReCa',
    template: '%s | Unit One',
  },
  description: 'Единая платформа для ресторанного бизнеса: услуги специалистов, вакансии и резюме, поставщики продуктов и оборудования.',
  keywords: ['HoReCa', 'рестораны', 'отели', 'кафе', 'поставщики', 'вакансии', 'услуги', 'маркетплейс', 'Unit One'],
  openGraph: {
    siteName: 'Unit One',
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
