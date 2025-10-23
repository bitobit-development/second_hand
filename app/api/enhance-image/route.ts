/**
 * AI-Powered Image Enhancement API Route
 *
 * Endpoint: POST /api/enhance-image
 *
 * Provides AI-powered background removal and image enhancement
 * for product listing images using Cloudinary transformations.
 *
 * Features:
 * - Background removal with AI
 * - White background replacement
 * - Square padding to 1000x1000px
 * - Auto quality and format optimization
 * - Rate limiting: 10 req/min, 100 req/hour
 * - Authentication required via NextAuth session
 *
 * @example Request
 * POST /api/enhance-image
 * Content-Type: application/json
 *
 * {
 *   "imageUrl": "https://res.cloudinary.com/doiyoqble/image/upload/v1234/product.jpg"
 * }
 *
 * @example Success Response (200)
 * {
 *   "success": true,
 *   "originalUrl": "https://res.cloudinary.com/.../product.jpg",
 *   "enhancedUrl": "https://res.cloudinary.com/.../e_background_removal,b_white,.../product.jpg",
 *   "width": 1000,
 *   "height": 1000,
 *   "format": "auto"
 * }
 *
 * @example Error Response (400)
 * {
 *   "success": false,
 *   "error": "Invalid Cloudinary URL",
 *   "code": "NOT_CLOUDINARY"
 * }
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { withRateLimit } from "@/lib/ai/middleware";
import { imageEnhancementLimiter } from "@/lib/ai/limiters";
import { enhanceProductImage } from "@/lib/ai/enhance-image";
import { isCloudinaryUrl } from "@/lib/cloudinary";
import type { EnhancedImageResult, EnhancementError } from "@/lib/ai/types";

/**
 * Request body validation schema
 */
const enhanceImageSchema = z.object({
  imageUrl: z
    .string()
    .min(1, "Image URL is required")
    .url("Image URL must be a valid URL")
    .refine((url) => isCloudinaryUrl(url), {
      message: "Image URL must be from Cloudinary domain (res.cloudinary.com)",
    }),
});

/**
 * POST /api/enhance-image
 *
 * Enhance product image with AI background removal and professional formatting.
 *
 * Rate Limits:
 * - 10 requests per minute
 * - 100 requests per hour
 *
 * Authentication: Required (NextAuth session)
 *
 * @param req - Next.js request with JSON body containing imageUrl
 * @returns JSON response with enhanced image result or error
 */
export async function POST(req: NextRequest) {
  return withRateLimit(req, imageEnhancementLimiter, async (userId) => {
    try {
      // Parse and validate request body
      const body = await req.json().catch(() => ({}));

      const validation = enhanceImageSchema.safeParse(body);

      if (!validation.success) {
        // Extract first validation error
        const firstError = validation.error.issues[0];
        return Response.json(
          {
            success: false,
            error: firstError.message,
            code: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }

      const { imageUrl } = validation.data;

      // Enhance image using AI
      const result: EnhancedImageResult = await enhanceProductImage(imageUrl);

      // Return success response
      return Response.json(
        {
          success: true,
          originalUrl: result.originalUrl,
          enhancedUrl: result.enhancedUrl,
          width: result.width,
          height: result.height,
          format: result.format,
        },
        { status: 200 }
      );
    } catch (error) {
      // Handle enhancement errors from enhanceProductImage
      if (error instanceof Error) {
        try {
          const enhancementError: EnhancementError = JSON.parse(error.message);

          // Map enhancement error codes to HTTP status codes
          const statusCode =
            enhancementError.code === "INVALID_URL" ||
            enhancementError.code === "NOT_CLOUDINARY"
              ? 400
              : 500;

          return Response.json(
            {
              success: false,
              error: enhancementError.message,
              code: enhancementError.code,
            },
            { status: statusCode }
          );
        } catch {
          // Not a JSON error, generic error
          return Response.json(
            {
              success: false,
              error: error.message || "Failed to enhance image",
              code: "ENHANCEMENT_FAILED",
            },
            { status: 500 }
          );
        }
      }

      // Unknown error type
      return Response.json(
        {
          success: false,
          error: "An unexpected error occurred",
          code: "UNKNOWN_ERROR",
        },
        { status: 500 }
      );
    }
  });
}

/**
 * Response Types
 * ==============
 *
 * Success Response (200):
 * {
 *   success: true,
 *   originalUrl: string,      // Original Cloudinary URL
 *   enhancedUrl: string,      // Enhanced URL with transformations
 *   width: number,            // 1000 (target width)
 *   height: number,           // 1000 (target height)
 *   format: string            // "auto" (optimized format)
 * }
 *
 * Error Responses:
 *
 * 400 Bad Request:
 * {
 *   success: false,
 *   error: string,            // Human-readable error message
 *   code: "VALIDATION_ERROR" | "INVALID_URL" | "NOT_CLOUDINARY"
 * }
 *
 * 401 Unauthorized (handled by middleware):
 * {
 *   error: "Unauthorized",
 *   message: "Authentication required"
 * }
 *
 * 429 Rate Limit Exceeded (handled by middleware):
 * {
 *   error: "Rate Limit Exceeded",
 *   message: "Too many requests. Please try again later.",
 *   retryAfter: number,       // Seconds until retry
 *   reset: number             // Unix timestamp when limit resets
 * }
 *
 * 500 Internal Server Error:
 * {
 *   success: false,
 *   error: string,
 *   code: "ENHANCEMENT_FAILED" | "UNKNOWN_ERROR"
 * }
 *
 * Rate Limit Headers
 * ==================
 *
 * All responses include:
 * - X-RateLimit-Remaining: Number of requests remaining in current window
 * - X-RateLimit-Reset: Unix timestamp (seconds) when limit resets
 *
 * Rate limited responses additionally include:
 * - Retry-After: Seconds until retry allowed
 *
 * Usage Example
 * =============
 *
 * ```typescript
 * // Client-side usage
 * const response = await fetch('/api/enhance-image', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({
 *     imageUrl: 'https://res.cloudinary.com/doiyoqble/image/upload/v1234/product.jpg'
 *   }),
 * });
 *
 * const data = await response.json();
 *
 * if (data.success) {
 *   console.log('Enhanced URL:', data.enhancedUrl);
 *   // Use data.enhancedUrl in your application
 * } else {
 *   console.error('Error:', data.error);
 *   // Handle error based on data.code
 * }
 * ```
 *
 * Error Handling
 * ==============
 *
 * Handle errors based on status code and error code:
 *
 * ```typescript
 * if (!response.ok) {
 *   const error = await response.json();
 *
 *   switch (response.status) {
 *     case 400:
 *       // Invalid request - show user-friendly error
 *       alert(error.error);
 *       break;
 *     case 401:
 *       // Not authenticated - redirect to login
 *       window.location.href = '/auth/login';
 *       break;
 *     case 429:
 *       // Rate limited - show retry message
 *       alert(`Too many requests. Retry in ${error.retryAfter} seconds`);
 *       break;
 *     case 500:
 *       // Server error - log and show generic message
 *       console.error('Enhancement failed:', error);
 *       alert('Failed to enhance image. Please try again.');
 *       break;
 *   }
 * }
 * ```
 */
