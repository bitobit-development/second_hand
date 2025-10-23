import { ListingCardSkeleton } from '@/components/listings/listing-card'
import { Card, CardContent } from '@/components/ui/card'

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container px-4 py-16 sm:px-6 lg:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            {/* Heading Skeleton */}
            <div className="space-y-3">
              <div className="h-12 bg-muted animate-pulse rounded mx-auto w-3/4" />
              <div className="h-12 bg-muted animate-pulse rounded mx-auto w-2/3" />
            </div>

            {/* Subheading Skeleton */}
            <div className="space-y-2 mt-6">
              <div className="h-6 bg-muted animate-pulse rounded mx-auto w-full" />
              <div className="h-6 bg-muted animate-pulse rounded mx-auto w-5/6" />
            </div>

            {/* Search Bar Skeleton */}
            <div className="mt-10">
              <div className="h-12 bg-muted animate-pulse rounded mx-auto w-full sm:max-w-lg" />
            </div>

            {/* CTA Buttons Skeleton */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <div className="h-12 bg-muted animate-pulse rounded w-full sm:w-48" />
              <div className="h-12 bg-muted animate-pulse rounded w-full sm:w-48" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className="container px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
        <div className="text-center mb-10">
          <div className="h-9 bg-muted animate-pulse rounded mx-auto w-64" />
          <div className="h-5 bg-muted animate-pulse rounded mx-auto w-48 mt-2" />
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center min-h-[140px]">
                <div className="w-12 h-12 bg-muted animate-pulse rounded-full mb-3" />
                <div className="h-5 bg-muted animate-pulse rounded w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Listings Skeleton */}
      <section className="bg-muted/30 border-y">
        <div className="container px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-9 bg-muted animate-pulse rounded w-56" />
              <div className="h-5 bg-muted animate-pulse rounded w-48 mt-2" />
            </div>
            <div className="hidden sm:block h-10 bg-muted animate-pulse rounded w-24" />
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
        <div className="text-center mb-12">
          <div className="h-9 bg-muted animate-pulse rounded mx-auto w-72" />
          <div className="h-5 bg-muted animate-pulse rounded mx-auto w-56 mt-2" />
        </div>

        <div className="grid gap-8 sm:grid-cols-3 max-w-5xl mx-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-muted animate-pulse rounded-full" />
              <div className="h-6 bg-muted animate-pulse rounded w-40" />
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
