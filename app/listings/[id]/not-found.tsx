import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function ListingNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <Alert className="border-destructive/50 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Listing Not Found</AlertTitle>
            <AlertDescription className="mt-2">
              The listing you are looking for does not exist or has been removed.
            </AlertDescription>
          </Alert>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/listings">Browse All Listings</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
