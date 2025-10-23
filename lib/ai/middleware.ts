import { auth } from "@/auth";
import { RateLimiter } from "./rate-limiter";
import { RateLimitResult } from "./types";

/**
 * Rate Limiting Middleware for AI API Routes
 *
 * Provides helper functions to apply rate limiting to Next.js API routes
 * with proper error handling and response headers.
 */

/**
 * Apply rate limiting to an API route handler
 *
 * Features:
 * - Extracts user ID from NextAuth session
 * - Falls back to IP address if no session
 * - Returns 429 with proper headers when limit exceeded
 * - Adds rate limit headers to all responses
 * - Returns 401 if no session and no IP available
 *
 * Example:
 * ```ts
 * import { withRateLimit } from '@/lib/ai/middleware';
 * import { imageEnhancementLimiter } from '@/lib/ai/limiters';
 *
 * export async function POST(req: Request) {
 *   return withRateLimit(req, imageEnhancementLimiter, async (userId) => {
 *     // Your API logic here
 *     return Response.json({ success: true });
 *   });
 * }
 * ```
 *
 * @param req - Next.js Request object
 * @param limiter - RateLimiter instance with configured limits
 * @param handler - Handler function to execute if rate limit allows
 * @returns Response with rate limit headers
 */
export async function withRateLimit(
  req: Request,
  limiter: RateLimiter,
  handler: (userId: string) => Promise<Response>
): Promise<Response> {
  // Get user ID from session
  const userId = await getUserIdentifier(req);

  if (!userId) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "Authentication required",
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Check rate limit
  const limitResult = await limiter.checkLimit(userId);

  // If rate limit exceeded, return 429
  if (!limitResult.allowed) {
    return createRateLimitResponse(limitResult);
  }

  // Execute handler
  try {
    const response = await handler(userId);

    // Add rate limit headers to successful response
    return addRateLimitHeaders(response, limitResult);
  } catch (error) {
    // Add rate limit headers even to error responses
    const errorResponse = new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message:
          error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return addRateLimitHeaders(errorResponse, limitResult);
  }
}

/**
 * Get user identifier from session or IP address
 *
 * Priority:
 * 1. NextAuth session user ID
 * 2. IP address from headers (Vercel, Cloudflare, standard)
 * 3. null if neither available
 *
 * @param req - Next.js Request object
 * @returns User identifier or null
 */
async function getUserIdentifier(req: Request): Promise<string | null> {
  // Try to get user from session
  const session = await auth();
  if (session?.user?.id) {
    return `user:${session.user.id}`;
  }

  // Fallback to IP address
  const ip = getClientIp(req);
  if (ip) {
    return `ip:${ip}`;
  }

  return null;
}

/**
 * Extract client IP address from request headers
 *
 * Checks headers in priority order:
 * 1. x-forwarded-for (Vercel, most proxies)
 * 2. x-real-ip (Nginx, Cloudflare)
 * 3. cf-connecting-ip (Cloudflare)
 *
 * @param req - Next.js Request object
 * @returns IP address or null
 */
function getClientIp(req: Request): string | null {
  // Check x-forwarded-for (Vercel, most proxies)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  // Check x-real-ip (Nginx, Cloudflare)
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Check cf-connecting-ip (Cloudflare specific)
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  return null;
}

/**
 * Create 429 Rate Limit Exceeded response
 *
 * @param limitResult - Rate limit result with retry information
 * @returns 429 Response with proper headers
 */
function createRateLimitResponse(limitResult: RateLimitResult): Response {
  const response = new Response(
    JSON.stringify({
      error: "Rate Limit Exceeded",
      message: "Too many requests. Please try again later.",
      retryAfter: limitResult.retryAfter,
      reset: limitResult.reset,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": limitResult.retryAfter?.toString() || "60",
      },
    }
  );

  return addRateLimitHeaders(response, limitResult);
}

/**
 * Add rate limit headers to response
 *
 * Headers:
 * - X-RateLimit-Limit: Total requests allowed per window
 * - X-RateLimit-Remaining: Requests remaining in current window
 * - X-RateLimit-Reset: Unix timestamp when limit resets
 *
 * @param response - Response to add headers to
 * @param limitResult - Rate limit result
 * @returns Response with added headers
 */
function addRateLimitHeaders(
  response: Response,
  limitResult: RateLimitResult
): Response {
  // Clone response to add headers (responses are immutable)
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  });

  // Add rate limit headers
  newResponse.headers.set(
    "X-RateLimit-Remaining",
    limitResult.remaining.toString()
  );
  newResponse.headers.set(
    "X-RateLimit-Reset",
    Math.floor(limitResult.reset / 1000).toString() // Convert to seconds
  );

  return newResponse;
}

/**
 * Simple rate limit check without middleware wrapper
 *
 * Useful when you need more control over the response.
 *
 * Example:
 * ```ts
 * const userId = await getUserId(req);
 * const limitResult = await checkRateLimit(userId, limiter);
 *
 * if (!limitResult.allowed) {
 *   return Response.json(
 *     { error: 'Rate limit exceeded' },
 *     { status: 429 }
 *   );
 * }
 * ```
 *
 * @param userId - User identifier
 * @param limiter - RateLimiter instance
 * @returns Rate limit result
 */
export async function checkRateLimit(
  userId: string,
  limiter: RateLimiter
): Promise<RateLimitResult> {
  return limiter.checkLimit(userId);
}

/**
 * Get user ID from request (exported for manual usage)
 *
 * @param req - Next.js Request object
 * @returns User identifier or null
 */
export async function getUserId(req: Request): Promise<string | null> {
  return getUserIdentifier(req);
}
