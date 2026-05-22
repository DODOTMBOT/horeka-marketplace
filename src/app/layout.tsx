import type { Metadata } from 'next'
import { Manrope, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-manrope',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono',
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'manifest', url: '/site.webmanifest' }],
  },
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
    <html lang="ru" className={`${manrope.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
