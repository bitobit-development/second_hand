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

interface SalesChartData {
  date: string
  sales: number
  revenue: number
}

interface SalesChartProps {
  data: SalesChartData[]
  timeRange?: '7d' | '30d' | '90d' | 'all'
  className?: string
}

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

/**
 * SalesChart Component
 *
 * Dual Y-axis area chart displaying sales count and revenue trends
 *
 * Features:
 * - Area chart with gradient fill
 * - Two metrics: sales count (left Y-axis) and revenue (right Y-axis)
 * - Interactive hover tooltips
 * - Responsive legend
 * - Date formatting on X-axis
 *
 * Accessibility:
 * - ARIA label for screen readers
 * - Keyboard navigable tooltips
 * - Color contrast compliant
 */
export function SalesChart({
  data,
  timeRange = '30d',
  className,
}: SalesChartProps) {
  // Format date based on time range
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (timeRange === '7d') {
      return format(date, 'EEE') // Mon, Tue, etc.
    } else if (timeRange === '30d') {
      return format(date, 'MMM d') // Jan 15
    } else {
      return format(date, 'MMM yyyy') // Jan 2025
    }
  }

  // Format revenue as ZAR
  const formatRevenue = (value: number) => {
    return `R ${value.toLocaleString('en-ZA', { maximumFractionDigits: 0 })}`
  }

  return (
    <div className={className} aria-label="Sales and revenue trend chart">
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
            <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--chart-1))"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--chart-1))"
                stopOpacity={0.1}
              />
            </linearGradient>
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
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            className="text-xs"
            width={40}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatRevenue}
            className="text-xs"
            width={80}
          />

          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => formatDate(value as string)}
                formatter={(value, name) => {
                  if (name === 'revenue') {
                    return [`R ${(value as number).toLocaleString('en-ZA')}`, 'Revenue']
                  }
                  return [value, name === 'sales' ? 'Sales' : name]
                }}
              />
            }
          />

          <ChartLegend content={<ChartLegendContent />} />

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="sales"
            stroke="hsl(var(--chart-1))"
            fill="url(#fillSales)"
            strokeWidth={2}
          />

          <Area
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--chart-2))"
            fill="url(#fillRevenue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
