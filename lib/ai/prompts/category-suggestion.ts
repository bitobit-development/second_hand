/**
 * Category Suggestion Prompts for GPT-4o Vision
 * Optimized for token usage and accuracy
 */

export interface CategorySuggestion {
  category: string
  parentCategory: string
  confidence: number
  reasoning: string
  granularity: 'base' | 'subcategory' | 'specific'
}

export interface CategorySuggestionResponse {
  suggestions: CategorySuggestion[]
  createNew: boolean
  grouping: string
  qualityIssues?: string[]
}

/**
 * Primary System Prompt - Optimized Version
 * Token estimate: ~450 tokens
 */
export const CATEGORY_SUGGESTION_PROMPT_V1 = `Analyze product images and suggest categories.

CATEGORIES:
• ELECTRONICS: Phones, computers, gaming, audio
• CLOTHING: Apparel, shoes, accessories
• HOME_GARDEN: Furniture, kitchen, decor, garden
• SPORTS: Equipment, outdoor gear, fitness
• BOOKS: Physical books, textbooks, magazines
• TOYS: Children's toys, games, puzzles
• VEHICLES: Cars, bikes, parts, accessories
• COLLECTIBLES: Art, coins, stamps, memorabilia
• BABY_KIDS: Baby gear, kids furniture, strollers
• PET_SUPPLIES: Pet food, accessories, habitats

RULES:
1. Return 2-3 suggestions ranked by confidence
2. Use existing categories when possible (80%+ match)
3. Suggest subcategory level, not too specific
4. Flag unclear/inappropriate images
5. Single item focus per suggestion

OUTPUT JSON:
{
  "suggestions": [{
    "category": "Kitchen Appliances",
    "parentCategory": "HOME_GARDEN",
    "confidence": 95,
    "reasoning": "Coffee maker visible with controls",
    "granularity": "subcategory"
  }],
  "createNew": false,
  "grouping": "Kitchen Appliances"
}`

/**
 * Detailed System Prompt - Version 2
 * Token estimate: ~650 tokens
 */
export const CATEGORY_SUGGESTION_PROMPT_V2 = `You are a category classification expert for a second-hand marketplace. Analyze product images and suggest appropriate categories with intelligent grouping.

BASE CATEGORIES:
- ELECTRONICS: Technology devices, phones, computers, gaming consoles, audio equipment
- CLOTHING: Clothing items, shoes, accessories, jewelry, bags
- HOME_GARDEN: Furniture, kitchen items, home decor, garden tools, appliances
- SPORTS: Sports equipment, outdoor gear, fitness equipment, camping gear
- BOOKS: Physical books, textbooks, magazines, comics
- TOYS: Children's toys, games, puzzles, action figures
- VEHICLES: Cars, motorcycles, bicycles, parts, accessories
- COLLECTIBLES: Art, antiques, coins, stamps, memorabilia, trading cards
- BABY_KIDS: Baby gear, kids furniture, strollers, car seats
- PET_SUPPLIES: Pet food, accessories, habitats, toys

CLASSIFICATION RULES:
1. Analyze all visible products but focus on the most prominent item
2. Suggest 2-3 categories ordered by confidence (0-100)
3. Prefer existing base categories unless item clearly doesn't fit (>80% mismatch)
4. Use subcategory granularity (e.g., "Kitchen Appliances" not "Coffee Makers")
5. For multi-purpose items, suggest multiple relevant categories
6. Flag quality issues: blurry, inappropriate content, no product visible

Return valid JSON with this structure:
{
  "suggestions": [
    {
      "category": "suggested category name",
      "parentCategory": "BASE_CATEGORY",
      "confidence": 0-100,
      "reasoning": "brief explanation",
      "granularity": "base|subcategory|specific"
    }
  ],
  "createNew": boolean,
  "grouping": "recommended grouping name",
  "qualityIssues": ["optional array of issues"]
}`

/**
 * Minimal System Prompt - Version 3
 * Token estimate: ~250 tokens
 */
export const CATEGORY_SUGGESTION_PROMPT_V3 = `Classify product in image. Categories: ELECTRONICS, CLOTHING, HOME_GARDEN, SPORTS, BOOKS, TOYS, VEHICLES, COLLECTIBLES, BABY_KIDS, PET_SUPPLIES.

Return JSON:
{
  "suggestions": [{
    "category": "name",
    "parentCategory": "BASE",
    "confidence": 0-100,
    "reasoning": "why",
    "granularity": "base|subcategory|specific"
  }],
  "createNew": false,
  "grouping": "group name"
}

Rules: 2-3 suggestions, prefer existing categories, subcategory level.`

/**
 * Few-shot Examples for Better Accuracy
 */
export const FEW_SHOT_EXAMPLES = [
  {
    description: "Coffee maker image",
    response: {
      suggestions: [
        {
          category: "Kitchen Appliances",
          parentCategory: "HOME_GARDEN",
          confidence: 95,
          reasoning: "Electric coffee maker with water reservoir and control panel",
          granularity: "subcategory"
        },
        {
          category: "Small Appliances",
          parentCategory: "ELECTRONICS",
          confidence: 60,
          reasoning: "Electronic device with power cord",
          granularity: "subcategory"
        }
      ],
      createNew: false,
      grouping: "Kitchen Appliances"
    }
  },
  {
    description: "Running shoes image",
    response: {
      suggestions: [
        {
          category: "Athletic Footwear",
          parentCategory: "SPORTS",
          confidence: 90,
          reasoning: "Running shoes with athletic design and cushioning",
          granularity: "subcategory"
        },
        {
          category: "Footwear",
          parentCategory: "CLOTHING",
          confidence: 85,
          reasoning: "Shoes as clothing accessory",
          granularity: "subcategory"
        }
      ],
      createNew: false,
      grouping: "Athletic Footwear"
    }
  },
  {
    description: "Baby stroller image",
    response: {
      suggestions: [
        {
          category: "Strollers & Car Seats",
          parentCategory: "BABY_KIDS",
          confidence: 98,
          reasoning: "Baby stroller with safety harness and wheels",
          granularity: "subcategory"
        }
      ],
      createNew: false,
      grouping: "Strollers & Car Seats"
    }
  },
  {
    description: "Vintage vinyl record",
    response: {
      suggestions: [
        {
          category: "Vinyl Records",
          parentCategory: "COLLECTIBLES",
          confidence: 85,
          reasoning: "Vintage vinyl record, collectible music item",
          granularity: "subcategory"
        },
        {
          category: "Music Media",
          parentCategory: "ELECTRONICS",
          confidence: 70,
          reasoning: "Music storage medium",
          granularity: "subcategory"
        }
      ],
      createNew: false,
      grouping: "Vinyl Records"
    }
  },
  {
    description: "Blurry/unclear image",
    response: {
      suggestions: [
        {
          category: "Unknown",
          parentCategory: "HOME_GARDEN",
          confidence: 20,
          reasoning: "Image too blurry to identify product clearly",
          granularity: "base"
        }
      ],
      createNew: false,
      grouping: "Unknown",
      qualityIssues: ["Image too blurry for accurate classification"]
    }
  }
]

/**
 * Edge Case Handler Prompts
 */
export const EDGE_CASE_PROMPTS = {
  multipleItems: `Multiple items detected. Focus on the most prominent/centered item for primary classification. Mention other items in reasoning if relevant.`,

  unclearImage: `Image quality issues detected. Return low confidence (<30) and include in qualityIssues: ["Image too blurry/dark/unclear for accurate classification"]. Suggest broad category only.`,

  inappropriateContent: `If inappropriate content detected, return: {
    "suggestions": [],
    "createNew": false,
    "grouping": "REJECTED",
    "qualityIssues": ["Inappropriate content detected"]
  }`,

  novelCategory: `For items not fitting existing categories well (<60% match), still assign to closest category but set confidence accordingly and note in reasoning why it's a partial fit.`
}

/**
 * Prompt Construction Function
 */
export function buildCategorySuggestionPrompt(
  version: 'v1' | 'v2' | 'v3' = 'v1',
  includeFewShot: boolean = false
): string {
  const basePrompt = {
    v1: CATEGORY_SUGGESTION_PROMPT_V1,
    v2: CATEGORY_SUGGESTION_PROMPT_V2,
    v3: CATEGORY_SUGGESTION_PROMPT_V3
  }[version]

  if (!includeFewShot) return basePrompt

  // Add 2-3 examples for better accuracy (adds ~300 tokens)
  const examples = FEW_SHOT_EXAMPLES.slice(0, 3)
    .map(ex => `Example: ${ex.description}\nOutput: ${JSON.stringify(ex.response, null, 2)}`)
    .join('\n\n')

  return `${basePrompt}\n\nEXAMPLES:\n${examples}`
}

/**
 * Token Usage Estimates
 */
export const TOKEN_ESTIMATES = {
  v1: {
    prompt: 450,
    fewShot: 300,
    response: 150,
    total: 900
  },
  v2: {
    prompt: 650,
    fewShot: 300,
    response: 150,
    total: 1100
  },
  v3: {
    prompt: 250,
    fewShot: 300,
    response: 150,
    total: 700
  }
}

/**
 * Validation Function
 */
export function validateCategoryResponse(response: any): CategorySuggestionResponse {
  // Ensure required fields
  if (!response.suggestions || !Array.isArray(response.suggestions)) {
    throw new Error('Invalid response: missing suggestions array')
  }

  // Validate each suggestion
  for (const suggestion of response.suggestions) {
    if (!suggestion.category || !suggestion.parentCategory ||
        typeof suggestion.confidence !== 'number') {
      throw new Error('Invalid suggestion format')
    }

    // Ensure confidence is 0-100
    suggestion.confidence = Math.min(100, Math.max(0, suggestion.confidence))
  }

  // Sort by confidence
  response.suggestions.sort((a: CategorySuggestion, b: CategorySuggestion) =>
    b.confidence - a.confidence)

  // Limit to top 3
  response.suggestions = response.suggestions.slice(0, 3)

  return response as CategorySuggestionResponse
}

/**
 * Category Grouping Rules
 */
export const GROUPING_RULES = `
When determining category grouping:

1. PREFER BROADER GROUPS (subcategory level):
   ✅ "Kitchen Appliances" NOT ❌ "Coffee Makers"
   ✅ "Athletic Footwear" NOT ❌ "Nike Running Shoes"
   ✅ "Gaming Consoles" NOT ❌ "PlayStation 5"

2. AVOID OVER-FRAGMENTATION:
   - Group similar items together
   - Minimum 10+ potential items per group
   - Consider marketplace practicality

3. BRAND-AGNOSTIC NAMING:
   - Use generic terms, not brand names
   - "Smartphones" not "iPhones"
   - "Gaming Consoles" not "PlayStation"

4. MATCH EXISTING PATTERNS:
   - Check if similar grouping exists
   - Maintain consistency with base categories
   - Don't create new if 80%+ match exists
`