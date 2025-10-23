/**
 * Example Rate-Limited AI API Route
 *
 * This is a reference implementation showing how to integrate
 * rate limiting into AI API routes.
 *
 * DO NOT USE IN PRODUCTION - This is for demonstration only
 */

import { NextRequest } from "next/server";
import { withRateLimit } from "@/lib/ai/middleware";
import { imageEnhancementLimiter } from "@/lib/ai/limiters";

export async function POST(req: NextRequest) {
  return withRateLimit(req, imageEnhancementLimiter, async (userId) => {
    // Your AI logic here
    // userId is automatically extracted from NextAuth session or IP

    // Example: Process the request
    const body = await req.json();

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Return response (rate limit headers are added automatically)
    return Response.json({
      success: true,
      userId, // For debugging - remove in production
      message: "Request processed successfully",
      data: body,
    });
  });
}

/**
 * Integration Pattern
 * ===================
 *
 * 1. Import the middleware and limiter:
 *    import { withRateLimit } from '@/lib/ai/middleware';
 *    import { imageEnhancementLimiter } from '@/lib/ai/limiters';
 *
 * 2. Wrap your handler with withRateLimit:
 *    export async function POST(req: NextRequest) {
 *      return withRateLimit(req, imageEnhancementLimiter, async (userId) => {
 *        // Your logic here
 *      });
 *    }
 *
 * 3. The middleware automatically:
 *    - Extracts user ID from NextAuth session or falls back to IP
 *    - Checks rate limits before executing handler
 *    - Returns 429 if limit exceeded
 *    - Adds rate limit headers to all responses:
 *      - X-RateLimit-Remaining: Requests remaining
 *      - X-RateLimit-Reset: Unix timestamp when limit resets
 *    - Returns 401 if no user ID or IP available
 *
 * Response Headers
 * ================
 *
 * Success (200):
 *   X-RateLimit-Remaining: 9
 *   X-RateLimit-Reset: 1698765432
 *
 * Rate Limited (429):
 *   X-RateLimit-Remaining: 0
 *   X-RateLimit-Reset: 1698765432
 *   Retry-After: 45
 *
 * Error Handling
 * ==============
 *
 * The middleware handles errors gracefully:
 * - 401: No authentication (no session and no IP)
 * - 429: Rate limit exceeded
 * - 500: Handler threw an error
 *
 * Custom Rate Limits
 * ==================
 *
 * For custom limits, create a new limiter:
 *
 * import { createRateLimiter } from '@/lib/ai/limiters';
 *
 * const myLimiter = createRateLimiter({
 *   requestsPerMinute: 20,
 *   requestsPerHour: 200,
 * });
 *
 * export async function POST(req: NextRequest) {
 *   return withRateLimit(req, myLimiter, async (userId) => {
 *     // Your logic
 *   });
 * }
 *
 * Manual Rate Limit Check
 * ========================
 *
 * For more control, use checkRateLimit directly:
 *
 * import { checkRateLimit, getUserId } from '@/lib/ai/middleware';
 * import { imageEnhancementLimiter } from '@/lib/ai/limiters';
 *
 * export async function POST(req: NextRequest) {
 *   const userId = await getUserId(req);
 *   if (!userId) {
 *     return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *
 *   const limitResult = await checkRateLimit(userId, imageEnhancementLimiter);
 *   if (!limitResult.allowed) {
 *     return Response.json(
 *       { error: 'Rate limit exceeded', retryAfter: limitResult.retryAfter },
 *       {
 *         status: 429,
 *         headers: {
 *           'X-RateLimit-Remaining': '0',
 *           'X-RateLimit-Reset': Math.floor(limitResult.reset / 1000).toString(),
 *           'Retry-After': limitResult.retryAfter?.toString() || '60',
 *         },
 *       }
 *     );
 *   }
 *
 *   // Your logic here
 *   return Response.json({ success: true });
 * }
 */
