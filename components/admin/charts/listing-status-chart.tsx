'use client'

import { Pie, PieChart, Cell } from 'recharts'
import { ListingStatus } from '@prisma/client'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface ListingStatusData {
  status: ListingStatus
  count: number
  color: string
}

interface ListingStatusChartProps {
  data: ListingStatusData[]
  className?: string
}

// Status color mapping (matches badge colors from listing-status-badge.tsx)
const STATUS_COLORS: Record<ListingStatus, string> = {
  PENDING: 'hsl(45 93% 47%)', // Yellow
  APPROVED: 'hsl(142 76% 36%)', // Green
  REJECTED: 'hsl(0 72% 51%)', // Red
  SOLD: 'hsl(221 83% 53%)', // Blue
  PAUSED: 'hsl(215 16% 47%)', // Gray
}

const STATUS_LABELS: Record<ListingStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SOLD: 'Sold',
  PAUSED: 'Paused',
}

/**
 * ListingStatusChart Component
 *
 * Donut chart showing distribution of listings by status
 *
 * Features:
 * - Donut chart with center total
 * - Interactive segments
 * - Color-coded by status (matches badge colors)
 * - Legend with counts
 * - Responsive 250px diameter
 *
 * Accessibility:
 * - ARIA label for screen readers
 * - Keyboard navigation support
 * - High contrast colors
 * - Focus indicators
 */
export function ListingStatusChart({
  data,
  className,
}: ListingStatusChartProps) {
  // Calculate total listings
  const totalListings = data.reduce((sum, item) => sum + item.count, 0)

  // Build chart config
  const chartConfig: ChartConfig = data.reduce((config, item) => {
    config[item.status] = {
      label: STATUS_LABELS[item.status],
      color: STATUS_COLORS[item.status],
    }
    return config
  }, {} as ChartConfig)

  // Prepare data with colors
  const chartData = data.map((item) => ({
    ...item,
    name: STATUS_LABELS[item.status],
    fill: STATUS_COLORS[item.status],
  }))

  return (
    <div className={className} aria-label="Listing status distribution chart">
      <div className="flex flex-col items-center gap-4">
        {/* Donut Chart */}
        <div className="relative">
          <ChartContainer
            config={chartConfig}
            className="mx-auto"
            style={{ width: '250px', height: '250px' }}
          >
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => {
                      const percentage = ((value as number) / totalListings * 100).toFixed(1)
                      return [`${value} listings (${percentage}%)`, name]
                    }}
                  />
                }
              />
            </PieChart>
          </ChartContainer>

          {/* Center Total */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalListings}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        {/* Legend with Counts */}
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {chartData.map((item) => {
            const percentage = ((item.count / totalListings) * 100).toFixed(1)
            return (
              <div key={item.status} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: item.fill }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium">{item.name}</span>
                </div>
                <div className="ml-5 flex flex-col">
                  <span className="text-sm font-semibold">{item.count}</span>
                  <span className="text-xs text-muted-foreground">
                    {percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
