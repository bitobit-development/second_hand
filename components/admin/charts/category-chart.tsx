'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { Pie, PieChart, Cell } from 'recharts'
import { ListingCategory } from '@prisma/client'

interface CategoryDataPoint {
  category: ListingCategory
  count: number
  percentage: number
}

interface CategoryChartProps {
  data: CategoryDataPoint[]
  title?: string
  description?: string
}

const CATEGORY_COLORS: Record<ListingCategory, string> = {
  ELECTRONICS: 'hsl(var(--chart-1))',
  CLOTHING: 'hsl(var(--chart-2))',
  HOME_GARDEN: 'hsl(var(--chart-3))',
  SPORTS: 'hsl(var(--chart-4))',
  BOOKS: 'hsl(var(--chart-5))',
  TOYS: 'hsl(221 83% 53%)',
  VEHICLES: 'hsl(142 76% 36%)',
  COLLECTIBLES: 'hsl(280 65% 60%)',
  BABY_KIDS: 'hsl(346 77% 50%)',
  PET_SUPPLIES: 'hsl(24 95% 53%)',
}

const CATEGORY_LABELS: Record<ListingCategory, string> = {
  ELECTRONICS: 'Electronics',
  CLOTHING: 'Clothing',
  HOME_GARDEN: 'Home & Garden',
  SPORTS: 'Sports',
  BOOKS: 'Books',
  TOYS: 'Toys',
  VEHICLES: 'Vehicles',
  COLLECTIBLES: 'Collectibles',
  BABY_KIDS: 'Baby & Kids',
  PET_SUPPLIES: 'Pet Supplies',
}

export function CategoryChart({
  data,
  title = 'Listings by Category',
  description = 'Distribution across categories'
}: CategoryChartProps) {
  // Filter out categories with 0 count
  const filteredData = data.filter(item => item.count > 0)

  const chartConfig = filteredData.reduce((config, item) => {
    config[item.category] = {
      label: CATEGORY_LABELS[item.category],
      color: CATEGORY_COLORS[item.category],
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
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => [
                    `${value} listings (${data.find(d => d.category === name)?.percentage.toFixed(1)}%)`,
                    CATEGORY_LABELS[name as ListingCategory],
                  ]}
                />
              }
            />
            <Pie
              data={filteredData}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ percentage }) => `${percentage.toFixed(0)}%`}
              labelLine={false}
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category]} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
