'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ListingCategory, ListingStatus } from '@prisma/client'

/**
 * Admin dashboard statistics interface
 */
export interface AdminStatistics {
  pendingListings: number
  approvedListings: number
  rejectedListings: number
  pausedListings: number
  soldListings: number
  totalListings: number
  totalUsers: number
  activeUsers: number // users with emailVerified
  todaySignups: number // users created today
  weekSales: number // listings sold in last 7 days
  monthRevenue: number // estimate based on 20% commission
  listingsByCategory: Record<ListingCategory, number>
  listingsByStatus: Record<ListingStatus, number>
}

/**
 * Time-series data point for sales/revenue charts
 */
export interface TimeSeriesDataPoint {
  date: string // ISO date string
  sales: number
  revenue: number
  commission: number
}

/**
 * Category distribution data point
 */
export interface CategoryDistributionPoint {
  category: ListingCategory
  count: number
  percentage: number
}

/**
 * User growth data point
 */
export interface UserGrowthDataPoint {
  date: string // ISO date string
  newUsers: number
  totalUsers: number
}

/**
 * Status distribution data point
 */
export interface StatusDistributionPoint {
  status: ListingStatus
  count: number
}

/**
 * Fetches time-series data for sales and revenue
 *
 * @param days Number of days to fetch (default: 30)
 * @returns Array of time-series data points with daily sales and revenue
 * @throws Error if user is not authenticated or not an admin
 */
export async function getSalesTimeSeries(days: number = 30): Promise<TimeSeriesDataPoint[]> {
  // Validate admin authentication
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  // Fetch all sold listings in the date range
  const soldListings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.SOLD,
      soldAt: { gte: startDate },
    },
    select: {
      soldAt: true,
      price: true,
    },
    orderBy: {
      soldAt: 'asc',
    },
  })

  // Group by date and calculate sales count + revenue + commission
  const dataByDate = new Map<string, { sales: number; revenue: number; commission: number }>()

  // Initialize all dates with zero values
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateKey = date.toISOString().split('T')[0]
    dataByDate.set(dateKey, { sales: 0, revenue: 0, commission: 0 })
  }

  // Populate with actual data
  soldListings.forEach((listing) => {
    if (!listing.soldAt) return

    const dateKey = listing.soldAt.toISOString().split('T')[0]
    const existing = dataByDate.get(dateKey)

    if (existing) {
      existing.sales += 1
      if (listing.price) {
        // Convert Decimal to number
        const price = Number(listing.price)
        existing.revenue += price
        existing.commission += price * 0.20 // 20% commission
      }
    }
  })

  // Convert to array format
  return Array.from(dataByDate.entries())
    .map(([date, data]) => ({
      date,
      sales: data.sales,
      revenue: Math.round(data.revenue * 100) / 100, // Round to 2 decimal places
      commission: Math.round(data.commission * 100) / 100, // Round to 2 decimal places
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Fetches category distribution data
 *
 * @returns Array of category data points with counts and percentages
 * @throws Error if user is not authenticated or not an admin
 */
export async function getCategoryDistribution(): Promise<CategoryDistributionPoint[]> {
  // Validate admin authentication
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }

  // Get category counts
  const categoryGroups = await prisma.listing.groupBy({
    by: ['category'],
    _count: { id: true },
    where: {
      status: {
        in: [ListingStatus.APPROVED, ListingStatus.SOLD], // Only count active/sold listings
      },
    },
  })

  const total = categoryGroups.reduce((sum, group) => sum + group._count.id, 0)

  // Map to distribution format
  return categoryGroups.map((group) => ({
    category: group.category,
    count: group._count.id,
    percentage: total > 0 ? (group._count.id / total) * 100 : 0,
  }))
}

/**
 * Fetches user growth time-series data
 *
 * @param days Number of days to fetch (default: 30)
 * @returns Array of user growth data points
 * @throws Error if user is not authenticated or not an admin
 */
export async function getUserGrowthData(days: number = 30): Promise<UserGrowthDataPoint[]> {
  // Validate admin authentication
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  // Fetch users created in date range
  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
      emailVerified: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  // Initialize cumulative counter
  let totalCount = await prisma.user.count({
    where: {
      createdAt: { lt: startDate },
    },
  })

  // Generate daily data points
  const dataPoints: UserGrowthDataPoint[] = []

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateKey = date.toISOString().split('T')[0]

    // Count users created on this day
    const dayUsers = users.filter((u) => {
      const userDate = u.createdAt.toISOString().split('T')[0]
      return userDate === dateKey
    })

    const newUsersCount = dayUsers.length
    totalCount += newUsersCount

    dataPoints.push({
      date: dateKey,
      newUsers: newUsersCount,
      totalUsers: totalCount,
    })
  }

  return dataPoints
}

/**
 * Fetches status distribution data
 *
 * @returns Array of status data points with counts
 * @throws Error if user is not authenticated or not an admin
 */
export async function getStatusDistribution(): Promise<StatusDistributionPoint[]> {
  // Validate admin authentication
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }

  // Get status counts
  const statusGroups = await prisma.listing.groupBy({
    by: ['status'],
    _count: { id: true },
  })

  return statusGroups.map((group) => ({
    status: group.status,
    count: group._count.id,
  }))
}

/**
 * Fetches comprehensive admin dashboard statistics
 *
 * @returns AdminStatistics object with all dashboard metrics
 * @throws Error if user is not authenticated or not an admin
 *
 * Performance optimizations:
 * - Uses Promise.all() for parallel query execution
 * - Prisma aggregations for efficient counting
 * - Single queries with groupBy to avoid N+1 problems
 * - Target response time: <500ms
 */
export async function getAdminStatistics(): Promise<AdminStatistics> {
  // Validate admin authentication
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  // Verify admin role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }

  // Calculate date ranges
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Execute all queries in parallel for optimal performance
  const [
    listingsByStatus,
    listingsByCategory,
    userStats,
    todaySignups,
    weekSales,
    monthSoldListings,
  ] = await Promise.all([
    // Group listings by status for status counts
    prisma.listing.groupBy({
      by: ['status'],
      _count: { id: true },
    }),

    // Group listings by category for category distribution
    prisma.listing.groupBy({
      by: ['category'],
      _count: { id: true },
    }),

    // User statistics in a single aggregation
    prisma.user.aggregate({
      _count: {
        id: true,
      },
      where: {
        emailVerified: { not: null },
      },
    }),

    // Count signups today
    prisma.user.count({
      where: {
        createdAt: { gte: todayStart },
      },
    }),

    // Count sales in last 7 days
    prisma.listing.count({
      where: {
        status: ListingStatus.SOLD,
        soldAt: { gte: weekAgo },
      },
    }),

    // Fetch sold listings from last 30 days with prices for revenue calculation
    prisma.listing.findMany({
      where: {
        status: ListingStatus.SOLD,
        soldAt: { gte: monthAgo },
        price: { not: null },
      },
      select: {
        price: true,
      },
    }),
  ])

  // Also get total user count (including unverified)
  const totalUsersCount = await prisma.user.count()

  // Transform groupBy results into Record format
  const statusMap: Record<ListingStatus, number> = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    SOLD: 0,
    PAUSED: 0,
  }

  listingsByStatus.forEach((group) => {
    statusMap[group.status] = group._count.id
  })

  const categoryMap: Record<ListingCategory, number> = {
    ELECTRONICS: 0,
    CLOTHING: 0,
    HOME_GARDEN: 0,
    SPORTS: 0,
    BOOKS: 0,
    TOYS: 0,
    VEHICLES: 0,
    COLLECTIBLES: 0,
    BABY_KIDS: 0,
    PET_SUPPLIES: 0,
  }

  listingsByCategory.forEach((group) => {
    categoryMap[group.category] = group._count.id
  })

  // Calculate total listings
  const totalListings = Object.values(statusMap).reduce((sum, count) => sum + count, 0)

  // Calculate month revenue (20% commission on sold listings)
  const monthRevenue = monthSoldListings.reduce((total, listing) => {
    if (listing.price) {
      // Convert Decimal to number and apply 20% commission
      const price = Number(listing.price)
      return total + price * 0.20
    }
    return total
  }, 0)

  return {
    // Status counts
    pendingListings: statusMap.PENDING,
    approvedListings: statusMap.APPROVED,
    rejectedListings: statusMap.REJECTED,
    pausedListings: statusMap.PAUSED,
    soldListings: statusMap.SOLD,
    totalListings,

    // User statistics
    totalUsers: totalUsersCount,
    activeUsers: userStats._count.id, // verified users
    todaySignups,

    // Sales metrics
    weekSales,
    monthRevenue: Math.round(monthRevenue * 100) / 100, // Round to 2 decimal places

    // Distributions
    listingsByCategory: categoryMap,
    listingsByStatus: statusMap,
  }
}
