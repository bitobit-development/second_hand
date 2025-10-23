import { RateLimitConfig, RateLimitResult } from "./types";

/**
 * Request timestamp entry for sliding window tracking
 */
interface RequestEntry {
  timestamp: number; // Unix timestamp in milliseconds
}

/**
 * User request history for rate limiting
 */
interface UserRequestHistory {
  requests: RequestEntry[];
  lastCleanup: number;
}

/**
 * Rate Limiter with Sliding Window Algorithm
 *
 * Tracks requests per user with separate minute and hour windows.
 * Uses in-memory Map storage with automatic cleanup.
 *
 * Features:
 * - Sliding window algorithm (not fixed windows)
 * - Per-user tracking (userId or IP fallback)
 * - Separate minute/hour limits
 * - Automatic cleanup of old entries
 * - Memory-efficient (removes entries older than 1 hour)
 *
 * Example:
 * ```ts
 * const limiter = new RateLimiter({
 *   requestsPerMinute: 10,
 *   requestsPerHour: 100
 * });
 *
 * const result = await limiter.checkLimit(userId);
 * if (!result.allowed) {
 *   return new Response('Rate limit exceeded', {
 *     status: 429,
 *     headers: {
 *       'X-RateLimit-Limit': '10',
 *       'X-RateLimit-Remaining': '0',
 *       'X-RateLimit-Reset': result.reset.toString(),
 *       'Retry-After': result.retryAfter?.toString() || '60'
 *     }
 *   });
 * }
 * ```
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private userRequests: Map<string, UserRequestHistory>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  // Time windows in milliseconds
  private readonly MINUTE_WINDOW = 60 * 1000; // 60 seconds
  private readonly HOUR_WINDOW = 60 * 60 * 1000; // 3600 seconds
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_AGE = 60 * 60 * 1000; // 1 hour

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.userRequests = new Map();

    // Start automatic cleanup
    this.startCleanup();
  }

  /**
   * Check if user has exceeded rate limits
   *
   * Uses sliding window algorithm:
   * 1. Remove requests older than window
   * 2. Count remaining requests in window
   * 3. Compare against limit
   * 4. Add new request if allowed
   *
   * @param userId - User identifier (or IP address)
   * @returns Rate limit result with allowed status and metadata
   */
  async checkLimit(userId: string): Promise<RateLimitResult> {
    const now = Date.now();
    const history = this.getUserHistory(userId);

    // Clean up old requests for this user
    this.cleanupUserRequests(history, now);

    // Count requests in minute and hour windows
    const minuteRequests = this.countRequestsInWindow(
      history.requests,
      now,
      this.MINUTE_WINDOW
    );
    const hourRequests = this.countRequestsInWindow(
      history.requests,
      now,
      this.HOUR_WINDOW
    );

    // Check minute limit
    if (minuteRequests >= this.config.requestsPerMinute) {
      const oldestInMinute = this.getOldestRequestInWindow(
        history.requests,
        now,
        this.MINUTE_WINDOW
      );
      const resetTime = oldestInMinute + this.MINUTE_WINDOW;
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        reset: resetTime,
        retryAfter,
      };
    }

    // Check hour limit
    if (hourRequests >= this.config.requestsPerHour) {
      const oldestInHour = this.getOldestRequestInWindow(
        history.requests,
        now,
        this.HOUR_WINDOW
      );
      const resetTime = oldestInHour + this.HOUR_WINDOW;
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        reset: resetTime,
        retryAfter,
      };
    }

    // Add new request
    history.requests.push({ timestamp: now });

    // Calculate remaining (most restrictive limit)
    // After adding this request, how many more can we make?
    const minuteRemaining = this.config.requestsPerMinute - (minuteRequests + 1);
    const hourRemaining = this.config.requestsPerHour - (hourRequests + 1);
    const remaining = Math.min(minuteRemaining, hourRemaining);

    // Calculate next reset time (when oldest request in most restrictive window expires)
    let reset: number;
    if (minuteRemaining < hourRemaining) {
      // Minute window is more restrictive
      const oldestInMinute = this.getOldestRequestInWindow(
        history.requests,
        now,
        this.MINUTE_WINDOW
      );
      reset = oldestInMinute + this.MINUTE_WINDOW;
    } else {
      // Hour window is more restrictive (or equal)
      const oldestInHour = this.getOldestRequestInWindow(
        history.requests,
        now,
        this.HOUR_WINDOW
      );
      reset = oldestInHour + this.HOUR_WINDOW;
    }

    return {
      allowed: true,
      remaining: Math.max(0, remaining),
      reset,
    };
  }

  /**
   * Get or create user request history
   */
  private getUserHistory(userId: string): UserRequestHistory {
    let history = this.userRequests.get(userId);

    if (!history) {
      history = {
        requests: [],
        lastCleanup: Date.now(),
      };
      this.userRequests.set(userId, history);
    }

    return history;
  }

  /**
   * Count requests within a time window
   */
  private countRequestsInWindow(
    requests: RequestEntry[],
    now: number,
    windowMs: number
  ): number {
    const windowStart = now - windowMs;
    return requests.filter((req) => req.timestamp > windowStart).length;
  }

  /**
   * Get oldest request timestamp in a time window
   */
  private getOldestRequestInWindow(
    requests: RequestEntry[],
    now: number,
    windowMs: number
  ): number {
    const windowStart = now - windowMs;
    const requestsInWindow = requests.filter(
      (req) => req.timestamp > windowStart
    );
    return requestsInWindow[0]?.timestamp || now;
  }

  /**
   * Remove requests older than hour window for a user
   */
  private cleanupUserRequests(history: UserRequestHistory, now: number): void {
    const cutoff = now - this.HOUR_WINDOW;
    history.requests = history.requests.filter(
      (req) => req.timestamp > cutoff
    );
    history.lastCleanup = now;
  }

  /**
   * Global cleanup - remove old entries and inactive users
   */
  cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.MAX_AGE;

    // Convert to array to avoid iterator issues
    const entries = Array.from(this.userRequests.entries());

    for (const [userId, history] of entries) {
      // Remove old requests
      history.requests = history.requests.filter(
        (req) => req.timestamp > cutoff
      );

      // Remove user if no recent requests
      if (history.requests.length === 0 && history.lastCleanup < cutoff) {
        this.userRequests.delete(userId);
      }
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanup(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);

    // Don't prevent Node.js from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop automatic cleanup (for testing or shutdown)
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get current stats (for debugging)
   */
  getStats(): {
    totalUsers: number;
    totalRequests: number;
  } {
    let totalRequests = 0;
    // Convert to array to avoid iterator issues
    const histories = Array.from(this.userRequests.values());
    for (const history of histories) {
      totalRequests += history.requests.length;
    }

    return {
      totalUsers: this.userRequests.size,
      totalRequests,
    };
  }
}
