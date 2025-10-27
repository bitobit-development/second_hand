/**
 * Category Seed Script
 * Seeds the Category table with the 10 base categories from the legacy ListingCategory enum
 *
 * Run with: npx tsx scripts/seed-categories.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Base categories mapping from legacy enum
// Icons match those in lib/constants/categories.ts
const BASE_CATEGORIES = [
  {
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Smartphone',
    description: 'Phones, laptops, cameras, and gadgets',
    legacyEnum: 'ELECTRONICS',
  },
  {
    name: 'Clothing & Fashion',
    slug: 'clothing',
    icon: 'Shirt',
    description: 'Clothes, shoes, and accessories',
    legacyEnum: 'CLOTHING',
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    icon: 'Home',
    description: 'Furniture, appliances, and decor',
    legacyEnum: 'HOME_GARDEN',
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports',
    icon: 'Dumbbell',
    description: 'Exercise equipment and outdoor gear',
    legacyEnum: 'SPORTS',
  },
  {
    name: 'Books & Media',
    slug: 'books',
    icon: 'BookOpen',
    description: 'Books, magazines, and media',
    legacyEnum: 'BOOKS',
  },
  {
    name: 'Toys & Games',
    slug: 'toys',
    icon: 'Gamepad2',
    description: 'Toys, games, and hobbies',
    legacyEnum: 'TOYS',
  },
  {
    name: 'Vehicles',
    slug: 'vehicles',
    icon: 'Car',
    description: 'Cars, motorcycles, and parts',
    legacyEnum: 'VEHICLES',
  },
  {
    name: 'Collectibles & Art',
    slug: 'collectibles',
    icon: 'Palette',
    description: 'Antiques, art, and collectibles',
    legacyEnum: 'COLLECTIBLES',
  },
  {
    name: 'Baby & Kids',
    slug: 'baby-kids',
    icon: 'Baby',
    description: 'Baby gear, toys, and clothing',
    legacyEnum: 'BABY_KIDS',
  },
  {
    name: 'Pet Supplies',
    slug: 'pet-supplies',
    icon: 'PawPrint',
    description: 'Pet food, toys, and accessories',
    legacyEnum: 'PET_SUPPLIES',
  },
]

async function seedCategories() {
  console.log('🌱 Starting category seed...')

  try {
    // Create categories with upsert to make this script idempotent
    const categoryMap = new Map<string, string>() // legacyEnum -> categoryId

    for (const cat of BASE_CATEGORIES) {
      const category = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          icon: cat.icon,
          description: cat.description,
          isActive: true,
          aiGenerated: false,
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          description: cat.description,
          isActive: true,
          aiGenerated: false,
          parentId: null,
          itemCount: 0,
        },
      })

      categoryMap.set(cat.legacyEnum, category.id)
      console.log(`✅ Created/Updated category: ${cat.name} (${category.id})`)
    }

    console.log('\n📊 Category seed summary:')
    console.log(`   Total categories: ${BASE_CATEGORIES.length}`)
    console.log('   All categories are root-level (no hierarchy yet)')
    console.log('   aiGenerated: false (manual base categories)')
    console.log('\n💡 Next steps:')
    console.log('   1. Run migration to apply schema changes')
    console.log('   2. Run data migration to link existing listings to new categories')
    console.log('   3. Update itemCount for each category')

    return categoryMap
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    throw error
  }
}

async function main() {
  try {
    const categoryMap = await seedCategories()

    // Count existing listings by legacy category
    console.log('\n📈 Existing listing distribution:')
    const listingCounts = await prisma.$queryRaw<
      Array<{ category: string; count: bigint }>
    >`
      SELECT "category" as category, COUNT(*) as count
      FROM "Listing"
      GROUP BY "category"
      ORDER BY count DESC
    `

    for (const row of listingCounts) {
      const count = Number(row.count)
      const categoryId = categoryMap.get(row.category)
      console.log(`   ${row.category}: ${count} listings (will map to category ${categoryId})`)
    }

    console.log('\n✨ Category seed completed successfully!')
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
