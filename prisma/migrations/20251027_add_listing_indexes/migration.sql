-- Drop old indexes
DROP INDEX IF EXISTS "Listing_status_category_idx";
DROP INDEX IF EXISTS "Listing_status_createdAt_idx";

-- Create new composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS "Listing_status_category_createdAt_idx"
    ON "Listing"("status", "category", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Listing_status_province_createdAt_idx"
    ON "Listing"("status", "province", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Listing_status_pricingType_createdAt_idx"
    ON "Listing"("status", "pricingType", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Listing_status_condition_createdAt_idx"
    ON "Listing"("status", "condition", "createdAt" DESC);

-- Price range query optimization
CREATE INDEX IF NOT EXISTS "Listing_status_price_idx"
    ON "Listing"("status", "price");

-- Multi-filter scenarios
CREATE INDEX IF NOT EXISTS "Listing_status_category_province_idx"
    ON "Listing"("status", "category", "province");

CREATE INDEX IF NOT EXISTS "Listing_status_category_condition_idx"
    ON "Listing"("status", "category", "condition");
