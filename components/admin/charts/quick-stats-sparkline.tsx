'use client'

import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickStatsSparklineProps {
  data: number[]
  trend?: 'up' | 'down' | 'neutral'
  percentage?: number
  className?: string
  color?: string
}

/**
 * QuickStatsSparkline Component
 *
 * Micro line chart (sparkline) for displaying inline trend data
 * Used in StatsCard component to show quick visual trends
 *
 * Features:
 * - Minimal 60x20px inline chart
 * - No axes or labels
 * - Trend arrow and percentage
 * - Color-coded based on trend direction
 */
export function QuickStatsSparkline({
  data,
  trend = 'neutral',
  percentage,
  className,
  color,
}: QuickStatsSparklineProps) {
  // Transform data array into chart format
  const chartData = data.map((value, index) => ({
    index,
    value,
  }))

  // Determine trend color
  const trendColor = trend === 'up'
    ? 'text-emerald-600 dark:text-emerald-400'
    : trend === 'down'
    ? 'text-red-600 dark:text-red-400'
    : 'text-muted-foreground'

  // Determine stroke color for chart
  const strokeColor = color || (
    trend === 'up'
      ? 'hsl(142 76% 36%)' // emerald-600
      : trend === 'down'
      ? 'hsl(0 84% 60%)' // red-600
      : 'hsl(var(--muted-foreground))'
  )

  // Select trend icon
  const TrendIcon = trend === 'up'
    ? TrendingUp
    : trend === 'down'
    ? TrendingDown
    : Minus

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Sparkline Chart */}
      <div className="h-5 w-15" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Indicator */}
      {percentage !== undefined && (
        <div
          className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            trendColor
          )}
        >
          <TrendIcon className="h-3 w-3" aria-hidden="true" />
          <span>
            {trend === 'up' && '+'}
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  )
}
