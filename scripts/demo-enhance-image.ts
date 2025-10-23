/**
 * Demonstration script for AI image enhancement
 *
 * Run: npx tsx scripts/demo-enhance-image.ts
 */

import {
  isCloudinaryUrl,
  extractPublicId,
  generateEnhancedUrl,
  revertToOriginal,
} from "../lib/cloudinary";
import { enhanceProductImage } from "../lib/ai/enhance-image";

console.log("🎨 AI Image Enhancement Demo\n");

// Example Cloudinary URLs
const testUrls = {
  simple: "https://res.cloudinary.com/doiyoqble/image/upload/v1234567890/product.jpg",
  withFolder:
    "https://res.cloudinary.com/doiyoqble/image/upload/v1234567890/second-hand/listings/product.jpg",
  withTransformations:
    "https://res.cloudinary.com/doiyoqble/image/upload/w_800,h_800/v1234567890/product.jpg",
};

// Test 1: URL Validation
console.log("1️⃣ URL Validation");
console.log("✅ Cloudinary URL:", isCloudinaryUrl(testUrls.simple));
console.log("❌ Non-Cloudinary URL:", isCloudinaryUrl("https://example.com/image.jpg"));
console.log();

// Test 2: Public ID Extraction
console.log("2️⃣ Public ID Extraction");
try {
  console.log("Simple URL:", extractPublicId(testUrls.simple));
  console.log("With Folder:", extractPublicId(testUrls.withFolder));
  console.log("With Transformations:", extractPublicId(testUrls.withTransformations));
} catch (error) {
  console.error("Error:", error);
}
console.log();

// Test 3: Enhanced URL Generation
console.log("3️⃣ Enhanced URL Generation");
console.log("\nOriginal URL:");
console.log(testUrls.simple);
console.log("\nEnhanced URL:");
const enhanced = generateEnhancedUrl(testUrls.simple);
console.log(enhanced);
console.log("\nTransformations Applied:");
console.log("  • e_background_removal - AI background removal");
console.log("  • b_white - White background");
console.log("  • c_pad,w_1000,h_1000 - Square padding");
console.log("  • q_auto:best - Quality optimization");
console.log("  • f_auto - Format optimization");
console.log();

// Test 4: Revert to Original
console.log("4️⃣ Revert to Original");
const reverted = revertToOriginal(enhanced);
console.log("Reverted URL:", reverted);
console.log("Matches Original:", reverted === testUrls.simple);
console.log();

// Test 5: Full Enhancement Function
console.log("5️⃣ Full Enhancement Result");
(async () => {
  try {
    const result = await enhanceProductImage(testUrls.withFolder);
    console.log("Enhancement Result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Enhancement Error:", error);
  }

  console.log();

  // Test 6: Error Handling
  console.log("6️⃣ Error Handling");
  try {
    await enhanceProductImage("https://example.com/not-cloudinary.jpg");
  } catch (error) {
    const errorData = JSON.parse((error as Error).message);
    console.log("Error Code:", errorData.code);
    console.log("Error Message:", errorData.message);
  }

  console.log();
  console.log("✅ Demo Complete!");
})();
