import React from 'react'
import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectionMethodBadgeProps {
  method: 'ai' | 'manual'
  confidence?: number
  className?: string
}

export const SelectionMethodBadge = ({
  method,
  confidence,
  className
}: SelectionMethodBadgeProps) => {
  const isAI = method === 'ai'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200',
        isAI
          ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
          : 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20',
        className
      )}
      role="status"
      aria-label={
        isAI
          ? `AI suggested category with ${confidence}% confidence`
          : 'Manually selected category'
      }
    >
      {isAI ? (
        <>
          <Bot className="w-3.5 h-3.5" aria-hidden="true" />
          <span>AI Suggested</span>
          {confidence !== undefined && (
            <span className="font-semibold tabular-nums">({confidence}%)</span>
          )}
        </>
      ) : (
        <>
          <User className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Manually Selected</span>
        </>
      )}
    </span>
  )
}
