import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash2, Pause, Play, Eye, Clock, CheckCircle, XCircle, ShoppingBag } from 'lucide-react'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getCategoryConfig, getConditionConfig, formatZAR } from '@/lib/constants/categories'
import { deleteListing, pauseListing, resumeListing } from '@/app/listings/create/actions'
import { ListingStatus } from '@/lib/generated/prisma'
import { serializeDecimal } from '@/lib/helpers/listing-helpers'

type ListingCardProps = {
  listing: {
    id: string
    title: string
    primaryImage: string
    price: string | null
    pricingType: string
    status: ListingStatus
    views: number
    category: string
    condition: string
    createdAt: Date
  }
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const categoryConfig = getCategoryConfig(listing.category as any)
  const conditionConfig = getConditionConfig(listing.condition as any)

  const statusConfig = {
    PENDING: { label: 'Pending Approval', icon: Clock, variant: 'secondary' as const },
    APPROVED: { label: 'Active', icon: CheckCircle, variant: 'default' as const },
    REJECTED: { label: 'Rejected', icon: XCircle, variant: 'destructive' as const },
    SOLD: { label: 'Sold', icon: ShoppingBag, variant: 'default' as const },
    PAUSED: { label: 'Paused', icon: Pause, variant: 'outline' as const },
  }

  const status = statusConfig[listing.status]
  const StatusIcon = status.icon
  const CategoryIcon = categoryConfig?.icon

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            {listing.primaryImage ? (
              <img
                src={listing.primaryImage}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold line-clamp-2 flex-1">{listing.title}</h3>
              <Badge variant={status.variant} className="flex-shrink-0">
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {CategoryIcon && <CategoryIcon className="w-3 h-3" />}
                {categoryConfig?.label}
              </span>
              <span>•</span>
              <span>{conditionConfig?.label}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {listing.views} views
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {listing.pricingType === 'FIXED' && listing.price ? (
                  <p className="text-lg font-bold text-primary">
                    {formatZAR(parseFloat(listing.price))}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-primary">
                    Accepting Offers
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {listing.status === 'APPROVED' && (
                  <form action={async () => {
                    'use server'
                    await pauseListing(listing.id)
                  }}>
                    <Button type="submit" size="sm" variant="outline" title="Pause listing">
                      <Pause className="w-4 h-4" />
                    </Button>
                  </form>
                )}
                {listing.status === 'PAUSED' && (
                  <form action={async () => {
                    'use server'
                    await resumeListing(listing.id)
                  }}>
                    <Button type="submit" size="sm" variant="outline" title="Resume listing">
                      <Play className="w-4 h-4" />
                    </Button>
                  </form>
                )}
                <Link href={`/listings/${listing.id}/edit`}>
                  <Button size="sm" variant="outline" title="Edit listing">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                {listing.status !== 'SOLD' && (
                  <form action={async () => {
                    'use server'
                    await deleteListing(listing.id)
                  }}>
                    <Button
                      type="submit"
                      size="sm"
                      variant="destructive"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function MyListingsPage() {
  const session = await requireAuth()

  // Fetch user's listings
  const rawListings = await prisma.listing.findMany({
    where: { sellerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      primaryImage: true,
      price: true,
      pricingType: true,
      status: true,
      views: true,
      category: true,
      condition: true,
      createdAt: true,
    },
  })

  // Serialize listings for client
  const listings = rawListings.map((listing) => ({
    ...listing,
    price: serializeDecimal(listing.price),
  }))

  // Group listings by status
  const activeListings = listings.filter((l) => l.status === 'APPROVED')
  const pendingListings = listings.filter((l) => l.status === 'PENDING')
  const soldListings = listings.filter((l) => l.status === 'SOLD')
  const pausedListings = listings.filter((l) => l.status === 'PAUSED')

  const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
  )

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your items for sale
          </p>
        </div>
        <Link href="/listings/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active</p>
                <p className="text-2xl font-bold">{activeListings.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold">{pendingListings.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sold</p>
                <p className="text-2xl font-bold">{soldListings.length}</p>
              </div>
              <ShoppingBag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Paused</p>
                <p className="text-2xl font-bold">{pausedListings.length}</p>
              </div>
              <Pause className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">
            Active ({activeListings.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingListings.length})
          </TabsTrigger>
          <TabsTrigger value="sold">
            Sold ({soldListings.length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            Paused ({pausedListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeListings.length > 0 ? (
            activeListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <EmptyState
              icon={CheckCircle}
              title="No active listings"
              description="Your approved listings will appear here. Create a new listing to get started!"
            />
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingListings.length > 0 ? (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  These listings are waiting for admin approval before going live on the marketplace.
                </p>
              </div>
              {pendingListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </>
          ) : (
            <EmptyState
              icon={Clock}
              title="No pending listings"
              description="Listings awaiting admin approval will appear here."
            />
          )}
        </TabsContent>

        <TabsContent value="sold" className="space-y-4">
          {soldListings.length > 0 ? (
            soldListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="No sold listings"
              description="Your sold items will appear here."
            />
          )}
        </TabsContent>

        <TabsContent value="paused" className="space-y-4">
          {pausedListings.length > 0 ? (
            pausedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <EmptyState
              icon={Pause}
              title="No paused listings"
              description="Listings you've paused will appear here. You can resume them anytime."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
