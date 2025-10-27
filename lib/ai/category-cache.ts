/**
 * Category Suggestion Caching Layer
 *
 * Simple in-memory caching to reduce OpenAI API costs.
 * Caches category suggestions based on image hash.
 *
 * Features:
 * - In-memory Map storage
 * - TTL-based expiration (15 minutes)
 * - Automatic cleanup
 * - Cache hit metrics
 *
 * Future Enhancement:
 * - Upgrade to Redis for distributed caching
 * - Add LRU eviction policy
 * - Persist cache across restarts
 */

import { CategorySuggestionResult, CategoryCacheEntry } from './types';

/**
 * Cache configuration
 */
interface CacheConfig {
  ttlMinutes: number; // Time to live in minutes
  maxEntries: number; // Maximum cache entries
  cleanupIntervalMinutes: number; // How often to run cleanup
}

/**
 * Cache metrics for monitoring
 */
interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number; // Percentage
  size: number; // Current number of entries
}

/**
 * Category Suggestion Cache
 */
export class CategoryCache {
  private cache: Map<string, CategoryCacheEntry>;
  private config: CacheConfig;
  private metrics: { hits: number; misses: number; totalRequests: number };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new Map();
    this.config = {
      ttlMinutes: config?.ttlMinutes || 15,
      maxEntries: config?.maxEntries || 1000,
      cleanupIntervalMinutes: config?.cleanupIntervalMinutes || 5,
    };
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
    };

    // Start automatic cleanup
    this.startCleanup();
  }

  /**
   * Get cached result
   *
   * @param imageUrl - First image URL (used as cache key)
   * @returns Cached result or null if not found/expired
   */
  get(imageUrl: string): CategorySuggestionResult | null {
    this.metrics.totalRequests++;

    const key = this.generateKey(imageUrl);
    const entry = this.cache.get(key);

    // Cache miss
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      this.metrics.misses++;
      return null;
    }

    // Cache hit
    this.metrics.hits++;
    return entry.result;
  }

  /**
   * Set cache entry
   *
   * @param imageUrl - First image URL (used as cache key)
   * @param result - Category suggestion result
   */
  set(imageUrl: string, result: CategorySuggestionResult): void {
    const key = this.generateKey(imageUrl);
    const now = Date.now();
    const ttlMs = this.config.ttlMinutes * 60 * 1000;

    const entry: CategoryCacheEntry = {
      key,
      result,
      timestamp: now,
      expiresAt: now + ttlMs,
    };

    // Check if cache is full
    if (this.cache.size >= this.config.maxEntries) {
      // Evict oldest entry (simple FIFO)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, entry);
  }

  /**
   * Delete cache entry
   *
   * @param imageUrl - Image URL
   */
  delete(imageUrl: string): boolean {
    const key = this.generateKey(imageUrl);
    return this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.metrics = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
    };
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    const hitRate =
      this.metrics.totalRequests > 0
        ? (this.metrics.hits / this.metrics.totalRequests) * 100
        : 0;

    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      totalRequests: this.metrics.totalRequests,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
    };
  }

  /**
   * Generate cache key from image URL
   *
   * Uses simple hash of URL for now.
   * Future: Could use image perceptual hash for better matching.
   *
   * @param imageUrl - Image URL
   * @returns Cache key
   */
  private generateKey(imageUrl: string): string {
    // Simple hash function (good enough for MVP)
    let hash = 0;
    for (let i = 0; i < imageUrl.length; i++) {
      const char = imageUrl.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `category:${Math.abs(hash).toString(36)}`;
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanup(): void {
    if (this.cleanupInterval) return;

    const intervalMs = this.config.cleanupIntervalMinutes * 60 * 1000;

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, intervalMs);

    // Don't prevent Node.js from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if key exists
   */
  has(imageUrl: string): boolean {
    const key = this.generateKey(imageUrl);
    return this.cache.has(key);
  }
}

/**
 * Singleton cache instance
 */
export const categorySuggestCache = new CategoryCache({
  ttlMinutes: 15, // 15 minutes TTL
  maxEntries: 1000, // Store up to 1000 results
  cleanupIntervalMinutes: 5, // Cleanup every 5 minutes
});

/**
 * Helper functions for easier usage
 */

export function getCachedCategorySuggestion(
  imageUrl: string
): CategorySuggestionResult | null {
  return categorySuggestCache.get(imageUrl);
}

export function setCachedCategorySuggestion(
  imageUrl: string,
  result: CategorySuggestionResult
): void {
  categorySuggestCache.set(imageUrl, result);
}

export function clearCategorySuggestionCache(): void {
  categorySuggestCache.clear();
}

export function getCategoryCacheMetrics(): CacheMetrics {
  return categorySuggestCache.getMetrics();
}
