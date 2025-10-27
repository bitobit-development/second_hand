'use client'

import { useState, useEffect } from 'react'
import { ListingCategory } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sparkles,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Grid3x3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES, getCategoryConfig } from '@/lib/constants/categories'
import { toast } from 'sonner'

/**
 * Category suggestion from AI API
 */
interface CategorySuggestion {
  category: string
  parentCategory: string
  confidence: number
  reasoning: string
  granularity: 'base' | 'subcategory' | 'specific'
}

/**
 * AI API response structure
 */
interface AISuggestionResponse {
  success: boolean
  suggestions?: CategorySuggestion[]
  createNew?: boolean
  grouping?: string
  qualityIssues?: string[]
  tokensUsed?: number
  cached?: boolean
  error?: string
  code?: string
}

interface AICategoryStepProps {
  /** Array of image URLs to analyze */
  imageUrls: string[]
  /** Currently selected category value */
  selectedCategory: ListingCategory | ''
  /** Callback when category is selected */
  onCategorySelect: (category: ListingCategory) => void
  /** Callback for error handling */
  onError: (error: string) => void
}

/**
 * AI-Powered Category Selection Component
 *
 * Features:
 * - Analyzes uploaded images using OpenAI GPT-4o Vision
 * - Displays 2-3 AI-suggested categories with confidence scores
 * - Visual confidence indicators (green/yellow/red)
 * - Fallback to manual category grid
 * - Handles API errors gracefully
 * - Supports re-analysis if more images added
 */
export function AICategoryStep({
  imageUrls,
  selectedCategory,
  onCategorySelect,
  onError,
}: AICategoryStepProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([])
  const [qualityIssues, setQualityIssues] = useState<string[]>([])
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [hasFetchedSuggestions, setHasFetchedSuggestions] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  /**
   * Fetch AI category suggestions from API
   */
  const fetchAISuggestions = async () => {
    if (imageUrls.length === 0) {
      setApiError('No images uploaded')
      return
    }

    setIsAnalyzing(true)
    setApiError(null)
    setSuggestions([])
    setQualityIssues([])

    try {
      const response = await fetch('/api/suggest-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: imageUrls.slice(0, 5), // Max 5 images
          promptVersion: 'v1',
        }),
      })

      const data: AISuggestionResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`)
      }

      if (!data.success || !data.suggestions || data.suggestions.length === 0) {
        throw new Error('No suggestions returned')
      }

      // Store suggestions
      setSuggestions(data.suggestions)
      setQualityIssues(data.qualityIssues || [])
      setHasFetchedSuggestions(true)

      // Show toast notification
      const topConfidence = data.suggestions[0]?.confidence || 0
      if (topConfidence >= 95) {
        toast.success('High-confidence category suggestions ready!')
      } else if (topConfidence >= 70) {
        toast.info('Category suggestions generated')
      } else {
        toast.warning('Low confidence. Please verify category selection.')
      }

      // Show cache status if applicable
      if (data.cached) {
        toast.info('Using cached analysis')
      }
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to analyze images'
      setApiError(errorMessage)
      onError(errorMessage)

      // Fallback to manual selection
      setShowAllCategories(true)
      toast.error('AI analysis failed. Please select category manually.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  /**
   * Auto-fetch suggestions when component mounts with images
   */
  useEffect(() => {
    if (imageUrls.length > 0 && !hasFetchedSuggestions && !isAnalyzing) {
      fetchAISuggestions()
    }
  }, [imageUrls.length]) // Only depend on image count

  /**
   * Map AI parent category to Prisma enum value
   */
  const mapParentCategoryToEnum = (
    parentCategory: string
  ): ListingCategory | null => {
    const normalized = parentCategory.toUpperCase().replace(/[^A-Z_]/g, '_')
    const categoryConfig = CATEGORIES.find((cat) => cat.value === normalized)
    return categoryConfig ? categoryConfig.value : null
  }

  /**
   * Get confidence badge variant based on score
   */
  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 95) return 'default' // Green
    if (confidence >= 70) return 'secondary' // Yellow
    return 'destructive' // Red
  }

  /**
   * Get confidence badge color classes
   */
  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 95)
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    if (confidence >= 70)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  }

  /**
   * Render loading state
   */
  if (isAnalyzing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 animate-pulse text-primary" />
          <span>Analyzing your images with AI...</span>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  /**
   * Render no images state
   */
  if (imageUrls.length === 0) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Upload images first to get AI-powered category suggestions.
          </AlertDescription>
        </Alert>

        <div className="pt-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            Select Category Manually
          </h3>
          <ManualCategoryGrid
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
          />
        </div>
      </div>
    )
  }

  /**
   * Render error state with manual fallback
   */
  if (apiError && suggestions.length === 0) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>

        <Button
          type="button"
          variant="outline"
          onClick={fetchAISuggestions}
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry AI Analysis
        </Button>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-3">
            Or Select Category Manually
          </h3>
          <ManualCategoryGrid
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
          />
        </div>
      </div>
    )
  }

  /**
   * Render AI suggestions with manual fallback
   */
  return (
    <div className="space-y-6">
      {/* Quality Issues Warning */}
      {qualityIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">Image Quality Issues:</div>
            <ul className="text-sm list-disc list-inside">
              {qualityIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI-Suggested Categories
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fetchAISuggestions}
              disabled={isAnalyzing}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Re-analyze
            </Button>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const categoryEnum = mapParentCategoryToEnum(
                suggestion.parentCategory
              )
              const categoryConfig = categoryEnum
                ? getCategoryConfig(categoryEnum)
                : null
              const isSelected = selectedCategory === categoryEnum

              if (!categoryConfig) {
                return null // Skip if category doesn't map to enum
              }

              const Icon = categoryConfig.icon

              return (
                <Card
                  key={index}
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary',
                    isSelected &&
                      'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                  )}
                  onClick={() => categoryEnum && onCategorySelect(categoryEnum)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Category Icon */}
                      <div className="mt-1">
                        <Icon className="w-10 h-10 text-primary" />
                      </div>

                      {/* Category Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">
                                {categoryConfig.label}
                              </h4>
                              {index === 0 && (
                                <Badge variant="outline" className="text-xs">
                                  Top Match
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {suggestion.category}
                            </p>
                          </div>

                          {/* Confidence Badge */}
                          <Badge
                            className={cn(
                              'text-xs font-semibold',
                              getConfidenceBadgeColor(suggestion.confidence)
                            )}
                          >
                            {suggestion.confidence}%
                          </Badge>
                        </div>

                        {/* Reasoning */}
                        <p className="text-sm text-muted-foreground mb-3">
                          {suggestion.reasoning}
                        </p>

                        {/* Select Button */}
                        <Button
                          type="button"
                          size="sm"
                          variant={isSelected ? 'default' : 'outline'}
                          onClick={(e) => {
                            e.stopPropagation()
                            categoryEnum && onCategorySelect(categoryEnum)
                          }}
                          className="w-full"
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Selected
                            </>
                          ) : (
                            'Select This Category'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Confidence Legend */}
          <div className="text-xs text-muted-foreground flex items-center gap-4 pt-2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              95%+ High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              70-94% Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              &lt;70% Low
            </span>
          </div>
        </div>
      )}

      {/* Manual Category Fallback */}
      <div className="pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowAllCategories(!showAllCategories)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            Browse All Categories
          </span>
          {showAllCategories ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {showAllCategories && (
          <div className="mt-4">
            <ManualCategoryGrid
              selectedCategory={selectedCategory}
              onCategorySelect={onCategorySelect}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Manual Category Grid Component
 */
function ManualCategoryGrid({
  selectedCategory,
  onCategorySelect,
}: {
  selectedCategory: ListingCategory | ''
  onCategorySelect: (category: ListingCategory) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {CATEGORIES.map((category) => {
        const Icon = category.icon
        const isSelected = selectedCategory === category.value

        return (
          <button
            key={category.value}
            type="button"
            onClick={() => onCategorySelect(category.value)}
            className={cn(
              'p-4 rounded-lg border-2 transition-all text-left hover:border-primary',
              isSelected
                ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                : 'border-muted'
            )}
          >
            <Icon className="w-8 h-8 mb-2" />
            <h3 className="font-semibold mb-1 text-sm">{category.label}</h3>
            <p className="text-xs text-muted-foreground">
              {category.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
