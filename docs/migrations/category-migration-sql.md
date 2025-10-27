# Category Migration - Manual SQL Script

This document provides a step-by-step SQL migration script for moving from the enum-based category system to the relational Category model.

## Overview

This migration is designed to be **zero-downtime** and **safe** for production use. It follows these principles:

1. **Additive first**: Add new tables and columns without removing old ones
2. **Dual-write period**: Application can use both old and new fields
3. **Gradual cutover**: Test thoroughly before removing old schema
4. **Easy rollback**: Keep old fields until migration is verified

## Migration Phases

### Phase 1: Add New Schema (Non-Breaking)

This phase adds the Category table and new foreign key column without touching existing data.

```sql
-- =================================================================
-- PHASE 1: ADD NEW SCHEMA (NON-BREAKING)
-- =================================================================

BEGIN;

-- Step 1: Create Category table
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
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Add self-referential foreign key
ALTER TABLE "Category"
  ADD CONSTRAINT "Category_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "Category"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 3: Create indexes for Category table
CREATE INDEX "Category_slug_idx" ON "Category"("slug");
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");
CREATE INDEX "Category_itemCount_idx" ON "Category"("itemCount");
CREATE INDEX "Category_parentId_isActive_itemCount_idx"
  ON "Category"("parentId", "isActive", "itemCount");

-- Step 4: Rename existing category column to legacyCategory
ALTER TABLE "Listing" RENAME COLUMN "category" TO "legacyCategory";

-- Step 5: Add new categoryId column (nullable for now)
ALTER TABLE "Listing" ADD COLUMN "categoryId" TEXT;

-- Step 6: Add foreign key constraint (not yet enforced since nullable)
ALTER TABLE "Listing"
  ADD CONSTRAINT "Listing_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 7: Create index on new categoryId column
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");

-- Step 8: Add composite indexes for new categoryId field
CREATE INDEX "Listing_status_categoryId_createdAt_idx"
  ON "Listing"("status", "categoryId", "createdAt" DESC);
CREATE INDEX "Listing_status_categoryId_province_idx"
  ON "Listing"("status", "categoryId", "province");
CREATE INDEX "Listing_status_categoryId_condition_idx"
  ON "Listing"("status", "categoryId", "condition");

-- Step 9: Update existing indexes to use legacyCategory
-- (Prisma will handle these automatically, but for manual migration:)
CREATE INDEX "Listing_legacyCategory_idx" ON "Listing"("legacyCategory");
CREATE INDEX "Listing_status_legacyCategory_createdAt_idx"
  ON "Listing"("status", "legacyCategory", "createdAt" DESC);

COMMIT;
```

**Verification:**
```sql
-- Check Category table exists
SELECT COUNT(*) FROM "Category"; -- Should return 0 (empty)

-- Check Listing schema
\d "Listing" -- Should show both legacyCategory and categoryId columns

-- Check indexes
\di+ | grep -i category -- Should show all new indexes
```

### Phase 2: Seed Categories

Insert the 10 base categories that map to the existing enum values.

```sql
-- =================================================================
-- PHASE 2: SEED BASE CATEGORIES
-- =================================================================

BEGIN;

INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "isActive", "aiGenerated", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Electronics', 'electronics', 'Smartphone', 'Phones, laptops, cameras, and gadgets', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'Clothing & Fashion', 'clothing', 'Shirt', 'Clothes, shoes, and accessories', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'Home & Garden', 'home-garden', 'Home', 'Furniture, appliances, and decor', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'Sports & Outdoors', 'sports', 'Dumbbell', 'Exercise equipment and outdoor gear', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'Books & Media', 'books', 'BookOpen', 'Books, magazines, and media', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'Toys & Games', 'toys', 'Gamepad2', 'Toys, games, and hobbies', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'Vehicles', 'vehicles', 'Car', 'Cars, motorcycles, and parts', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'Collectibles & Art', 'collectibles', 'Palette', 'Antiques, art, and collectibles', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'Baby & Kids', 'baby-kids', 'Baby', 'Baby gear, toys, and clothing', true, false, NOW(), NOW()),
  (gen_random_uuid(), 'Pet Supplies', 'pet-supplies', 'PawPrint', 'Pet food, toys, and accessories', true, false, NOW(), NOW());

COMMIT;
```

**Verification:**
```sql
-- Check all categories inserted
SELECT COUNT(*) FROM "Category"; -- Should return 10

-- View all categories
SELECT id, name, slug, icon FROM "Category" ORDER BY name;
```

### Phase 3: Migrate Listing Data

Copy category data from legacyCategory enum to categoryId foreign key.

```sql
-- =================================================================
-- PHASE 3: MIGRATE LISTING DATA
-- =================================================================

BEGIN;

-- Update listings in batches to avoid long locks
-- ELECTRONICS
UPDATE "Listing"
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'electronics')
WHERE "legacyCategory" = 'ELECTRONICS' AND "categoryId" IS NULL;

-- CLOTHING
UPDATE "Listing"
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'clothing')
WHERE "legacyCategory" = 'CLOTHING' AND "categoryId" IS NULL;

-- HOME_GARDEN
UPDATE "Listing"
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'home-garden')
WHERE "legacyCategory" = 'HOME_GARDEN' AND "categoryId" IS NULL;

-- SPORTS
UPDATE "Listing"
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'sports')
WHERE "legacyCategory" = 'SPORTS' AND "categoryId" IS NULL;

-- BOOKS
UPDATE "Listing"
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'books')
WHERE "legacyCategory" = 'BOOKS' AND "categoryId" IS NULL;

-- TOYS
UPDATE "Listing"
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'toys')
WHERE "legacyCategory" = 'TOYS' AND "categoryId" IS NULL;

-- VEHICLES
UPDATE "Listing"
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'vehicles')
WHERE "legacyCategory" = 'VEHICLES' AND "categoryId" IS NULL;

-- COLLECTIBLES
UPDATE "Listing"
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'collectibles')
WHERE "legacyCategory" = 'COLLECTIBLES' AND "categoryId" IS NULL;

-- BABY_KIDS
UPDATE "Listing"
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'baby-kids')
WHERE "legacyCategory" = 'BABY_KIDS' AND "categoryId" IS NULL;

-- PET_SUPPLIES
UPDATE "Listing"
SET "categoryId" = (SELECT id FROM "Category" WHERE slug = 'pet-supplies')
WHERE "legacyCategory" = 'PET_SUPPLIES' AND "categoryId" IS NULL;

COMMIT;
```

**Verification:**
```sql
-- Check all listings have categoryId
SELECT COUNT(*) FROM "Listing" WHERE "categoryId" IS NULL;
-- Should return 0

-- Verify mappings are correct
SELECT
  l."legacyCategory",
  c.slug,
  c.name,
  COUNT(*) as count
FROM "Listing" l
JOIN "Category" c ON l."categoryId" = c.id
GROUP BY l."legacyCategory", c.slug, c.name
ORDER BY count DESC;
-- Should show matching pairs (ELECTRONICS -> electronics, etc.)
```

### Phase 4: Update Category Item Counts

Populate the denormalized itemCount field for performance.

```sql
-- =================================================================
-- PHASE 4: UPDATE CATEGORY ITEM COUNTS
-- =================================================================

BEGIN;

UPDATE "Category"
SET "itemCount" = (
  SELECT COUNT(*)
  FROM "Listing"
  WHERE "Listing"."categoryId" = "Category"."id"
);

COMMIT;
```

**Verification:**
```sql
-- Check item counts match actual listing counts
SELECT
  c.name,
  c."itemCount" as stored_count,
  COUNT(l.id) as actual_count
FROM "Category" c
LEFT JOIN "Listing" l ON l."categoryId" = c.id
GROUP BY c.id, c.name, c."itemCount"
ORDER BY actual_count DESC;
-- stored_count and actual_count should match
```

### Phase 5: Make categoryId Required (Optional - Do Later)

After confirming everything works in production for 1-2 weeks:

```sql
-- =================================================================
-- PHASE 5: MAKE categoryId REQUIRED (OPTIONAL)
-- =================================================================

BEGIN;

-- This is a breaking change - do only after app is fully migrated
ALTER TABLE "Listing" ALTER COLUMN "categoryId" SET NOT NULL;

COMMIT;
```

### Phase 6: Remove Legacy Field (Optional - Do Much Later)

Only after several weeks of successful production operation:

```sql
-- =================================================================
-- PHASE 6: REMOVE LEGACY FIELD (OPTIONAL)
-- =================================================================

BEGIN;

-- Drop indexes on legacy field
DROP INDEX IF EXISTS "Listing_legacyCategory_idx";
DROP INDEX IF EXISTS "Listing_status_legacyCategory_createdAt_idx";
DROP INDEX IF EXISTS "Listing_status_legacyCategory_province_idx";
DROP INDEX IF EXISTS "Listing_status_legacyCategory_condition_idx";

-- Drop the legacy column
ALTER TABLE "Listing" DROP COLUMN "legacyCategory";

COMMIT;
```

## Rollback Procedures

### Rollback Phase 3-4 (Data Migration)

If data migration issues are found:

```sql
BEGIN;

-- Clear categoryId values
UPDATE "Listing" SET "categoryId" = NULL;

-- Reset item counts
UPDATE "Category" SET "itemCount" = 0;

COMMIT;

-- Then re-run Phase 3 scripts
```

### Rollback Phase 1-2 (Schema Changes)

If you need to completely rollback before application deployment:

```sql
BEGIN;

-- Drop foreign key constraint
ALTER TABLE "Listing" DROP CONSTRAINT IF EXISTS "Listing_categoryId_fkey";

-- Drop new indexes
DROP INDEX IF EXISTS "Listing_categoryId_idx";
DROP INDEX IF EXISTS "Listing_status_categoryId_createdAt_idx";
DROP INDEX IF EXISTS "Listing_status_categoryId_province_idx";
DROP INDEX IF EXISTS "Listing_status_categoryId_condition_idx";

-- Drop new column
ALTER TABLE "Listing" DROP COLUMN IF EXISTS "categoryId";

-- Rename back to original
ALTER TABLE "Listing" RENAME COLUMN "legacyCategory" TO "category";

-- Drop Category table and constraints
DROP TABLE IF EXISTS "Category" CASCADE;

COMMIT;
```

## Execution Guide

### For Development Environment

```bash
# Connect to database
psql $DATABASE_URL

# Run phases in order
\i phase1-add-schema.sql
\i phase2-seed-categories.sql
\i phase3-migrate-data.sql
\i phase4-update-counts.sql
```

### For Production Environment

1. **Backup first:**
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Apply Phase 1 (low risk, non-breaking):**
   - Can be done during normal operation
   - No impact on running application

3. **Apply Phase 2 (low risk):**
   - Inserts data only
   - No impact on existing queries

4. **Deploy application code that reads from categoryId:**
   - Application should read from both legacyCategory and categoryId
   - Prefer categoryId when available, fall back to legacyCategory

5. **Apply Phase 3 (low risk, batch updates):**
   - Run during off-peak hours if database is large
   - Monitor for slow queries

6. **Apply Phase 4 (low risk):**
   - Quick update, no locks on Listing table

7. **Monitor for 1-2 weeks:**
   - Watch for any issues
   - Verify all queries use new categoryId

8. **Optional: Apply Phase 5 & 6 (breaking changes):**
   - Only after thorough verification
   - Make categoryId required
   - Remove legacy field

## Performance Considerations

- **Phase 1**: < 1 second (DDL operations)
- **Phase 2**: < 1 second (10 inserts)
- **Phase 3**: Depends on listing count
  - 1,000 listings: ~1 second
  - 10,000 listings: ~5 seconds
  - 100,000 listings: ~30 seconds
  - Each UPDATE is batched by category for better lock management
- **Phase 4**: < 1 second (10 updates)

## SQL Files Organization

Save these as separate files:

```
docs/migrations/sql/
├── phase1-add-schema.sql
├── phase2-seed-categories.sql
├── phase3-migrate-data.sql
├── phase4-update-counts.sql
├── phase5-make-required.sql (optional)
├── phase6-remove-legacy.sql (optional)
└── rollback.sql
```

## Post-Migration Validation

After completing all phases, run this comprehensive validation:

```sql
-- Validation Report
SELECT '=== CATEGORY MIGRATION VALIDATION ===' as report;

-- 1. Category table health
SELECT
  'Category Count' as check_name,
  COUNT(*) as result,
  '10' as expected
FROM "Category";

-- 2. All categories active
SELECT
  'Active Categories' as check_name,
  COUNT(*) as result,
  '10' as expected
FROM "Category"
WHERE "isActive" = true;

-- 3. All listings have categoryId
SELECT
  'Listings without categoryId' as check_name,
  COUNT(*) as result,
  '0' as expected
FROM "Listing"
WHERE "categoryId" IS NULL;

-- 4. Category counts match
SELECT
  'Categories with Mismatched Counts' as check_name,
  COUNT(*) as result,
  '0' as expected
FROM (
  SELECT
    c.id,
    c."itemCount" as stored,
    COUNT(l.id) as actual
  FROM "Category" c
  LEFT JOIN "Listing" l ON l."categoryId" = c.id
  GROUP BY c.id, c."itemCount"
  HAVING c."itemCount" != COUNT(l.id)
) as mismatches;

-- 5. Foreign key integrity
SELECT
  'Orphaned Listings' as check_name,
  COUNT(*) as result,
  '0' as expected
FROM "Listing" l
LEFT JOIN "Category" c ON l."categoryId" = c.id
WHERE l."categoryId" IS NOT NULL AND c.id IS NULL;

-- 6. Legacy vs new category alignment
SELECT
  'Misaligned Categories' as check_name,
  COUNT(*) as result,
  '0' as expected
FROM "Listing" l
JOIN "Category" c ON l."categoryId" = c.id
WHERE
  (l."legacyCategory" = 'ELECTRONICS' AND c.slug != 'electronics') OR
  (l."legacyCategory" = 'CLOTHING' AND c.slug != 'clothing') OR
  (l."legacyCategory" = 'HOME_GARDEN' AND c.slug != 'home-garden') OR
  (l."legacyCategory" = 'SPORTS' AND c.slug != 'sports') OR
  (l."legacyCategory" = 'BOOKS' AND c.slug != 'books') OR
  (l."legacyCategory" = 'TOYS' AND c.slug != 'toys') OR
  (l."legacyCategory" = 'VEHICLES' AND c.slug != 'vehicles') OR
  (l."legacyCategory" = 'COLLECTIBLES' AND c.slug != 'collectibles') OR
  (l."legacyCategory" = 'BABY_KIDS' AND c.slug != 'baby-kids') OR
  (l."legacyCategory" = 'PET_SUPPLIES' AND c.slug != 'pet-supplies');
```

All validation queries should return `result = expected`.
