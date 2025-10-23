import * as React from 'react'
import Link from 'next/link'
import { Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { SearchBarWrapper } from '@/components/listings/search-bar-wrapper'
import { FilterPanelWrapper } from '@/components/listings/filter-panel-wrapper'
import { ListingCard } from '@/components/listings/listing-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getListings, type GetListingsParams } from './actions'
import { deserializeDecimal, parseSortOption, parseNumberParam } from '@/lib/helpers/listing-helpers'
import type { ListingCategory, ListingCondition, PricingType } from '@prisma/client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Listings | Second-Hand Marketplace',
  description: 'Browse thousands of quality pre-owned items from trusted sellers across South Africa.',
  openGraph: {
    title: 'Browse Listings | Second-Hand Marketplace',
    description: 'Browse thousands of quality pre-owned items from trusted sellers across South Africa.',
  },
}

type SearchParams = Promise<{
  q?: string
  category?: string
  condition?: string
  pricingType?: string
  minPrice?: string
  maxPrice?: string
  province?: string
  sortBy?: string
  cursor?: string
}>

export default async function ListingsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: SearchParams
}) {
  // Await searchParams as per Next.js 16 requirements
  const searchParams = await searchParamsPromise

  // Parse URL parameters
  const query = searchParams.q
  const sortBy = parseSortOption(searchParams.sortBy)
  const cursor = searchParams.cursor
  const minPrice = parseNumberParam(searchParams.minPrice)
  const maxPrice = parseNumberParam(searchParams.maxPrice)
  const province = searchParams.province

  // Parse array filters (category, condition, pricingType)
  const categories = searchParams.category
    ?.split(',')
    .filter((c): c is ListingCategory => !!c) ?? []

  const conditions = searchParams.condition
    ?.split(',')
    .filter((c): c is ListingCondition => !!c) ?? []

  const pricingTypes = searchParams.pricingType
    ?.split(',')
    .filter((t): t is PricingType => !!t) ?? []

  // Build params for getListings
  const listingsParams: GetListingsParams = {
    query,
    sortBy,
    cursor,
    minPrice,
    maxPrice,
    province,
    ...(categories.length > 0 && { category: categories[0] }), // Server action only supports single category
    ...(conditions.length > 0 && { condition: conditions[0] }), // Server action only supports single condition
    ...(pricingTypes.length > 0 && { pricingType: pricingTypes[0] }), // Server action only supports single pricingType
  }

  // Fetch listings from server action
  const { listings, totalCount, hasMore, nextCursor } = await getListings(listingsParams)

  // Build query string for pagination
  const buildPaginationUrl = (newCursor: string | null) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (searchParams.category) params.set('category', searchParams.category)
    if (searchParams.condition) params.set('condition', searchParams.condition)
    if (searchParams.pricingType) params.set('pricingType', searchParams.pricingType)
    if (minPrice) params.set('minPrice', minPrice.toString())
    if (maxPrice) params.set('maxPrice', maxPrice.toString())
    if (province) params.set('province', province)
    if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy)
    if (newCursor) params.set('cursor', newCursor)

    const queryString = params.toString()
    return queryString ? `/listings?${queryString}` : '/listings'
  }

  const previousUrl = cursor ? buildPaginationUrl(null) : null
  const nextUrl = hasMore && nextCursor ? buildPaginationUrl(nextCursor) : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold sm:text-2xl">Browse Listings</h1>
        </div>
      </header>

      <div className="container px-4 py-6 sm:px-6 lg:px-8">
        {/* Search Bar - Full width at top */}
        <React.Suspense fallback={<div className="h-20 bg-muted animate-pulse rounded-lg mb-6" />}>
          <SearchBarWrapper />
        </React.Suspense>

        {/* Two-column layout: Filters (left) + Listings (right) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar - Desktop only, mobile uses sheet */}
          <React.Suspense fallback={<div className="hidden lg:block w-80 h-96 bg-muted animate-pulse rounded-lg" />}>
            <FilterPanelWrapper />
          </React.Suspense>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{listings.length}</span> of{' '}
                <span className="font-medium text-foreground">{totalCount}</span> listings
              </p>
            </div>

            {/* Listings Grid */}
            {listings.length > 0 && (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    id={listing.id}
                    title={listing.title}
                    price={deserializeDecimal(listing.price) ?? undefined}
                    pricingType={listing.pricingType}
                    condition={listing.condition}
                    primaryImage={listing.primaryImage}
                    city={listing.city}
                    createdAt={listing.createdAt}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {listings.length === 0 && (
              <Alert className="max-w-2xl mx-auto mt-12">
                <Package className="h-5 w-5" aria-hidden="true" />
                <AlertDescription className="ml-2">
                  <p className="font-semibold mb-1">No listings found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filters to find what you are looking for.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Cursor-based Pagination */}
            {listings.length > 0 && (previousUrl || nextUrl) && (
              <div className="mt-12 flex items-center justify-center gap-4">
                {previousUrl ? (
                  <Button asChild variant="outline" size="lg">
                    <Link href={previousUrl}>
                      <ChevronLeft className="w-5 h-5 mr-2" aria-hidden="true" />
                      Previous
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" disabled>
                    <ChevronLeft className="w-5 h-5 mr-2" aria-hidden="true" />
                    Previous
                  </Button>
                )}

                {nextUrl ? (
                  <Button asChild variant="outline" size="lg">
                    <Link href={nextUrl}>
                      Next
                      <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="lg" disabled>
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
