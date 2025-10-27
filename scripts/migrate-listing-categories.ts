/**
 * Data Migration Script: Migrate Listing Categories
 * Migrates existing listings from legacy enum categories to new Category table
 *
 * Run AFTER:
 * 1. prisma migrate dev (to create Category table and add categoryId field)
 * 2. npx tsx scripts/seed-categories.ts (to populate Category table)
 *
 * Run with: npx tsx scripts/migrate-listing-categories.ts
 *
 * SAFE TO RE-RUN: Uses idempotent updates
 */

import { PrismaClient, ListingCategory } from '@prisma/client'

const prisma = new PrismaClient()

// Mapping from legacy enum values to category slugs
const CATEGORY_SLUG_MAP: Record<ListingCategory, string> = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  HOME_GARDEN: 'home-garden',
  SPORTS: 'sports',
  BOOKS: 'books',
  TOYS: 'toys',
  VEHICLES: 'vehicles',
  COLLECTIBLES: 'collectibles',
  BABY_KIDS: 'baby-kids',
  PET_SUPPLIES: 'pet-supplies',
}

interface MigrationStats {
  totalListings: number
  migratedListings: number
  alreadyMigrated: number
  errors: number
  categoryCounts: Record<string, number>
}

async function migrateListingCategories(): Promise<MigrationStats> {
  console.log('🔄 Starting listing category migration...\n')

  const stats: MigrationStats = {
    totalListings: 0,
    migratedListings: 0,
    alreadyMigrated: 0,
    errors: 0,
    categoryCounts: {},
  }

  try {
    // Step 1: Load all category IDs by slug
    console.log('📋 Loading category mapping...')
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, name: true },
    })

    const categoryIdMap = new Map<string, string>()
    categories.forEach((cat) => {
      categoryIdMap.set(cat.slug, cat.id)
      console.log(`   ${cat.slug} -> ${cat.id} (${cat.name})`)
    })

    // Validate all mappings exist
    const missingCategories: string[] = []
    for (const [legacyEnum, slug] of Object.entries(CATEGORY_SLUG_MAP)) {
      if (!categoryIdMap.has(slug)) {
        missingCategories.push(`${legacyEnum} -> ${slug}`)
      }
    }

    if (missingCategories.length > 0) {
      throw new Error(
        `Missing categories in database: ${missingCategories.join(', ')}\n` +
          'Run "npx tsx scripts/seed-categories.ts" first!'
      )
    }

    console.log('✅ All category mappings validated\n')

    // Step 2: Count total listings
    stats.totalListings = await prisma.listing.count()
    console.log(`📊 Total listings to process: ${stats.totalListings}\n`)

    if (stats.totalListings === 0) {
      console.log('ℹ️  No listings found. Migration complete.')
      return stats
    }

    // Step 3: Migrate listings in batches
    const BATCH_SIZE = 100
    let offset = 0
    let batchNumber = 1

    while (offset < stats.totalListings) {
      console.log(`🔄 Processing batch ${batchNumber} (offset: ${offset})...`)

      const listings = await prisma.listing.findMany({
        take: BATCH_SIZE,
        skip: offset,
        select: {
          id: true,
          category: true,
          categoryId: true,
        },
      })

      if (listings.length === 0) break

      for (const listing of listings) {
        try {
          // Skip if already migrated (has valid categoryId)
          if (listing.categoryId) {
            stats.alreadyMigrated++
            continue
          }

          // Get category ID from legacy enum
          const legacyCategory = listing.category as ListingCategory
          if (!legacyCategory) {
            console.warn(`⚠️  Listing ${listing.id} has no legacy category, skipping`)
            stats.errors++
            continue
          }

          const slug = CATEGORY_SLUG_MAP[legacyCategory]
          const categoryId = categoryIdMap.get(slug)

          if (!categoryId) {
            console.error(`❌ No category found for ${legacyCategory} (slug: ${slug})`)
            stats.errors++
            continue
          }

          // Update listing with new categoryId
          await prisma.listing.update({
            where: { id: listing.id },
            data: {
              categoryId,
              // Keep legacyCategory for rollback capability
            },
          })

          stats.migratedListings++
          stats.categoryCounts[legacyCategory] =
            (stats.categoryCounts[legacyCategory] || 0) + 1
        } catch (error) {
          console.error(`❌ Error migrating listing ${listing.id}:`, error)
          stats.errors++
        }
      }

      console.log(
        `   Batch complete: ${stats.migratedListings} migrated, ${stats.alreadyMigrated} already done, ${stats.errors} errors`
      )

      offset += BATCH_SIZE
      batchNumber++

      // Small delay to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Step 4: Update itemCount for each category
    console.log('\n📊 Updating category item counts...')
    for (const category of categories) {
      const count = await prisma.listing.count({
        where: {
          categoryId: category.id,
        },
      })

      await prisma.category.update({
        where: { id: category.id },
        data: { itemCount: count },
      })

      console.log(`   ${category.name}: ${count} listings`)
    }

    return stats
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

async function main() {
  try {
    const stats = await migrateListingCategories()

    console.log('\n' + '='.repeat(60))
    console.log('✨ MIGRATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total listings:        ${stats.totalListings}`)
    console.log(`Migrated:              ${stats.migratedListings}`)
    console.log(`Already migrated:      ${stats.alreadyMigrated}`)
    console.log(`Errors:                ${stats.errors}`)
    console.log('\nCategory distribution:')
    Object.entries(stats.categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category.padEnd(20)}: ${count}`)
      })
    console.log('='.repeat(60))

    if (stats.errors > 0) {
      console.warn(
        '\n⚠️  Migration completed with errors. Please review the logs above.'
      )
      process.exit(1)
    } else {
      console.log('\n✅ Migration completed successfully!')
      console.log('\n💡 Next steps:')
      console.log(
        '   1. Verify data integrity: Check listings in the database'
      )
      console.log('   2. Test application: Ensure category browsing works')
      console.log(
        '   3. Run tests: pnpm test to verify no regressions'
      )
      console.log(
        '   4. Optional: Remove legacyCategory field after confirming everything works'
      )
    }
  } catch (error) {
    console.error('\n💥 Fatal error during migration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
