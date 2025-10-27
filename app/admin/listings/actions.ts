'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-log'
import { ListingStatus, ListingCategory, PricingType, Prisma } from '@prisma/client'
import { z } from 'zod'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Standard action result type for all server actions
 */
export interface ActionResult<T = unknown> {
  success: boolean
  error?: string
  data?: T
}

/**
 * Parameters for fetching admin listings with filters and pagination
 */
export interface GetAdminListingsParams {
  /** Filter by listing status (single or multiple) */
  status?: ListingStatus | ListingStatus[]
  /** Filter by category */
  category?: ListingCategory
  /** Search query for title/description */
  search?: string
  /** Page number (1-indexed) */
  page?: number
  /** Results per page (default: 20, max: 100) */
  limit?: number
  /** Sort field */
  sortBy?: 'createdAt' | 'updatedAt' | 'price'
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Listing with seller information for admin view
 * Note: price and minOffer are serialized as strings for client compatibility
 */
export interface AdminListingWithSeller {
  id: string
  title: string
  description: string
  category: ListingCategory
  pricingType: PricingType
  status: ListingStatus
  price: string | null
  minOffer: string | null
  primaryImage: string
  city: string
  province: string
  views: number
  createdAt: Date
  updatedAt: Date
  approvedAt: Date | null
  rejectionReason: string | null
  seller: {
    id: string
    name: string
    email: string
    rating: number
  }
}

/**
 * Paginated response for admin listings
 */
export interface GetAdminListingsResponse {
  listings: AdminListingWithSeller[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for rejection reason validation
 */
const rejectionReasonSchema = z.string()
  .min(10, 'Rejection reason must be at least 10 characters')
  .max(500, 'Rejection reason must not exceed 500 characters')

/**
 * Schema for deletion reason validation
 */
const deletionReasonSchema = z.string()
  .min(10, 'Deletion reason must be at least 10 characters')
  .max(500, 'Deletion reason must not exceed 500 characters')

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Fetches listings for admin dashboard with filtering and pagination
 *
 * @param params - Filter and pagination parameters
 * @returns Paginated listings with seller information
 *
 * @example
 * ```typescript
 * // Get pending listings
 * const { listings } = await getAdminListings({ status: 'PENDING' })
 *
 * // Search with pagination
 * const result = await getAdminListings({
 *   search: 'laptop',
 *   page: 2,
 *   limit: 20
 * })
 *
 * // Multiple statuses
 * const active = await getAdminListings({
 *   status: ['APPROVED', 'PENDING']
 * })
 * ```
 */
export async function getAdminListings(
  params: GetAdminListingsParams = {}
): Promise<ActionResult<GetAdminListingsResponse>> {
  try {
    // Validate admin authentication
    await requireAdmin()

    // Set defaults
    const page = Math.max(1, params.page || 1)
    const limit = Math.min(100, Math.max(1, params.limit || 20))
    const skip = (page - 1) * limit
    const sortBy = params.sortBy || 'createdAt'
    const sortOrder = params.sortOrder || 'desc'

    // Build where clause
    const where: Prisma.ListingWhereInput = {}

    // Status filter (single or multiple)
    if (params.status) {
      if (Array.isArray(params.status)) {
        where.status = { in: params.status }
      } else {
        where.status = params.status
      }
    }

    // Category filter
    if (params.category) {
      where.category = params.category
    }

    // Search filter (title OR description)
    if (params.search && params.search.trim()) {
      const searchTerm = params.search.trim()
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ]
    }

    // Build orderBy clause
    const orderBy: Prisma.ListingOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    }

    // Execute queries in parallel for performance
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              rating: true,
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    // Serialize Decimal fields for client components
    const serializedListings = listings.map(listing => ({
      ...listing,
      price: listing.price ? listing.price.toString() : null,
      minOffer: listing.minOffer ? listing.minOffer.toString() : null,
    }))

    return {
      success: true,
      data: {
        listings: serializedListings as any as AdminListingWithSeller[],
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    }
  } catch (error) {
    console.error('Failed to fetch admin listings:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch listings',
    }
  }
}

/**
 * Approves a pending listing
 *
 * @param listingId - ID of the listing to approve
 * @returns Success result with updated listing
 *
 * @example
 * ```typescript
 * const result = await approveListing('listing-123')
 * if (result.success) {
 *   console.log('Listing approved')
 * }
 * ```
 */
export async function approveListing(
  listingId: string
): Promise<ActionResult<{ listing: AdminListingWithSeller }>> {
  try {
    // Validate admin authentication
    const admin = await requireAdmin()

    // Validate listing exists and status
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, title: true },
    })

    if (!listing) {
      return {
        success: false,
        error: 'Listing not found',
      }
    }

    if (listing.status !== ListingStatus.PENDING) {
      return {
        success: false,
        error: `Cannot approve listing with status: ${listing.status}. Only PENDING listings can be approved.`,
      }
    }

    // Update listing status
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.APPROVED,
        approvedAt: new Date(),
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true,
          },
        },
      },
    })

    // Create audit log
    await createAuditLog({
      userId: admin.id,
      action: 'APPROVE_LISTING',
      targetType: 'LISTING',
      targetId: listingId,
      details: {
        previousStatus: listing.status,
        newStatus: ListingStatus.APPROVED,
        listingTitle: listing.title,
      },
    })

    // Revalidate admin pages
    revalidatePath('/admin/listings')
    revalidatePath('/admin')

    return {
      success: true,
      data: {
        listing: updatedListing as AdminListingWithSeller,
      },
    }
  } catch (error) {
    console.error('Failed to approve listing:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve listing',
    }
  }
}

/**
 * Rejects a pending listing with a reason
 *
 * @param listingId - ID of the listing to reject
 * @param reason - Rejection reason (10-500 characters)
 * @returns Success result with updated listing
 *
 * @example
 * ```typescript
 * const result = await rejectListing(
 *   'listing-123',
 *   'Listing violates prohibited items policy'
 * )
 * ```
 */
export async function rejectListing(
  listingId: string,
  reason: string
): Promise<ActionResult<{ listing: AdminListingWithSeller }>> {
  try {
    // Validate admin authentication
    const admin = await requireAdmin()

    // Validate rejection reason
    const validationResult = rejectionReasonSchema.safeParse(reason)
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || 'Invalid rejection reason',
      }
    }

    // Validate listing exists and status
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, title: true },
    })

    if (!listing) {
      return {
        success: false,
        error: 'Listing not found',
      }
    }

    if (listing.status !== ListingStatus.PENDING) {
      return {
        success: false,
        error: `Cannot reject listing with status: ${listing.status}. Only PENDING listings can be rejected.`,
      }
    }

    // Update listing status
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.REJECTED,
        rejectionReason: reason,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true,
          },
        },
      },
    })

    // Create audit log
    await createAuditLog({
      userId: admin.id,
      action: 'REJECT_LISTING',
      targetType: 'LISTING',
      targetId: listingId,
      details: {
        previousStatus: listing.status,
        newStatus: ListingStatus.REJECTED,
        rejectionReason: reason,
        listingTitle: listing.title,
      },
    })

    // Revalidate admin pages
    revalidatePath('/admin/listings')
    revalidatePath('/admin')

    return {
      success: true,
      data: {
        listing: updatedListing as AdminListingWithSeller,
      },
    }
  } catch (error) {
    console.error('Failed to reject listing:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject listing',
    }
  }
}

/**
 * Pauses an approved listing
 *
 * @param listingId - ID of the listing to pause
 * @returns Success result with updated listing
 *
 * @example
 * ```typescript
 * const result = await adminPauseListing('listing-123')
 * ```
 */
export async function adminPauseListing(
  listingId: string
): Promise<ActionResult<{ listing: AdminListingWithSeller }>> {
  try {
    // Validate admin authentication
    const admin = await requireAdmin()

    // Validate listing exists and status
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, title: true },
    })

    if (!listing) {
      return {
        success: false,
        error: 'Listing not found',
      }
    }

    if (listing.status !== ListingStatus.APPROVED) {
      return {
        success: false,
        error: `Cannot pause listing with status: ${listing.status}. Only APPROVED listings can be paused.`,
      }
    }

    // Update listing status
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.PAUSED,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true,
          },
        },
      },
    })

    // Create audit log
    await createAuditLog({
      userId: admin.id,
      action: 'PAUSE_LISTING',
      targetType: 'LISTING',
      targetId: listingId,
      details: {
        previousStatus: listing.status,
        newStatus: ListingStatus.PAUSED,
        listingTitle: listing.title,
      },
    })

    // Revalidate admin pages
    revalidatePath('/admin/listings')
    revalidatePath('/admin')

    return {
      success: true,
      data: {
        listing: updatedListing as AdminListingWithSeller,
      },
    }
  } catch (error) {
    console.error('Failed to pause listing:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pause listing',
    }
  }
}

/**
 * Resumes a paused listing (sets status back to APPROVED)
 *
 * @param listingId - ID of the listing to resume
 * @returns Success result with updated listing
 *
 * @example
 * ```typescript
 * const result = await adminResumeListing('listing-123')
 * ```
 */
export async function adminResumeListing(
  listingId: string
): Promise<ActionResult<{ listing: AdminListingWithSeller }>> {
  try {
    // Validate admin authentication
    const admin = await requireAdmin()

    // Validate listing exists and status
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, status: true, title: true },
    })

    if (!listing) {
      return {
        success: false,
        error: 'Listing not found',
      }
    }

    if (listing.status !== ListingStatus.PAUSED) {
      return {
        success: false,
        error: `Cannot resume listing with status: ${listing.status}. Only PAUSED listings can be resumed.`,
      }
    }

    // Update listing status back to APPROVED
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.APPROVED,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            rating: true,
          },
        },
      },
    })

    // Create audit log (using RESTORE_LISTING action)
    await createAuditLog({
      userId: admin.id,
      action: 'RESTORE_LISTING',
      targetType: 'LISTING',
      targetId: listingId,
      details: {
        previousStatus: listing.status,
        newStatus: ListingStatus.APPROVED,
        listingTitle: listing.title,
        action: 'resume',
      },
    })

    // Revalidate admin pages
    revalidatePath('/admin/listings')
    revalidatePath('/admin')

    return {
      success: true,
      data: {
        listing: updatedListing as AdminListingWithSeller,
      },
    }
  } catch (error) {
    console.error('Failed to resume listing:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resume listing',
    }
  }
}

/**
 * Deletes a listing (admin-only, cannot delete SOLD listings)
 *
 * @param listingId - ID of the listing to delete
 * @param reason - Deletion reason (10-500 characters)
 * @returns Success result
 *
 * @example
 * ```typescript
 * const result = await adminDeleteListing(
 *   'listing-123',
 *   'Listing violates platform terms of service'
 * )
 * ```
 */
export async function adminDeleteListing(
  listingId: string,
  reason: string
): Promise<ActionResult<void>> {
  try {
    // Validate admin authentication
    const admin = await requireAdmin()

    // Validate deletion reason
    const validationResult = deletionReasonSchema.safeParse(reason)
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0]?.message || 'Invalid deletion reason',
      }
    }

    // Validate listing exists and status
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        status: true,
        title: true,
        sellerId: true,
      },
    })

    if (!listing) {
      return {
        success: false,
        error: 'Listing not found',
      }
    }

    if (listing.status === ListingStatus.SOLD) {
      return {
        success: false,
        error: 'Cannot delete SOLD listings. They are part of transaction history.',
      }
    }

    // Create audit log BEFORE deletion
    await createAuditLog({
      userId: admin.id,
      action: 'DELETE_LISTING',
      targetType: 'LISTING',
      targetId: listingId,
      details: {
        previousStatus: listing.status,
        deletionReason: reason,
        listingTitle: listing.title,
        sellerId: listing.sellerId,
      },
    })

    // Delete related offers first (cascade)
    await prisma.offer.deleteMany({
      where: { listingId },
    })

    // Delete listing
    await prisma.listing.delete({
      where: { id: listingId },
    })

    // Revalidate admin pages
    revalidatePath('/admin/listings')
    revalidatePath('/admin')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to delete listing:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete listing',
    }
  }
}
