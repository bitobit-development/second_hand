'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface AILoadingStateProps {
  operation: 'enhancing' | 'generating'
  message?: string
  className?: string
}

const OPERATION_MESSAGES = {
  enhancing: 'Enhancing your image...',
  generating: 'Generating description...',
} as const

const AILoadingState = ({
  operation,
  message,
  className,
}: AILoadingStateProps) => {
  const displayMessage = message ?? OPERATION_MESSAGES[operation]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg bg-muted/50 p-6',
        'md:p-8',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={displayMessage}
    >
      {/* Animated spinner */}
      <div className="flex items-center gap-3">
        <Loader2
          className="size-5 animate-spin text-primary md:size-6"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-foreground md:text-base">
          {displayMessage}
        </p>
      </div>

      {/* Progress bar with animation */}
      <Progress
        value={undefined}
        className="h-1.5 w-full max-w-xs animate-pulse"
        aria-hidden="true"
      />

      {/* Skeleton loader for text content */}
      <div className="mt-2 w-full max-w-md space-y-2" aria-hidden="true">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted-foreground/20" />
        <div className="h-3 w-full animate-pulse rounded bg-muted-foreground/20" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted-foreground/20" />
      </div>

      <span className="sr-only">Loading, please wait</span>
    </div>
  )
}

export { AILoadingState }
