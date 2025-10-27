/**
 * Category Suggestion Testing & Optimization Strategy
 */

import { suggestCategoriesWithABTest, analyzeCategoryDistribution } from './category-suggester'
import type { CategorySuggestionResponse } from './prompts/category-suggestion'

/**
 * A/B Testing Strategy
 *
 * Goal: Optimize for accuracy, token usage, and response time
 */
export const AB_TEST_STRATEGY = {
  /**
   * Test Groups Configuration
   */
  groups: {
    control: {
      name: 'Control - Minimal Prompt',
      prompt: 'v1',
      fewShot: false,
      expectedTokens: 600,
      hypothesis: 'Baseline performance with minimal instructions'
    },
    v1: {
      name: 'V1 - Optimized with Examples',
      prompt: 'v1',
      fewShot: true,
      expectedTokens: 900,
      hypothesis: 'Few-shot examples improve accuracy by 15%+'
    },
    v2: {
      name: 'V2 - Detailed Instructions',
      prompt: 'v2',
      fewShot: false,
      expectedTokens: 950,
      hypothesis: 'Detailed rules reduce "create new" rate by 30%'
    },
    v3: {
      name: 'V3 - Ultra-Minimal with Examples',
      prompt: 'v3',
      fewShot: true,
      expectedTokens: 700,
      hypothesis: 'Minimal prompt + examples = best token/accuracy ratio'
    }
  },

  /**
   * Success Metrics
   */
  metrics: {
    accuracy: {
      target: 85,
      measurement: 'Human validation sample (n=100)',
      weight: 0.4
    },
    tokenUsage: {
      target: 800,
      measurement: 'Average tokens per request',
      weight: 0.2
    },
    responseTime: {
      target: 2500, // milliseconds
      measurement: 'P95 response time',
      weight: 0.2
    },
    createNewRate: {
      target: 10, // percentage
      measurement: 'Percentage requesting new category',
      weight: 0.2
    }
  },

  /**
   * Test Duration & Sample Size
   */
  testing: {
    duration: '2 weeks',
    minSampleSize: 1000,
    distribution: 'equal', // 25% each group
    confidenceLevel: 0.95
  }
}

/**
 * Example Usage Scenarios
 */
export const USAGE_EXAMPLES = {
  /**
   * Single Image Category Suggestion
   */
  singleImage: async (imageUrl: string) => {
    const response = await suggestCategoriesWithABTest({
      images: [imageUrl],
      temperature: 0.2, // Low temperature for consistency
      maxTokens: 300
    })

    console.log('Category Suggestions:', response.suggestions)
    console.log('Test Group:', response.testGroup)
    console.log('Token Usage:', response.tokenUsage)

    return response
  },

  /**
   * Multiple Images (Product Gallery)
   */
  multipleImages: async (imageUrls: string[]) => {
    const response = await suggestCategoriesWithABTest({
      images: imageUrls.slice(0, 5), // Max 5 images
      temperature: 0.3, // Slightly higher for multiple perspectives
      maxTokens: 400
    })

    // Use highest confidence suggestion
    const primary = response.suggestions[0]
    const alternatives = response.suggestions.slice(1)

    return {
      primary,
      alternatives,
      shouldCreateNew: response.createNew && primary.confidence < 60
    }
  },

  /**
   * Edge Case: Blurry/Unclear Image
   */
  handleUnclearImage: async (imageUrl: string) => {
    const response = await suggestCategoriesWithABTest({
      images: [imageUrl],
      promptVersion: 'v2', // Use detailed version for edge cases
      temperature: 0.1
    })

    if (response.qualityIssues && response.qualityIssues.length > 0) {
      return {
        error: 'Image quality issues detected',
        issues: response.qualityIssues,
        fallbackCategory: 'HOME_GARDEN' // Default fallback
      }
    }

    return response
  }
}

/**
 * Performance Optimization Recommendations
 */
export const OPTIMIZATION_TIPS = {
  tokenReduction: [
    'Use "low" detail for images (65 tokens vs 1105)',
    'Limit to 3 few-shot examples maximum',
    'Remove redundant instructions in prompts',
    'Use abbreviated category descriptions',
    'Batch similar requests when possible'
  ],

  accuracyImprovement: [
    'Include 2-3 diverse few-shot examples',
    'Add edge case handling instructions',
    'Use temperature 0.2-0.3 for consistency',
    'Provide clear granularity guidelines',
    'Validate and normalize responses'
  ],

  responseTime: [
    'Implement response caching (15 min TTL)',
    'Use streaming for large batches',
    'Parallelize independent requests',
    'Pre-warm API connection',
    'Implement circuit breaker pattern'
  ]
}

/**
 * Metrics Collection Function
 */
export async function collectMetrics(
  testGroup: string,
  response: CategorySuggestionResponse,
  groundTruth?: string
): Promise<void> {
  const metrics = {
    timestamp: new Date().toISOString(),
    testGroup,
    primaryCategory: response.suggestions[0]?.parentCategory,
    confidence: response.suggestions[0]?.confidence,
    createNew: response.createNew,
    suggestionCount: response.suggestions.length,
    hasQualityIssues: (response.qualityIssues?.length || 0) > 0,
    accuracy: groundTruth
      ? response.suggestions[0]?.parentCategory === groundTruth
      : null
  }

  // In production, send to analytics service
  console.log('Metrics collected:', metrics)

  // Store for analysis
  // await storeMetrics(metrics)
}

/**
 * Results Analysis Function
 */
export function analyzeTestResults(results: any[]): {
  winner: string
  analysis: Record<string, any>
  recommendation: string
} {
  // Group results by test group
  const grouped = results.reduce((acc, r) => {
    acc[r.testGroup] = acc[r.testGroup] || []
    acc[r.testGroup].push(r)
    return acc
  }, {} as Record<string, any[]>)

  // Calculate metrics for each group
  const analysis: Record<string, any> = {}

  for (const [group, groupResults] of Object.entries(grouped)) {
    const results = groupResults as any[]
    const accuracyRate = results.filter(r => r.accuracy).length / results.length
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length
    const createNewRate = results.filter(r => r.createNew).length / results.length

    analysis[group] = {
      sampleSize: results.length,
      accuracy: (accuracyRate * 100).toFixed(1) + '%',
      avgConfidence: avgConfidence.toFixed(1),
      createNewRate: (createNewRate * 100).toFixed(1) + '%',
      score: calculateScore(accuracyRate, avgConfidence, createNewRate)
    }
  }

  // Determine winner
  const winner = Object.entries(analysis)
    .sort(([, a], [, b]) => b.score - a.score)[0][0]

  return {
    winner,
    analysis,
    recommendation: getRecommendation(winner, analysis)
  }
}

function calculateScore(accuracy: number, confidence: number, createNewRate: number): number {
  return (
    accuracy * 0.4 +
    (confidence / 100) * 0.3 +
    ((1 - createNewRate) * 0.3)
  ) * 100
}

function getRecommendation(winner: string, analysis: any): string {
  const winnerStats = analysis[winner]

  if (winnerStats.accuracy > 85 && winnerStats.createNewRate < 10) {
    return `Deploy ${winner} to production - exceeds all targets`
  } else if (winnerStats.accuracy > 80) {
    return `Use ${winner} but monitor createNew rate closely`
  } else {
    return `Continue testing - consider hybrid approach or prompt refinement`
  }
}

/**
 * Implementation Checklist
 */
export const IMPLEMENTATION_CHECKLIST = [
  '✅ Set up OpenAI API key in environment variables',
  '✅ Implement category suggestion endpoint',
  '✅ Add response validation and error handling',
  '✅ Set up A/B test framework with analytics',
  '✅ Implement caching layer (Redis/in-memory)',
  '✅ Add monitoring and alerting',
  '✅ Create admin dashboard for metrics',
  '✅ Set up human validation workflow',
  '✅ Document API usage and limits',
  '✅ Implement rate limiting and quotas'
]