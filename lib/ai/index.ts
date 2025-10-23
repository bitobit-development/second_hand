/**
 * AI Enhancement Module
 *
 * Exports all AI-powered utilities for product listings
 */

// Image enhancement
export { enhanceProductImage, enhanceProductImages } from "./enhance-image";

// Description generation
export {
  generateProductDescription,
  generateMultipleDescriptions,
} from "./generate-description";

// Error handling
export {
  AIError,
  createOpenAIError,
  createRateLimitError,
  createInvalidImageError,
  createNoImageError,
  createValidationError,
  createTimeoutError,
  isAIError,
  getUserFriendlyMessage,
  AI_ERROR_CODES,
} from "./errors";

// Rate limiting
export { RateLimiter } from "./rate-limiter";
export { withRateLimit, checkRateLimit, getUserId } from "./middleware";
export {
  imageEnhancementLimiter,
  descriptionGenerationLimiter,
  createRateLimiter,
} from "./limiters";

// Types
export type {
  EnhancedImageResult,
  EnhancementError,
  DescriptionResult,
  GenerateDescriptionParams,
  RateLimitConfig,
  RateLimitResult,
} from "./types";

export type { AIErrorCode } from "./errors";
