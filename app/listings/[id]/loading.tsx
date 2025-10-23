import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function ListingDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb Skeleton */}
      <div className="border-b">
        <div className="container px-4 py-4 sm:px-6 lg:px-8">
          <div className="h-5 bg-muted animate-pulse rounded w-64" />
        </div>
      </div>

      <div className="container px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Images and Description */}
          <div className="space-y-6">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted animate-pulse" />

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Description Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </CardContent>
            </Card>

            {/* Details Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-24" />
                      <div className="h-5 bg-muted animate-pulse rounded w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Price and Actions */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card className="space-y-6 p-6">
              {/* Price Skeleton */}
              <div className="h-10 bg-muted animate-pulse rounded w-40" />

              <Separator />

              {/* Action Buttons Skeleton */}
              <div className="space-y-3">
                <div className="h-12 bg-muted animate-pulse rounded" />
                <div className="h-12 bg-muted animate-pulse rounded" />
              </div>

              <Separator />

              {/* Seller Info Skeleton */}
              <div className="space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded w-40" />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted animate-pulse rounded w-32" />
                    <div className="h-4 bg-muted animate-pulse rounded w-24" />
                  </div>
                </div>
                <div className="h-10 bg-muted animate-pulse rounded" />
              </div>

              {/* Location Skeleton */}
              <div className="h-16 bg-muted animate-pulse rounded" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
