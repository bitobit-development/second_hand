'use client'

import type { CategoryAnalytics as AnalyticsData } from '@/app/admin/categories/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Folder,
  FolderOpen,
  Sparkles,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'

type CategoryAnalyticsProps = {
  analytics: AnalyticsData
}

const COLORS = [
  'oklch(0.642 0.202 259.49)', // primary
  'oklch(0.729 0.149 162.36)', // success
  'oklch(0.732 0.163 64.43)',  // warning
  'oklch(0.578 0.241 15.8)',   // destructive
  'oklch(0.655 0.224 288.97)', // accent
]

export const CategoryAnalytics = ({ analytics }: CategoryAnalyticsProps) => {
  const stats = [
    {
      title: 'Total Categories',
      value: analytics.total,
      icon: Folder,
      description: `${analytics.active} active, ${analytics.inactive} inactive`,
    },
    {
      title: 'AI Generated',
      value: analytics.aiGenerated,
      icon: Sparkles,
      description: `${analytics.manual} manual categories`,
      highlight: analytics.aiGenerated > 0,
    },
    {
      title: 'Avg Items/Category',
      value: analytics.avgItemsPerCategory.toFixed(1),
      icon: TrendingUp,
      description: `${analytics.rootCategories} root, ${analytics.subcategories} subcategories`,
    },
    {
      title: 'Empty Categories',
      value: analytics.withZeroItems,
      icon: AlertCircle,
      description: 'Categories with 0 items',
      warning: analytics.withZeroItems > 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon
                  className={`w-4 h-4 ${
                    stat.highlight
                      ? 'text-primary'
                      : stat.warning
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Distribution Chart */}
      {analytics.distribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.distribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="categoryName"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.9 0 0)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="itemCount" radius={[8, 8, 0, 0]}>
                  {analytics.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
