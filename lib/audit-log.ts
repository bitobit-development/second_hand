'use server'

import { prisma } from '@/lib/prisma'
import { AdminAction, AuditTargetType } from '@prisma/client'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Parameters for creating an audit log entry
 */
export interface CreateAuditLogParams {
  /** ID of the admin user performing the action */
  userId: string
  /** Type of administrative action performed */
  action: AdminAction
  /** Type of entity being affected */
  targetType: AuditTargetType
  /** ID of the affected entity */
  targetId: string
  /** Optional metadata about the action (e.g., rejection reason, field changes) */
  details?: Record<string, any>
  /** IP address of the admin user for security tracking */
  ipAddress?: string
  /** Browser/client user agent string */
  userAgent?: string
}

/**
 * Parameters for querying audit logs with filtering
 */
export interface GetAuditLogsParams {
  /** Filter by specific admin user */
  userId?: string
  /** Filter by action type */
  action?: AdminAction
  /** Filter by target entity type */
  targetType?: AuditTargetType
  /** Filter by specific target entity ID */
  targetId?: string
  /** Filter logs created on or after this date */
  startDate?: Date
  /** Filter logs created on or before this date */
  endDate?: Date
  /** Maximum number of results to return (default: 50) */
  limit?: number
  /** Cursor for pagination (ID of last item from previous page) */
  cursor?: string
}

/**
 * Audit log entry with associated user information
 */
export interface AuditLogWithUser {
  id: string
  userId: string
  action: AdminAction
  targetType: AuditTargetType
  targetId: string
  details: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
  }
}

/**
 * Response structure for paginated audit log queries
 */
export interface GetAuditLogsResponse {
  /** Array of audit log entries with user info */
  logs: AuditLogWithUser[]
  /** Indicates if more results are available */
  hasMore: boolean
  /** Cursor for fetching next page (null if no more results) */
  nextCursor: string | null
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Creates an audit log entry for admin actions
 *
 * This function is non-blocking and will not throw errors if logging fails.
 * Failed log writes are logged to console but do not interrupt the main action.
 *
 * @param params - Audit log parameters
 *
 * @example
 * ```typescript
 * await createAuditLog({
 *   userId: session.user.id,
 *   action: 'APPROVE_LISTING',
 *   targetType: 'LISTING',
 *   targetId: listingId,
 *   details: { previousStatus: 'PENDING', newStatus: 'APPROVED' },
 *   ipAddress: request.ip,
 *   userAgent: request.headers['user-agent'],
 * })
 * ```
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        details: params.details || undefined,
        ipAddress: params.ipAddress || undefined,
        userAgent: params.userAgent || undefined,
      },
    })
  } catch (error) {
    // Log error but don't throw - audit log failures shouldn't break admin actions
    console.error('Failed to create audit log:', {
      error,
      params: {
        userId: params.userId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
      },
    })
  }
}

/**
 * Retrieves audit logs with optional filtering and pagination
 *
 * Supports filtering by user, action type, target entity, and date range.
 * Uses cursor-based pagination for efficient queries on large datasets.
 * Results are ordered by creation date (most recent first).
 *
 * @param params - Filter parameters (all optional)
 * @returns Paginated audit logs with user information
 *
 * @example
 * ```typescript
 * // Get recent audit logs
 * const { logs, hasMore, nextCursor } = await getAuditLogs({ limit: 20 })
 *
 * // Filter by specific admin
 * const adminLogs = await getAuditLogs({ userId: adminId })
 *
 * // Filter by action type
 * const approvals = await getAuditLogs({ action: 'APPROVE_LISTING' })
 *
 * // Get all actions on a specific listing
 * const listingHistory = await getAuditLogs({
 *   targetType: 'LISTING',
 *   targetId: listingId,
 * })
 *
 * // Date range query
 * const lastWeek = await getAuditLogs({
 *   startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
 *   endDate: new Date(),
 * })
 *
 * // Pagination
 * const firstPage = await getAuditLogs({ limit: 50 })
 * const secondPage = await getAuditLogs({
 *   limit: 50,
 *   cursor: firstPage.nextCursor
 * })
 * ```
 */
export async function getAuditLogs(
  params: GetAuditLogsParams = {}
): Promise<GetAuditLogsResponse> {
  const limit = params.limit || 50
  const where: any = {}

  // Apply filters
  if (params.userId) where.userId = params.userId
  if (params.action) where.action = params.action
  if (params.targetType) where.targetType = params.targetType
  if (params.targetId) where.targetId = params.targetId

  // Date range filter
  if (params.startDate || params.endDate) {
    where.createdAt = {}
    if (params.startDate) where.createdAt.gte = params.startDate
    if (params.endDate) where.createdAt.lte = params.endDate
  }

  // Cursor-based pagination (fetch one extra to check if more exist)
  if (params.cursor) {
    where.id = { lt: params.cursor }
  }

  const logs = await prisma.adminAuditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1, // Fetch one extra to determine if more exist
  })

  // Determine pagination state
  const hasMore = logs.length > limit
  const results = hasMore ? logs.slice(0, limit) : logs
  const nextCursor = hasMore ? results[results.length - 1].id : null

  return {
    logs: results,
    hasMore,
    nextCursor,
  }
}

/**
 * Retrieves audit logs for a specific target entity
 *
 * Convenience function to get the complete audit trail for a single entity.
 * Useful for displaying action history on admin detail pages.
 *
 * @param targetType - Type of target entity
 * @param targetId - ID of target entity
 * @param limit - Maximum number of results (default: 100)
 * @returns Array of audit logs for the target entity
 *
 * @example
 * ```typescript
 * // Get all actions performed on a listing
 * const listingHistory = await getAuditLogsByTarget('LISTING', listingId)
 * ```
 */
export async function getAuditLogsByTarget(
  targetType: AuditTargetType,
  targetId: string,
  limit: number = 100
): Promise<AuditLogWithUser[]> {
  const result = await getAuditLogs({
    targetType,
    targetId,
    limit,
  })

  return result.logs
}

/**
 * Retrieves recent audit logs for a specific admin user
 *
 * Convenience function to get an admin's recent activity timeline.
 * Useful for admin dashboards and activity monitoring.
 *
 * @param userId - Admin user ID
 * @param limit - Maximum number of results (default: 50)
 * @returns Array of recent audit logs by the user
 *
 * @example
 * ```typescript
 * // Get admin's recent activity
 * const recentActivity = await getRecentAdminActivity(adminId, 20)
 * ```
 */
export async function getRecentAdminActivity(
  userId: string,
  limit: number = 50
): Promise<AuditLogWithUser[]> {
  const result = await getAuditLogs({
    userId,
    limit,
  })

  return result.logs
}

/**
 * Counts total audit logs matching the filter criteria
 *
 * Useful for analytics, reporting, and displaying total counts in admin UI.
 * Supports the same filtering options as getAuditLogs.
 *
 * @param params - Filter parameters (same as getAuditLogs)
 * @returns Total count of matching audit logs
 *
 * @example
 * ```typescript
 * // Count approvals in last 30 days
 * const approvalCount = await countAuditLogs({
 *   action: 'APPROVE_LISTING',
 *   startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
 * })
 *
 * // Count all actions by admin
 * const totalActions = await countAuditLogs({ userId: adminId })
 * ```
 */
export async function countAuditLogs(params: GetAuditLogsParams = {}): Promise<number> {
  const where: any = {}

  // Apply filters (same as getAuditLogs)
  if (params.userId) where.userId = params.userId
  if (params.action) where.action = params.action
  if (params.targetType) where.targetType = params.targetType
  if (params.targetId) where.targetId = params.targetId

  if (params.startDate || params.endDate) {
    where.createdAt = {}
    if (params.startDate) where.createdAt.gte = params.startDate
    if (params.endDate) where.createdAt.lte = params.endDate
  }

  const count = await prisma.adminAuditLog.count({ where })
  return count
}
