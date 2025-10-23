# AI Image Enhancement Module

## Overview

This module provides AI-powered image enhancement utilities using Cloudinary's background removal and professional image processing capabilities.

## Features

- **AI Background Removal**: Automatically removes backgrounds using Cloudinary's AI
- **Professional White Background**: Adds clean white background for marketplace consistency
- **Square Formatting**: Pads images to 1000x1000px for uniform display
- **Auto Optimization**: Automatically selects best quality and format (WebP, AVIF)
- **Batch Processing**: Enhance multiple images simultaneously

## Usage

### Basic Enhancement

```typescript
import { enhanceProductImage } from '@/lib/ai';

// Enhance a single image
const result = await enhanceProductImage(
  "https://res.cloudinary.com/doiyoqble/image/upload/v1234567890/second-hand/listings/product.jpg"
);

console.log(result);
// {
//   originalUrl: "https://res.cloudinary.com/doiyoqble/image/upload/v1234567890/second-hand/listings/product.jpg",
//   enhancedUrl: "https://res.cloudinary.com/doiyoqble/image/upload/e_background_removal,b_white,c_pad,w_1000,h_1000,q_auto:best,f_auto/v1234567890/second-hand/listings/product.jpg",
//   width: 1000,
//   height: 1000,
//   format: "auto"
// }
```

### Batch Enhancement

```typescript
import { enhanceProductImages } from '@/lib/ai';

const imageUrls = [
  "https://res.cloudinary.com/doiyoqble/image/upload/v1234/product1.jpg",
  "https://res.cloudinary.com/doiyoqble/image/upload/v1234/product2.jpg",
  "https://res.cloudinary.com/doiyoqble/image/upload/v1234/product3.jpg"
];

const results = await enhanceProductImages(imageUrls);
```

### Helper Functions

```typescript
import {
  isCloudinaryUrl,
  extractPublicId,
  generateEnhancedUrl,
  revertToOriginal
} from '@/lib/cloudinary';

// Check if URL is from Cloudinary
const isValid = isCloudinaryUrl("https://res.cloudinary.com/doiyoqble/image/upload/v1234/product.jpg");
// Returns: true

// Extract public ID from URL
const publicId = extractPublicId("https://res.cloudinary.com/doiyoqble/image/upload/v1234/second-hand/listings/product.jpg");
// Returns: "second-hand/listings/product"

// Generate enhanced URL
const enhanced = generateEnhancedUrl("https://res.cloudinary.com/doiyoqble/image/upload/v1234/product.jpg");
// Returns URL with transformations applied

// Revert to original
const original = revertToOriginal("https://res.cloudinary.com/doiyoqble/image/upload/e_background_removal,b_white/v1234/product.jpg");
// Returns: "https://res.cloudinary.com/doiyoqble/image/upload/v1234/product.jpg"
```

## Error Handling

The module provides structured error responses:

```typescript
try {
  const result = await enhanceProductImage(invalidUrl);
} catch (error) {
  const enhancementError = JSON.parse(error.message);

  switch (enhancementError.code) {
    case "INVALID_URL":
      // Handle invalid URL format
      break;
    case "NOT_CLOUDINARY":
      // Handle non-Cloudinary URLs
      break;
    case "ENHANCEMENT_FAILED":
      // Handle processing failures
      break;
  }
}
```

## Cloudinary Transformations

The enhancement applies these transformations in order:

1. **`e_background_removal`** - AI-powered background removal
2. **`b_white`** - White background replacement
3. **`c_pad,w_1000,h_1000`** - Pad to 1000x1000px square
4. **`q_auto:best`** - Automatic quality optimization
5. **`f_auto`** - Automatic format selection (WebP, AVIF, etc.)

### Example Transformation

**Original URL:**
```
https://res.cloudinary.com/doiyoqble/image/upload/v1234567890/second-hand/listings/product.jpg
```

**Enhanced URL:**
```
https://res.cloudinary.com/doiyoqble/image/upload/e_background_removal,b_white,c_pad,w_1000,h_1000,q_auto:best,f_auto/v1234567890/second-hand/listings/product.jpg
```

## TypeScript Types

```typescript
interface EnhancedImageResult {
  originalUrl: string;
  enhancedUrl: string;
  width: number;
  height: number;
  format: string;
}

interface EnhancementError {
  code: "INVALID_URL" | "NOT_CLOUDINARY" | "ENHANCEMENT_FAILED";
  message: string;
}
```

## Edge Cases Handled

- Invalid URL formats
- Non-Cloudinary URLs
- URLs with existing transformations (replaced with enhancement)
- Missing version numbers in URLs
- Malformed Cloudinary paths

## Performance

- URL generation is synchronous (no API calls)
- Transformations applied on-demand by Cloudinary CDN
- First request may be slower (processing), subsequent requests are cached
- Batch enhancement processes all images in parallel

## Integration Example

```typescript
// In listing creation flow
import { enhanceProductImage } from '@/lib/ai';
import { uploadImage } from '@/lib/cloudinary';

async function createListing(formData: FormData) {
  // 1. Upload original image
  const uploadResult = await uploadImage(imageFile);

  // 2. Enhance the uploaded image
  const enhanced = await enhanceProductImage(uploadResult.secure_url);

  // 3. Save both URLs to database
  await db.listing.create({
    data: {
      title: formData.get('title'),
      images: [enhanced.enhancedUrl], // Use enhanced for display
      originalImages: [enhanced.originalUrl], // Keep original for reference
      // ... other fields
    }
  });
}
```
