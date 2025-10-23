/**
 * AI-Powered Image Enhancement Utility
 *
 * Uses Cloudinary's AI background removal and professional image processing
 * to enhance product images with:
 * - Background removal using AI
 * - White background replacement
 * - Square padding to 1000x1000px
 * - Auto quality and format optimization
 */

import { isCloudinaryUrl, generateEnhancedUrl } from "../cloudinary";
import type { EnhancedImageResult, EnhancementError } from "./types";

/**
 * Enhance product image with AI background removal and professional formatting
 *
 * @param imageUrl - Original Cloudinary image URL
 * @returns Enhanced image result with transformation URL
 * @throws Error if URL is invalid or not from Cloudinary
 *
 * @example
 * const result = await enhanceProductImage(
 *   "https://res.cloudinary.com/doiyoqble/image/upload/v1234/product.jpg"
 * );
 * // Returns enhanced URL with background removed and white background added
 */
export async function enhanceProductImage(
  imageUrl: string
): Promise<EnhancedImageResult> {
  // Validate input URL
  if (!imageUrl || typeof imageUrl !== "string") {
    const error: EnhancementError = {
      code: "INVALID_URL",
      message: "Image URL must be a non-empty string",
    };
    throw new Error(JSON.stringify(error));
  }

  // Validate it's a Cloudinary URL
  if (!isCloudinaryUrl(imageUrl)) {
    const error: EnhancementError = {
      code: "NOT_CLOUDINARY",
      message: "Image URL must be from Cloudinary domain (res.cloudinary.com)",
    };
    throw new Error(JSON.stringify(error));
  }

  try {
    // Generate enhanced URL with AI transformations
    const enhancedUrl = generateEnhancedUrl(imageUrl);

    // Return structured result
    const result: EnhancedImageResult = {
      originalUrl: imageUrl,
      enhancedUrl: enhancedUrl,
      width: 1000,
      height: 1000,
      format: "auto", // Will be auto-selected by Cloudinary (WebP, AVIF, etc.)
    };

    return result;
  } catch (error) {
    const enhancementError: EnhancementError = {
      code: "ENHANCEMENT_FAILED",
      message: error instanceof Error ? error.message : "Failed to enhance image",
    };
    throw new Error(JSON.stringify(enhancementError));
  }
}

/**
 * Batch enhance multiple product images
 *
 * @param imageUrls - Array of Cloudinary image URLs
 * @returns Array of enhanced image results
 */
export async function enhanceProductImages(
  imageUrls: string[]
): Promise<EnhancedImageResult[]> {
  const enhancePromises = imageUrls.map((url) => enhanceProductImage(url));
  return Promise.all(enhancePromises);
}
