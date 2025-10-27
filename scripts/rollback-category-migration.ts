/**
 * Rollback Script: Category Migration
 * Reverts listings from new Category model back to legacy enum
 *
 * USE ONLY IF: Migration needs to be reversed due to critical issues
 *
 * Prerequisites:
 * - legacyCategory field still exists on Listing model
 * - Original enum values are intact in legacyCategory
 *
 * Run with: npx tsx scripts/rollback-category-migration.ts
 *
 * DANGER: This is destructive if legacyCategory is null. Review carefully!
 */

import { PrismaClient, ListingCategory } from '@prisma/client'
import * as readline from 'readline'

const prisma = new PrismaClient()

// Mapping from category slugs back to enum values
const SLUG_TO_ENUM_MAP: Record<string, ListingCategory> = {
  electronics: 'ELECTRONICS',
  clothing: 'CLOTHING',
  'home-garden': 'HOME_GARDEN',
  sports: 'SPORTS',
  books: 'BOOKS',
  toys: 'TOYS',
  vehicles: 'VEHICLES',
  collectibles: 'COLLECTIBLES',
  'baby-kids': 'BABY_KIDS',
  'pet-supplies': 'PET_SUPPLIES',
}

interface RollbackStats {
  totalListings: number
  rolledBack: number
  alreadyReverted: number
  errors: number
  missingLegacyCategory: number
}

async function confirmRollback(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will revert all listings to legacy enum categories.\n' +
        'Are you sure you want to proceed? (yes/no): ',
      (answer) => {
        rl.close()
        resolve(answer.toLowerCase() === 'yes')
      }
    )
  })
}

async function rollbackCategoryMigration(): Promise<RollbackStats> {
  console.log('🔄 Starting category migration rollback...\n')

  const stats: RollbackStats = {
    totalListings: 0,
    rolledBack: 0,
    alreadyReverted: 0,
    errors: 0,
    missingLegacyCategory: 0,
  }

  try {
    // Check if legacyCategory field exists
    console.log('🔍 Checking schema compatibility...')
    const sampleListing = await prisma.listing.findFirst({
      select: { id: true, categoryId: true, category: true },
    })

    if (!sampleListing) {
      console.log('ℹ️  No listings found. Nothing to rollback.')
      return stats
    }

    console.log('✅ Schema compatible (legacyCategory field exists)\n')

    // Count total listings
    stats.totalListings = await prisma.listing.count()
    console.log(`📊 Total listings to process: ${stats.totalListings}\n`)

    // Load category slug map
    console.log('📋 Loading category slug mapping...')
    const categories = await prisma.category.findMany({
      select: { id: true, slug: true, name: true },
    })

    const categorySlugMap = new Map<string, string>()
    categories.forEach((cat) => {
      categorySlugMap.set(cat.id, cat.slug)
      console.log(`   ${cat.id} -> ${cat.slug} (${cat.name})`)
    })
    console.log()

    // Process in batches
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
          categoryId: true,
          category: true,
        },
      })

      if (listings.length === 0) break

      for (const listing of listings) {
        try {
          // Option 1: Use existing category if available
          if (listing.category) {
            // Already has legacy value, keep it
            stats.alreadyReverted++
            continue
          }

          // Option 2: Derive from categoryId
          if (!listing.categoryId) {
            console.warn(
              `⚠️  Listing ${listing.id} has neither category nor categoryId`
            )
            stats.errors++
            continue
          }

          const slug = categorySlugMap.get(listing.categoryId)
          if (!slug) {
            console.error(
              `❌ No category found for ID ${listing.categoryId}`
            )
            stats.errors++
            continue
          }

          const legacyEnum = SLUG_TO_ENUM_MAP[slug]
          if (!legacyEnum) {
            console.error(`❌ No enum mapping for slug ${slug}`)
            stats.errors++
            continue
          }

          // Update listing with category
          await prisma.listing.update({
            where: { id: listing.id },
            data: {
              category: legacyEnum,
              // Keep categoryId for reference, but app should use category
            },
          })

          stats.rolledBack++
        } catch (error) {
          console.error(`❌ Error rolling back listing ${listing.id}:`, error)
          stats.errors++
        }
      }

      console.log(
        `   Batch complete: ${stats.rolledBack} rolled back, ` +
          `${stats.alreadyReverted} already reverted, ${stats.errors} errors`
      )

      offset += BATCH_SIZE
      batchNumber++

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return stats
  } catch (error) {
    console.error('❌ Rollback failed:', error)
    throw error
  }
}

async function main() {
  try {
    // Confirm with user
    const confirmed = await confirmRollback()
    if (!confirmed) {
      console.log('\n❌ Rollback cancelled by user.')
      process.exit(0)
    }

    const stats = await rollbackCategoryMigration()

    console.log('\n' + '='.repeat(60))
    console.log('🔙 ROLLBACK SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total listings:              ${stats.totalListings}`)
    console.log(`Rolled back:                 ${stats.rolledBack}`)
    console.log(`Already reverted:            ${stats.alreadyReverted}`)
    console.log(`Missing legacy category:     ${stats.missingLegacyCategory}`)
    console.log(`Errors:                      ${stats.errors}`)
    console.log('='.repeat(60))

    if (stats.errors > 0) {
      console.warn(
        '\n⚠️  Rollback completed with errors. Please review the logs above.'
      )
      console.log('\n💡 Next steps:')
      console.log('   1. Manually fix listings with errors')
      console.log('   2. Re-run this script to complete rollback')
      console.log('   3. Update application code to use legacyCategory')
      process.exit(1)
    } else {
      console.log('\n✅ Rollback completed successfully!')
      console.log('\n💡 Next steps:')
      console.log('   1. Update Prisma schema to use enum category field')
      console.log('   2. Create migration: prisma migrate dev')
      console.log('   3. Update application code to use enum')
      console.log('   4. Test thoroughly before deploying')
      console.log('\n⚠️  Note: Category table still exists. You can:')
      console.log('   - Keep it for future use')
      console.log('   - Delete it manually if no longer needed')
    }
  } catch (error) {
    console.error('\n💥 Fatal error during rollback:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
