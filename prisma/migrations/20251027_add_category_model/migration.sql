-- CreateTable Category
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for Category
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "Category_slug_idx" ON "Category"("slug");
CREATE INDEX IF NOT EXISTS "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX IF NOT EXISTS "Category_isActive_idx" ON "Category"("isActive");
CREATE INDEX IF NOT EXISTS "Category_aiGenerated_idx" ON "Category"("aiGenerated");
CREATE INDEX IF NOT EXISTS "Category_itemCount_idx" ON "Category"("itemCount");

-- AddForeignKey for Category self-reference
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add categoryId column to Listing (nullable for backward compatibility)
ALTER TABLE "Listing" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- CreateIndex for Listing.categoryId
CREATE INDEX IF NOT EXISTS "Listing_categoryId_idx" ON "Listing"("categoryId");

-- AddForeignKey for Listing.categoryId
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
