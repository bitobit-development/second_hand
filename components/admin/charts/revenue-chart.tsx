'use client'

import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from 'recharts'
import { format } from 'date-fns'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface RevenueData {
  date: string
  revenue: number
  commission: number
}

interface RevenueChartProps {
  data: RevenueData[]
  className?: string
}

const chartConfig = {
  revenue: {
    label: 'Total Revenue',
    color: 'hsl(var(--chart-2))',
  },
  commission: {
    label: 'Platform Commission',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

/**
 * RevenueChart Component
 *
 * Line chart with area fill showing revenue analytics
 *
 * Features:
 * - Line chart with gradient area fill
 * - Two metrics: total revenue and platform commission (20%)
 * - Total and average metrics display
 * - Date formatted X-axis
 *
 * Accessibility:
 * - ARIA label for screen readers
 * - Keyboard navigable tooltips
 * - Color contrast WCAG 2.1 AA compliant
 */
export function RevenueChart({ data, className }: RevenueChartProps) {
  // Calculate totals
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const totalCommission = data.reduce((sum, item) => sum + item.commission, 0)
  const avgRevenue = data.length > 0 ? totalRevenue / data.length : 0
  const avgCommission = data.length > 0 ? totalCommission / data.length : 0

  // Format date for X-axis
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'MMM d')
  }

  // Format ZAR currency
  const formatZAR = (value: number) => {
    return `R ${value.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`
  }

  return (
    <div className={className}>
      {/* Summary Metrics */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-semibold">{formatZAR(totalRevenue)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Total Commission</p>
          <p className="text-lg font-semibold">{formatZAR(totalCommission)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Avg Daily Revenue</p>
          <p className="text-lg font-semibold">{formatZAR(avgRevenue)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Avg Daily Commission</p>
          <p className="text-lg font-semibold">{formatZAR(avgCommission)}</p>
        </div>
      </div>

      {/* Chart */}
      <div aria-label="Revenue analytics chart">
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
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCommission" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-4))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-4))"
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
              tickFormatter={formatZAR}
              tickLine={false}
              axisLine={false}
              className="text-xs"
              width={80}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value, name) => {
                    return [formatZAR(value as number), name]
                  }}
                />
              }
            />

            <ChartLegend content={<ChartLegendContent />} />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--chart-2))"
              fill="url(#fillRevenue)"
              strokeWidth={2}
            />

            <Area
              type="monotone"
              dataKey="commission"
              stroke="hsl(var(--chart-4))"
              fill="url(#fillCommission)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  )
}
