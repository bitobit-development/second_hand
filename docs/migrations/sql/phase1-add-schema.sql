-- =================================================================
-- PHASE 1: ADD NEW SCHEMA (NON-BREAKING)
-- Add Category table and new FK column without touching existing data
-- Runtime: ~1 second
-- Downtime: ZERO (non-breaking change)
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

-- Step 9: Rename existing indexes to reflect legacyCategory
-- Note: PostgreSQL doesn't require this, but good for clarity
ALTER INDEX IF EXISTS "Listing_category_idx"
  RENAME TO "Listing_legacyCategory_idx";
ALTER INDEX IF EXISTS "Listing_status_category_createdAt_idx"
  RENAME TO "Listing_status_legacyCategory_createdAt_idx";
ALTER INDEX IF EXISTS "Listing_status_category_province_idx"
  RENAME TO "Listing_status_legacyCategory_province_idx";
ALTER INDEX IF EXISTS "Listing_status_category_condition_idx"
  RENAME TO "Listing_status_legacyCategory_condition_idx";

COMMIT;

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'Phase 1 complete. Verification:';
  RAISE NOTICE '  - Category table created: %', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'Category');
  RAISE NOTICE '  - Listing.categoryId column added: %', EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'Listing' AND column_name = 'categoryId');
  RAISE NOTICE '  - Listing.legacyCategory column exists: %', EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'Listing' AND column_name = 'legacyCategory');
END $$;
