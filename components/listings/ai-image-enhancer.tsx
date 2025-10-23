'use client'

import { useState, useCallback } from 'react'
import { Wand2, Check } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { EnhancedImageResult } from '@/lib/ai/types'
import { AILoadingState } from './ai-loading-state'
import { AIErrorDisplay } from './ai-error-display'

interface AIImageEnhancerProps {
  imageUrl: string
  onEnhanced: (enhancedUrl: string, originalUrl: string) => void
  onError: (error: string) => void
  disabled?: boolean
  className?: string
}

const AIImageEnhancer = ({
  imageUrl,
  onEnhanced,
  onError,
  disabled = false,
  className,
}: AIImageEnhancerProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  const handleEnhance = useCallback(async () => {
    if (!imageUrl) {
      setError('No image URL provided')
      onError('No image URL provided')
      return
    }

    setIsEnhancing(true)
    setError(null)
    setErrorCode(null)

    try {
      const response = await fetch('/api/enhance-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
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
        const errorMessage = data.error || 'Failed to enhance image'
        const code = data.code || 'ENHANCEMENT_FAILED'
        setError(errorMessage)
        setErrorCode(code)
        onError(errorMessage)
        toast.error(errorMessage)
        return
      }

      // Success
      const result: EnhancedImageResult = data
      setEnhancedUrl(result.enhancedUrl)
      onEnhanced(result.enhancedUrl, result.originalUrl)
      toast.success('Image enhanced successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enhance image'
      setError(errorMessage)
      setErrorCode('ENHANCEMENT_FAILED')
      onError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsEnhancing(false)
    }
  }, [imageUrl, onEnhanced, onError])

  const handleRetry = useCallback(() => {
    setError(null)
    setErrorCode(null)
    handleEnhance()
  }, [handleEnhance])

  const handleDismissError = useCallback(() => {
    setError(null)
    setErrorCode(null)
  }, [])

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Enhance Button */}
      {!enhancedUrl && !isEnhancing && !error && (
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={handleEnhance}
          disabled={disabled || isEnhancing}
          className="w-full sm:w-auto"
          aria-label="Enhance image with AI"
        >
          <Wand2 className="size-4" aria-hidden="true" />
          Enhance with AI
        </Button>
      )}

      {/* Loading State */}
      {isEnhancing && <AILoadingState operation="enhancing" />}

      {/* Error Display */}
      {error && !isEnhancing && (
        <AIErrorDisplay
          error={error}
          errorCode={errorCode ?? undefined}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
        />
      )}

      {/* Success State with Comparison */}
      {enhancedUrl && !isEnhancing && (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            {/* Success message */}
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <Check className="size-4" aria-hidden="true" />
              <span>Image enhanced successfully!</span>
            </div>

            {/* Before/After Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <div className="flex gap-1 rounded-lg border p-1">
                <button
                  type="button"
                  onClick={() => setShowComparison(false)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    !showComparison
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-pressed={!showComparison}
                >
                  Enhanced
                </button>
                <button
                  type="button"
                  onClick={() => setShowComparison(true)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    showComparison
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-pressed={showComparison}
                >
                  Comparison
                </button>
              </div>
            </div>

            {/* Image Display */}
            <div className="grid gap-4">
              {showComparison ? (
                // Side-by-side comparison
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Original
                    </span>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                      <Image
                        src={imageUrl}
                        alt="Original image"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Enhanced
                    </span>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                      <Image
                        src={enhancedUrl}
                        alt="Enhanced image"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Enhanced image only
                <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg border">
                  <Image
                    src={enhancedUrl}
                    alt="Enhanced image"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { AIImageEnhancer }
