-- AlterTable
-- Add AI tracking fields to Listing table
-- These fields track AI-enhanced features usage for analytics

ALTER TABLE "Listing" ADD COLUMN "aiEnhancedImages" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Listing" ADD COLUMN "aiGeneratedDesc" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Listing" ADD COLUMN "originalImages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
