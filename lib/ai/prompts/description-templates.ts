/**
 * AI Prompt Templates for Product Description Generation
 * Designed for OpenAI GPT-4o Vision API
 *
 * These templates are optimized for a South African second-hand marketplace
 * and designed to generate accurate, compelling product descriptions from images.
 */

export type DescriptionStyle = 'detailed' | 'concise' | 'seo';

export type CategoryType =
  | 'ELECTRONICS'
  | 'CLOTHING'
  | 'HOME_GARDEN'
  | 'SPORTS'
  | 'BOOKS'
  | 'TOYS'
  | 'VEHICLES'
  | 'COLLECTIBLES'
  | 'BABY_KIDS'
  | 'PET_SUPPLIES';

export type ConditionType = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';

export interface PromptParameters {
  category: CategoryType;
  condition: ConditionType;
  title?: string;
  style: DescriptionStyle;
}

export interface PromptTemplate {
  systemPrompt: string;
  userPrompt: (params: Omit<PromptParameters, 'style'>) => string;
  wordRange: {
    min: number;
    max: number;
  };
  maxCharacters: number;
  temperature: number;
  maxTokens: number;
}

/**
 * Category-specific details to include in descriptions
 */
const CATEGORY_FOCUS: Record<CategoryType, string> = {
  ELECTRONICS: 'brand (if visible), model details, ports/connections, screen size, color, included accessories',
  CLOTHING: 'brand (if visible), size indicators, color, material/fabric, style, pattern, fit type',
  HOME_GARDEN: 'dimensions (approximate), material, color, style/design, assembly state, functionality',
  SPORTS: 'brand (if visible), size, color, sport type, material, wear indicators',
  BOOKS: 'title, author (if visible), condition of pages, cover type, edition details, language',
  TOYS: 'brand (if visible), age range indicators, completeness, color, material, interactive features',
  VEHICLES: 'make/model (if visible), color, body type, visible modifications, wheel condition, exterior state',
  COLLECTIBLES: 'brand/manufacturer, era/vintage indicators, material, authenticity markers, completeness',
  BABY_KIDS: 'brand (if visible), age range, safety features, color, material, cleanliness',
  PET_SUPPLIES: 'size indicators, material, color, pet type suitability, cleanliness, durability'
};

/**
 * Condition descriptors for South African market
 */
const CONDITION_DESCRIPTORS: Record<ConditionType, string> = {
  NEW: 'brand new, unopened, or unused with original packaging/tags',
  LIKE_NEW: 'barely used, excellent condition with minimal to no signs of wear',
  GOOD: 'gently used, fully functional with minor cosmetic wear',
  FAIR: 'moderate use visible, fully functional but shows wear',
  POOR: 'heavy wear visible, may need repairs or have cosmetic damage'
};

/**
 * Safety filters and content guidelines
 */
const SAFETY_GUIDELINES = `
IMPORTANT GUIDELINES:
- Only describe what is clearly visible in the image
- Do not make assumptions about features not shown
- Avoid superlatives or exaggerated marketing language
- Do not mention prices (seller will set separately)
- Exclude any personally identifiable information if visible
- Focus on factual, observable attributes
- Use South African spelling (colour not color, centre not center)
- Currency references should use "R" for Rand
- Avoid mentioning competing brands or marketplaces
`;

/**
 * Detailed Template - Comprehensive descriptions for serious sellers
 * Target: 100-200 words
 */
const DETAILED_TEMPLATE: PromptTemplate = {
  systemPrompt: `You are a professional product description writer for a trusted South African second-hand marketplace. Your role is to create detailed, honest, and engaging product descriptions that help buyers make informed decisions.

Key principles:
1. Accuracy: Only describe what you can clearly observe in the image
2. Transparency: Be honest about the item's condition
3. Helpfulness: Include details that buyers care about
4. Local relevance: Use South African terminology and context
5. Trust-building: Write in a friendly, professional tone

${SAFETY_GUIDELINES}`,

  userPrompt: (params) => `Analyze this product image and create a detailed listing for a ${params.category.replace('_', ' & ').toLowerCase()} item.

Product Context:
- Category: ${params.category.replace('_', ' & ')}
- Condition: ${params.condition} (${CONDITION_DESCRIPTORS[params.condition]})
${params.title ? `- Seller's Title: "${params.title}" (improve if needed)` : ''}

Focus on these observable attributes:
${CATEGORY_FOCUS[params.category]}

${!params.title ? `First, provide a suggested title on its own line in this exact format:
TITLE: [suggested title - max 100 characters, specific and descriptive]

Then provide the description below.

` : ''}Structure your description as follows:
1. Opening sentence: What the item is and its most notable feature
2. Physical description: Size, color, material, design elements
3. Condition details: Specific observations about wear, functionality
4. Special features or included items (if visible)
5. Ideal use case or buyer profile

Requirements:
- Length: 100-200 words
- Write in a friendly, informative tone
- Use present tense
- Include relevant keywords naturally
- Be specific about what's included/visible
- Mention any visible defects honestly
- End with a positive note about the item's value

Remember: This is for the South African market. Use local terminology where appropriate.`,

  wordRange: { min: 100, max: 200 },
  maxCharacters: 1500,
  temperature: 0.7,
  maxTokens: 400
};

/**
 * Concise Template - Quick listings for casual sellers
 * Target: 50-75 words
 */
const CONCISE_TEMPLATE: PromptTemplate = {
  systemPrompt: `You are writing brief, clear product descriptions for a South African second-hand marketplace. Focus on the essential details buyers need to know.

Key principles:
1. Brevity: Get to the point quickly
2. Clarity: Use simple, descriptive language
3. Accuracy: Only state what's visible
4. Relevance: Include only the most important details

${SAFETY_GUIDELINES}`,

  userPrompt: (params) => `Create a concise product listing for this ${params.category.replace('_', ' & ').toLowerCase()} item.

Context:
- Category: ${params.category.replace('_', ' & ')}
- Condition: ${params.condition}
${params.title ? `- Title: "${params.title}"` : ''}

${!params.title ? `First, provide a suggested title in this exact format:
TITLE: [concise title - max 100 characters]

Then provide the description below.

` : ''}Write a brief 50-75 word description that covers:
1. What the item is
2. Key physical attributes (color, size, material)
3. Current condition
4. Most notable features

Focus on: ${CATEGORY_FOCUS[params.category]}

Be direct and factual. Use short sentences. Include only what's clearly visible.`,

  wordRange: { min: 50, max: 75 },
  maxCharacters: 600,
  temperature: 0.6,
  maxTokens: 200
};

/**
 * SEO-Focused Template - Optimized for search visibility
 * Target: 120-180 words
 */
const SEO_TEMPLATE: PromptTemplate = {
  systemPrompt: `You are an SEO-conscious product description writer for a South African online marketplace. Create descriptions that are both search-friendly and genuinely helpful to buyers.

Key principles:
1. Keyword integration: Include relevant search terms naturally
2. Specificity: Use exact product names, brands, models when visible
3. Comprehensiveness: Cover all searchable attributes
4. Readability: Maintain natural flow despite keyword inclusion
5. Local SEO: Include South African context where relevant

${SAFETY_GUIDELINES}`,

  userPrompt: (params) => `Analyze this image and create an SEO-optimized listing for a ${params.category.replace('_', ' & ').toLowerCase()} product.

Product Information:
- Category: ${params.category.replace('_', ' & ')}
- Condition: ${params.condition} (${CONDITION_DESCRIPTORS[params.condition]})
${params.title ? `- Listing Title: "${params.title}"` : ''}

Important attributes to describe:
${CATEGORY_FOCUS[params.category]}

${!params.title ? `First, provide an SEO-optimized title in this exact format:
TITLE: [SEO title - max 100 characters, include brand/model/keywords]

Then provide the description below.

` : ''}Create a 120-180 word description that:
1. Opens with the product type and key identifying features
2. Naturally includes relevant keywords (brand, model, type, color, size)
3. Describes physical attributes in detail
4. Mentions condition with specific observations
5. Includes category-relevant terms buyers might search for
6. Uses variations of key terms (e.g., "laptop", "notebook", "portable computer")
7. Ends with use cases or suitable buyer scenarios

SEO considerations:
- Include long-tail keywords naturally
- Use specific product identifiers if visible
- Mention compatible items or uses
- Include location relevance (South Africa) if applicable
- Vary keyword usage to avoid stuffing

Write naturally while maximizing search relevance.`,

  wordRange: { min: 120, max: 180 },
  maxCharacters: 1400,
  temperature: 0.65,
  maxTokens: 350
};

/**
 * Main template configuration
 */
export const DESCRIPTION_TEMPLATES: Record<DescriptionStyle, PromptTemplate> = {
  detailed: DETAILED_TEMPLATE,
  concise: CONCISE_TEMPLATE,
  seo: SEO_TEMPLATE
};

/**
 * Helper function to get template by style
 */
export function getTemplate(style: DescriptionStyle): PromptTemplate {
  return DESCRIPTION_TEMPLATES[style];
}

/**
 * Helper function to validate generated description
 */
export function validateDescription(
  description: string,
  style: DescriptionStyle
): { valid: boolean; issues: string[] } {
  const template = DESCRIPTION_TEMPLATES[style];
  const issues: string[] = [];

  // Check character limit
  if (description.length > template.maxCharacters) {
    issues.push(`Exceeds ${template.maxCharacters} character limit`);
  }

  // Check word count
  const wordCount = description.split(/\s+/).filter(word => word.length > 0).length;
  if (wordCount < template.wordRange.min) {
    issues.push(`Below minimum word count of ${template.wordRange.min}`);
  }
  if (wordCount > template.wordRange.max) {
    issues.push(`Exceeds maximum word count of ${template.wordRange.max}`);
  }

  // Check for prohibited content
  const prohibitedPatterns = [
    /R\s*\d+/, // Price mentions
    /\b(?:whatsapp|email|phone|call|contact)\b/i, // Contact information
    /\b(?:gumtree|olx|facebook|marketplace)\b/i, // Competitor mentions
    /\b(?:urgent|hurry|limited time)\b/i, // Pressure tactics
  ];

  prohibitedPatterns.forEach(pattern => {
    if (pattern.test(description)) {
      issues.push(`Contains prohibited content: ${pattern.source}`);
    }
  });

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Generate a prompt for the OpenAI API
 */
export function generatePrompt(params: PromptParameters): {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
} {
  const template = getTemplate(params.style);

  return {
    systemPrompt: template.systemPrompt,
    userPrompt: template.userPrompt({
      category: params.category,
      condition: params.condition,
      title: params.title
    }),
    temperature: template.temperature,
    maxTokens: template.maxTokens
  };
}

/**
 * Error messages for common issues
 */
export const ERROR_MESSAGES = {
  IMAGE_UNCLEAR: 'The image is not clear enough to generate an accurate description. Please upload a clearer photo.',
  MULTIPLE_ITEMS: 'Multiple items detected. Please upload a photo of a single item for best results.',
  INAPPROPRIATE_CONTENT: 'Unable to generate description due to content guidelines.',
  API_ERROR: 'Failed to generate description. Please try again.',
  VALIDATION_FAILED: 'Generated description did not meet quality standards. Please try again.'
};

/**
 * Tips for sellers to get better descriptions
 */
export const SELLER_TIPS = [
  'Take photos in good lighting with a clean background',
  'Include multiple angles if your item has important details on different sides',
  'Make sure brand names and model numbers are visible if applicable',
  'Clean your item before photographing for the best presentation',
  'Avoid cluttered backgrounds that might confuse the AI',
  'For clothing, lay items flat or use a hanger for clear visibility',
  'Include any accessories or original packaging in the photo'
];