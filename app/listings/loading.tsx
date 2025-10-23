import { ListingCardSkeleton } from '@/components/listings/listing-card'

export default function ListingsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold sm:text-2xl">Browse Listings</h1>
        </div>
      </header>

      <div className="container px-4 py-6 sm:px-6 lg:px-8">
        {/* Search Bar Skeleton */}
        <div className="mb-6">
          <div className="max-w-2xl h-12 bg-muted animate-pulse rounded-lg" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar Skeleton */}
          <aside className="hidden lg:block w-80 shrink-0 border-r border-border/50 pr-6">
            <div className="space-y-6">
              <div className="h-8 bg-muted animate-pulse rounded w-1/2" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-6 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Results Count Skeleton */}
            <div className="mb-6">
              <div className="h-5 bg-muted animate-pulse rounded w-48" />
            </div>

            {/* Listings Grid Skeleton */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
