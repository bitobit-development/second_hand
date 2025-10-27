-- =================================================================
-- PHASE 4: UPDATE CATEGORY ITEM COUNTS
-- Populate denormalized itemCount field for performance
-- Runtime: <1 second
-- Downtime: ZERO (updates Category table only)
-- =================================================================

BEGIN;

-- Update itemCount for all categories based on actual listing counts
UPDATE "Category"
SET "itemCount" = (
  SELECT COUNT(*)
  FROM "Listing"
  WHERE "Listing"."categoryId" = "Category"."id"
);

COMMIT;

-- Verification and reporting
DO $$
DECLARE
  category_stats TEXT;
  total_listings INTEGER;
  total_counted INTEGER;
BEGIN
  -- Sum actual listings
  SELECT COUNT(*) INTO total_listings FROM "Listing" WHERE "categoryId" IS NOT NULL;

  -- Sum category item counts
  SELECT SUM("itemCount") INTO total_counted FROM "Category";

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 4 Item Count Summary';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total listings:        %', total_listings;
  RAISE NOTICE 'Total counted:         %', total_counted;
  RAISE NOTICE 'Match:                 %', (total_listings = total_counted);
  RAISE NOTICE '';

  IF total_listings != total_counted THEN
    RAISE WARNING 'WARNING: Item counts do not match! Investigate discrepancies.';
  END IF;

  RAISE NOTICE 'Category item counts:';
  FOR category_stats IN
    SELECT
      name || ' (' || slug || '): ' || "itemCount" || ' listings' as info
    FROM "Category"
    ORDER BY "itemCount" DESC, name
  LOOP
    RAISE NOTICE '  %', category_stats;
  END LOOP;
  RAISE NOTICE '========================================';

  -- Check for mismatches
  RAISE NOTICE '';
  RAISE NOTICE 'Verifying itemCount accuracy:';
  FOR category_stats IN
    SELECT
      c.name || ': stored=' || c."itemCount" || ', actual=' || COUNT(l.id) as info
    FROM "Category" c
    LEFT JOIN "Listing" l ON l."categoryId" = c.id
    GROUP BY c.id, c.name, c."itemCount"
    HAVING c."itemCount" != COUNT(l.id)
  LOOP
    RAISE WARNING 'MISMATCH: %', category_stats;
  END LOOP;

  IF NOT FOUND THEN
    RAISE NOTICE 'SUCCESS: All itemCounts match actual listing counts!';
  END IF;
END $$;
