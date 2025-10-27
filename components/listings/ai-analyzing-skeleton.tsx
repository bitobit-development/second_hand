import React from 'react'
import { Sparkles } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface AIAnalyzingSkeletonProps {
  imageCount?: number
  className?: string
}

export const AIAnalyzingSkeleton = ({
  imageCount = 1,
  className
}: AIAnalyzingSkeletonProps) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="relative">
          <Sparkles
            className={cn(
              'w-12 h-12 text-purple-500',
              'animate-[spin_3s_ease-in-out_infinite]'
            )}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full animate-pulse" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">
            Analyzing your {imageCount === 1 ? 'image' : `${imageCount} images`}...
          </h3>
          <p className="text-sm text-muted-foreground">
            Our AI is identifying the best category for your item
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'w-2 h-2 rounded-full bg-purple-500',
              'animate-[bounce_1.4s_ease-in-out_0s_infinite]'
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              'w-2 h-2 rounded-full bg-purple-500',
              'animate-[bounce_1.4s_ease-in-out_0.2s_infinite]'
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              'w-2 h-2 rounded-full bg-purple-500',
              'animate-[bounce_1.4s_ease-in-out_0.4s_infinite]'
            )}
            aria-hidden="true"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          This usually takes 2-3 seconds
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Analyzing {imageCount === 1 ? 'image' : `${imageCount} images`} to suggest categories. Please wait.
      </div>
    </div>
  )
}
