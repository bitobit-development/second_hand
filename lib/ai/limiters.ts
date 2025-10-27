/**
 * Pre-configured Rate Limiters for AI API Routes
 *
 * This file exports singleton instances of RateLimiter configured
 * for each AI feature endpoint.
 */

import { RateLimiter } from "./rate-limiter";

/**
 * Rate limiter for image enhancement API
 *
 * Limits:
 * - 10 requests per minute
 * - 100 requests per hour
 *
 * Usage in API route:
 * ```ts
 * import { imageEnhancementLimiter } from '@/lib/ai/limiters';
 * import { withRateLimit } from '@/lib/ai/middleware';
 *
 * export async function POST(req: Request) {
 *   return withRateLimit(req, imageEnhancementLimiter, async (userId) => {
 *     // Your image enhancement logic here
 *     const result = await enhanceImage(imageUrl);
 *     return Response.json(result);
 *   });
 * }
 * ```
 */
export const imageEnhancementLimiter = new RateLimiter({
  requestsPerMinute: 10,
  requestsPerHour: 100,
});

/**
 * Rate limiter for description generation API
 *
 * Limits:
 * - 5 requests per minute
 * - 50 requests per hour
 *
 * Usage in API route:
 * ```ts
 * import { descriptionGenerationLimiter } from '@/lib/ai/limiters';
 * import { withRateLimit } from '@/lib/ai/middleware';
 *
 * export async function POST(req: Request) {
 *   return withRateLimit(req, descriptionGenerationLimiter, async (userId) => {
 *     // Your description generation logic here
 *     const result = await generateDescription(params);
 *     return Response.json(result);
 *   });
 * }
 * ```
 */
export const descriptionGenerationLimiter = new RateLimiter({
  requestsPerMinute: 5,
  requestsPerHour: 50,
});

/**
 * Rate limiter for category suggestion API
 *
 * Limits:
 * - 10 requests per minute
 * - 100 requests per hour
 *
 * Usage in API route:
 * ```ts
 * import { categorySuggestionLimiter } from '@/lib/ai/limiters';
 * import { withRateLimit } from '@/lib/ai/middleware';
 *
 * export async function POST(req: Request) {
 *   return withRateLimit(req, categorySuggestionLimiter, async (userId) => {
 *     // Your category suggestion logic here
 *     const result = await suggestCategories(params);
 *     return Response.json(result);
 *   });
 * }
 * ```
 */
export const categorySuggestionLimiter = new RateLimiter({
  requestsPerMinute: 10,
  requestsPerHour: 100,
});

/**
 * Custom rate limiter factory
 *
 * Create a custom rate limiter with specific limits.
 *
 * Example:
 * ```ts
 * import { createRateLimiter } from '@/lib/ai/limiters';
 *
 * const myLimiter = createRateLimiter({
 *   requestsPerMinute: 20,
 *   requestsPerHour: 200,
 * });
 * ```
 *
 * @param config - Rate limit configuration
 * @returns New RateLimiter instance
 */
export function createRateLimiter(config: {
  requestsPerMinute: number;
  requestsPerHour: number;
}): RateLimiter {
  return new RateLimiter(config);
}
