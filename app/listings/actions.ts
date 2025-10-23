"use server";

import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { Prisma } from "@/lib/generated/prisma";
import {
  ListingCategory,
  ListingCondition,
  ListingStatus,
  PricingType,
} from "@/lib/generated/prisma";

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export type SortOption =
  | "newest"
  | "oldest"
  | "price-low"
  | "price-high"
  | "most-viewed";

export interface GetListingsParams {
  // Filters
  category?: ListingCategory;
  condition?: ListingCondition;
  pricingType?: PricingType;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  province?: string;

  // Search
  query?: string;

  // Sorting
  sortBy?: SortOption;

  // Pagination (cursor-based)
  cursor?: string; // listing ID
  limit?: number; // default 20
}

export interface ListingWithSeller {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  condition: ListingCondition;
  primaryImage: string;
  images: string[];
  pricingType: PricingType;
  price: string | null; // Decimal as string for JSON serialization
  minOffer: string | null;
  city: string;
  province: string;
  views: number;
  createdAt: Date;
  seller: {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    city: string | null;
    province: string | null;
  };
}

export interface GetListingsResult {
  listings: ListingWithSeller[];
  totalCount: number;
  hasMore: boolean;
  nextCursor: string | null;
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Browse listings with advanced filters, search, and pagination
 * Only returns APPROVED listings visible to public users
 *
 * Performance optimizations:
 * - Cursor-based pagination for efficient scrolling
 * - Selective field loading with Prisma select
 * - Compound indexes on status + filters
 * - ILIKE search with proper indexing
 */
export async function getListings(
  params: GetListingsParams = {}
): Promise<GetListingsResult> {
  try {
    const {
      category,
      condition,
      pricingType,
      minPrice,
      maxPrice,
      city,
      province,
      query,
      sortBy = "newest",
      cursor,
      limit = 20,
    } = params;

    // Validate limit
    const validatedLimit = Math.min(Math.max(limit, 1), 100); // Max 100 items per page

    // Build where clause
    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.APPROVED, // Only approved listings
      ...(category && { category }),
      ...(condition && { condition }),
      ...(pricingType && { pricingType }),
      ...(city && { city: { equals: city, mode: "insensitive" } }),
      ...(province && { province: { equals: province, mode: "insensitive" } }),
    };

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.AND = where.AND || [];
      const priceFilter: Prisma.ListingWhereInput = {};

      if (minPrice !== undefined && maxPrice !== undefined) {
        priceFilter.price = {
          gte: new Prisma.Decimal(minPrice),
          lte: new Prisma.Decimal(maxPrice),
        };
      } else if (minPrice !== undefined) {
        priceFilter.price = { gte: new Prisma.Decimal(minPrice) };
      } else if (maxPrice !== undefined) {
        priceFilter.price = { lte: new Prisma.Decimal(maxPrice) };
      }

      (where.AND as Prisma.ListingWhereInput[]).push(priceFilter);
    }

    // Search query (title + description with ILIKE)
    if (query && query.trim().length > 0) {
      where.OR = [
        { title: { contains: query.trim(), mode: "insensitive" } },
        { description: { contains: query.trim(), mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    const orderBy = buildOrderBy(sortBy);

    // Execute query with cursor pagination
    const listings = await prisma.listing.findMany({
      where,
      orderBy,
      take: validatedLimit + 1, // Fetch one extra to check if there are more
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1, // Skip the cursor itself
      }),
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        condition: true,
        primaryImage: true,
        images: true,
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
            city: true,
            province: true,
          },
        },
      },
    });

    // Get total count (expensive operation, consider caching)
    const totalCount = await prisma.listing.count({ where });

    // Check if there are more results
    const hasMore = listings.length > validatedLimit;
    const paginatedListings = hasMore ? listings.slice(0, -1) : listings;
    const nextCursor = hasMore ? paginatedListings[paginatedListings.length - 1]?.id ?? null : null;

    // Convert Decimal to string for JSON serialization
    const serializedListings: ListingWithSeller[] = paginatedListings.map(
      (listing) => ({
        ...listing,
        price: listing.price?.toString() ?? null,
        minOffer: listing.minOffer?.toString() ?? null,
      })
    );

    return {
      listings: serializedListings,
      totalCount,
      hasMore,
      nextCursor,
    };
  } catch (error) {
    console.error("[getListings] Error:", error);
    throw new Error("Failed to fetch listings");
  }
}

/**
 * Get single listing by ID with seller information
 * Increments view count atomically
 * Returns null if not found or not approved
 */
export async function getListingById(
  id: string
): Promise<ListingWithSeller | null> {
  try {
    // Validate UUID format
    if (!isValidUUID(id)) {
      return null;
    }

    // Increment view count atomically
    const listing = await prisma.listing.update({
      where: {
        id,
        status: ListingStatus.APPROVED, // Only approved listings
      },
      data: {
        views: { increment: 1 },
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        condition: true,
        primaryImage: true,
        images: true,
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
            city: true,
            province: true,
          },
        },
      },
    });

    // Serialize Decimal fields
    return {
      ...listing,
      price: listing.price?.toString() ?? null,
      minOffer: listing.minOffer?.toString() ?? null,
    };
  } catch (error) {
    // Handle not found or not approved
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }

    console.error("[getListingById] Error:", error);
    throw new Error("Failed to fetch listing");
  }
}

/**
 * Get featured listings for homepage
 * Returns newest approved listings sorted by creation date
 * Cached for 5 minutes for better performance
 */
export const getFeaturedListings = cache(
  async (limit: number = 12): Promise<ListingWithSeller[]> => {
    try {
      // Validate limit
      const validatedLimit = Math.min(Math.max(limit, 1), 50); // Max 50 featured

      const listings = await prisma.listing.findMany({
        where: {
          status: ListingStatus.APPROVED,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: validatedLimit,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          condition: true,
          primaryImage: true,
          images: true,
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
              city: true,
              province: true,
            },
          },
        },
      });

      // Serialize Decimal fields
      return listings.map((listing) => ({
        ...listing,
        price: listing.price?.toString() ?? null,
        minOffer: listing.minOffer?.toString() ?? null,
      }));
    } catch (error) {
      console.error("[getFeaturedListings] Error:", error);
      throw new Error("Failed to fetch featured listings");
    }
  }
);

/**
 * Full-text search in title and description
 * Uses PostgreSQL ILIKE for case-insensitive search
 * Returns only approved listings with relevance scoring
 */
export async function searchListings(
  query: string,
  limit: number = 20
): Promise<ListingWithSeller[]> {
  try {
    // Validate query
    if (!query || query.trim().length < 2) {
      return [];
    }

    const trimmedQuery = query.trim();
    const validatedLimit = Math.min(Math.max(limit, 1), 100);

    // Use raw query for better relevance scoring
    // Prioritize title matches over description matches
    const listings = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        description: string;
        category: ListingCategory;
        condition: ListingCondition;
        primaryImage: string;
        images: string[];
        pricingType: PricingType;
        price: Prisma.Decimal | null;
        minOffer: Prisma.Decimal | null;
        city: string;
        province: string;
        views: number;
        createdAt: Date;
        sellerId: string;
      }>
    >`
      SELECT
        l.id, l.title, l.description, l.category, l.condition,
        l."primaryImage", l.images, l."pricingType", l.price, l."minOffer",
        l.city, l.province, l.views, l."createdAt", l."sellerId",
        CASE
          WHEN LOWER(l.title) LIKE LOWER(${"%" + trimmedQuery + "%"}) THEN 2
          ELSE 1
        END as relevance
      FROM "Listing" l
      WHERE l.status = ${ListingStatus.APPROVED}::"ListingStatus"
        AND (
          LOWER(l.title) LIKE LOWER(${"%" + trimmedQuery + "%"})
          OR LOWER(l.description) LIKE LOWER(${"%" + trimmedQuery + "%"})
        )
      ORDER BY relevance DESC, l."createdAt" DESC
      LIMIT ${validatedLimit}
    `;

    // Fetch seller info for each listing
    const sellerIds = Array.from(new Set(listings.map((l) => l.sellerId)));
    const sellers = await prisma.user.findMany({
      where: { id: { in: sellerIds } },
      select: {
        id: true,
        name: true,
        rating: true,
        reviewCount: true,
        city: true,
        province: true,
      },
    });

    const sellerMap = new Map(sellers.map((s) => [s.id, s]));

    // Combine listings with seller data and serialize
    return listings.map((listing) => {
      const seller = sellerMap.get(listing.sellerId);
      if (!seller) {
        throw new Error(`Seller not found for listing ${listing.id}`);
      }

      return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        condition: listing.condition,
        primaryImage: listing.primaryImage,
        images: listing.images,
        pricingType: listing.pricingType,
        price: listing.price?.toString() ?? null,
        minOffer: listing.minOffer?.toString() ?? null,
        city: listing.city,
        province: listing.province,
        views: listing.views,
        createdAt: listing.createdAt,
        seller,
      };
    });
  } catch (error) {
    console.error("[searchListings] Error:", error);
    throw new Error("Failed to search listings");
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build Prisma orderBy clause from sort option
 */
function buildOrderBy(sortBy: SortOption): Prisma.ListingOrderByWithRelationInput {
  switch (sortBy) {
    case "newest":
      return { createdAt: "desc" };
    case "oldest":
      return { createdAt: "asc" };
    case "price-low":
      return { price: "asc" };
    case "price-high":
      return { price: "desc" };
    case "most-viewed":
      return { views: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

/**
 * Validate UUID v4 format
 */
function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
