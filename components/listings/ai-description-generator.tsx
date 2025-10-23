'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Check, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { ListingCategory } from '@prisma/client'
import type { DescriptionResult } from '@/lib/ai/types'
import { AILoadingState } from './ai-loading-state'
import { AIErrorDisplay } from './ai-error-display'

interface AIDescriptionGeneratorProps {
  imageUrls: string[]
  category: ListingCategory
  onGenerated: (description: string, attributes: DescriptionResult['attributes']) => void
  onTitleGenerated?: (title: string) => void
  onError: (error: string) => void
  disabled?: boolean
  currentDescription?: string
  currentTitle?: string
  className?: string
}

type TemplateType = 'detailed' | 'concise' | 'seo'

const TEMPLATE_OPTIONS: Array<{ value: TemplateType; label: string; description: string }> = [
  {
    value: 'detailed',
    label: 'Detailed',
    description: 'Comprehensive description with all features',
  },
  {
    value: 'concise',
    label: 'Concise',
    description: 'Short and to-the-point description',
  },
  {
    value: 'seo',
    label: 'SEO Optimized',
    description: 'Search-engine friendly with keywords',
  },
]

const AIDescriptionGenerator = ({
  imageUrls,
  category,
  onGenerated,
  onTitleGenerated,
  onError,
  disabled = false,
  currentDescription,
  currentTitle,
  className,
}: AIDescriptionGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [template, setTemplate] = useState<TemplateType>('detailed')
  const [additionalContext, setAdditionalContext] = useState('')
  const [generatedResult, setGeneratedResult] = useState<DescriptionResult | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState('')
  const [editedTitle, setEditedTitle] = useState('')
  const [isTitleEditing, setIsTitleEditing] = useState(false)

  const handleGenerate = useCallback(async () => {
    if (!imageUrls || imageUrls.length === 0) {
      const errorMsg = 'Please upload at least one image first'
      setError(errorMsg)
      onError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setIsGenerating(true)
    setError(null)
    setErrorCode(null)

    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: imageUrls, // Send all images as array
          category,
          templateType: template, // API expects 'templateType' not 'template'
          additionalContext: additionalContext.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const waitTime = retryAfter ? `${retryAfter} seconds` : 'a few minutes'
          const message = `Rate limit exceeded. Please try again in ${waitTime}.`
          setError(message)
          setErrorCode('RATE_LIMIT')
          onError(message)
          toast.error(message)
          return
        }

        // Handle other errors
        const errorMessage = data.error || 'Failed to generate description'
        const code = data.code || 'GENERATION_FAILED'
        setError(errorMessage)
        setErrorCode(code)
        onError(errorMessage)
        toast.error(errorMessage)
        return
      }

      // Success
      const result: DescriptionResult = data
      setGeneratedResult(result)
      setEditedDescription(result.description)
      if (result.suggestedTitle) {
        setEditedTitle(result.suggestedTitle)
      }
      toast.success(result.suggestedTitle ? 'Title and description generated successfully!' : 'Description generated successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate description'
      setError(errorMessage)
      setErrorCode('GENERATION_FAILED')
      onError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }, [imageUrls, category, template, additionalContext, onError])

  const handleRetry = useCallback(() => {
    setError(null)
    setErrorCode(null)
    handleGenerate()
  }, [handleGenerate])

  const handleDismissError = useCallback(() => {
    setError(null)
    setErrorCode(null)
  }, [])

  const handleUseDescription = useCallback(() => {
    if (!generatedResult) return

    const finalDescription = isEditing ? editedDescription : generatedResult.description
    onGenerated(finalDescription, generatedResult.attributes)

    // Apply title if it was generated and callback is provided
    if (onTitleGenerated && generatedResult.suggestedTitle) {
      const finalTitle = isTitleEditing ? editedTitle : generatedResult.suggestedTitle
      onTitleGenerated(finalTitle)
    }

    toast.success(generatedResult.suggestedTitle ? 'Title and description applied!' : 'Description applied!')
  }, [generatedResult, isEditing, editedDescription, isTitleEditing, editedTitle, onGenerated, onTitleGenerated])

  const handleEditToggle = useCallback(() => {
    setIsEditing(!isEditing)
    if (!isEditing && generatedResult) {
      setEditedDescription(generatedResult.description)
    }
  }, [isEditing, generatedResult])

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Configuration Panel */}
      {!generatedResult && !isGenerating && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
              AI Description Generator
            </CardTitle>
            <CardDescription>
              Generate a product description from your images
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Show current title if exists */}
            {currentTitle && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                  Current title:
                </p>
                <p className="mt-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                  {currentTitle}
                </p>
              </div>
            )}

            {/* Show current description if exists */}
            {currentDescription && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                  Current description:
                </p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  {currentDescription.substring(0, 100)}
                  {currentDescription.length > 100 && '...'}
                </p>
              </div>
            )}

            {/* Template Selector */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="template-select"
                className="text-sm font-medium text-foreground"
              >
                Description Style
              </label>
              <Select
                value={template}
                onValueChange={(value) => setTemplate(value as TemplateType)}
                disabled={disabled}
              >
                <SelectTrigger
                  id="template-select"
                  className="w-full"
                  aria-label="Select description template"
                >
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Additional Context Input */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="additional-context"
                className="text-sm font-medium text-foreground"
              >
                Additional Context{' '}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="additional-context"
                type="text"
                placeholder="e.g., Brand name, special features, condition details..."
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                disabled={disabled}
                className="w-full"
                maxLength={200}
                aria-label="Additional context for description generation"
              />
              <p className="text-xs text-muted-foreground">
                {additionalContext.length}/200 characters
              </p>
            </div>

            {/* Generate Button */}
            <Button
              type="button"
              variant="default"
              size="default"
              onClick={handleGenerate}
              disabled={disabled || isGenerating || imageUrls.length === 0}
              className="w-full sm:w-auto"
              aria-label="Generate description with AI"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Generate Description
            </Button>

            {imageUrls.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Upload at least one image to generate a description
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isGenerating && <AILoadingState operation="generating" />}

      {/* Error Display */}
      {error && !isGenerating && (
        <AIErrorDisplay
          error={error}
          errorCode={errorCode ?? undefined}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
        />
      )}

      {/* Generated Result */}
      {generatedResult && !isGenerating && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                <Check className="size-4" aria-hidden="true" />
                <span>Description generated!</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleEditToggle}
                className="gap-2"
                aria-label={isEditing ? 'Cancel editing' : 'Edit description'}
              >
                <Edit2 className="size-3.5" aria-hidden="true" />
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Title Display/Edit (if generated) */}
            {generatedResult.suggestedTitle && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Suggested Title
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTitleEditing(!isTitleEditing)}
                    className="gap-2 h-7"
                  >
                    <Edit2 className="size-3" aria-hidden="true" />
                    {isTitleEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
                {isTitleEditing ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    maxLength={100}
                    className="w-full font-medium"
                    aria-label="Edit generated title"
                  />
                ) : (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-sm font-medium text-foreground">
                      {generatedResult.suggestedTitle}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Description Display/Edit */}
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="edit-description"
                  className="text-sm font-medium text-foreground"
                >
                  Edit Description
                </label>
                <Textarea
                  id="edit-description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="min-h-32 w-full"
                  aria-label="Edit generated description"
                />
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {generatedResult.description}
                </p>
              </div>
            )}

            {/* Word Count */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>
                Word count: <span className="font-medium">{generatedResult.wordCount}</span>
              </span>
              <span>
                Characters:{' '}
                <span className="font-medium">{generatedResult.characterCount}</span>
              </span>
            </div>

            {/* Extracted Attributes */}
            {Object.keys(generatedResult.attributes).length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-foreground">
                  Extracted Attributes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {generatedResult.attributes.color && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      Color: {generatedResult.attributes.color}
                    </span>
                  )}
                  {generatedResult.attributes.material && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                      Material: {generatedResult.attributes.material}
                    </span>
                  )}
                  {generatedResult.attributes.brand && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      Brand: {generatedResult.attributes.brand}
                    </span>
                  )}
                  {generatedResult.attributes.style && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                      Style: {generatedResult.attributes.style}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="default"
                size="default"
                onClick={handleUseDescription}
                className="w-full sm:w-auto"
                aria-label={generatedResult.suggestedTitle ? "Use this title and description" : "Use this description"}
              >
                {generatedResult.suggestedTitle ? 'Use title & description' : 'Use this description'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => setGeneratedResult(null)}
                className="w-full sm:w-auto"
                aria-label="Generate new description"
              >
                Generate New
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { AIDescriptionGenerator }
