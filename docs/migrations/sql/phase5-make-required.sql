-- =================================================================
-- PHASE 5: MAKE categoryId REQUIRED (OPTIONAL)
-- Make categoryId NOT NULL after verifying all data migrated
-- Runtime: <1 second
-- Downtime: ZERO (if all listings have categoryId)
-- WARNING: This is a breaking change. Only run after:
--   1. All listings have valid categoryId (verified)
--   2. Application code fully migrated to use categoryId
--   3. Tested in production for 1-2 weeks
-- =================================================================

BEGIN;

-- Pre-flight check: Ensure no NULL values exist
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count FROM "Listing" WHERE "categoryId" IS NULL;

  IF null_count > 0 THEN
    RAISE EXCEPTION 'ABORT: % listings have NULL categoryId. Cannot make column required!', null_count;
  END IF;

  RAISE NOTICE 'Pre-flight check passed: All listings have valid categoryId';
END $$;

-- Make categoryId required
ALTER TABLE "Listing" ALTER COLUMN "categoryId" SET NOT NULL;

COMMIT;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 5 Complete';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'categoryId is now REQUIRED on Listing table';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Monitor application for any errors';
  RAISE NOTICE '  2. After 2-4 weeks of stable operation:';
  RAISE NOTICE '     - Run phase6-remove-legacy.sql to clean up';
  RAISE NOTICE '========================================';
END $$;
