import Link from 'next/link'
import { CheckCircle, Plus, List, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type PageProps = {
  searchParams: Promise<{ id?: string }>
}

export default async function ListingSuccessPage({ searchParams }: PageProps) {
  const { id } = await searchParams

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <Card>
        <CardContent className="p-8 sm:p-12">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-4">
            Listing Created Successfully!
          </h1>

          {/* Description */}
          <div className="space-y-4 text-center text-muted-foreground mb-8">
            <p>
              Your listing has been submitted and is now pending admin approval.
            </p>
            <p>
              You'll receive a notification once your listing is reviewed. This usually takes 1-2 business days.
            </p>
            {id && (
              <p className="text-sm font-mono bg-muted px-3 py-2 rounded inline-block">
                Listing ID: {id}
              </p>
            )}
          </div>

          <Separator className="my-8" />

          {/* What Happens Next */}
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold">What happens next?</h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  1
                </span>
                <span>
                  Our admin team will review your listing to ensure it meets our quality standards and marketplace guidelines.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  2
                </span>
                <span>
                  Once approved, your listing will go live on the marketplace and be visible to all buyers.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                  3
                </span>
                <span>
                  You'll receive notifications when buyers view your listing or make offers.
                </span>
              </li>
            </ol>
          </div>

          <Separator className="my-8" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard/listings" className="flex-1">
              <Button variant="outline" className="w-full">
                <List className="w-4 h-4 mr-2" />
                View My Listings
              </Button>
            </Link>
            <Link href="/listings/create" className="flex-1">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Another Listing
              </Button>
            </Link>
          </div>

          {/* Additional Link */}
          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              Back to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
