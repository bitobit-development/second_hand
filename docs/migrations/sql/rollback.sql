-- =================================================================
-- ROLLBACK SCRIPT: Category Migration
-- Revert category migration back to original enum system
-- WARNING: Use only if critical issues found during migration
-- SAFE IF: legacyCategory field still exists with data
-- DESTRUCTIVE IF: legacyCategory field already dropped (Phase 6)
-- =================================================================

-- Check rollback safety
DO $$
DECLARE
  legacy_column_exists BOOLEAN;
  legacy_data_count INTEGER;
BEGIN
  -- Check if legacyCategory column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Listing' AND column_name = 'legacyCategory'
  ) INTO legacy_column_exists;

  IF NOT legacy_column_exists THEN
    RAISE EXCEPTION 'ABORT: legacyCategory column does not exist! Rollback impossible.';
  END IF;

  -- Check if legacy data exists
  SELECT COUNT(*) INTO legacy_data_count FROM "Listing" WHERE "legacyCategory" IS NOT NULL;

  RAISE NOTICE 'Rollback safety checks:';
  RAISE NOTICE '  legacyCategory column exists: %', legacy_column_exists;
  RAISE NOTICE '  Listings with legacy data: %', legacy_data_count;
  RAISE NOTICE '';

  IF legacy_data_count = 0 THEN
    RAISE WARNING 'WARNING: No legacyCategory data found. Attempting to restore from categoryId...';
  END IF;
END $$;

-- =================================================================
-- ROLLBACK PHASE 1: RESTORE LEGACY CATEGORY FROM CATEGORYID
-- =================================================================

BEGIN;

-- If legacyCategory is NULL, try to restore from categoryId
UPDATE "Listing" l
SET "legacyCategory" = CASE
  WHEN c.slug = 'electronics' THEN 'ELECTRONICS'::ListingCategory
  WHEN c.slug = 'clothing' THEN 'CLOTHING'::ListingCategory
  WHEN c.slug = 'home-garden' THEN 'HOME_GARDEN'::ListingCategory
  WHEN c.slug = 'sports' THEN 'SPORTS'::ListingCategory
  WHEN c.slug = 'books' THEN 'BOOKS'::ListingCategory
  WHEN c.slug = 'toys' THEN 'TOYS'::ListingCategory
  WHEN c.slug = 'vehicles' THEN 'VEHICLES'::ListingCategory
  WHEN c.slug = 'collectibles' THEN 'COLLECTIBLES'::ListingCategory
  WHEN c.slug = 'baby-kids' THEN 'BABY_KIDS'::ListingCategory
  WHEN c.slug = 'pet-supplies' THEN 'PET_SUPPLIES'::ListingCategory
  ELSE l."legacyCategory" -- Keep existing if no match
END
FROM "Category" c
WHERE l."categoryId" = c.id
  AND (l."legacyCategory" IS NULL OR l."legacyCategory" != CASE
    WHEN c.slug = 'electronics' THEN 'ELECTRONICS'::ListingCategory
    WHEN c.slug = 'clothing' THEN 'CLOTHING'::ListingCategory
    WHEN c.slug = 'home-garden' THEN 'HOME_GARDEN'::ListingCategory
    WHEN c.slug = 'sports' THEN 'SPORTS'::ListingCategory
    WHEN c.slug = 'books' THEN 'BOOKS'::ListingCategory
    WHEN c.slug = 'toys' THEN 'TOYS'::ListingCategory
    WHEN c.slug = 'vehicles' THEN 'VEHICLES'::ListingCategory
    WHEN c.slug = 'collectibles' THEN 'COLLECTIBLES'::ListingCategory
    WHEN c.slug = 'baby-kids' THEN 'BABY_KIDS'::ListingCategory
    WHEN c.slug = 'pet-supplies' THEN 'PET_SUPPLIES'::ListingCategory
  END);

COMMIT;

-- =================================================================
-- ROLLBACK PHASE 2: DROP NEW SCHEMA ELEMENTS
-- =================================================================

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

-- Rename legacyCategory back to category
ALTER TABLE "Listing" RENAME COLUMN "legacyCategory" TO "category";

-- Rename legacy indexes back to original names
ALTER INDEX IF EXISTS "Listing_legacyCategory_idx"
  RENAME TO "Listing_category_idx";
ALTER INDEX IF EXISTS "Listing_status_legacyCategory_createdAt_idx"
  RENAME TO "Listing_status_category_createdAt_idx";
ALTER INDEX IF EXISTS "Listing_status_legacyCategory_province_idx"
  RENAME TO "Listing_status_category_province_idx";
ALTER INDEX IF EXISTS "Listing_status_legacyCategory_condition_idx"
  RENAME TO "Listing_status_category_condition_idx";

-- Drop Category table (CASCADE removes FK constraints)
DROP TABLE IF EXISTS "Category" CASCADE;

COMMIT;

-- Verification
DO $$
DECLARE
  category_table_exists BOOLEAN;
  category_column_name TEXT;
  null_category_count INTEGER;
BEGIN
  -- Check if Category table still exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'Category'
  ) INTO category_table_exists;

  -- Check Listing.category column
  SELECT column_name INTO category_column_name
  FROM information_schema.columns
  WHERE table_name = 'Listing' AND column_name IN ('category', 'legacyCategory', 'categoryId')
  ORDER BY CASE column_name
    WHEN 'category' THEN 1
    WHEN 'legacyCategory' THEN 2
    WHEN 'categoryId' THEN 3
  END
  LIMIT 1;

  -- Check for NULL categories
  EXECUTE format('SELECT COUNT(*) FROM "Listing" WHERE "%s" IS NULL', category_column_name)
  INTO null_category_count;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ROLLBACK COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Category table removed: %', NOT category_table_exists;
  RAISE NOTICE 'Listing category column: %', category_column_name;
  RAISE NOTICE 'Listings with NULL category: %', null_category_count;
  RAISE NOTICE '';

  IF null_category_count > 0 THEN
    RAISE WARNING 'WARNING: % listings have NULL category! Manual intervention required.', null_category_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All listings restored to enum category system!';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Update Prisma schema to use enum category field';
  RAISE NOTICE '  2. Run: npx prisma db pull (sync schema)';
  RAISE NOTICE '  3. Run: npx prisma generate';
  RAISE NOTICE '  4. Deploy application code using enum';
  RAISE NOTICE '  5. Test thoroughly';
  RAISE NOTICE '========================================';
END $$;
