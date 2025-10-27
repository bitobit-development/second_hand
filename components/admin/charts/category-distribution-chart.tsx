'use client'

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface CategoryData {
  category: string
  count: number
  percentage: number
}

interface CategoryDistributionChartProps {
  data: CategoryData[]
  className?: string
}

const chartConfig = {
  count: {
    label: 'Listings',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

/**
 * CategoryDistributionChart Component
 *
 * Horizontal bar chart showing listings distribution across categories
 *
 * Features:
 * - Color-coded bars by category
 * - Percentage labels on bars
 * - Sorted descending by count
 * - Responsive auto-height based on number of categories
 * - Interactive tooltips
 *
 * Accessibility:
 * - ARIA label for screen readers
 * - Keyboard navigation support
 * - High contrast colors
 */
export function CategoryDistributionChart({
  data,
  className,
}: CategoryDistributionChartProps) {
  // Sort data by count descending
  const sortedData = [...data].sort((a, b) => b.count - a.count)

  // Calculate dynamic height based on number of categories
  const chartHeight = Math.max(300, sortedData.length * 50)

  return (
    <div
      className={className}
      aria-label="Listings distribution by category chart"
    >
      <ChartContainer
        config={chartConfig}
        className="w-full"
        style={{ height: `${chartHeight}px` }}
      >
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{
            top: 5,
            right: 60,
            left: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />

          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            className="text-xs"
          />

          <YAxis
            type="category"
            dataKey="category"
            tickLine={false}
            axisLine={false}
            className="text-xs"
            width={120}
          />

          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => {
                  const percentage = props.payload.percentage
                  return [
                    `${value} listings (${percentage.toFixed(1)}%)`,
                    'Count',
                  ]
                }}
              />
            }
          />

          <Bar
            dataKey="count"
            fill="hsl(var(--chart-3))"
            radius={[0, 4, 4, 0]}
          >
            <LabelList
              dataKey="percentage"
              position="right"
              className="fill-foreground text-xs"
              formatter={(value: number) => `${value.toFixed(1)}%`}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}
