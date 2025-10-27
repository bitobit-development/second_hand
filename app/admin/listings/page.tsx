import { Suspense } from 'react'
import { ListingStatus } from '@prisma/client'
import { requireAdmin } from '@/lib/auth-helpers'
import {
  getAdminListings,
  approveListing,
  rejectListing,
  adminPauseListing,
  adminDeleteListing,
  adminResumeListing,
} from './actions'
import { AdminListingsTable } from '@/components/admin/listings-table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

// ============================================================================
// TYPES
// ============================================================================

interface PageProps {
  searchParams: Promise<{
    status?: string
    page?: string
  }>
}

// ============================================================================
// ASYNC WRAPPER
// ============================================================================

/**
 * Async wrapper for listing content to handle server actions properly
 */
async function ListingsContent({ status, page }: { status?: ListingStatus; page: number }) {
  const result = await getAdminListings({
    status,
    page,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  if (!result.success || !result.data) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm text-destructive">
          {result.error || 'Failed to load listings. Please try again.'}
        </p>
      </div>
    )
  }

  const { listings, pagination } = result.data

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{listings.length}</span> of{' '}
          <span className="font-medium text-foreground">{pagination.total}</span> listings
        </p>
        {pagination.totalPages > 1 && (
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
        )}
      </div>

      {/* Listings Table */}
      <AdminListingsTable
        listings={listings}
        onApprove={async (id: string) => {
          'use server'
          const result = await approveListing(id)
          if (!result.success) {
            throw new Error(result.error || 'Failed to approve listing')
          }
        }}
        onReject={async (id: string, reason: string) => {
          'use server'
          const result = await rejectListing(id, reason)
          if (!result.success) {
            throw new Error(result.error || 'Failed to reject listing')
          }
        }}
        onPause={async (id: string) => {
          'use server'
          const result = await adminPauseListing(id)
          if (!result.success) {
            throw new Error(result.error || 'Failed to pause listing')
          }
        }}
        onDelete={async (id: string, reason: string) => {
          'use server'
          const result = await adminDeleteListing(id, reason)
          if (!result.success) {
            throw new Error(result.error || 'Failed to delete listing')
          }
        }}
        onResume={async (id: string) => {
          'use server'
          const result = await adminResumeListing(id)
          if (!result.success) {
            throw new Error(result.error || 'Failed to resume listing')
          }
        }}
      />

      {/* TODO: Add pagination controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <p className="text-sm text-muted-foreground italic">
            Pagination controls coming soon...
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Loading skeleton for listings table
 */
function ListingsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="space-y-3">
        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="h-10 px-2 text-left">
                      <Skeleton className="h-4 w-20" />
                    </th>
                    <th className="h-10 px-2 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                    <th className="h-10 px-2 text-left">
                      <Skeleton className="h-4 w-24" />
                    </th>
                    <th className="h-10 px-2 text-left">
                      <Skeleton className="h-4 w-20" />
                    </th>
                    <th className="h-10 px-2 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                    <th className="h-10 px-2 text-left">
                      <Skeleton className="h-4 w-16" />
                    </th>
                    <th className="h-10 px-2 text-left">
                      <Skeleton className="h-4 w-20" />
                    </th>
                    <th className="h-10 px-2 text-left">
                      <Skeleton className="h-4 w-12" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">
                        <Skeleton className="h-20 w-20" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-6 w-16" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="p-2">
                        <Skeleton className="h-8 w-8" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile skeleton */}
        <div className="md:hidden space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex gap-3">
                <Skeleton className="h-20 w-20 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// ============================================================================

/**
 * Admin Listings Management Page
 *
 * Features:
 * - Status filtering via tabs (All, Pending, Approved, Rejected, Paused, Sold)
 * - Real-time moderation actions (approve, reject, pause, resume, delete)
 * - Responsive table/card layout
 * - Pagination support (coming soon)
 *
 * @param searchParams - URL query parameters for filtering
 */
export default async function AdminListingsPage({ searchParams }: PageProps) {
  // Verify admin authentication
  await requireAdmin()

  // Parse search params
  const params = await searchParams
  const statusParam = params.status
  const status = statusParam as ListingStatus | undefined
  const page = parseInt(params.page || '1')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Listings Management</h1>
        <p className="text-muted-foreground mt-2">
          Review, approve, and manage platform listings
        </p>
      </div>

      {/* Status Filter Tabs */}
      <Tabs defaultValue={status || 'all'} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap sm:flex-nowrap">
          <TabsTrigger value="all" asChild>
            <a href="/admin/listings">All Listings</a>
          </TabsTrigger>
          <TabsTrigger value={ListingStatus.PENDING} asChild>
            <a href="/admin/listings?status=PENDING">Pending</a>
          </TabsTrigger>
          <TabsTrigger value={ListingStatus.APPROVED} asChild>
            <a href="/admin/listings?status=APPROVED">Approved</a>
          </TabsTrigger>
          <TabsTrigger value={ListingStatus.REJECTED} asChild>
            <a href="/admin/listings?status=REJECTED">Rejected</a>
          </TabsTrigger>
          <TabsTrigger value={ListingStatus.PAUSED} asChild>
            <a href="/admin/listings?status=PAUSED">Paused</a>
          </TabsTrigger>
          <TabsTrigger value={ListingStatus.SOLD} asChild>
            <a href="/admin/listings?status=SOLD">Sold</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={status || 'all'} className="mt-6">
          <Suspense fallback={<ListingsLoadingSkeleton />}>
            <ListingsContent status={status} page={page} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
