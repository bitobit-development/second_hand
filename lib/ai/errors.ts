/**
 * AI Error Classes
 *
 * Custom error types for AI operations with specific error codes
 */

export class AIError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AIError';
    this.code = code;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIError);
    }
  }
}

/**
 * Error codes for AI operations
 */
export const AI_ERROR_CODES = {
  // OpenAI API errors
  OPENAI_ERROR: 'OPENAI_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',

  // Image errors
  INVALID_IMAGE: 'INVALID_IMAGE',
  NO_IMAGE: 'NO_IMAGE',

  // Validation errors
  INVALID_PARAMS: 'INVALID_PARAMS',
  VALIDATION_FAILED: 'VALIDATION_FAILED',

  // Content errors
  INAPPROPRIATE_CONTENT: 'INAPPROPRIATE_CONTENT',
  UNCLEAR_IMAGE: 'UNCLEAR_IMAGE',
  MULTIPLE_ITEMS: 'MULTIPLE_ITEMS',

  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  TIMEOUT: 'TIMEOUT',
} as const;

export type AIErrorCode = typeof AI_ERROR_CODES[keyof typeof AI_ERROR_CODES];

/**
 * Factory functions for common AI errors
 */
export function createOpenAIError(message: string): AIError {
  return new AIError(AI_ERROR_CODES.OPENAI_ERROR, message);
}

export function createRateLimitError(retryAfter?: number): AIError {
  const message = retryAfter
    ? `Rate limit exceeded. Retry after ${retryAfter} seconds.`
    : 'Rate limit exceeded. Please try again later.';
  return new AIError(AI_ERROR_CODES.RATE_LIMIT, message);
}

export function createInvalidImageError(message: string = 'Invalid or inaccessible image URL'): AIError {
  return new AIError(AI_ERROR_CODES.INVALID_IMAGE, message);
}

export function createNoImageError(): AIError {
  return new AIError(AI_ERROR_CODES.NO_IMAGE, 'No image URL provided');
}

export function createValidationError(message: string): AIError {
  return new AIError(AI_ERROR_CODES.VALIDATION_FAILED, message);
}

export function createTimeoutError(): AIError {
  return new AIError(AI_ERROR_CODES.TIMEOUT, 'Request timed out after 30 seconds');
}

/**
 * Check if an error is an AIError
 */
export function isAIError(error: unknown): error is AIError {
  return error instanceof AIError;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AIError): string {
  switch (error.code) {
    case AI_ERROR_CODES.OPENAI_ERROR:
      return 'Failed to generate description. Please try again.';
    case AI_ERROR_CODES.RATE_LIMIT:
      return 'Too many requests. Please wait a moment and try again.';
    case AI_ERROR_CODES.INVALID_IMAGE:
      return 'Image could not be processed. Please upload a different photo.';
    case AI_ERROR_CODES.NO_IMAGE:
      return 'Please upload an image to generate a description.';
    case AI_ERROR_CODES.VALIDATION_FAILED:
      return 'Generated description did not meet quality standards. Please try again.';
    case AI_ERROR_CODES.TIMEOUT:
      return 'Request took too long. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
