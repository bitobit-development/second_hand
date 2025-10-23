/**
 * AI Image Enhancement Types
 */

export interface EnhancedImageResult {
  originalUrl: string;
  enhancedUrl: string;
  width: number;
  height: number;
  format: string;
}

export interface EnhancementError {
  code: "INVALID_URL" | "NOT_CLOUDINARY" | "ENHANCEMENT_FAILED";
  message: string;
}

/**
 * Rate Limiting Types
 */

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number; // Unix timestamp in milliseconds
  retryAfter?: number; // Seconds until retry
}

/**
 * Description Generation Types
 */

export interface DescriptionResult {
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

export interface GenerateDescriptionParams {
  imageUrl: string;
  title?: string;
  category: string;
  condition: string;
  template?: 'detailed' | 'concise' | 'seo';
}
