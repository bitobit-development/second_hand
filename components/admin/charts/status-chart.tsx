'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ListingStatus } from '@prisma/client'

interface StatusDataPoint {
  status: ListingStatus
  count: number
}

interface StatusChartProps {
  data: StatusDataPoint[]
  title?: string
  description?: string
}

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

export function StatusChart({
  data,
  title = 'Listings by Status',
  description = 'Current status distribution'
}: StatusChartProps) {
  const chartConfig = data.reduce((config, item) => {
    config[item.status] = {
      label: STATUS_LABELS[item.status],
      color: STATUS_COLORS[item.status],
    }
    return config
  }, {} as Record<string, { label: string; color: string }>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              type="category"
              dataKey="status"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => STATUS_LABELS[value as ListingStatus]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => [
                    `${value} listings`,
                    STATUS_LABELS[name as ListingStatus],
                  ]}
                />
              }
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <rect key={`bar-${index}`} fill={STATUS_COLORS[entry.status]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
