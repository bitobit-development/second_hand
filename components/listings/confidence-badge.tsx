import React from 'react'
import { Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfidenceBadgeProps {
  confidence: number
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const getConfidenceConfig = (confidence: number) => {
  if (confidence >= 90) {
    return {
      variant: 'success' as const,
      color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
      icon: Check,
      label: 'High confidence'
    }
  }
  if (confidence >= 70) {
    return {
      variant: 'warning' as const,
      color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20',
      icon: null,
      label: 'Medium confidence'
    }
  }
  return {
    variant: 'destructive' as const,
    color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    icon: AlertTriangle,
    label: 'Low confidence'
  }
}

const sizeClasses = {
  sm: {
    container: 'px-2 py-0.5 text-xs',
    icon: 'w-3 h-3',
    gap: 'gap-1'
  },
  md: {
    container: 'px-2.5 py-1 text-sm',
    icon: 'w-3.5 h-3.5',
    gap: 'gap-1.5'
  },
  lg: {
    container: 'px-3 py-1.5 text-base',
    icon: 'w-4 h-4',
    gap: 'gap-2'
  }
}

export const ConfidenceBadge = ({
  confidence,
  size = 'sm',
  showIcon = true,
  className
}: ConfidenceBadgeProps) => {
  const config = getConfidenceConfig(confidence)
  const Icon = config.icon
  const sizes = sizeClasses[size]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-all duration-200',
        config.color,
        sizes.container,
        sizes.gap,
        className
      )}
      role="status"
      aria-label={`${config.label}: ${confidence}%`}
    >
      {showIcon && Icon && (
        <Icon className={cn(sizes.icon, 'shrink-0')} aria-hidden="true" />
      )}
      <span className="font-semibold tabular-nums">
        {confidence}%
      </span>
    </span>
  )
}
