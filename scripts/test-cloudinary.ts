/**
 * Test Cloudinary Image Upload Script
 *
 * This script tests the image upload functionality with Cloudinary.
 * Run with: npx tsx scripts/test-cloudinary.ts
 */

import 'dotenv/config';
import { uploadImage } from '../lib/cloudinary';
import fs from 'fs';
import path from 'path';

async function testCloudinary() {
  console.log('🧪 Testing Cloudinary Image Upload...\n');

  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    console.log('📤 Uploading test image to Cloudinary...');

    const result = await uploadImage(testImageBase64, 'test');

    console.log('✅ Image uploaded successfully!');
    console.log('📷 Result:', {
      public_id: result.public_id,
      url: result.secure_url,
      size: `${result.width}x${result.height}`,
      format: result.format,
    });
    console.log('\n✨ Image URL:', result.secure_url);
    console.log('\n🎉 Cloudinary is working! You can now upload images for listings.');

  } catch (error) {
    console.error('❌ Error uploading image:', error);
    process.exit(1);
  }
}

testCloudinary();
