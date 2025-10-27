'use client'

import React from 'react'
import { type LucideIcon, Star, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfidenceBadge } from './confidence-badge'
import { cn } from '@/lib/utils'

interface AISuggestionCardProps {
  category: {
    name: string
    icon: LucideIcon
    confidence: number
    reasoning: string
    parentCategory?: string
  }
  selected: boolean
  variant?: 'default' | 'recommended' | 'disabled'
  onSelect: () => void
  className?: string
}

export const AISuggestionCard = ({
  category,
  selected,
  variant = 'default',
  onSelect,
  className
}: AISuggestionCardProps) => {
  const [showReasoning, setShowReasoning] = React.useState(false)
  const Icon = category.icon
  const isRecommended = variant === 'recommended'
  const isDisabled = variant === 'disabled'
  const isLowConfidence = category.confidence < 70

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!isDisabled) {
        onSelect()
      }
    }
  }

  return (
    <Card
      className={cn(
        'relative transition-all duration-300 cursor-pointer group',
        'hover:shadow-lg hover:border-primary/20',
        selected && 'ring-2 ring-primary ring-offset-2 bg-primary/5 border-primary/30',
        isDisabled && 'opacity-60 cursor-not-allowed hover:shadow-none',
        !isDisabled && !selected && 'hover:scale-[1.02]',
        className
      )}
      onClick={() => !isDisabled && onSelect()}
      onKeyDown={handleKeyDown}
      tabIndex={isDisabled ? -1 : 0}
      role="button"
      aria-pressed={selected}
      aria-label={`${category.name} category suggestion with ${category.confidence}% confidence`}
      aria-disabled={isDisabled}
    >
      {isRecommended && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full shadow-md">
            <Star className="w-3 h-3 fill-white" aria-hidden="true" />
            <span>Recommended</span>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-300',
                'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                'group-hover:bg-purple-500/20 group-hover:scale-110',
                selected && 'bg-purple-500/20 scale-110'
              )}
            >
              <Icon className="w-6 h-6 shrink-0" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight truncate">
                {category.name}
              </h3>
              {category.parentCategory && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {category.parentCategory}
                </p>
              )}
            </div>
          </div>
          <ConfidenceBadge
            confidence={category.confidence}
            size="md"
            className="shrink-0"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <Button
          type="button"
          variant={selected ? 'default' : 'outline'}
          className={cn(
            'w-full transition-all duration-200',
            selected && 'bg-primary hover:bg-primary/90',
            !selected && 'hover:bg-accent hover:text-accent-foreground'
          )}
          onClick={(e) => {
            e.stopPropagation()
            if (!isDisabled) {
              onSelect()
            }
          }}
          disabled={isDisabled}
          aria-label={selected ? 'Category selected' : 'Select this category'}
        >
          {selected ? 'Selected' : 'Select This Category'}
        </Button>

        {isLowConfidence && (
          <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Low confidence. Please verify this category is correct.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setShowReasoning(!showReasoning)
          }}
          className={cn(
            'flex items-center gap-1.5 text-sm text-muted-foreground transition-colors',
            'hover:text-foreground focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1 -mx-1'
          )}
          aria-expanded={showReasoning}
          aria-controls={`reasoning-${category.name.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <span>Why this category?</span>
          {showReasoning ? (
            <ChevronUp className="w-4 h-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        <div
          id={`reasoning-${category.name.replace(/\s+/g, '-').toLowerCase()}`}
          className={cn(
            'overflow-hidden transition-all duration-300',
            showReasoning ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
          aria-hidden={!showReasoning}
        >
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {category.reasoning}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
