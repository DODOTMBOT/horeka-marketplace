export type FormatBlock = {
  key: string
  title: string
  subtitle: string
  description: string
  bgColor: string
  textColor: 'light' | 'dark'
  priceHint: string
  timeHint: string
  stat: string
  statLabel: string
}

export type CatalogConfig = {
  headline: string
  subheadline: string
  formats: FormatBlock[]
}

export const DEFAULT_CATALOG_CONFIG: CatalogConfig = {
  headline: 'Маркетплейс',
  subheadline: 'Выберите формат работы — или сразу перейдите к поиску',
  formats: [
    {
      key: 'digital',
      title: 'Инструменты',
      subtitle: 'Готовые решения',
      description: 'Шаблоны меню, курсы, расчёты, цифровые продукты. Доступ сразу после оплаты.',
      bgColor: '#3D5AFE',
      textColor: 'light',
      priceHint: '300–5 000 ₽',
      timeHint: 'Сразу после оплаты',
      stat: '78',
      statLabel: 'инструментов',
    },
    {
      key: 'service',
      title: 'Специалист',
      subtitle: 'Услуга под задачу',
      description: 'Фотограф, бариста-тренер, шеф, маркетолог. Договоритесь и получите результат.',
      bgColor: '#0F0F12',
      textColor: 'light',
      priceHint: '3 000–30 000 ₽',
      timeHint: '1–7 дней',
      stat: '311',
      statLabel: 'специалистов',
    },
    {
      key: 'project',
      title: 'Проект',
      subtitle: 'Комплексная работа',
      description: 'Открытие заведения, ребрендинг, автоматизация. От первой встречи до результата.',
      bgColor: '#FF6B5C',
      textColor: 'light',
      priceHint: 'от 30 000 ₽',
      timeHint: 'от 15 дней',
      stat: '94',
      statLabel: 'проектов',
    },
  ],
}
