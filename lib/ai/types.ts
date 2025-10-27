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

/**
 * Category Suggestion Types
 */

export interface CategorySuggestion {
  category: string;
  parentCategory: string;
  confidence: number;
  reasoning: string;
  granularity: 'base' | 'subcategory' | 'specific';
}

export interface CategorySuggestionResult {
  suggestions: CategorySuggestion[];
  createNew: boolean;
  grouping: string;
  qualityIssues?: string[];
  tokensUsed?: number;
}

export interface CategorySuggestParams {
  imageUrls: string[];
  context?: string;
  promptVersion?: 'v1' | 'v2' | 'v3';
  temperature?: number;
}

/**
 * Category Matching Types
 */

export interface CategoryMatchResult {
  match: { name: string; slug: string; parentId?: string } | null;
  confidence: number;
  shouldCreateNew: boolean;
  similarCategories?: Array<{ name: string; similarity: number }>;
}

/**
 * Category Cache Types
 */

export interface CategoryCacheEntry {
  key: string;
  result: CategorySuggestionResult;
  timestamp: number;
  expiresAt: number;
}

/**
 * Image Upload Types
 */

export interface UploadedImage {
  originalUrl: string;      // Original uploaded image
  squareUrl: string;         // 1000x1000 AI-cropped for listing cards
  portraitUrl: string;       // 750x1000 AI-cropped for upload preview
  thumbnailUrl: string;      // 400x400 AI-cropped for thumbnails
  publicId: string;          // Cloudinary public ID
  width: number;             // Original width
  height: number;            // Original height
  format: string;            // Image format
}
