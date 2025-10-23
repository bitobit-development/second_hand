/**
 * AI-Powered Product Description Generation
 *
 * Uses OpenAI GPT-4o Vision API to analyze product images and generate
 * high-quality descriptions using our prompt templates.
 */

import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';
import { generatePrompt } from './prompts/description-templates';
import type { CategoryType, ConditionType, DescriptionStyle } from './prompts/description-templates';
import type { DescriptionResult, GenerateDescriptionParams } from './types';
import {
  AIError,
  createOpenAIError,
  createRateLimitError,
  createInvalidImageError,
  createNoImageError,
  createTimeoutError,
  createValidationError,
} from './errors';

/**
 * OpenAI client instance
 */
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw createOpenAIError('OPENAI_API_KEY environment variable is not set');
    }

    openaiClient = new OpenAI({
      apiKey,
      timeout: 30000, // 30 second timeout
    });
  }

  return openaiClient;
}

/**
 * Configuration for description generation
 */
const CONFIG = {
  model: 'gpt-4o', // GPT-4o Vision model
  fallbackModel: 'gpt-4o-mini', // Fallback if rate limited
  maxCharacters: 2000,
  timeout: 30000, // 30 seconds
  maxRetries: 2,
} as const;

/**
 * Extract attributes from description text
 *
 * Uses simple regex patterns to extract common attributes mentioned
 * in the generated description.
 */
function extractAttributes(description: string): {
  color?: string;
  material?: string;
  brand?: string;
  style?: string;
} {
  const attributes: {
    color?: string;
    material?: string;
    brand?: string;
    style?: string;
  } = {};

  // Common colors
  const colorPattern = /\b(black|white|grey|gray|blue|red|green|yellow|orange|purple|pink|brown|beige|navy|silver|gold|cream|khaki|maroon)\b/i;
  const colorMatch = description.match(colorPattern);
  if (colorMatch) {
    attributes.color = colorMatch[1].toLowerCase();
  }

  // Common materials
  const materialPattern = /\b(cotton|polyester|leather|metal|plastic|wood|glass|ceramic|steel|aluminium|aluminum|fabric|denim|silk|wool|suede|canvas|rubber)\b/i;
  const materialMatch = description.match(materialPattern);
  if (materialMatch) {
    attributes.material = materialMatch[1].toLowerCase();
  }

  // Brand mentions (look for capitalized words that might be brands)
  const brandPattern = /\b(Nike|Adidas|Samsung|Apple|Sony|LG|HP|Dell|Lenovo|Asus|Ikea|Zara|H&M|Levi's|Puma|Reebok|Canon|Nikon|Bosch|Philips)\b/;
  const brandMatch = description.match(brandPattern);
  if (brandMatch) {
    attributes.brand = brandMatch[1];
  }

  // Style keywords
  const stylePattern = /\b(modern|vintage|classic|contemporary|traditional|minimalist|rustic|industrial|bohemian|casual|formal|sporty|elegant)\b/i;
  const styleMatch = description.match(stylePattern);
  if (styleMatch) {
    attributes.style = styleMatch[1].toLowerCase();
  }

  return attributes;
}

/**
 * Truncate description gracefully if it exceeds character limit
 */
function truncateDescription(description: string, maxChars: number): string {
  if (description.length <= maxChars) {
    return description;
  }

  // Truncate at the last complete sentence before the limit
  const truncated = description.substring(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');

  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

  if (lastSentenceEnd > 0 && lastSentenceEnd > maxChars * 0.7) {
    // Found a sentence boundary and it's not too far back
    return truncated.substring(0, lastSentenceEnd + 1).trim();
  }

  // Fallback: truncate at last space and add ellipsis
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }

  // Last resort: hard truncate with ellipsis
  return truncated.trim() + '...';
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Validate image URL format
 */
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Check if it's HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Check if it has a valid image extension or is from known image hosts
    const isKnownHost = ['cloudinary.com', 'unsplash.com', 'imgur.com'].some(
      host => parsed.hostname.includes(host)
    );
    const hasImageExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(parsed.pathname);

    return isKnownHost || hasImageExtension;
  } catch {
    return false;
  }
}

/**
 * Validate input parameters
 */
function validateParams(params: GenerateDescriptionParams): void {
  if (!params.imageUrl) {
    throw createNoImageError();
  }

  if (!isValidImageUrl(params.imageUrl)) {
    throw createInvalidImageError('Invalid image URL format');
  }

  const validCategories: CategoryType[] = [
    'ELECTRONICS', 'CLOTHING', 'HOME_GARDEN', 'SPORTS', 'BOOKS',
    'TOYS', 'VEHICLES', 'COLLECTIBLES', 'BABY_KIDS', 'PET_SUPPLIES'
  ];

  if (!validCategories.includes(params.category as CategoryType)) {
    throw new AIError('INVALID_PARAMS', `Invalid category: ${params.category}`);
  }

  const validConditions: ConditionType[] = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];

  if (!validConditions.includes(params.condition as ConditionType)) {
    throw new AIError('INVALID_PARAMS', `Invalid condition: ${params.condition}`);
  }
}

/**
 * Generate product description from image using OpenAI GPT-4o Vision API
 *
 * @param params - Description generation parameters
 * @returns Promise<DescriptionResult> - Generated description with metadata
 * @throws {AIError} - Specific error codes for different failure scenarios
 *
 * @example
 * ```typescript
 * const result = await generateProductDescription({
 *   imageUrl: 'https://example.com/product.jpg',
 *   title: 'Vintage Leather Jacket',
 *   category: 'CLOTHING',
 *   condition: 'GOOD',
 *   template: 'detailed'
 * });
 * console.log(result.description);
 * console.log(result.attributes.color); // 'brown'
 * ```
 */
export async function generateProductDescription(
  params: GenerateDescriptionParams
): Promise<DescriptionResult> {
  // Validate input parameters
  validateParams(params);

  const { imageUrl, title, category, condition, template = 'detailed' } = params;

  try {
    // Get OpenAI client
    const client = getOpenAIClient();

    // Generate prompt using templates
    const { systemPrompt, userPrompt, temperature, maxTokens } = generatePrompt({
      category: category as CategoryType,
      condition: condition as ConditionType,
      title,
      style: template as DescriptionStyle,
    });

    // Prepare messages for OpenAI API
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userPrompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high', // High detail for better analysis
            },
          },
        ],
      },
    ];

    // Call OpenAI API with timeout
    const completion = await Promise.race([
      client.chat.completions.create({
        model: CONFIG.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: 0.9,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(createTimeoutError()), CONFIG.timeout)
      ),
    ]);

    // Extract description from response
    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw createOpenAIError('No description generated from API response');
    }

    // Try to extract title if the response includes one
    // Format expected: "TITLE: [title]\n\n[description]" or just "[description]"
    let suggestedTitle: string | undefined;
    let description = content;

    const titleMatch = content.match(/^TITLE:\s*(.+?)(?:\n\n|\n)/);
    if (titleMatch) {
      suggestedTitle = titleMatch[1].trim();
      // Remove title line from description
      description = content.replace(/^TITLE:\s*.+?\n\n?/, '').trim();
    }

    // Truncate if exceeds character limit
    const truncatedDescription = truncateDescription(description, CONFIG.maxCharacters);

    // Count words and characters
    const wordCount = countWords(truncatedDescription);
    const characterCount = truncatedDescription.length;

    // Extract attributes from description
    const attributes = extractAttributes(truncatedDescription);

    // Validate word count is reasonable
    if (wordCount < 20) {
      throw createValidationError('Generated description is too short');
    }

    return {
      description: truncatedDescription,
      suggestedTitle,
      wordCount,
      characterCount,
      attributes,
    };

  } catch (error) {
    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        // Rate limit error
        const retryAfter = error.headers?.['retry-after'];
        throw createRateLimitError(retryAfter ? parseInt(retryAfter, 10) : undefined);
      }

      if (error.status === 400) {
        // Bad request - likely invalid image
        throw createInvalidImageError('Image could not be processed by API');
      }

      // Generic OpenAI error
      throw createOpenAIError(`OpenAI API error: ${error.message}`);
    }

    // Re-throw AIErrors
    if (error instanceof AIError) {
      throw error;
    }

    // Unknown error
    console.error('Unexpected error in generateProductDescription:', error);
    throw createOpenAIError('An unexpected error occurred while generating description');
  }
}

/**
 * Generate multiple descriptions with different templates
 *
 * Useful for giving sellers options to choose from.
 *
 * @param params - Base parameters (without template)
 * @returns Promise with descriptions for all three templates
 */
export async function generateMultipleDescriptions(
  params: Omit<GenerateDescriptionParams, 'template'>
): Promise<{
  detailed: DescriptionResult;
  concise: DescriptionResult;
  seo: DescriptionResult;
}> {
  const [detailed, concise, seo] = await Promise.all([
    generateProductDescription({ ...params, template: 'detailed' }),
    generateProductDescription({ ...params, template: 'concise' }),
    generateProductDescription({ ...params, template: 'seo' }),
  ]);

  return { detailed, concise, seo };
}

/**
 * Reset OpenAI client (useful for testing)
 */
export function resetClient(): void {
  openaiClient = null;
}
