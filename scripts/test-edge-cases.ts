/**
 * Edge case testing for AI image enhancement
 *
 * Run: npx tsx scripts/test-edge-cases.ts
 */

import {
  isCloudinaryUrl,
  extractPublicId,
  generateEnhancedUrl,
  revertToOriginal,
} from "../lib/cloudinary";
import { enhanceProductImage } from "../lib/ai/enhance-image";

async function runTests() {
  console.log("🧪 Edge Case Testing\n");

  const tests = [
  {
    name: "Empty string",
    url: "",
    shouldPass: false,
  },
  {
    name: "Invalid URL",
    url: "not-a-url",
    shouldPass: false,
  },
  {
    name: "Non-Cloudinary domain",
    url: "https://example.com/image.jpg",
    shouldPass: false,
  },
  {
    name: "Cloudinary URL without version",
    url: "https://res.cloudinary.com/doiyoqble/image/upload/product.jpg",
    shouldPass: true,
  },
  {
    name: "Cloudinary URL with nested folders",
    url: "https://res.cloudinary.com/doiyoqble/image/upload/v1234/a/b/c/product.jpg",
    shouldPass: true,
  },
  {
    name: "Already enhanced URL",
    url: "https://res.cloudinary.com/doiyoqble/image/upload/e_background_removal,b_white/v1234/product.jpg",
    shouldPass: true,
  },
  {
    name: "URL with multiple transformations",
    url: "https://res.cloudinary.com/doiyoqble/image/upload/w_800,h_600,c_fill,q_auto/v1234/product.jpg",
    shouldPass: true,
  },
  {
    name: "URL with special characters in filename",
    url: "https://res.cloudinary.com/doiyoqble/image/upload/v1234/product-name_123.jpg",
    shouldPass: true,
  },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await enhanceProductImage(test.url);

      if (test.shouldPass) {
        console.log(`✅ ${test.name}`);
        console.log(`   Original: ${result.originalUrl.substring(0, 80)}...`);
        console.log(`   Enhanced: ${result.enhancedUrl.substring(0, 80)}...`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - Expected to fail but passed`);
        failed++;
      }
    } catch (error) {
      if (!test.shouldPass) {
        const errorData = JSON.parse((error as Error).message);
        console.log(`✅ ${test.name} - Correctly failed`);
        console.log(`   Error: ${errorData.code} - ${errorData.message}`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - Unexpected failure`);
        console.log(`   Error: ${(error as Error).message}`);
        failed++;
      }
    }
    console.log();
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  // Test helper functions individually
  console.log("\n🔧 Helper Function Tests\n");

  // Test isCloudinaryUrl
  console.log("isCloudinaryUrl Tests:");
  console.log("  ✓ Valid:", isCloudinaryUrl("https://res.cloudinary.com/demo/image/upload/sample.jpg"));
  console.log("  ✓ Invalid:", !isCloudinaryUrl("https://example.com/image.jpg"));
  console.log("  ✓ Malformed:", !isCloudinaryUrl("not-a-url"));

  // Test extractPublicId
  console.log("\nextractPublicId Tests:");
  try {
    console.log("  ✓ Simple:", extractPublicId("https://res.cloudinary.com/demo/image/upload/v123/product.jpg") === "product");
    console.log("  ✓ Nested:", extractPublicId("https://res.cloudinary.com/demo/image/upload/v123/a/b/c.jpg") === "a/b/c");
  } catch (error) {
    console.log("  ✗ Error:", (error as Error).message);
  }

  // Test revertToOriginal
  console.log("\nrevertToOriginal Tests:");
  const enhancedUrl = "https://res.cloudinary.com/demo/image/upload/e_background_removal,b_white/v123/product.jpg";
  const revertedUrl = revertToOriginal(enhancedUrl);
  console.log("  ✓ Reverted:", revertedUrl === "https://res.cloudinary.com/demo/image/upload/v123/product.jpg");

  console.log("\n✅ All tests completed!");
}

runTests().catch(console.error);
