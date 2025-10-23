/**
 * Optimized Prisma Query Patterns for Second-Hand Marketplace
 *
 * This module provides pre-defined, optimized query functions for common
 * data access patterns across the application.
 *
 * Performance Best Practices Applied:
 * - Select only necessary fields
 * - Use include sparingly
 * - Implement cursor-based pagination for large datasets
 * - Leverage indexed fields for filtering
 */

import { Prisma } from '@/lib/generated/prisma';
import { prisma } from '@/lib/prisma';

// ============================================================================
// LISTING QUERIES
// ============================================================================

/**
 * Get approved listings with pagination and filtering
 *
 * @param params - Pagination and filter parameters
 * @returns Paginated list of approved listings with seller info
 */
export async function getApprovedListings(params: {
  cursor?: string;
  limit?: number;
  category?: string;
  searchQuery?: string;
  province?: string;
  pricingType?: 'FIXED' | 'OFFERS';
}) {
  const {
    cursor,
    limit = 20,
    category,
    searchQuery,
    province,
    pricingType,
  } = params;

  const where: Prisma.ListingWhereInput = {
    status: 'APPROVED',
    ...(category && { category: category as any }),
    ...(province && { province }),
    ...(pricingType && { pricingType: pricingType as any }),
    ...(searchQuery && {
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ],
    }),
  };

  const listings = await prisma.listing.findMany({
    where,
    take: limit,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: [{ createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      condition: true,
      primaryImage: true,
      pricingType: true,
      price: true,
      minOffer: true,
      city: true,
      province: true,
      views: true,
      createdAt: true,
      seller: {
        select: {
          id: true,
          name: true,
          rating: true,
          reviewCount: true,
        },
      },
    },
  });

  return {
    data: listings,
    nextCursor: listings.length === limit ? listings[listings.length - 1].id : null,
  };
}

/**
 * Get single listing by ID with full details
 *
 * @param id - Listing ID
 * @returns Listing with all relations
 */
export async function getListingById(id: string) {
  return await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          province: true,
          rating: true,
          reviewCount: true,
          createdAt: true,
        },
      },
      offers: {
        where: {
          status: { in: ['PENDING', 'COUNTERED'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          amount: true,
          message: true,
          status: true,
          counterAmount: true,
          createdAt: true,
          buyer: {
            select: {
              id: true,
              name: true,
              rating: true,
            },
          },
        },
      },
      transaction: {
        select: {
          id: true,
          status: true,
          completedAt: true,
        },
      },
    },
  });
}

/**
 * Increment listing view count
 *
 * @param id - Listing ID
 */
export async function incrementListingViews(id: string) {
  await prisma.listing.update({
    where: { id },
    data: {
      views: { increment: 1 },
    },
  });
}

// ============================================================================
// USER DASHBOARD QUERIES
// ============================================================================

/**
 * Get seller dashboard data
 *
 * @param sellerId - Seller user ID
 * @returns Dashboard stats and recent listings
 */
export async function getSellerDashboard(sellerId: string) {
  const [user, listings, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        name: true,
        email: true,
        rating: true,
        reviewCount: true,
      },
    }),

    prisma.listing.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        primaryImage: true,
        price: true,
        status: true,
        views: true,
        createdAt: true,
        _count: {
          select: { offers: true },
        },
      },
    }),

    prisma.$queryRaw<{ status: string; count: bigint }[]>`
      SELECT status, COUNT(*) as count
      FROM "Listing"
      WHERE "sellerId" = ${sellerId}
      GROUP BY status
    `,
  ]);

  return {
    user,
    listings,
    stats: stats.map((s) => ({ status: s.status, count: Number(s.count) })),
  };
}

/**
 * Get buyer dashboard data
 *
 * @param buyerId - Buyer user ID
 * @returns Dashboard with purchases and offers
 */
export async function getBuyerDashboard(buyerId: string) {
  const [user, purchases, offers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: buyerId },
      select: {
        id: true,
        name: true,
        email: true,
        rating: true,
        reviewCount: true,
      },
    }),

    prisma.transaction.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            primaryImage: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.offer.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            primaryImage: true,
            status: true,
          },
        },
      },
    }),
  ]);

  return {
    user,
    purchases,
    offers,
  };
}

// ============================================================================
// ADMIN QUERIES
// ============================================================================

/**
 * Get pending listings for admin moderation
 *
 * @param params - Pagination parameters
 * @returns Paginated pending listings
 */
export async function getPendingListingsForAdmin(params: { cursor?: string; limit?: number }) {
  const { cursor, limit = 20 } = params;

  const listings = await prisma.listing.findMany({
    where: { status: 'PENDING' },
    take: limit,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { createdAt: 'asc' }, // Oldest first for FIFO moderation
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          rating: true,
          reviewCount: true,
        },
      },
    },
  });

  return {
    data: listings,
    nextCursor: listings.length === limit ? listings[listings.length - 1].id : null,
  };
}

/**
 * Get admin analytics overview
 *
 * @returns Platform-wide statistics
 */
export async function getAdminAnalytics() {
  const [
    totalUsers,
    totalListings,
    totalTransactions,
    recentTransactions,
    listingsByStatus,
    transactionsByStatus,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.listing.count(),

    prisma.transaction.count(),

    prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        listing: { select: { title: true } },
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
      },
    }),

    prisma.listing.groupBy({
      by: ['status'],
      _count: true,
    }),

    prisma.transaction.groupBy({
      by: ['status'],
      _count: true,
      _sum: {
        amount: true,
        commission: true,
      },
    }),
  ]);

  return {
    totalUsers,
    totalListings,
    totalTransactions,
    recentTransactions,
    listingsByStatus,
    transactionsByStatus,
  };
}

// ============================================================================
// TRANSACTION QUERIES
// ============================================================================

/**
 * Create a transaction from an accepted offer or direct purchase
 *
 * @param data - Transaction creation data
 * @returns Created transaction
 */
export async function createTransaction(data: {
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  paymentMethod?: string;
}) {
  const commission = data.amount * 0.2; // 20% commission
  const netAmount = data.amount - commission;

  return await prisma.$transaction(async (tx) => {
    // Create transaction
    const transaction = await tx.transaction.create({
      data: {
        listingId: data.listingId,
        buyerId: data.buyerId,
        sellerId: data.sellerId,
        amount: data.amount,
        commission,
        netAmount,
        paymentMethod: data.paymentMethod,
      },
    });

    // Mark listing as SOLD
    await tx.listing.update({
      where: { id: data.listingId },
      data: {
        status: 'SOLD',
        soldAt: new Date(),
      },
    });

    // Mark all offers for this listing as EXPIRED
    await tx.offer.updateMany({
      where: {
        listingId: data.listingId,
        status: { in: ['PENDING', 'COUNTERED'] },
      },
      data: { status: 'EXPIRED' },
    });

    return transaction;
  });
}

// ============================================================================
// OFFER QUERIES
// ============================================================================

/**
 * Create a new offer on a listing
 *
 * @param data - Offer creation data
 * @returns Created offer
 */
export async function createOffer(data: {
  listingId: string;
  buyerId: string;
  amount: number;
  message?: string;
}) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours from now

  return await prisma.offer.create({
    data: {
      ...data,
      expiresAt,
    },
    include: {
      listing: {
        select: {
          title: true,
          seller: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get offers for a specific listing
 *
 * @param listingId - Listing ID
 * @returns All offers for the listing
 */
export async function getOffersForListing(listingId: string) {
  return await prisma.offer.findMany({
    where: { listingId },
    orderBy: { createdAt: 'desc' },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          rating: true,
          reviewCount: true,
        },
      },
    },
  });
}

// ============================================================================
// REVIEW QUERIES
// ============================================================================

/**
 * Get reviews for a user (as reviewee)
 *
 * @param userId - User ID
 * @returns User's reviews
 */
export async function getUserReviews(userId: string) {
  return await prisma.review.findMany({
    where: { revieweeId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
        },
      },
      transaction: {
        select: {
          id: true,
          listing: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });
}
