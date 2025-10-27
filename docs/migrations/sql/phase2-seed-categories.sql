-- =================================================================
-- PHASE 2: SEED BASE CATEGORIES
-- Insert 10 base categories that map to existing enum values
-- Runtime: <1 second
-- Downtime: ZERO (inserts only, no schema changes)
-- =================================================================

BEGIN;

-- Insert 10 base categories matching the original ListingCategory enum
INSERT INTO "Category" ("id", "name", "slug", "icon", "description", "isActive", "aiGenerated", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Electronics', 'electronics', 'Smartphone', 'Phones, laptops, cameras, and gadgets', true, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Clothing & Fashion', 'clothing', 'Shirt', 'Clothes, shoes, and accessories', true, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Home & Garden', 'home-garden', 'Home', 'Furniture, appliances, and decor', true, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Sports & Outdoors', 'sports', 'Dumbbell', 'Exercise equipment and outdoor gear', true, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Books & Media', 'books', 'BookOpen', 'Books, magazines, and media', true, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Toys & Games', 'toys', 'Gamepad2', 'Toys, games, and hobbies', true, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Vehicles', 'vehicles', 'Car', 'Cars, motorcycles, and parts', true, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Collectibles & Art', 'collectibles', 'Palette', 'Antiques, art, and collectibles', true, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Baby & Kids', 'baby-kids', 'Baby', 'Baby gear, toys, and clothing', true, false, NOW(), NOW()),
  (gen_random_uuid()::text, 'Pet Supplies', 'pet-supplies', 'PawPrint', 'Pet food, toys, and accessories', true, false, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING; -- Make idempotent

COMMIT;

-- Verification and reporting
DO $$
DECLARE
  category_count INTEGER;
  listing_distribution TEXT;
BEGIN
  -- Count categories
  SELECT COUNT(*) INTO category_count FROM "Category";
  RAISE NOTICE 'Categories created: %', category_count;

  -- Show category distribution
  RAISE NOTICE '';
  RAISE NOTICE 'Category mapping (legacy enum -> new category):';
  FOR listing_distribution IN
    SELECT
      c.slug || ' (' || c.name || ') - ID: ' || c.id as info
    FROM "Category" c
    ORDER BY c.name
  LOOP
    RAISE NOTICE '  %', listing_distribution;
  END LOOP;

  -- Show existing listing counts by legacy category
  RAISE NOTICE '';
  RAISE NOTICE 'Existing listings by legacy category:';
  FOR listing_distribution IN
    SELECT
      "legacyCategory" || ': ' || COUNT(*) || ' listings' as info
    FROM "Listing"
    GROUP BY "legacyCategory"
    ORDER BY COUNT(*) DESC
  LOOP
    RAISE NOTICE '  %', listing_distribution;
  END LOOP;
END $$;
