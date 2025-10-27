-- ============================================================================
-- COMBINED PRODUCTION MIGRATION SCRIPT
-- Run this in Neon SQL Editor to apply all pending migrations
-- ============================================================================

-- MIGRATION 1: Auth Tokens
-- ============================================================================

-- Create VerificationToken table
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- Create PasswordResetToken table
CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- Create indexes for VerificationToken
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE INDEX IF NOT EXISTS "VerificationToken_userId_idx" ON "VerificationToken"("userId");
CREATE INDEX IF NOT EXISTS "VerificationToken_token_idx" ON "VerificationToken"("token");
CREATE INDEX IF NOT EXISTS "VerificationToken_expiresAt_idx" ON "VerificationToken"("expiresAt");

-- Create indexes for PasswordResetToken
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- Add foreign keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'VerificationToken_userId_fkey'
    ) THEN
        ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'PasswordResetToken_userId_fkey'
    ) THEN
        ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- MIGRATION 2: Admin Audit System
-- ============================================================================

-- CreateEnum for AdminAction
DO $$ BEGIN
    CREATE TYPE "AdminAction" AS ENUM (
        'APPROVE_LISTING',
        'REJECT_LISTING',
        'PAUSE_LISTING',
        'RESTORE_LISTING',
        'DELETE_LISTING',
        'CREATE_USER',
        'UPDATE_USER',
        'DELETE_USER',
        'UPDATE_USER_ROLE',
        'BAN_USER',
        'UNBAN_USER',
        'CREATE_CATEGORY',
        'UPDATE_CATEGORY',
        'MERGE_CATEGORIES',
        'DELETE_CATEGORY',
        'TOGGLE_CATEGORY_STATUS',
        'UPDATE_SETTINGS',
        'VIEW_AUDIT_LOG',
        'EXPORT_DATA'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum for AuditTargetType
DO $$ BEGIN
    CREATE TYPE "AuditTargetType" AS ENUM (
        'LISTING',
        'USER',
        'CATEGORY',
        'TRANSACTION',
        'SYSTEM'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable AdminAuditLog
CREATE TABLE IF NOT EXISTS "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "AdminAction" NOT NULL,
    "targetType" "AuditTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for AdminAuditLog
CREATE INDEX IF NOT EXISTS "AdminAuditLog_userId_idx" ON "AdminAuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_targetType_idx" ON "AdminAuditLog"("targetType");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_targetId_idx" ON "AdminAuditLog"("targetId");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_userId_action_idx" ON "AdminAuditLog"("userId", "action");
CREATE INDEX IF NOT EXISTS "AdminAuditLog_targetType_targetId_idx" ON "AdminAuditLog"("targetType", "targetId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AdminAuditLog_userId_fkey'
    ) THEN
        ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- MIGRATION 3: Listing Indexes
-- ============================================================================

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

-- MIGRATION 4: Category Model (CRITICAL - Fixes categoryId error)
-- ============================================================================

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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Category_parentId_fkey'
    ) THEN
        ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey"
            FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Add categoryId column to Listing (nullable for backward compatibility)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Listing' AND column_name = 'categoryId'
    ) THEN
        ALTER TABLE "Listing" ADD COLUMN "categoryId" TEXT;
    END IF;
END $$;

-- CreateIndex for Listing.categoryId
CREATE INDEX IF NOT EXISTS "Listing_categoryId_idx" ON "Listing"("categoryId");

-- AddForeignKey for Listing.categoryId
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Listing_categoryId_fkey'
    ) THEN
        ALTER TABLE "Listing" ADD CONSTRAINT "Listing_categoryId_fkey"
            FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Uncomment these to verify the migration was successful:

-- Check if categoryId column exists
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'Listing' AND column_name = 'categoryId';

-- Check if Category table exists
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'Category';

-- Count tables created
-- SELECT COUNT(*) FROM information_schema.tables
-- WHERE table_name IN ('Category', 'AdminAuditLog', 'VerificationToken', 'PasswordResetToken');

-- ============================================================================
-- SUCCESS!
-- All migrations have been applied to the production database.
-- You can now create listings without the categoryId error.
-- ============================================================================
