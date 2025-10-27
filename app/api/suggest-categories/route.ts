/**
 * API Route: /api/suggest-categories
 *
 * AI-powered category suggestion endpoint.
 * Analyzes product images using OpenAI GPT-4o Vision API and suggests
 * appropriate categories with confidence scores.
 *
 * Features:
 * - Authentication required (NextAuth session)
 * - Rate limiting (10 req/min, 100 req/hour per user)
 * - Request validation with Zod
 * - Caching (15-minute TTL)
 * - Multiple prompt versions (v1, v2, v3)
 * - Intelligent category matching
 *
 * @see /lib/ai/category-suggester.ts - Core suggestion logic
 * @see /lib/ai/category-matcher.ts - Category matching algorithm
 * @see /lib/ai/category-cache.ts - Caching layer
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { suggestCategories } from '@/lib/ai/category-suggester';
import { categorySuggestionLimiter } from '@/lib/ai/limiters';
import { withRateLimit } from '@/lib/ai/middleware';
import { AIError, isAIError, getUserFriendlyMessage } from '@/lib/ai/errors';
import {
  getCachedCategorySuggestion,
  setCachedCategorySuggestion,
} from '@/lib/ai/category-cache';

/**
 * Zod schema for request body validation
 *
 * Validates:
 * - imageUrls: 1-5 Cloudinary URLs (required)
 * - context: Optional user notes for better suggestions
 * - promptVersion: AI prompt version (v1, v2, v3)
 */
const SuggestCategoriesSchema = z.object({
  imageUrls: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(5, 'Maximum 5 images allowed'),
  context: z.string().max(500, 'Context must be less than 500 characters').optional(),
  promptVersion: z.enum(['v1', 'v2', 'v3']).optional().default('v1'),
});

/**
 * Success response structure
 */
interface SuccessResponse {
  success: true;
  suggestions: Array<{
    category: string;
    parentCategory: string;
    confidence: number;
    reasoning: string;
    granularity: 'base' | 'subcategory' | 'specific';
  }>;
  createNew: boolean;
  grouping: string;
  qualityIssues?: string[];
  tokensUsed: number;
  cached: boolean;
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
 * POST /api/suggest-categories
 *
 * Generate AI category suggestions from product images.
 *
 * Request Body:
 * ```json
 * {
 *   "imageUrls": ["https://res.cloudinary.com/..."],
 *   "context": "Vintage leather jacket with brass buttons",
 *   "promptVersion": "v1"
 * }
 * ```
 *
 * Success Response (200):
 * ```json
 * {
 *   "success": true,
 *   "suggestions": [
 *     {
 *       "category": "Leather Jackets",
 *       "parentCategory": "CLOTHING",
 *       "confidence": 95,
 *       "reasoning": "Vintage leather jacket visible with brass buttons",
 *       "granularity": "subcategory"
 *     },
 *     {
 *       "category": "Outerwear",
 *       "parentCategory": "CLOTHING",
 *       "confidence": 85,
 *       "reasoning": "Clothing item for outdoor wear",
 *       "granularity": "subcategory"
 *     }
 *   ],
 *   "createNew": false,
 *   "grouping": "Leather Jackets",
 *   "tokensUsed": 450,
 *   "cached": false
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
    categorySuggestionLimiter,
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
        const validationResult = SuggestCategoriesSchema.safeParse(body);

        if (!validationResult.success) {
          const firstError = validationResult.error.issues[0];
          return Response.json(
            {
              success: false,
              error: firstError.message,
              code: 'VALIDATION_ERROR',
            } satisfies ErrorResponse,
            { status: 400 }
          );
        }

        const { imageUrls, context, promptVersion } = validationResult.data;

        // Check cache first (using first image as cache key)
        const cachedResult = getCachedCategorySuggestion(imageUrls[0]);

        if (cachedResult) {
          return Response.json(
            {
              success: true,
              ...cachedResult,
              tokensUsed: cachedResult.tokensUsed ?? 0,
              cached: true,
            } satisfies SuccessResponse,
            { status: 200 }
          );
        }

        // Use up to 2 images for cost optimization
        // GPT-4o Vision with 'low' detail: ~65 tokens per image
        const imagesToAnalyze = imageUrls.slice(0, 2);

        // Call AI category suggester
        const result = await suggestCategories({
          images: imagesToAnalyze,
          promptVersion,
          includeFewShot: false, // Can enable for better accuracy (adds ~300 tokens)
          maxTokens: 300,
          temperature: 0.2, // Low temperature for consistent results
        });

        // Estimate token usage (for monitoring)
        const imageTokens = imagesToAnalyze.length * 65; // Low-detail images
        const promptTokens = {
          v1: 450,
          v2: 650,
          v3: 250,
        }[promptVersion];
        const responseTokens = 150; // Estimated
        const tokensUsed = imageTokens + promptTokens + responseTokens;

        const response: SuccessResponse = {
          success: true,
          suggestions: result.suggestions,
          createNew: result.createNew,
          grouping: result.grouping,
          qualityIssues: result.qualityIssues,
          tokensUsed,
          cached: false,
        };

        // Cache the result (15-minute TTL)
        setCachedCategorySuggestion(imageUrls[0], {
          ...result,
          tokensUsed,
        });

        // Return success response
        return Response.json(response, { status: 200 });
      } catch (error) {
        // Handle AI-specific errors
        if (isAIError(error)) {
          const friendlyMessage = getUserFriendlyMessage(error);
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
        console.error('Unexpected error in /api/suggest-categories:', error);

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

/**
 * GET /api/suggest-categories/stats
 *
 * Get cache statistics (for monitoring)
 */
export async function GET() {
  const { getCategoryCacheMetrics } = await import('@/lib/ai/category-cache');
  const metrics = getCategoryCacheMetrics();

  return Response.json({
    success: true,
    metrics,
  });
}
