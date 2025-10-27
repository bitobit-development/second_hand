import { Suspense } from 'react'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-helpers'
import { getAdminStatistics } from './dashboard/actions'
import { StatsCard } from '@/components/admin/stats-card'
import { DashboardCharts } from '@/components/admin/dashboard-charts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  TrendingUp,
  DollarSign,
  UserCheck,
  UserPlus,
} from 'lucide-react'

/**
 * Loading skeleton for stats grid
 */
function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <StatsCard
          key={i}
          title=""
          value={0}
          icon={ShoppingBag}
          loading
        />
      ))}
    </div>
  )
}

/**
 * Statistics content component
 */
async function DashboardStats() {
  const stats = await getAdminStatistics()

  return (
    <div className="space-y-8">
      {/* Primary Metrics - Listing Status */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Listing Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Pending Approval"
            value={stats.pendingListings}
            icon={Clock}
            description="Awaiting review"
          />
          <StatsCard
            title="Approved"
            value={stats.approvedListings}
            icon={CheckCircle}
            description="Live on marketplace"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejectedListings}
            icon={XCircle}
            description="Did not meet criteria"
          />
          <StatsCard
            title="Paused"
            value={stats.pausedListings}
            icon={Pause}
            description="Temporarily inactive"
          />
        </div>
      </div>

      {/* Secondary Metrics - Platform Overview */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Platform Metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            description="All registered users"
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers}
            icon={UserCheck}
            description="Verified accounts"
          />
          <StatsCard
            title="Total Listings"
            value={stats.totalListings}
            icon={ShoppingBag}
            description="All time listings"
          />
        </div>
      </div>

      {/* Tertiary Metrics - Activity & Revenue */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Recent Activity
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Today's Signups"
            value={stats.todaySignups}
            icon={UserPlus}
            description="New users today"
          />
          <StatsCard
            title="Sales This Week"
            value={stats.weekSales}
            icon={TrendingUp}
            description="Last 7 days"
          />
          <StatsCard
            title="Monthly Revenue"
            value={`R ${stats.monthRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            description="20% commission (30 days)"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Admin Dashboard Homepage
 */
export default async function AdminDashboardPage() {
  const user = await requireAdmin()

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user.name || 'Admin'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="default">
            <Link href="/admin/listings?status=PENDING">
              <Clock className="mr-2 h-4 w-4" />
              View Pending
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/listings">
              <ShoppingBag className="mr-2 h-4 w-4" />
              All Listings
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Grid with Loading State */}
      <Suspense fallback={<StatsGridSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* Analytics Charts Section */}
      <DashboardCharts />

      {/* Additional Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The admin dashboard provides real-time insights into platform
            activity. Review pending listings, monitor user growth, and track
            revenue from successful transactions.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/reports">View Reports</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
