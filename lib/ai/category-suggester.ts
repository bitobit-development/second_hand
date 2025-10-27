/**
 * Category Suggestion Service using GPT-4o Vision
 */

import OpenAI from 'openai'
import {
  buildCategorySuggestionPrompt,
  validateCategoryResponse,
  CategorySuggestionResponse,
  EDGE_CASE_PROMPTS
} from './prompts/category-suggestion'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export interface CategorySuggestionOptions {
  images: string[] // Base64 or URLs
  promptVersion?: 'v1' | 'v2' | 'v3'
  includeFewShot?: boolean
  maxTokens?: number
  temperature?: number
}

/**
 * Suggest categories for product images using GPT-4o Vision
 */
export async function suggestCategories({
  images,
  promptVersion = 'v1',
  includeFewShot = false,
  maxTokens = 300,
  temperature = 0.2
}: CategorySuggestionOptions): Promise<CategorySuggestionResponse> {
  if (!images || images.length === 0) {
    throw new Error('At least one image is required')
  }

  // Build the prompt
  const systemPrompt = buildCategorySuggestionPrompt(promptVersion, includeFewShot)

  // Prepare image content
  // Images can be: Cloudinary URLs (https://...), data URLs (data:image/...), or base64 strings
  const imageContent = images.slice(0, 5).map(image => {
    let imageUrl: string;

    if (image.startsWith('data:')) {
      // Already a data URL
      imageUrl = image;
    } else if (image.startsWith('http://') || image.startsWith('https://')) {
      // Cloudinary or external URL - use directly
      imageUrl = image;
    } else {
      // Assume it's a base64 string, convert to data URL
      imageUrl = `data:image/jpeg;base64,${image}`;
    }

    return {
      type: 'image_url' as const,
      image_url: {
        url: imageUrl,
        detail: 'low' as const // Use 'low' to save tokens (65 tokens vs 1105 for 'high')
      }
    };
  })

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze these product images and suggest appropriate categories.'
            },
            ...imageContent
          ]
        }
      ],
      max_tokens: maxTokens,
      temperature,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content)
    return validateCategoryResponse(result)

  } catch (error) {
    console.error('Category suggestion error:', error)

    // Return fallback suggestion
    return {
      suggestions: [
        {
          category: 'General',
          parentCategory: 'HOME_GARDEN',
          confidence: 30,
          reasoning: 'Unable to analyze image properly',
          granularity: 'base'
        }
      ],
      createNew: false,
      grouping: 'General',
      qualityIssues: ['Error analyzing image']
    }
  }
}

/**
 * A/B Testing Wrapper
 */
export async function suggestCategoriesWithABTest(
  options: CategorySuggestionOptions,
  testGroup?: 'control' | 'v1' | 'v2' | 'v3'
): Promise<CategorySuggestionResponse & { testGroup: string; tokenUsage?: number }> {
  // Determine test group
  const group = testGroup || getRandomTestGroup()

  // Configure based on test group
  const configMap: Record<string, Partial<CategorySuggestionOptions>> = {
    control: { promptVersion: 'v1' as const, includeFewShot: false },
    v1: { promptVersion: 'v1' as const, includeFewShot: true },
    v2: { promptVersion: 'v2' as const, includeFewShot: false },
    v3: { promptVersion: 'v3' as const, includeFewShot: true }
  }
  const config = configMap[group] || {}

  const startTime = Date.now()
  const result = await suggestCategories({ ...options, ...config })
  const responseTime = Date.now() - startTime

  // Log for analysis
  console.log('Category suggestion A/B test:', {
    testGroup: group,
    responseTime,
    confidence: result.suggestions[0]?.confidence,
    createNew: result.createNew
  })

  return {
    ...result,
    testGroup: group,
    tokenUsage: estimateTokenUsage(group, options.images.length)
  }
}

/**
 * Random test group assignment
 */
function getRandomTestGroup(): 'control' | 'v1' | 'v2' | 'v3' {
  const groups = ['control', 'v1', 'v2', 'v3'] as const
  return groups[Math.floor(Math.random() * groups.length)]
}

/**
 * Estimate token usage based on configuration
 */
function estimateTokenUsage(group: string, imageCount: number): number {
  const imageTokens = 65 * imageCount // 'low' detail images

  const promptTokens = {
    control: 450,
    v1: 750, // with few-shot
    v2: 650,
    v3: 550 // with few-shot
  }[group] || 450

  return imageTokens + promptTokens + 150 // +150 for response
}

/**
 * Batch category suggestions for multiple products
 */
export async function batchSuggestCategories(
  productImages: string[][],
  options?: Partial<CategorySuggestionOptions>
): Promise<CategorySuggestionResponse[]> {
  // Process in parallel but limit concurrency
  const batchSize = 5
  const results: CategorySuggestionResponse[] = []

  for (let i = 0; i < productImages.length; i += batchSize) {
    const batch = productImages.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(images =>
        suggestCategories({ ...options, images })
      )
    )
    results.push(...batchResults)
  }

  return results
}

/**
 * Analyze category distribution for optimization
 */
export function analyzeCategoryDistribution(
  suggestions: CategorySuggestionResponse[]
): {
  categoryFrequency: Record<string, number>
  avgConfidence: number
  createNewRate: number
  groupingPatterns: Record<string, number>
} {
  const categoryCount: Record<string, number> = {}
  const groupingCount: Record<string, number> = {}
  let totalConfidence = 0
  let createNewCount = 0

  for (const response of suggestions) {
    // Count parent categories
    for (const suggestion of response.suggestions) {
      categoryCount[suggestion.parentCategory] =
        (categoryCount[suggestion.parentCategory] || 0) + 1
      totalConfidence += suggestion.confidence
    }

    // Count groupings
    groupingCount[response.grouping] = (groupingCount[response.grouping] || 0) + 1

    // Count create new
    if (response.createNew) createNewCount++
  }

  const totalSuggestions = suggestions.reduce((sum, r) => sum + r.suggestions.length, 0)

  return {
    categoryFrequency: categoryCount,
    avgConfidence: totalConfidence / totalSuggestions,
    createNewRate: (createNewCount / suggestions.length) * 100,
    groupingPatterns: groupingCount
  }
}