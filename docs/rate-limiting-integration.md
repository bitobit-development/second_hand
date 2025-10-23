# Rate Limiting Integration Guide

This guide shows how to integrate rate limiting into AI API routes.

## Quick Start

### 1. Basic Usage

```typescript
// app/api/enhance-image/route.ts
import { NextRequest } from "next/server";
import { withRateLimit, imageEnhancementLimiter } from "@/lib/ai";

export async function POST(req: NextRequest) {
  return withRateLimit(req, imageEnhancementLimiter, async (userId) => {
    const { imageUrl } = await req.json();

    // Your AI logic here
    const result = await enhanceImage(imageUrl);

    return Response.json({ success: true, result });
  });
}
```

### 2. Available Limiters

Pre-configured limiters are exported from `@/lib/ai/limiters`:

| Limiter | Requests/Minute | Requests/Hour |
|---------|-----------------|---------------|
| `imageEnhancementLimiter` | 10 | 100 |
| `descriptionGenerationLimiter` | 5 | 50 |

### 3. Custom Rate Limits

```typescript
import { createRateLimiter, withRateLimit } from "@/lib/ai";

const customLimiter = createRateLimiter({
  requestsPerMinute: 20,
  requestsPerHour: 200,
});

export async function POST(req: NextRequest) {
  return withRateLimit(req, customLimiter, async (userId) => {
    // Your logic
  });
}
```

## How It Works

### Sliding Window Algorithm

The rate limiter uses a **sliding window algorithm**, not fixed time windows:

```
Fixed Window (BAD):
T=0s: Request 1, 2, 3 (3/3 used)
T=60s: Window resets, Request 4, 5, 6 (3/3 used)
Result: 6 requests in 61 seconds allowed ❌

Sliding Window (GOOD):
T=0s: Request 1, 2, 3
T=30s: Request fails (3 requests in last 60s)
T=61s: Request succeeds (only 2 requests in last 60s)
Result: True rate limiting per 60-second window ✅
```

### User Identification

Rate limits are tracked per user using:

1. **NextAuth Session** (preferred): `user:${session.user.id}`
2. **IP Address** (fallback): `ip:${clientIp}`
3. **No ID** → Returns 401 Unauthorized

### Memory Management

- **Automatic cleanup**: Every 5 minutes
- **Entry retention**: 1 hour maximum
- **Cleanup logic**:
  - Removes requests older than 1 hour
  - Removes inactive users with no recent requests
  - Prevents memory leaks in long-running processes

## Response Headers

All responses include rate limit headers:

### Success Response (200)

```http
HTTP/1.1 200 OK
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1698765432
Content-Type: application/json

{
  "success": true,
  "result": { ... }
}
```

### Rate Limited Response (429)

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1698765432
Retry-After: 45
Content-Type: application/json

{
  "error": "Rate Limit Exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 45,
  "reset": 1698765432000
}
```

## Advanced Usage

### Manual Rate Limit Check

For more control, use `checkRateLimit` directly:

```typescript
import { checkRateLimit, getUserId, imageEnhancementLimiter } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitResult = await checkRateLimit(userId, imageEnhancementLimiter);

  if (!limitResult.allowed) {
    return Response.json(
      {
        error: "Rate limit exceeded",
        retryAfter: limitResult.retryAfter,
        reset: limitResult.reset
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.floor(limitResult.reset / 1000).toString(),
          "Retry-After": limitResult.retryAfter?.toString() || "60"
        }
      }
    );
  }

  // Your logic here
  const result = await processRequest();

  return Response.json(
    { success: true, result },
    {
      headers: {
        "X-RateLimit-Remaining": limitResult.remaining.toString(),
        "X-RateLimit-Reset": Math.floor(limitResult.reset / 1000).toString()
      }
    }
  );
}
```

### Multiple Rate Limiters

Apply different limits to different endpoints:

```typescript
// app/api/ai/enhance/route.ts
import { imageEnhancementLimiter } from "@/lib/ai";

export async function POST(req: NextRequest) {
  return withRateLimit(req, imageEnhancementLimiter, async (userId) => {
    // 10/min, 100/hr
  });
}

// app/api/ai/describe/route.ts
import { descriptionGenerationLimiter } from "@/lib/ai";

export async function POST(req: NextRequest) {
  return withRateLimit(req, descriptionGenerationLimiter, async (userId) => {
    // 5/min, 50/hr
  });
}
```

### Conditional Rate Limiting

Apply different limits based on user tier:

```typescript
import { createRateLimiter, withRateLimit } from "@/lib/ai";
import { auth } from "@/auth";

const freeTierLimiter = createRateLimiter({
  requestsPerMinute: 5,
  requestsPerHour: 50,
});

const premiumTierLimiter = createRateLimiter({
  requestsPerMinute: 20,
  requestsPerHour: 200,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const limiter = session?.user?.isPremium ? premiumTierLimiter : freeTierLimiter;

  return withRateLimit(req, limiter, async (userId) => {
    // Your logic
  });
}
```

## Testing

Run the rate limiter test suite:

```bash
npx tsx scripts/test-rate-limiter.ts
```

Tests verify:
- ✅ Minute and hour limits enforced
- ✅ Sliding window algorithm works correctly
- ✅ Multiple users tracked independently
- ✅ Automatic cleanup prevents memory leaks
- ✅ Rate limit headers are accurate
- ✅ Retry-After calculated correctly

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ API Route (app/api/enhance-image/route.ts)             │
├─────────────────────────────────────────────────────────┤
│ withRateLimit(req, limiter, handler)                    │
│   ↓                                                      │
│ 1. Extract userId from NextAuth session or IP           │
│ 2. Check rate limit: limiter.checkLimit(userId)         │
│ 3. If exceeded: Return 429 with headers                 │
│ 4. If allowed: Execute handler                          │
│ 5. Add rate limit headers to response                   │
└─────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────────┐
│ RateLimiter (lib/ai/rate-limiter.ts)                    │
├─────────────────────────────────────────────────────────┤
│ • In-memory Map storage (userId → request history)      │
│ • Sliding window algorithm (count requests in window)   │
│ • Separate minute and hour tracking                     │
│ • Automatic cleanup every 5 minutes                     │
│ • Memory-efficient (removes old entries)                │
└─────────────────────────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `lib/ai/rate-limiter.ts` | Core RateLimiter class with sliding window algorithm |
| `lib/ai/middleware.ts` | withRateLimit helper for API routes |
| `lib/ai/limiters.ts` | Pre-configured limiter instances |
| `lib/ai/types.ts` | TypeScript types for rate limiting |
| `scripts/test-rate-limiter.ts` | Comprehensive test suite |

## Best Practices

1. **Use pre-configured limiters** for standard AI endpoints
2. **Create custom limiters** for specialized use cases
3. **Always add rate limit headers** to help clients handle limits
4. **Monitor rate limit metrics** to adjust limits as needed
5. **Consider user tiers** for premium features
6. **Test rate limiting** before deploying to production
7. **Document limits** in API documentation for frontend developers

## Frontend Integration

Frontend should handle rate limit responses:

```typescript
// Frontend example
async function enhanceImage(imageUrl: string) {
  const response = await fetch("/api/enhance-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });

  const remaining = response.headers.get("X-RateLimit-Remaining");
  const reset = response.headers.get("X-RateLimit-Reset");

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    throw new Error(
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`
    );
  }

  return response.json();
}
```

## Production Considerations

### Scaling

For distributed systems, consider:
- **Redis** for shared rate limit state across instances
- **API Gateway** rate limiting (Vercel, AWS API Gateway)
- **Database-backed** rate limiting for persistence

### Monitoring

Track these metrics:
- Rate limit hits (429 responses)
- Requests per user
- Most active users
- Peak usage times

### Adjusting Limits

Monitor and adjust limits based on:
- API costs
- User feedback
- System capacity
- Business requirements
