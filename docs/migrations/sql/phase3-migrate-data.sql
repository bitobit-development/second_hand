-- =================================================================
-- PHASE 3: MIGRATE LISTING DATA
-- Copy category data from legacyCategory enum to categoryId FK
-- Runtime: ~1-5 seconds per 1000 listings
-- Downtime: ZERO (updates only, app still uses legacyCategory)
-- Recommendation: Run during off-peak hours for large databases
-- =================================================================

BEGIN;

-- Update listings in batches by category to avoid long locks
-- Each UPDATE processes all listings of one category type

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

-- Verification
DO $$
DECLARE
  total_listings INTEGER;
  migrated_listings INTEGER;
  unmigrated_listings INTEGER;
  migration_summary TEXT;
BEGIN
  -- Count totals
  SELECT COUNT(*) INTO total_listings FROM "Listing";
  SELECT COUNT(*) INTO migrated_listings FROM "Listing" WHERE "categoryId" IS NOT NULL;
  SELECT COUNT(*) INTO unmigrated_listings FROM "Listing" WHERE "categoryId" IS NULL;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 3 Migration Summary';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total listings:      %', total_listings;
  RAISE NOTICE 'Migrated:            %', migrated_listings;
  RAISE NOTICE 'Unmigrated:          %', unmigrated_listings;
  RAISE NOTICE '';

  IF unmigrated_listings > 0 THEN
    RAISE WARNING 'WARNING: % listings still have NULL categoryId!', unmigrated_listings;
    RAISE NOTICE 'Check legacyCategory values for unmigrated listings:';
    FOR migration_summary IN
      SELECT "legacyCategory" || ': ' || COUNT(*) || ' listings' as info
      FROM "Listing"
      WHERE "categoryId" IS NULL
      GROUP BY "legacyCategory"
    LOOP
      RAISE NOTICE '  %', migration_summary;
    END LOOP;
  ELSE
    RAISE NOTICE 'SUCCESS: All listings migrated to new category system!';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE 'Migration verification by category:';
  FOR migration_summary IN
    SELECT
      l."legacyCategory" || ' -> ' || c.slug || ' (' || c.name || '): ' || COUNT(*) || ' listings' as info
    FROM "Listing" l
    JOIN "Category" c ON l."categoryId" = c.id
    GROUP BY l."legacyCategory", c.slug, c.name
    ORDER BY COUNT(*) DESC
  LOOP
    RAISE NOTICE '  %', migration_summary;
  END LOOP;
  RAISE NOTICE '========================================';
END $$;
