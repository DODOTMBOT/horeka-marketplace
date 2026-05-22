export type GridCategoryCard = {
  name: string
  hint: string
  count: number | string
  categorySlug?: string
}

export type GridSection = {
  title: string
  subtitle: string
  bgColor: string
  textColor: string
  stats: string
  ctaHref: string
  categories: GridCategoryCard[]
}

export type HeroV2 = {
  badge: string
  titleLine1: string
  titleLine2: string
  titleAccent: string
  titleHighlight: string
  description: string
  aiQuery: string
  aiChips: string
}

export const DEFAULT_GRID_SECTIONS: GridSection[] = [
  {
    title: 'Закупки и продукты',
    subtitle: 'Что заходит на кухню',
    bgColor: '#3D5AFE',
    textColor: 'light',
    stats: '699 поставщиков · 4.8',
    ctaHref: '/catalog',
    categories: [
      { name: 'Продукты',  hint: 'мясо, рыба, овощи',    count: 412, categorySlug: 'food' },
      { name: 'Напитки',   hint: 'алко, безалко, кофе',   count: 287, categorySlug: 'beverages' },
      { name: 'Клининг',   hint: 'химия, инвентарь',      count: 89,  categorySlug: 'cleaning' },
    ],
  },
  {
    title: 'Пространство и сервис',
    subtitle: 'Чем заполнено и кто работает',
    bgColor: '#D7FF3A',
    textColor: 'dark',
    stats: '561 поставщик · 18 регионов',
    ctaHref: '/catalog',
    categories: [
      { name: 'Оборудование', hint: 'плиты, холод, посуда', count: 196, categorySlug: 'equipment' },
      { name: 'Интерьер',    hint: 'столы, стулья, декор', count: 154, categorySlug: 'furniture' },
      { name: 'Персонал',    hint: 'повара, бармены',      count: 311, categorySlug: 'staff' },
    ],
  },
  {
    title: 'Технологии и рост',
    subtitle: 'Автоматизация и продвижение',
    bgColor: '#FF6B5C',
    textColor: 'light',
    stats: '235 студий · ИНН-верификация',
    ctaHref: '/catalog',
    categories: [
      { name: 'IT',        hint: 'касса, CRM, учёт',  count: 78,  categorySlug: 'it' },
      { name: 'Маркетинг', hint: 'фото, SMM, меню',   count: 157, categorySlug: 'marketing' },
    ],
  },
]

export const DEFAULT_HERO_V2: HeroV2 = {
  badge: 'B2B МАРКЕТПЛЕЙС · HORECA · РОССИЯ',
  titleLine1: 'Всё, что нужно',
  titleLine2: 'ресторану —',
  titleAccent: 'в ОДНОМ',
  titleHighlight: 'окне.',
  description: '1855 поставщиков, 8 категорий. ИНН-верификация по DaData. От первого тендера до повторных заказов — без таблиц и переписки в мессенджерах.',
  aiQuery: 'Открываю кафе на 60 мест, нужны поставщики кофе и мебели',
  aiChips: 'ПОСТАВЩИК КОФЕ,БАНКЕТНАЯ МЕБЕЛЬ,КОФЕ-МАШИНЫ,ЧАЙ ОТ ПОСТАВЩИКА',
}
