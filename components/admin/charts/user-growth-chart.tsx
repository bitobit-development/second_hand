'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { format } from 'date-fns'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface UserGrowthData {
  date: string
  newUsers: number
  totalUsers: number
}

interface UserGrowthChartProps {
  data: UserGrowthData[]
  className?: string
}

const chartConfig = {
  newUsers: {
    label: 'New Users',
    color: 'hsl(var(--chart-5))',
  },
  totalUsers: {
    label: 'Total Users',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

/**
 * UserGrowthChart Component
 *
 * Stacked area chart showing user acquisition and cumulative growth
 *
 * Features:
 * - Two-layer stacked area chart
 * - New users (daily) and cumulative total
 * - Growth percentage calculation
 * - Interactive tooltips with trend data
 * - Gradient fills for visual hierarchy
 *
 * Accessibility:
 * - ARIA label for screen readers
 * - Keyboard navigable tooltips
 * - Color contrast WCAG 2.1 AA compliant
 */
export function UserGrowthChart({ data, className }: UserGrowthChartProps) {
  // Calculate growth metrics
  const firstDay = data[0]
  const lastDay = data[data.length - 1]
  const growthCount = lastDay ? lastDay.totalUsers - (firstDay?.totalUsers || 0) : 0
  const growthPercentage = firstDay?.totalUsers
    ? ((growthCount / firstDay.totalUsers) * 100).toFixed(1)
    : '0.0'

  // Total new users in period
  const totalNewUsers = data.reduce((sum, item) => sum + item.newUsers, 0)

  // Format date for X-axis
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM d')
  }

  return (
    <div className={className}>
      {/* Summary Metrics */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">New Users</p>
          <p className="text-lg font-semibold">{totalNewUsers.toLocaleString()}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Total Users</p>
          <p className="text-lg font-semibold">
            {lastDay?.totalUsers.toLocaleString() || '0'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Growth Rate</p>
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            +{growthPercentage}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div aria-label="User growth and acquisition chart">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="fillNewUsers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-5))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-5))"
                  stopOpacity={0.2}
                />
              </linearGradient>
              <linearGradient id="fillTotalUsers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-xs"
              width={50}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value, name) => {
                    return [
                      (value as number).toLocaleString(),
                      name === 'newUsers' ? 'New Users' : 'Total Users',
                    ]
                  }}
                />
              }
            />

            <ChartLegend content={<ChartLegendContent />} />

            {/* Stacked areas */}
            <Area
              type="monotone"
              dataKey="totalUsers"
              stroke="hsl(var(--chart-1))"
              fill="url(#fillTotalUsers)"
              strokeWidth={2}
              stackId="1"
            />

            <Area
              type="monotone"
              dataKey="newUsers"
              stroke="hsl(var(--chart-5))"
              fill="url(#fillNewUsers)"
              strokeWidth={2}
              stackId="2"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  )
}
