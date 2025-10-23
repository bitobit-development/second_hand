import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Upload image to Cloudinary
 * @param file - Base64 string or file path
 * @param folder - Cloudinary folder (default: "listings")
 * @returns Upload result with URL and metadata
 */
export async function uploadImage(
  file: string,
  folder: string = "listings"
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `second-hand/${folder}`,
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Upload multiple images in batch
 */
export async function uploadImages(
  files: string[],
  folder: string = "listings"
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Failed to delete image");
  }
}

/**
 * Delete multiple images in batch
 */
export async function deleteImages(publicIds: string[]): Promise<void> {
  const deletePromises = publicIds.map((id) => deleteImage(id));
  await Promise.all(deletePromises);
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}
): string {
  const {
    width = 800,
    height = 800,
    crop = "limit",
    quality = "auto:good",
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop },
      { quality },
      { fetch_format: "auto" },
    ],
  });
}

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
 * Extract public ID from Cloudinary URL
 *
 * @example
 * extractPublicId("https://res.cloudinary.com/doiyoqble/image/upload/v1234/second-hand/listings/product.jpg")
 * // Returns: "second-hand/listings/product"
 */
export function extractPublicId(url: string): string {
  if (!isCloudinaryUrl(url)) {
    throw new Error("URL is not from Cloudinary domain");
  }

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Pattern: /cloud_name/image/upload/v{version}/{public_id}.{format}
    // or: /cloud_name/image/upload/{transformations}/v{version}/{public_id}.{format}
    const uploadMatch = pathname.match(/\/upload\/(?:.*?\/)?v\d+\/(.+)$/);
    if (uploadMatch) {
      const pathWithExtension = uploadMatch[1];
      // Remove file extension
      return pathWithExtension.replace(/\.[^/.]+$/, "");
    }

    // Fallback: Extract everything after /upload/
    const fallbackMatch = pathname.match(/\/upload\/(.+)$/);
    if (fallbackMatch) {
      const pathWithExtension = fallbackMatch[1];
      return pathWithExtension.replace(/\.[^/.]+$/, "");
    }

    throw new Error("Could not extract public ID from Cloudinary URL");
  } catch (error) {
    throw new Error(
      `Failed to extract public ID: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generate enhanced URL with AI background removal and professional formatting
 *
 * Transformations applied:
 * - e_background_removal: Remove background using AI
 * - b_white: Add white background
 * - c_pad,w_1000,h_1000: Pad to square 1000x1000px
 * - q_auto:best: Auto quality optimization
 * - f_auto: Auto format selection (WebP, AVIF, etc.)
 *
 * @example
 * generateEnhancedUrl("https://res.cloudinary.com/doiyoqble/image/upload/v1234/product.jpg")
 * // Returns: "https://res.cloudinary.com/doiyoqble/image/upload/e_background_removal,b_white,c_pad,w_1000,h_1000,q_auto:best,f_auto/v1234/product.jpg"
 */
export function generateEnhancedUrl(originalUrl: string): string {
  if (!isCloudinaryUrl(originalUrl)) {
    throw new Error("URL must be from Cloudinary domain");
  }

  try {
    const urlObj = new URL(originalUrl);
    const pathname = urlObj.pathname;

    // Define AI enhancement transformations
    const transformations =
      "e_background_removal,b_white,c_pad,w_1000,h_1000,q_auto:best,f_auto";

    // Check if URL already has transformations
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) {
      throw new Error("Invalid Cloudinary URL format");
    }

    // Insert transformations after /upload/
    const beforeUpload = pathname.substring(0, uploadIndex + 8); // Include "/upload/"
    const afterUpload = pathname.substring(uploadIndex + 8);

    // Remove existing transformations if any (everything before version number)
    const versionMatch = afterUpload.match(/(v\d+\/.+)$/);
    const pathAfterTransformations = versionMatch ? versionMatch[1] : afterUpload;

    // Construct enhanced URL
    const enhancedPathname = `${beforeUpload}${transformations}/${pathAfterTransformations}`;

    return `${urlObj.protocol}//${urlObj.hostname}${enhancedPathname}`;
  } catch (error) {
    throw new Error(
      `Failed to generate enhanced URL: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Revert enhanced URL back to original URL (remove transformations)
 *
 * @example
 * revertToOriginal("https://res.cloudinary.com/doiyoqble/image/upload/e_background_removal,b_white/v1234/product.jpg")
 * // Returns: "https://res.cloudinary.com/doiyoqble/image/upload/v1234/product.jpg"
 */
export function revertToOriginal(enhancedUrl: string): string {
  if (!isCloudinaryUrl(enhancedUrl)) {
    throw new Error("URL must be from Cloudinary domain");
  }

  try {
    const urlObj = new URL(enhancedUrl);
    const pathname = urlObj.pathname;

    // Find /upload/ and version pattern
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) {
      throw new Error("Invalid Cloudinary URL format");
    }

    const beforeUpload = pathname.substring(0, uploadIndex + 8);
    const afterUpload = pathname.substring(uploadIndex + 8);

    // Extract path after transformations (starting with version)
    const versionMatch = afterUpload.match(/(v\d+\/.+)$/);
    if (!versionMatch) {
      // No version found, might already be original
      return enhancedUrl;
    }

    const originalPathname = beforeUpload + versionMatch[1];

    return `${urlObj.protocol}//${urlObj.hostname}${originalPathname}`;
  } catch (error) {
    throw new Error(
      `Failed to revert to original URL: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export default cloudinary;
