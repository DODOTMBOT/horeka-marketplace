import { prisma } from './prisma'
import { DEFAULT_GRID_SECTIONS, DEFAULT_HERO_V2 } from './homepageDefaults'
import { DEFAULT_CATALOG_CONFIG } from './catalogDefaults'

export type { GridCategoryCard, GridSection, HeroV2 } from './homepageDefaults'
export { DEFAULT_GRID_SECTIONS, DEFAULT_HERO_V2 } from './homepageDefaults'
export type { FormatBlock, CatalogConfig } from './catalogDefaults'
export { DEFAULT_CATALOG_CONFIG } from './catalogDefaults'

export type SectionBlock = {
  titleLine1: string
  titleLine2: string
  bgColor: string
  stat: string
  statLabel: string
  rating: string
  description: string
  ctaLabel: string
  ctaHref: string
}

export type HomepageConfig = {
  blocks: SectionBlock[]
  heroV2: import('./homepageDefaults').HeroV2
  gridSections: import('./homepageDefaults').GridSection[]
  hero: {
    badge: string; title: string; titleAccent: string; subtitle: string
    cta1Label: string; cta1Href: string; cta2Label: string; cta2Href: string
    bgFrom: string; bgTo: string
  }
  about: { label: string; text: string }
  feature1: { icon: string; title: string; text: string; badge: string }
  feature2: { title: string; subtitle: string; icon: string }
  feature3: {
    statValue: string; statLabel: string; statDesc: string
    row1Label: string; row2Label: string; row3Label: string
    row1Dots: number; row2Dots: number; row3Dots: number
    row1N: number; row2N: number; row3N: number
  }
  stats: { s1Value: string; s1Label: string; s2Value: string; s2Label: string; s3Value: string; s3Label: string; s4Value: string; s4Label: string }
  services: { label: string; title: string; ctaLabel: string; ctaHref: string }
  cta: { badge: string; title: string; btn1Label: string; btn1Href: string; btn2Label: string; btn2Href: string }
  block1?: SectionBlock
  block2?: SectionBlock
  block3?: SectionBlock
}

export const defaultConfig: HomepageConfig = {
  blocks: [],
  heroV2: DEFAULT_HERO_V2,
  gridSections: DEFAULT_GRID_SECTIONS,
  hero: {
    badge: '✦ Единая платформа для HoReCa', title: 'Развивайте бизнес', titleAccent: 'умнее и быстрее.',
    subtitle: 'Услуги специалистов, вакансии и поставщики — всё для ресторанов, отелей и кафе.',
    cta1Label: 'Начать работу ↗', cta1Href: '/catalog', cta2Label: 'Стать исполнителем', cta2Href: '/register',
    bgFrom: '#0f172a', bgTo: '#0f4c35',
  },
  about: { label: 'О платформе', text: 'Unit One объединяет рестораторов, поставщиков и специалистов HoReCa.' },
  feature1: { icon: '🍽️', title: 'Проверенные специалисты с опытом в ресторанном бизнесе.', text: 'Верификация ИНН', badge: 'Каталог активен' },
  feature2: { icon: '🧑‍🍳', title: 'Вакансии и кадры', subtitle: 'Найдите сотрудников или работу в HoReCa' },
  feature3: { statValue: '500+', statLabel: 'Специалистов', statDesc: 'Профессионалы для вашего бизнеса', row1Label: 'Рестораны', row2Label: 'Отели', row3Label: 'Кафе и бары', row1Dots: 9, row2Dots: 7, row3Dots: 6, row1N: 55, row2N: 40, row3N: 35 },
  stats: { s1Value: '2 000+', s1Label: 'Предложений', s2Value: '98%', s2Label: 'Довольных', s3Value: '500+', s3Label: 'Поставщиков', s4Value: '10+', s4Label: 'Категорий' },
  services: { label: 'Возможности', title: 'Откройте весь спектр услуг.', ctaLabel: 'Смотреть каталог ↗', ctaHref: '/catalog' },
  cta: { badge: 'Готовы начать?', title: 'Разместите услуги и привлекайте клиентов', btn1Label: 'Стать исполнителем', btn1Href: '/register?role=SELLER', btn2Label: 'Смотреть каталог', btn2Href: '/catalog' },
  block1: { titleLine1: 'МАРКЕТПЛЕЙС', titleLine2: 'УСЛУГ И СЕРВИСОВ', bgColor: '#C97B65', stat: '2 000+', statLabel: 'предложений', rating: '4.8', description: 'Широкий выбор услуг.', ctaLabel: 'В КАТАЛОГ', ctaHref: '/catalog' },
  block2: { titleLine1: 'БИРЖА', titleLine2: 'ВАКАНСИЙ', bgColor: '#B5D43D', stat: '500+', statLabel: 'вакансий', rating: '4.9', description: 'Найдите сотрудников.', ctaLabel: 'НАЙТИ РАБОТУ', ctaHref: '/jobs' },
  block3: { titleLine1: 'КАТАЛОГ', titleLine2: 'ПОСТАВЩИКОВ', bgColor: '#C4906A', stat: '300+', statLabel: 'поставщиков', rating: '4.7', description: 'Продукты и оборудование.', ctaLabel: 'К ПОСТАВЩИКАМ', ctaHref: '/suppliers' },
}
defaultConfig.blocks = [defaultConfig.block1!, defaultConfig.block2!, defaultConfig.block3!]

export type PackageTier = { key: string; label: string }
export const DEFAULT_PACKAGE_TIERS: PackageTier[] = [
  { key: 'basic', label: 'Базовый' }, { key: 'standard', label: 'Стандарт' }, { key: 'premium', label: 'Премиум' },
]
export const DEFAULT_PRICE_UNITS: string[] = ['разово', 'в месяц', 'в час', 'за проект']

export async function getPackageTiers(): Promise<PackageTier[]> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: 'packageTiers' } })
    return row ? row.value as PackageTier[] : DEFAULT_PACKAGE_TIERS
  } catch { return DEFAULT_PACKAGE_TIERS }
}

export async function getPriceUnits(): Promise<string[]> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: 'priceUnits' } })
    return row ? row.value as string[] : DEFAULT_PRICE_UNITS
  } catch { return DEFAULT_PRICE_UNITS }
}

export async function getCatalogConfig(): Promise<import('./catalogDefaults').CatalogConfig> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: 'catalog' } })
    if (!row) return DEFAULT_CATALOG_CONFIG
    const saved = row.value as Partial<import('./catalogDefaults').CatalogConfig>
    return {
      ...DEFAULT_CATALOG_CONFIG,
      ...saved,
      formats: (saved.formats && saved.formats.length > 0) ? saved.formats : DEFAULT_CATALOG_CONFIG.formats,
    }
  } catch { return DEFAULT_CATALOG_CONFIG }
}

export type NavbarConfig = {
  logoImageUrl: string
  logoText: string
  showIcon: boolean
}

export const DEFAULT_NAVBAR_CONFIG: NavbarConfig = {
  logoImageUrl: '',
  logoText: 'unit one',
  showIcon: true,
}

export async function getNavbarConfig(): Promise<NavbarConfig> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: 'navbar' } })
    if (!row) return DEFAULT_NAVBAR_CONFIG
    return { ...DEFAULT_NAVBAR_CONFIG, ...(row.value as Partial<NavbarConfig>) }
  } catch { return DEFAULT_NAVBAR_CONFIG }
}

export async function getHomepageConfig(): Promise<HomepageConfig> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { key: 'homepage' } })
    if (!row) return defaultConfig
    const saved = row.value as Partial<HomepageConfig>
    const merged: HomepageConfig = { ...defaultConfig, ...saved }
    if (!merged.blocks || merged.blocks.length === 0) {
      merged.blocks = [merged.block1 ?? defaultConfig.block1!, merged.block2 ?? defaultConfig.block2!, merged.block3 ?? defaultConfig.block3!]
    }
    if (!merged.heroV2) merged.heroV2 = DEFAULT_HERO_V2
    if (!merged.gridSections || merged.gridSections.length === 0) merged.gridSections = DEFAULT_GRID_SECTIONS
    return merged
  } catch { return defaultConfig }
}
