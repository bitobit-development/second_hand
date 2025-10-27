'use client'

import { Suspense, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SalesChart } from './charts/sales-chart'
import { RevenueChart } from './charts/revenue-chart'
import { CategoryDistributionChart } from './charts/category-distribution-chart'
import { UserGrowthChart } from './charts/user-growth-chart'
import { ListingStatusChart } from './charts/listing-status-chart'
import { DateRangeSelector, type TimeRange } from './charts/date-range-selector'

/**
 * Loading skeleton for chart cards
 */
function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  )
}

/**
 * Mock data generators (will be replaced with real API calls by backend team)
 */
function generateMockSalesData(days: number) {
  const data = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const sales = Math.floor(Math.random() * 50) + 10
    const revenue = sales * (Math.random() * 5000 + 1000)
    data.push({
      date: date.toISOString().split('T')[0],
      sales,
      revenue: Math.round(revenue),
    })
  }
  return data
}

function generateMockRevenueData(days: number) {
  const data = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const revenue = Math.floor(Math.random() * 50000) + 10000
    const commission = Math.round(revenue * 0.2)
    data.push({
      date: date.toISOString().split('T')[0],
      revenue,
      commission,
    })
  }
  return data
}

function generateMockCategoryData() {
  return [
    { category: 'Electronics', count: 245, percentage: 28.5 },
    { category: 'Clothing', count: 189, percentage: 22.0 },
    { category: 'Home & Garden', count: 156, percentage: 18.2 },
    { category: 'Sports', count: 98, percentage: 11.4 },
    { category: 'Books', count: 78, percentage: 9.1 },
    { category: 'Toys', count: 45, percentage: 5.2 },
    { category: 'Vehicles', count: 32, percentage: 3.7 },
    { category: 'Collectibles', count: 17, percentage: 2.0 },
  ]
}

function generateMockUserGrowthData(days: number) {
  const data = []
  const today = new Date()
  let totalUsers = 500
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const newUsers = Math.floor(Math.random() * 20) + 5
    totalUsers += newUsers
    data.push({
      date: date.toISOString().split('T')[0],
      newUsers,
      totalUsers,
    })
  }
  return data
}

function generateMockStatusData() {
  return [
    { status: 'PENDING' as const, count: 42, color: 'hsl(45 93% 47%)' },
    { status: 'APPROVED' as const, count: 156, color: 'hsl(142 76% 36%)' },
    { status: 'REJECTED' as const, count: 18, color: 'hsl(0 72% 51%)' },
    { status: 'SOLD' as const, count: 89, color: 'hsl(221 83% 53%)' },
    { status: 'PAUSED' as const, count: 23, color: 'hsl(215 16% 47%)' },
  ]
}

/**
 * Dashboard Charts Section
 *
 * Displays interactive analytics charts for the admin dashboard:
 * - Sales & Revenue trend (dual Y-axis area chart)
 * - Revenue analytics (line chart with metrics)
 * - Category distribution (horizontal bar chart)
 * - User growth (stacked area chart)
 * - Listing status distribution (donut chart)
 *
 * Features:
 * - Date range selector (7d, 30d, 90d, all)
 * - Responsive grid layout
 * - Interactive charts with tooltips
 * - Mobile-first design
 * - WCAG 2.1 AA accessible
 */
export function DashboardCharts() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  // Map time range to number of days
  const daysMap: Record<TimeRange, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    'all': 365, // Use 365 for "all time" mock data
  }
  const days = daysMap[timeRange]

  // Generate mock data based on selected time range
  const salesData = generateMockSalesData(days)
  const revenueData = generateMockRevenueData(days)
  const categoryData = generateMockCategoryData()
  const userGrowthData = generateMockUserGrowthData(days)
  const statusData = generateMockStatusData()

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform performance metrics and trends
          </p>
        </div>
        <DateRangeSelector
          defaultValue={timeRange}
          onValueChange={setTimeRange}
          className="w-full sm:w-auto"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sales & Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales & Revenue</CardTitle>
            <CardDescription>
              Daily sales count and revenue over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesData} timeRange={timeRange} />
          </CardContent>
        </Card>

        {/* Category Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Listings by Category</CardTitle>
            <CardDescription>
              Distribution of listings across categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDistributionChart data={categoryData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Analytics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>
              Total revenue vs platform commission (20%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>
              New user acquisition and cumulative growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={userGrowthData} />
          </CardContent>
        </Card>
      </div>

      {/* Listing Status Chart - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Status Distribution</CardTitle>
          <CardDescription>
            Current status breakdown of all listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListingStatusChart data={statusData} />
        </CardContent>
      </Card>
    </div>
  )
}
