'use client'

import React from 'react'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ConfidenceTooltipProps {
  className?: string
}

export const ConfidenceTooltip = ({ className }: ConfidenceTooltipProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className={cn(
            'inline-flex items-center justify-center',
            'text-muted-foreground hover:text-foreground',
            'transition-colors rounded-full',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2',
            className
          )}
          aria-label="Learn about AI confidence scores"
        >
          <Info className="w-4 h-4" aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-xs p-4 space-y-3"
        >
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">AI Confidence Scores</h4>
            <div className="h-px bg-border" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none" role="img" aria-label="High confidence">
                🟢
              </span>
              <div className="space-y-0.5">
                <p className="font-medium">90-100% - High confidence</p>
                <p className="text-muted-foreground">
                  AI is very certain this is correct
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-lg leading-none" role="img" aria-label="Medium confidence">
                🟡
              </span>
              <div className="space-y-0.5">
                <p className="font-medium">70-89% - Medium confidence</p>
                <p className="text-muted-foreground">
                  AI thinks this is likely correct
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-lg leading-none" role="img" aria-label="Low confidence">
                🔴
              </span>
              <div className="space-y-0.5">
                <p className="font-medium">Below 70% - Low confidence</p>
                <p className="text-muted-foreground">
                  Please verify this category
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t text-xs text-muted-foreground">
            Our AI analyzes your images to suggest the most appropriate category
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
