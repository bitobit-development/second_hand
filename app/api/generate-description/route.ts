/**
 * API Route: /api/generate-description
 *
 * AI-powered product description generation endpoint.
 * Analyzes product images using OpenAI GPT-4o Vision API and generates
 * high-quality descriptions optimized for the Second-Hand Marketplace.
 *
 * Features:
 * - Authentication required (NextAuth session)
 * - Rate limiting (5 req/min, 50 req/hour per user)
 * - Request validation with Zod
 * - Multiple template types (detailed, concise, seo)
 * - Extracts product attributes (color, material, brand, style)
 *
 * @see /lib/ai/generate-description.ts - Core generation logic
 * @see /lib/ai/middleware.ts - Rate limiting middleware
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateProductDescription } from '@/lib/ai/generate-description';
import { descriptionGenerationLimiter } from '@/lib/ai/limiters';
import { withRateLimit } from '@/lib/ai/middleware';
import { AIError, isAIError, getUserFriendlyMessage } from '@/lib/ai/errors';

/**
 * Zod schema for request body validation
 *
 * Validates:
 * - imageUrls: 1-5 Cloudinary URLs (required)
 * - category: Valid ListingCategory enum value (required)
 * - templateType: Description style (detailed, concise, seo)
 * - additionalContext: Optional user notes for context
 */
const GenerateDescriptionSchema = z.object({
  imageUrls: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(5, 'Maximum 5 images allowed'),
  category: z.enum([
    'ELECTRONICS',
    'CLOTHING',
    'HOME_GARDEN',
    'SPORTS',
    'BOOKS',
    'TOYS',
    'VEHICLES',
    'COLLECTIBLES',
    'BABY_KIDS',
    'PET_SUPPLIES',
  ]),
  templateType: z.enum(['detailed', 'concise', 'seo']),
  additionalContext: z.string().optional(),
});

/**
 * Success response structure
 */
interface SuccessResponse {
  success: true;
  description: string;
  suggestedTitle?: string;
  wordCount: number;
  characterCount: number;
  attributes: {
    color?: string;
    material?: string;
    brand?: string;
    style?: string;
  };
}

/**
 * Error response structure
 */
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

/**
 * POST /api/generate-description
 *
 * Generate AI product description from images.
 *
 * Request Body:
 * ```json
 * {
 *   "imageUrls": ["https://res.cloudinary.com/..."],
 *   "category": "ELECTRONICS",
 *   "templateType": "detailed",
 *   "additionalContext": "Barely used, includes original box"
 * }
 * ```
 *
 * Success Response (200):
 * ```json
 * {
 *   "success": true,
 *   "description": "This Samsung Galaxy smartphone...",
 *   "wordCount": 145,
 *   "characterCount": 823,
 *   "attributes": {
 *     "color": "black",
 *     "brand": "Samsung"
 *   }
 * }
 * ```
 *
 * Error Responses:
 * - 400: Invalid request body
 * - 401: Unauthenticated
 * - 429: Rate limit exceeded
 * - 500: OpenAI API error or server error
 */
export async function POST(req: NextRequest) {
  return withRateLimit(
    req,
    descriptionGenerationLimiter,
    async () => {
      try {
        // Parse and validate request body
        const body = await req.json().catch(() => null);

        if (!body) {
          return Response.json(
            {
              success: false,
              error: 'Invalid JSON in request body',
              code: 'INVALID_JSON',
            } satisfies ErrorResponse,
            { status: 400 }
          );
        }

        // Validate with Zod schema
        const validationResult = GenerateDescriptionSchema.safeParse(body);

        if (!validationResult.success) {
          const firstError = validationResult.error.errors[0];
          return Response.json(
            {
              success: false,
              error: firstError.message,
              code: 'VALIDATION_ERROR',
            } satisfies ErrorResponse,
            { status: 400 }
          );
        }

        const { imageUrls, category, templateType, additionalContext } =
          validationResult.data;

        // Use first image for description generation
        // TODO: Future enhancement - analyze multiple images
        const primaryImageUrl = imageUrls[0];

        // Build user prompt with additional context if provided
        const title = additionalContext || undefined;

        // Call AI description generator
        const result = await generateProductDescription({
          imageUrl: primaryImageUrl,
          category,
          condition: 'GOOD', // Default condition - can be enhanced later
          template: templateType,
          title,
        });

        // Return success response
        return Response.json(
          {
            success: true,
            description: result.description,
            suggestedTitle: result.suggestedTitle,
            wordCount: result.wordCount,
            characterCount: result.characterCount,
            attributes: result.attributes,
          } satisfies SuccessResponse,
          { status: 200 }
        );
      } catch (error) {
        // Handle AI-specific errors
        if (isAIError(error)) {
          const friendlyMessage = getUserFriendlyMessage(error);

          // Map AI error codes to HTTP status codes
          const statusCode = getStatusCodeForAIError(error);

          return Response.json(
            {
              success: false,
              error: friendlyMessage,
              code: error.code,
            } satisfies ErrorResponse,
            { status: statusCode }
          );
        }

        // Handle unexpected errors
        console.error('Unexpected error in /api/generate-description:', error);

        return Response.json(
          {
            success: false,
            error: 'An unexpected error occurred. Please try again.',
            code: 'INTERNAL_ERROR',
          } satisfies ErrorResponse,
          { status: 500 }
        );
      }
    }
  );
}

/**
 * Map AIError codes to appropriate HTTP status codes
 *
 * @param error - AIError instance
 * @returns HTTP status code
 */
function getStatusCodeForAIError(error: AIError): number {
  switch (error.code) {
    // Client errors (400)
    case 'INVALID_IMAGE':
    case 'NO_IMAGE':
    case 'INVALID_PARAMS':
    case 'VALIDATION_FAILED':
    case 'INAPPROPRIATE_CONTENT':
    case 'UNCLEAR_IMAGE':
    case 'MULTIPLE_ITEMS':
      return 400;

    // Rate limit (429)
    case 'RATE_LIMIT':
      return 429;

    // Server errors (500)
    case 'OPENAI_ERROR':
    case 'TIMEOUT':
    case 'UNKNOWN_ERROR':
    default:
      return 500;
  }
}
