# Listing Actions - Usage Examples

This document provides examples of how to use the server actions for browsing, searching, and retrieving listings.

## Import

```typescript
import {
  getListings,
  getListingById,
  getFeaturedListings,
  searchListings,
  type GetListingsParams,
  type ListingWithSeller,
  type GetListingsResult,
} from "@/app/listings/actions";
```

## 1. Browse Listings with Filters

### Basic Usage (All Listings)

```typescript
const result = await getListings();
// Returns first 20 approved listings, sorted by newest
```

### Filter by Category

```typescript
import { ListingCategory } from "@/lib/generated/prisma";

const result = await getListings({
  category: ListingCategory.ELECTRONICS,
  limit: 12,
});
```

### Filter by Price Range

```typescript
const result = await getListings({
  minPrice: 100,
  maxPrice: 5000,
  sortBy: "price-low",
});
```

### Filter by Location

```typescript
const result = await getListings({
  province: "Gauteng",
  city: "Johannesburg",
});
```

### Complex Multi-Filter

```typescript
const result = await getListings({
  category: ListingCategory.ELECTRONICS,
  condition: ListingCondition.LIKE_NEW,
  pricingType: PricingType.FIXED,
  minPrice: 500,
  maxPrice: 10000,
  province: "Western Cape",
  sortBy: "price-low",
  limit: 24,
});
```

### Pagination (Cursor-based)

```typescript
// First page
const page1 = await getListings({ limit: 20 });

// Next page
if (page1.hasMore && page1.nextCursor) {
  const page2 = await getListings({
    cursor: page1.nextCursor,
    limit: 20,
  });
}
```

## 2. Search Listings

### Full-Text Search

```typescript
// Search in title and description
const results = await searchListings("iPhone 13");

// Search with limit
const results = await searchListings("mountain bike", 10);
```

### Search with Filters

```typescript
// For combined search + filters, use getListings with query
const result = await getListings({
  query: "laptop",
  category: ListingCategory.ELECTRONICS,
  minPrice: 3000,
  maxPrice: 15000,
  province: "Gauteng",
});
```

## 3. Get Single Listing

```typescript
const listing = await getListingById("550e8400-e29b-41d4-a716-446655440000");

if (listing) {
  console.log(listing.title);
  console.log(listing.seller.name);
  console.log(listing.seller.rating);
  // View count is automatically incremented
}
```

## 4. Featured Listings (Homepage)

```typescript
// Get 12 newest listings for homepage
const featured = await getFeaturedListings();

// Custom limit
const featured = await getFeaturedListings(24);
```

## 5. Sort Options

Available sort options:

- `"newest"` - Sort by creation date (DESC) - **Default**
- `"oldest"` - Sort by creation date (ASC)
- `"price-low"` - Sort by price (low to high)
- `"price-high"` - Sort by price (high to low)
- `"most-viewed"` - Sort by view count (DESC)

```typescript
const result = await getListings({ sortBy: "most-viewed" });
```

## 6. Server Component Example

```tsx
// app/listings/page.tsx
import { getListings } from "./actions";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const result = await getListings({
    category: searchParams.category as ListingCategory | undefined,
    limit: 20,
  });

  return (
    <div>
      <h1>Listings ({result.totalCount})</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {result.listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      {result.hasMore && <LoadMoreButton nextCursor={result.nextCursor} />}
    </div>
  );
}
```

## 7. Client Component with Actions

```tsx
// components/listing-search.tsx
"use client";

import { useState } from "react";
import { searchListings } from "@/app/listings/actions";
import type { ListingWithSeller } from "@/app/listings/actions";

export function ListingSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const listings = await searchListings(query);
      setResults(listings);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search listings..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
      <div>
        {results.map((listing) => (
          <div key={listing.id}>{listing.title}</div>
        ))}
      </div>
    </div>
  );
}
```

## 8. Response Structure

### GetListingsResult

```typescript
{
  listings: ListingWithSeller[],  // Array of listings
  totalCount: number,              // Total matching count
  hasMore: boolean,                // More results available?
  nextCursor: string | null        // Cursor for next page
}
```

### ListingWithSeller

```typescript
{
  id: string,
  title: string,
  description: string,
  category: ListingCategory,
  condition: ListingCondition,
  primaryImage: string,
  images: string[],
  pricingType: PricingType,
  price: string | null,            // Decimal as string
  minOffer: string | null,         // Decimal as string
  city: string,
  province: string,
  views: number,
  createdAt: Date,
  seller: {
    id: string,
    name: string,
    rating: number,
    reviewCount: number,
    city: string | null,
    province: string | null
  }
}
```

## 9. Error Handling

All actions throw errors on failure:

```typescript
try {
  const listing = await getListingById(id);
  if (!listing) {
    // Listing not found or not approved
    return notFound();
  }
} catch (error) {
  console.error("Failed to fetch listing:", error);
  // Handle error appropriately
}
```

## 10. Performance Notes

- **Cursor pagination** is used for efficient scrolling through large result sets
- **Selective field loading** reduces data transfer
- **Indexed queries** leverage the database indexes added by gal-database
- **Cached featured listings** using React's `cache()` function
- **View count increments** are atomic (no race conditions)
- **Search relevance** prioritizes title matches over description matches
