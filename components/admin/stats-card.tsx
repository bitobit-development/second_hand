import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { QuickStatsSparkline } from './charts/quick-stats-sparkline'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  sparklineData?: number[]
  loading?: boolean
}

function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num
  return new Intl.NumberFormat('en-US').format(n)
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  sparklineData,
  loading = false
}: StatsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-32" />
          {description && <Skeleton className="h-3 w-full" />}
          {(trend || sparklineData) && <Skeleton className="h-5 w-32" />}
        </CardContent>
      </Card>
    )
  }

  const formattedValue = typeof value === 'number' ? formatNumber(value) : value
  const TrendIcon = trend?.isPositive ? TrendingUp : TrendingDown

  // Determine trend direction from sparkline if not explicitly provided
  const sparklineTrend = sparklineData && sparklineData.length >= 2
    ? sparklineData[sparklineData.length - 1] > sparklineData[0]
      ? 'up'
      : sparklineData[sparklineData.length - 1] < sparklineData[0]
      ? 'down'
      : 'neutral'
    : undefined

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            'bg-primary/10 text-primary'
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold tracking-tight sm:text-3xl">
          {formattedValue}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}

        {/* Sparkline or Trend Display */}
        {sparklineData && sparklineData.length > 0 ? (
          <QuickStatsSparkline
            data={sparklineData}
            trend={sparklineTrend}
            percentage={trend?.value}
          />
        ) : trend ? (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}
          >
            <TrendIcon className="h-3 w-3" aria-hidden="true" />
            <span>
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
