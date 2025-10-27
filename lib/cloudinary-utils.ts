/**
 * Cloudinary URL Transformation Utilities
 *
 * Client-safe utilities for transforming Cloudinary URLs without importing
 * the Cloudinary SDK (which requires Node.js fs module).
 */

/**
 * Validate if URL is from Cloudinary domain
 */
export function isCloudinaryUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("res.cloudinary.com");
  } catch {
    return false;
  }
}

/**
 * Generate square AI-cropped URL (1000x1000) from any Cloudinary URL
 * Uses smart cropping with g_auto to detect and center the main subject
 *
 * @param originalUrl - Any Cloudinary image URL
 * @returns Square-cropped URL (1000x1000)
 *
 * @example
 * getSquareUrl("https://res.cloudinary.com/.../v1234/product.jpg")
 * // Returns: "https://res.cloudinary.com/.../w_1000,h_1000,c_fill,g_auto/v1234/product.jpg"
 */
export function getSquareUrl(originalUrl: string): string {
  if (!isCloudinaryUrl(originalUrl)) {
    // Return original URL if not from Cloudinary
    return originalUrl;
  }

  try {
    const urlObj = new URL(originalUrl);
    const pathname = urlObj.pathname;

    // Define square transformation with AI smart crop
    const transformation = "w_1000,h_1000,c_fill,g_auto,q_auto:good,f_auto";

    // Check if URL already has transformations
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) {
      return originalUrl;
    }

    // Insert transformations after /upload/
    const beforeUpload = pathname.substring(0, uploadIndex + 8); // Include "/upload/"
    const afterUpload = pathname.substring(uploadIndex + 8);

    // Remove existing transformations if any (everything before version number)
    const versionMatch = afterUpload.match(/(v\d+\/.+)$/);
    const pathAfterTransformations = versionMatch ? versionMatch[1] : afterUpload;

    // Construct square URL
    const squarePathname = `${beforeUpload}${transformation}/${pathAfterTransformations}`;

    return `${urlObj.protocol}//${urlObj.hostname}${squarePathname}`;
  } catch (error) {
    console.error("Failed to generate square URL:", error);
    return originalUrl; // Fallback to original
  }
}

/**
 * Generate portrait AI-cropped URL (3:4 ratio, 750x1000) from any Cloudinary URL
 *
 * @param originalUrl - Any Cloudinary image URL
 * @returns Portrait-cropped URL (750x1000)
 */
export function getPortraitUrl(originalUrl: string): string {
  if (!isCloudinaryUrl(originalUrl)) {
    return originalUrl;
  }

  try {
    const urlObj = new URL(originalUrl);
    const pathname = urlObj.pathname;

    const transformation = "w_750,h_1000,c_fill,g_auto,q_auto:good,f_auto";

    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) {
      return originalUrl;
    }

    const beforeUpload = pathname.substring(0, uploadIndex + 8);
    const afterUpload = pathname.substring(uploadIndex + 8);

    const versionMatch = afterUpload.match(/(v\d+\/.+)$/);
    const pathAfterTransformations = versionMatch ? versionMatch[1] : afterUpload;

    const portraitPathname = `${beforeUpload}${transformation}/${pathAfterTransformations}`;

    return `${urlObj.protocol}//${urlObj.hostname}${portraitPathname}`;
  } catch (error) {
    console.error("Failed to generate portrait URL:", error);
    return originalUrl;
  }
}

/**
 * Generate thumbnail URL (400x400) from any Cloudinary URL
 *
 * @param originalUrl - Any Cloudinary image URL
 * @returns Thumbnail URL (400x400)
 */
export function getThumbnailUrl(originalUrl: string): string {
  if (!isCloudinaryUrl(originalUrl)) {
    return originalUrl;
  }

  try {
    const urlObj = new URL(originalUrl);
    const pathname = urlObj.pathname;

    const transformation = "w_400,h_400,c_fill,g_auto,q_auto:good,f_auto";

    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) {
      return originalUrl;
    }

    const beforeUpload = pathname.substring(0, uploadIndex + 8);
    const afterUpload = pathname.substring(uploadIndex + 8);

    const versionMatch = afterUpload.match(/(v\d+\/.+)$/);
    const pathAfterTransformations = versionMatch ? versionMatch[1] : afterUpload;

    const thumbnailPathname = `${beforeUpload}${transformation}/${pathAfterTransformations}`;

    return `${urlObj.protocol}//${urlObj.hostname}${thumbnailPathname}`;
  } catch (error) {
    console.error("Failed to generate thumbnail URL:", error);
    return originalUrl;
  }
}
