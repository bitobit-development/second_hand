# Category Migration Guide

## Overview
This guide details the migration from fixed `ListingCategory` enum to a flexible, hierarchical Category model.

## Schema Changes

### Before (Enum-based)
```prisma
enum ListingCategory {
  ELECTRONICS
  CLOTHING
  HOME_GARDEN
  SPORTS
  BOOKS
  TOYS
  VEHICLES
  COLLECTIBLES
  BABY_KIDS
  PET_SUPPLIES
}

model Listing {
  category ListingCategory
}
```

### After (Relational Model)
```prisma
model Category {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  parentId    String?
  icon        String
  description String
  isActive    Boolean  @default(true)
  itemCount   Int      @default(0)
  aiGenerated Boolean  @default(false)
  listings    Listing[]
}

model Listing {
  categoryId      String
  legacyCategory  ListingCategory? // Temporary for migration
  category        Category @relation(...)
}
```

## Migration Steps

### 1. Pre-Migration Preparation

**A. Backup Database**
```bash
# For Neon (PostgreSQL), create a backup branch
# Or use pg_dump for local backup
pg_dump $DATABASE_URL > backup_pre_category_migration.sql
```

**B. Verify Current State**
```bash
# Count listings by category
npx prisma studio
# OR run query:
SELECT category, COUNT(*) FROM "Listing" GROUP BY category;
```

**C. Review Schema Changes**
```bash
# Check the diff between current and new schema
git diff prisma/schema.prisma
```

### 2. Apply Schema Migration

**A. Generate Migration**
```bash
npx prisma migrate dev --name add_category_model_and_hierarchy
```

This creates:
- `Category` table with all fields and indexes
- `categoryId` foreign key on `Listing` table
- `legacyCategory` nullable field on `Listing` table
- All necessary indexes and constraints

**B. Migration File Structure**
The generated migration will:
1. Create `Category` table
2. Alter `Listing` table:
   - Add `categoryId` column (nullable initially)
   - Rename `category` to `legacyCategory` and make nullable
   - Add foreign key constraint
3. Create indexes on new columns

**Example migration SQL:**
```sql
-- CreateTable
CREATE TABLE "Category" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "parentId" TEXT,
  "icon" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "itemCount" INTEGER NOT NULL DEFAULT 0,
  "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "Category"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable (simplified)
ALTER TABLE "Listing" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Listing" ALTER COLUMN "category" DROP NOT NULL;
ALTER TABLE "Listing" RENAME COLUMN "category" TO "legacyCategory";

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex (multiple indexes)
CREATE INDEX "Category_slug_idx" ON "Category"("slug");
-- ... (additional indexes)
```

### 3. Seed Categories

**A. Run Category Seed Script**
```bash
npx tsx scripts/seed-categories.ts
```

**B. Expected Output**
```
🌱 Starting category seed...
✅ Created/Updated category: Electronics (uuid-1)
✅ Created/Updated category: Clothing & Fashion (uuid-2)
... (8 more categories)

📊 Category seed summary:
   Total categories: 10
   All categories are root-level (no hierarchy yet)
   aiGenerated: false (manual base categories)
```

**C. Verify Categories Created**
```bash
npx prisma studio
# Navigate to Category table, should see 10 rows
```

### 4. Migrate Listing Data

**A. Run Data Migration Script**
```bash
npx tsx scripts/migrate-listing-categories.ts
```

**B. Expected Output**
```
🔄 Starting listing category migration...

📋 Loading category mapping...
   electronics -> uuid-1 (Electronics)
   ... (9 more mappings)
✅ All category mappings validated

📊 Total listings to process: 1250

🔄 Processing batch 1 (offset: 0)...
   Batch complete: 100 migrated, 0 already done, 0 errors
... (additional batches)

📊 Updating category item counts...
   Electronics: 342 listings
   ... (9 more categories)

==========================================================
✨ MIGRATION SUMMARY
==========================================================
Total listings:        1250
Migrated:              1250
Already migrated:      0
Errors:                0

Category distribution:
   ELECTRONICS         : 342
   CLOTHING            : 278
   ... (8 more)
==========================================================

✅ Migration completed successfully!
```

**C. Script is Idempotent**
- Safe to re-run if interrupted
- Skips already-migrated listings
- Updates item counts on each run

### 5. Post-Migration Verification

**A. Data Integrity Checks**
```sql
-- Check all listings have categoryId
SELECT COUNT(*) FROM "Listing" WHERE "categoryId" IS NULL;
-- Should return 0

-- Verify category counts match
SELECT c.name, c."itemCount", COUNT(l.id) as actual_count
FROM "Category" c
LEFT JOIN "Listing" l ON l."categoryId" = c.id
GROUP BY c.id, c.name, c."itemCount"
HAVING c."itemCount" != COUNT(l.id);
-- Should return 0 rows (all counts match)

-- Check foreign key integrity
SELECT COUNT(*) FROM "Listing" l
LEFT JOIN "Category" c ON l."categoryId" = c.id
WHERE c.id IS NULL;
-- Should return 0
```

**B. Application Testing**
```bash
# Start dev server
pnpm dev

# Test category browsing:
# 1. Visit /listings
# 2. Filter by each category
# 3. Verify listing counts match
# 4. Check category icons display correctly

# Run automated tests
pnpm test
```

**C. Performance Testing**
```sql
-- Test query performance with new indexes
EXPLAIN ANALYZE
SELECT * FROM "Listing"
WHERE "categoryId" = 'uuid-1' AND status = 'APPROVED'
ORDER BY "createdAt" DESC
LIMIT 20;

-- Should use index: Listing_status_categoryId_createdAt_idx
```

### 6. Optional: Remove Legacy Field

**After confirming everything works (1-2 weeks in production):**

**A. Update Schema**
```prisma
model Listing {
  // Remove this line:
  // legacyCategory  ListingCategory?
}
```

**B. Create Migration**
```bash
npx prisma migrate dev --name remove_legacy_category_field
```

**C. Generated Migration**
```sql
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "legacyCategory";

-- DropIndex (if exists)
DROP INDEX IF EXISTS "Listing_legacyCategory_idx";
```

## Rollback Procedure

### If Migration Fails Before Data Migration
```bash
# Restore from backup
psql $DATABASE_URL < backup_pre_category_migration.sql

# OR use Prisma migrate rollback (if available)
npx prisma migrate resolve --rolled-back <migration_name>
```

### If Issues Found After Data Migration
```bash
# Option 1: Re-run migration script (idempotent)
npx tsx scripts/migrate-listing-categories.ts

# Option 2: Manual rollback (SQL)
-- Copy categoryId back to legacyCategory if needed
UPDATE "Listing"
SET "legacyCategory" = (
  SELECT UPPER(REPLACE(c.slug, '-', '_'))
  FROM "Category" c
  WHERE c.id = "Listing"."categoryId"
)
WHERE "categoryId" IS NOT NULL;
```

## Performance Considerations

### Index Strategy
The migration creates these indexes:
- `Category.slug` (unique) - Fast category lookup by URL slug
- `Category.parentId` - Efficient hierarchy queries
- `Category.isActive` - Filter active categories
- `Listing.categoryId` - Foreign key index (auto-created)
- Composite indexes maintained for common queries

### Query Performance Impact

**Before (Enum):**
- No JOIN required
- Direct enum comparison (very fast)
- Index on single column

**After (Foreign Key):**
- Requires JOIN for category details
- Foreign key lookup (indexed, fast)
- Slightly slower but negligible (<1ms difference)

**Optimization Tips:**
1. Use `select` to limit joined fields:
   ```typescript
   const listings = await prisma.listing.findMany({
     include: {
       category: {
         select: { id: true, name: true, slug: true, icon: true }
       }
     }
   })
   ```

2. Cache category list in memory (10 categories, rarely changes)

3. Use `itemCount` for sorting popular categories (denormalized)

### Expected Performance
- **Category lookup by slug**: <1ms (indexed)
- **Listings by category**: <10ms for 1000 listings (indexed)
- **Hierarchy queries**: <5ms for 3-level deep (indexed)
- **Item count updates**: Batch updates during off-peak hours

## Common Issues & Solutions

### Issue: Foreign Key Constraint Violation
**Symptom:** Error during migration: "violates foreign key constraint"

**Cause:** Orphaned listings with invalid category references

**Solution:**
```sql
-- Find orphaned listings
SELECT id, category FROM "Listing"
WHERE category NOT IN (
  'ELECTRONICS', 'CLOTHING', 'HOME_GARDEN', 'SPORTS',
  'BOOKS', 'TOYS', 'VEHICLES', 'COLLECTIBLES',
  'BABY_KIDS', 'PET_SUPPLIES'
);

-- Fix or delete them before migration
```

### Issue: Duplicate Slug Error
**Symptom:** "Unique constraint failed on the fields: (`slug`)"

**Cause:** Running seed script multiple times with different data

**Solution:**
```bash
# Seed script uses upsert - should not happen
# If it does, clear Category table first:
npx prisma studio
# Delete all Category rows, then re-run seed
```

### Issue: Migration Hangs
**Symptom:** Migration script stops responding

**Cause:** Large database, slow queries, or locks

**Solution:**
```bash
# Increase batch size for faster processing
# Edit BATCH_SIZE in migrate-listing-categories.ts

# Check for locks in PostgreSQL
SELECT * FROM pg_locks WHERE NOT granted;

# Kill blocking queries if needed
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state = 'active' AND pid != pg_backend_pid();
```

## Future Enhancements

### 1. Category Hierarchy
Add subcategories to existing categories:
```typescript
// Example: Electronics > Smartphones
const electronics = await prisma.category.findUnique({
  where: { slug: 'electronics' }
})

await prisma.category.create({
  data: {
    name: 'Smartphones',
    slug: 'smartphones',
    icon: 'Smartphone',
    description: 'Mobile phones and accessories',
    parentId: electronics.id,
    aiGenerated: false,
  }
})
```

### 2. AI-Generated Categories
Use GPT-4o Vision to suggest categories from listing images:
```typescript
// Auto-create subcategories based on listing patterns
// Set aiGenerated: true for these
```

### 3. Category Merging
Merge similar categories to avoid fragmentation:
```sql
-- Example: Merge "Phones" into "Smartphones"
UPDATE "Listing"
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'smartphones')
WHERE "categoryId" = (SELECT id FROM "Category" WHERE slug = 'phones');

-- Update item counts
UPDATE "Category" SET "itemCount" = ... WHERE slug = 'smartphones';

-- Soft-delete merged category
UPDATE "Category" SET "isActive" = false WHERE slug = 'phones';
```

## Support & Contact
For issues or questions:
1. Check this guide thoroughly
2. Review migration logs for specific errors
3. Consult `scripts/migrate-listing-categories.ts` comments
4. Test in development environment first

## Appendix: SQL Quick Reference

```sql
-- Count listings by category (before migration)
SELECT category, COUNT(*) as count
FROM "Listing"
GROUP BY category
ORDER BY count DESC;

-- Count listings by category (after migration)
SELECT c.name, c."itemCount", COUNT(l.id) as actual
FROM "Category" c
LEFT JOIN "Listing" l ON l."categoryId" = c.id
GROUP BY c.id, c.name, c."itemCount"
ORDER BY actual DESC;

-- Find categories with mismatched counts
SELECT c.name, c."itemCount" as stored, COUNT(l.id) as actual
FROM "Category" c
LEFT JOIN "Listing" l ON l."categoryId" = c.id
GROUP BY c.id, c.name, c."itemCount"
HAVING c."itemCount" != COUNT(l.id);

-- Get category hierarchy
WITH RECURSIVE CategoryTree AS (
  SELECT id, name, slug, "parentId", 0 as level
  FROM "Category"
  WHERE "parentId" IS NULL

  UNION ALL

  SELECT c.id, c.name, c.slug, c."parentId", ct.level + 1
  FROM "Category" c
  INNER JOIN CategoryTree ct ON c."parentId" = ct.id
)
SELECT * FROM CategoryTree ORDER BY level, name;
```
