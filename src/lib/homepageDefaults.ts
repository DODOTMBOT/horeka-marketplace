export type GridCategoryCard = {
  name: string
  hint: string
  count: number | string
  categorySlug?: string
  href?: string
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
    title: 'Маркетплейс услуг',
    subtitle: 'Специалисты, инструменты и проекты',
    bgColor: '#3D5AFE',
    textColor: 'light',
    stats: 'ИНН-верификация · вся Россия',
    ctaHref: '/catalog',
    categories: [
      { name: 'Инструменты', hint: 'шаблоны, курсы, расчёты',     count: 0, href: '/catalog?format=digital'  },
      { name: 'Специалист',  hint: 'фотограф, шеф, маркетолог',   count: 0, href: '/catalog?format=service'  },
      { name: 'Проект',      hint: 'открытие, ребрендинг, автом.', count: 0, href: '/catalog?format=project' },
    ],
  },
  {
    title: 'Вакансии и резюме',
    subtitle: 'Работа в HoReCa',
    bgColor: '#D7FF3A',
    textColor: 'dark',
    stats: 'Рестораны, отели, кафе и бары',
    ctaHref: '/jobs',
    categories: [
      { name: 'Вакансии', hint: 'повар, бармен, управляющий', count: 0, href: '/jobs' },
      { name: 'Резюме',   hint: 'найдите нужного кандидата',  count: 0, href: '/jobs' },
    ],
  },
  {
    title: 'Поставщики',
    subtitle: 'Продукты и оборудование',
    bgColor: '#0F0F12',
    textColor: 'light',
    stats: 'Прямые поставки · без посредников',
    ctaHref: '/suppliers',
    categories: [
      { name: 'Продукты',     hint: 'мясо, рыба, овощи, напитки', count: 0, href: '/suppliers' },
      { name: 'Оборудование', hint: 'плиты, холод, посуда',        count: 0, href: '/suppliers' },
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
