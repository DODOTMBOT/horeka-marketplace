import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const categories = [
  { slug: 'food', name: 'Продукты питания', icon: '🥩' },
  { slug: 'beverages', name: 'Напитки и алкоголь', icon: '🍷' },
  { slug: 'equipment', name: 'Кухонное оборудование', icon: '🍳' },
  { slug: 'furniture', name: 'Мебель и интерьер', icon: '🪑' },
  { slug: 'cleaning', name: 'Клининг', icon: '🧹' },
  { slug: 'staff', name: 'Персонал', icon: '👨‍🍳' },
  { slug: 'it', name: 'IT и автоматизация', icon: '💻' },
  { slug: 'marketing', name: 'Маркетинг и дизайн', icon: '📣' },
]

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon },
      create: cat,
    })
  }
  console.log('✅ Категории созданы:', categories.map(c => c.slug).join(', '))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
