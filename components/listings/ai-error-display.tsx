'use client'

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AIErrorDisplayProps {
  error: string
  errorCode?: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

/**
 * User-friendly error messages for common error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
  RATE_LIMIT: "You've reached the rate limit. Please try again in a few minutes.",
  INVALID_IMAGE: 'Please upload a valid product image',
  TIMEOUT: 'Request took too long. Please try again.',
  ENHANCEMENT_FAILED: 'Unable to enhance this image. Please try another image.',
  INVALID_URL: 'Invalid image URL. Please upload a new image.',
  NOT_CLOUDINARY: 'Image must be uploaded through our platform.',
  GENERATION_FAILED: 'Unable to generate description. Please try again.',
}

const AIErrorDisplay = ({
  error,
  errorCode,
  onRetry,
  onDismiss,
  className,
}: AIErrorDisplayProps) => {
  // Get user-friendly message if error code exists
  const displayMessage = errorCode && ERROR_MESSAGES[errorCode]
    ? ERROR_MESSAGES[errorCode]
    : error

  return (
    <Alert
      variant="destructive"
      className={cn('flex flex-col gap-3', className)}
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="size-4" aria-hidden="true" />

      <div className="flex flex-col gap-2">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p className="text-sm">{displayMessage}</p>
          {errorCode && (
            <p className="mt-1 text-xs text-destructive/80">
              Error code: {errorCode}
            </p>
          )}
        </AlertDescription>
      </div>

      {/* Action buttons */}
      {(onRetry || onDismiss) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              aria-label="Retry operation"
            >
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-destructive hover:bg-destructive/10"
              aria-label="Dismiss error message"
            >
              Dismiss
            </Button>
          )}
        </div>
      )}
    </Alert>
  )
}

export { AIErrorDisplay }
