'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ListingCategory, ListingStatus, PricingType } from '@prisma/client'
import {
  MoreHorizontal,
  Check,
  X,
  Pause,
  Play,
  Trash2,
  Package,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ListingStatusBadge } from './listing-status-badge'
import { getCategoryConfig, formatZAR } from '@/lib/constants/categories'
import { cn } from '@/lib/utils'

interface ListingData {
  id: string
  title: string
  primaryImage: string
  category: ListingCategory
  price: string | null
  pricingType: PricingType
  status: ListingStatus
  createdAt: Date
  seller: {
    id: string
    name: string
    email: string
  }
}

interface AdminListingsTableProps {
  listings: ListingData[]
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
  onPause: (id: string) => Promise<void>
  onDelete: (id: string, reason: string) => Promise<void>
  onResume: (id: string) => Promise<void>
  isLoading?: boolean
}

export function AdminListingsTable({
  listings,
  onApprove,
  onReject,
  onPause,
  onDelete,
  onResume,
  isLoading = false,
}: AdminListingsTableProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  const handleAction = async (
    id: string,
    action: () => Promise<void>
  ) => {
    setProcessingIds((prev) => new Set(prev).add(id))
    try {
      await action()
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const formatRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 30) return `${diffInDays}d ago`

    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price: string | null, pricingType: PricingType): string => {
    if (pricingType === 'OFFERS') {
      return price ? `From ${formatZAR(parseFloat(price))}` : 'Accepting offers'
    }
    return price ? formatZAR(parseFloat(price)) : 'N/A'
  }

  const truncateTitle = (title: string, maxLength = 40): string => {
    if (title.length <= maxLength) return title
    return `${title.substring(0, maxLength)}...`
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="h-10 px-2 text-left"><Skeleton className="h-4 w-20" /></th>
                    <th className="h-10 px-2 text-left"><Skeleton className="h-4 w-16" /></th>
                    <th className="h-10 px-2 text-left"><Skeleton className="h-4 w-24" /></th>
                    <th className="h-10 px-2 text-left"><Skeleton className="h-4 w-20" /></th>
                    <th className="h-10 px-2 text-left"><Skeleton className="h-4 w-16" /></th>
                    <th className="h-10 px-2 text-left"><Skeleton className="h-4 w-16" /></th>
                    <th className="h-10 px-2 text-left"><Skeleton className="h-4 w-20" /></th>
                    <th className="h-10 px-2 text-left"><Skeleton className="h-4 w-12" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2"><Skeleton className="h-20 w-20" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-32" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-2"><Skeleton className="h-6 w-16" /></td>
                      <td className="p-2"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-2"><Skeleton className="h-8 w-8" /></td>
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
    )
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-lg border border-dashed">
        <Package className="w-12 h-12 text-muted-foreground mb-4" aria-hidden="true" />
        <h3 className="text-lg font-medium text-foreground mb-1">No listings found</h3>
        <p className="text-sm text-muted-foreground">
          There are no listings to display at the moment.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Image</TableHead>
              <TableHead scope="col">Title</TableHead>
              <TableHead scope="col">Seller</TableHead>
              <TableHead scope="col">Category</TableHead>
              <TableHead scope="col">Price</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Created</TableHead>
              <TableHead scope="col" className="w-[50px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => {
              const categoryConfig = getCategoryConfig(listing.category)
              const CategoryIcon = categoryConfig?.icon
              const isProcessing = processingIds.has(listing.id)

              return (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={listing.primaryImage}
                        alt={listing.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <span className="font-medium" title={listing.title}>
                        {truncateTitle(listing.title)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-medium text-sm">{listing.seller.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {listing.seller.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {CategoryIcon && (
                        <CategoryIcon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      )}
                      <span className="text-sm">{categoryConfig?.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatPrice(listing.price, listing.pricingType)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ListingStatusBadge status={listing.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatRelativeTime(listing.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {listing.status !== 'SOLD' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isProcessing}
                            aria-label={`Actions for ${listing.title}`}
                          >
                            <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {listing.status === 'PENDING' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleAction(listing.id, () => onApprove(listing.id))}
                                disabled={isProcessing}
                                className="text-green-600 dark:text-green-400 focus:text-green-600 dark:focus:text-green-400"
                              >
                                <Check className="w-4 h-4" aria-hidden="true" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason (optional):')
                                  if (reason !== null) {
                                    handleAction(listing.id, () => onReject(listing.id, reason))
                                  }
                                }}
                                disabled={isProcessing}
                              >
                                <X className="w-4 h-4" aria-hidden="true" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {listing.status === 'APPROVED' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleAction(listing.id, () => onPause(listing.id))}
                                disabled={isProcessing}
                              >
                                <Pause className="w-4 h-4" aria-hidden="true" />
                                Pause
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                  const reason = prompt('Enter deletion reason (optional):')
                                  if (reason !== null) {
                                    handleAction(listing.id, () => onDelete(listing.id, reason))
                                  }
                                }}
                                disabled={isProcessing}
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                          {listing.status === 'PAUSED' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleAction(listing.id, () => onResume(listing.id))}
                                disabled={isProcessing}
                              >
                                <Play className="w-4 h-4" aria-hidden="true" />
                                Resume
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => {
                                  const reason = prompt('Enter deletion reason (optional):')
                                  if (reason !== null) {
                                    handleAction(listing.id, () => onDelete(listing.id, reason))
                                  }
                                }}
                                disabled={isProcessing}
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                          {listing.status === 'REJECTED' && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                const reason = prompt('Enter deletion reason (optional):')
                                if (reason !== null) {
                                  handleAction(listing.id, () => onDelete(listing.id, reason))
                                }
                              }}
                              disabled={isProcessing}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {listings.map((listing) => {
          const categoryConfig = getCategoryConfig(listing.category)
          const CategoryIcon = categoryConfig?.icon
          const isProcessing = processingIds.has(listing.id)

          return (
            <div
              key={listing.id}
              className="rounded-lg border bg-card text-card-foreground p-4 space-y-3"
            >
              {/* Image + Title */}
              <div className="flex gap-3">
                <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={listing.primaryImage}
                    alt={listing.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm leading-tight mb-1" title={listing.title}>
                    {listing.title}
                  </h3>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>{listing.seller.name}</div>
                    <div>{listing.seller.email}</div>
                  </div>
                </div>
              </div>

              {/* Category + Price */}
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {CategoryIcon && (
                    <CategoryIcon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className="text-muted-foreground">{categoryConfig?.label}</span>
                </div>
                <span className="font-medium">
                  {formatPrice(listing.price, listing.pricingType)}
                </span>
              </div>

              {/* Status + Created */}
              <div className="flex items-center justify-between gap-4">
                <ListingStatusBadge status={listing.status} />
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(listing.createdAt)}
                </span>
              </div>

              {/* Actions */}
              {listing.status !== 'SOLD' && (
                <div className="pt-2 border-t">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={isProcessing}
                        aria-label={`Actions for ${listing.title}`}
                      >
                        <MoreHorizontal className="w-4 h-4 mr-2" aria-hidden="true" />
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {listing.status === 'PENDING' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleAction(listing.id, () => onApprove(listing.id))}
                            disabled={isProcessing}
                            className="text-green-600 dark:text-green-400 focus:text-green-600 dark:focus:text-green-400"
                          >
                            <Check className="w-4 h-4" aria-hidden="true" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('Enter rejection reason (optional):')
                              if (reason !== null) {
                                handleAction(listing.id, () => onReject(listing.id, reason))
                              }
                            }}
                            disabled={isProcessing}
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      {listing.status === 'APPROVED' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleAction(listing.id, () => onPause(listing.id))}
                            disabled={isProcessing}
                          >
                            <Pause className="w-4 h-4" aria-hidden="true" />
                            Pause
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('Enter deletion reason (optional):')
                              if (reason !== null) {
                                handleAction(listing.id, () => onDelete(listing.id, reason))
                              }
                            }}
                            disabled={isProcessing}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      {listing.status === 'PAUSED' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleAction(listing.id, () => onResume(listing.id))}
                            disabled={isProcessing}
                          >
                            <Play className="w-4 h-4" aria-hidden="true" />
                            Resume
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt('Enter deletion reason (optional):')
                              if (reason !== null) {
                                handleAction(listing.id, () => onDelete(listing.id, reason))
                              }
                            }}
                            disabled={isProcessing}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      {listing.status === 'REJECTED' && (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => {
                            const reason = prompt('Enter deletion reason (optional):')
                            if (reason !== null) {
                              handleAction(listing.id, () => onDelete(listing.id, reason))
                            }
                          }}
                          disabled={isProcessing}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
