import { redirect, notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { EditListingForm } from './edit-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditListingPage({ params }: PageProps) {
  const session = await requireAuth()
  const { id } = await params

  // Fetch listing
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      sellerId: true,
      title: true,
      description: true,
      category: true,
      condition: true,
      images: true,
      primaryImage: true,
      pricingType: true,
      price: true,
      minOffer: true,
      city: true,
      province: true,
      status: true,
    },
  })

  if (!listing) {
    notFound()
  }

  // Check ownership
  if (listing.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/dashboard/listings')
  }

  // Convert Decimal to number and serialize for form
  const listingData = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    condition: listing.condition,
    images: listing.images,
    primaryImage: listing.primaryImage,
    pricingType: listing.pricingType,
    price: listing.price ? parseFloat(listing.price.toString()) : undefined,
    minOffer: listing.minOffer ? parseFloat(listing.minOffer.toString()) : undefined,
    city: listing.city,
    province: listing.province,
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Listing</h1>
        <p className="text-muted-foreground">
          Update your listing details
        </p>
        {listing.status === 'PENDING' && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              This listing is pending admin approval. Changes will also require re-approval.
            </p>
          </div>
        )}
      </div>

      <EditListingForm listing={listingData as any} />
    </div>
  )
}
