import * as React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'
import { formatZAR, getCategoryConfig, getConditionConfig } from '@/lib/constants/categories'
import { ListingCard } from '@/components/listings/listing-card'
import { ImageGalleryClient } from '@/components/listings/image-gallery-client'
import { ShareButtonClient } from '@/components/listings/share-button-client'
import { getListingById, getListings } from '../actions'
import { deserializeDecimal, formatRelativeDate } from '@/lib/helpers/listing-helpers'
import type { Metadata } from 'next'

// Generate metadata for SEO
type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const listing = await getListingById(id)

  if (!listing) {
    return {
      title: 'Listing Not Found',
    }
  }

  const price = deserializeDecimal(listing.price)
  const priceText = price ? formatZAR(price) : 'Offers Accepted'

  return {
    title: `${listing.title} - ${priceText} | Second-Hand Marketplace`,
    description: listing.description.substring(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.substring(0, 160),
      images: [listing.primaryImage],
      type: 'website',
    },
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params

  // Fetch listing from server action
  const listing = await getListingById(id)

  // Handle not found
  if (!listing) {
    notFound()
  }

  // Deserialize price fields
  const price = deserializeDecimal(listing.price)
  const minOffer = deserializeDecimal(listing.minOffer)

  // Get category and condition configs
  const categoryConfig = getCategoryConfig(listing.category)
  const conditionConfig = getConditionConfig(listing.condition)

  // Fetch related listings from same category
  const { listings: relatedListings } = await getListings({
    category: listing.category,
    limit: 3,
  })

  // Filter out current listing from related
  const filteredRelated = relatedListings.filter((r) => r.id !== listing.id).slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/listings">Listings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{listing.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Images and Description */}
          <div className="space-y-6">
            {/* Image Gallery - Client Component */}
            <ImageGalleryClient images={listing.images} title={listing.title} />

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium flex items-center gap-2">
                      {categoryConfig?.icon && <categoryConfig.icon className="w-4 h-4" aria-hidden="true" />}
                      {categoryConfig?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Condition</p>
                    <Badge className={cn('mt-1')}>{conditionConfig?.label}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">
                      {listing.city}, {listing.province}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Listed</p>
                    <p className="font-medium">{formatRelativeDate(listing.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Views</p>
                    <p className="font-medium">{listing.views.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Price and Actions */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card className="space-y-6 p-6">
              {/* Price */}
              <div>
                {listing.pricingType === 'FIXED' && price !== null ? (
                  <p className="text-3xl font-bold text-foreground">{formatZAR(price)}</p>
                ) : (
                  <div>
                    <p className="text-2xl font-semibold text-muted-foreground italic">
                      Offers Accepted
                    </p>
                    {minOffer !== null && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Minimum offer: {formatZAR(minOffer)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-3">
                {listing.pricingType === 'FIXED' ? (
                  <Button size="lg" className="w-full text-base h-12">
                    Buy Now
                  </Button>
                ) : (
                  <Button size="lg" className="w-full text-base h-12">
                    Make Offer
                  </Button>
                )}
                <ShareButtonClient title={listing.title} url={`/listings/${listing.id}`} />
              </div>

              <Separator />

              {/* Seller Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Seller Information</h3>
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>{listing.seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base truncate">{listing.seller.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            i < Math.floor(listing.seller.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted'
                          )}
                          aria-hidden="true"
                        />
                      ))}
                      <span className="font-medium text-sm ml-1">{listing.seller.rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({listing.seller.reviewCount} reviews)
                      </span>
                    </div>
                    {(listing.seller.city || listing.seller.province) && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {[listing.seller.city, listing.seller.province].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Seller Profile
                </Button>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <MapPin className="w-5 h-5 shrink-0 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-sm">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {listing.city}, {listing.province}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Related Listings */}
        {filteredRelated.length > 0 && (
          <section className="mt-16" aria-labelledby="related-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="related-heading" className="text-2xl font-bold">
                Similar Listings
              </h2>
              <Link
                href={`/listings?category=${listing.category}`}
                className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                View All
              </Link>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRelated.map((relatedListing) => (
                <ListingCard
                  key={relatedListing.id}
                  id={relatedListing.id}
                  title={relatedListing.title}
                  price={deserializeDecimal(relatedListing.price) ?? undefined}
                  pricingType={relatedListing.pricingType}
                  condition={relatedListing.condition}
                  primaryImage={relatedListing.primaryImage}
                  city={relatedListing.city}
                  createdAt={relatedListing.createdAt}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
