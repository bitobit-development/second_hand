'use client'

import React from 'react'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryReasoningProps {
  reasoning: string
  features?: string[]
  className?: string
}

export const CategoryReasoning = ({
  reasoning,
  features = [],
  className
}: CategoryReasoningProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <div className={cn('space-y-2', className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center gap-2 text-sm text-muted-foreground transition-colors',
          'hover:text-foreground focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-2 py-1 -mx-2'
        )}
        aria-expanded={isExpanded}
        aria-controls="category-reasoning-content"
      >
        <Sparkles className="w-4 h-4 text-purple-500" aria-hidden="true" />
        <span className="font-medium">Why this category?</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 ml-auto" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-auto" aria-hidden="true" />
        )}
      </button>

      <div
        id="category-reasoning-content"
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!isExpanded}
      >
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-start gap-2 p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg">
            <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {reasoning}
            </p>
          </div>

          {features.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Key Features Identified
              </h4>
              <ul className="space-y-1.5" role="list">
                {features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
