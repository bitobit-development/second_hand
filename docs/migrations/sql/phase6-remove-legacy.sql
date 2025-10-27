-- =================================================================
-- PHASE 6: REMOVE LEGACY FIELD (OPTIONAL)
-- Drop legacyCategory field after migration fully verified
-- Runtime: <1 second
-- Downtime: ZERO (if app no longer uses legacyCategory)
-- WARNING: This is destructive and irreversible!
-- Only run after:
--   1. Application fully migrated to categoryId
--   2. Phase 5 completed and tested
--   3. 4+ weeks of stable production operation
--   4. Recent full database backup taken
-- =================================================================

BEGIN;

-- Final confirmation check
DO $$
DECLARE
  null_count INTEGER;
  category_count INTEGER;
BEGIN
  -- Verify all listings have categoryId
  SELECT COUNT(*) INTO null_count FROM "Listing" WHERE "categoryId" IS NULL;
  IF null_count > 0 THEN
    RAISE EXCEPTION 'ABORT: % listings have NULL categoryId!', null_count;
  END IF;

  -- Verify all categories exist
  SELECT COUNT(*) INTO category_count FROM "Category" WHERE "isActive" = true;
  IF category_count < 10 THEN
    RAISE WARNING 'WARNING: Only % active categories (expected at least 10)', category_count;
  END IF;

  RAISE NOTICE 'Pre-flight checks passed. Proceeding with legacy cleanup...';
END $$;

-- Drop indexes on legacy field
DROP INDEX IF EXISTS "Listing_legacyCategory_idx";
DROP INDEX IF EXISTS "Listing_status_legacyCategory_createdAt_idx";
DROP INDEX IF EXISTS "Listing_status_legacyCategory_province_idx";
DROP INDEX IF EXISTS "Listing_status_legacyCategory_condition_idx";

-- Drop the legacy column
ALTER TABLE "Listing" DROP COLUMN IF EXISTS "legacyCategory";

COMMIT;

-- Verification
DO $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Check if column still exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Listing' AND column_name = 'legacyCategory'
  ) INTO column_exists;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 6 Complete: Legacy Cleanup';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'legacyCategory column removed: %', NOT column_exists;
  RAISE NOTICE 'Legacy indexes dropped';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration is now COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE 'Current Listing schema:';
  RAISE NOTICE '  - categoryId: NOT NULL (required FK to Category)';
  RAISE NOTICE '  - legacyCategory: REMOVED';
  RAISE NOTICE '';
  RAISE NOTICE 'Database cleanup recommendations:';
  RAISE NOTICE '  1. VACUUM ANALYZE "Listing"; (reclaim space)';
  RAISE NOTICE '  2. REINDEX TABLE "Listing"; (rebuild indexes)';
  RAISE NOTICE '========================================';
END $$;
