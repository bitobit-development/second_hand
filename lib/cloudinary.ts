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

export default cloudinary;
