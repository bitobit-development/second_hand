'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatZAR } from '@/lib/constants/categories'
import { getSquareUrl } from '@/lib/cloudinary-utils'
import type { ListingCondition, PricingType } from '@prisma/client'

export interface ListingCardProps {
  id: string
  title: string
  price?: number
  pricingType: PricingType
  condition: ListingCondition
  primaryImage: string
  city: string
  createdAt: Date
  className?: string
}

const CONDITION_COLORS: Record<ListingCondition, string> = {
  NEW: 'bg-primary/10 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/40',
  LIKE_NEW: 'bg-accent text-accent-foreground border-accent-foreground/20 dark:bg-accent/80 dark:text-accent-foreground dark:border-accent-foreground/30',
  GOOD: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  FAIR: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  POOR: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
}

const CONDITION_LABELS: Record<ListingCondition, string> = {
  NEW: 'Brand New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
}

const isNewListing = (createdAt: Date): boolean => {
  const now = new Date()
  const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
  return diffInHours <= 24
}

export const ListingCard = ({
  id,
  title,
  price,
  pricingType,
  condition,
  primaryImage,
  city,
  createdAt,
  className,
}: ListingCardProps) => {
  const showNewBadge = isNewListing(createdAt)

  // Use AI-cropped square version for perfect 1:1 display
  const squareImageUrl = getSquareUrl(primaryImage)

  return (
    <Link
      href={`/listings/${id}`}
      className={cn(
        'group block w-full transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl',
        className
      )}
      aria-label={`View details for ${title}`}
    >
      <Card className={cn(
        'overflow-hidden h-full transition-all duration-200',
        'group-hover:shadow-xl group-hover:scale-[1.02]',
        'border-border/50 group-hover:border-primary/60 group-hover:bg-accent/20',
        'py-0 gap-0'
      )}>
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={squareImageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {showNewBadge && (
              <Badge
                variant="default"
                className={cn(
                  'bg-primary text-primary-foreground shadow-lg',
                  'border border-primary-foreground/20',
                  'font-semibold'
                )}
                aria-label="New listing"
              >
                <Clock className="w-3 h-3" aria-hidden="true" />
                NEW
              </Badge>
            )}
            <Badge
              className={cn(
                'shadow-md border font-medium',
                CONDITION_COLORS[condition]
              )}
              aria-label={`Condition: ${CONDITION_LABELS[condition]}`}
            >
              {CONDITION_LABELS[condition]}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3
            className={cn(
              'font-semibold text-base line-clamp-2 text-foreground',
              'group-hover:text-primary transition-colors duration-200'
            )}
          >
            {title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            {pricingType === 'FIXED' && price !== undefined ? (
              <p className={cn(
                'text-xl font-bold',
                'bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'
              )}>
                {formatZAR(price)}
              </p>
            ) : (
              <p className="text-base font-semibold text-primary/80 italic">
                Offers Accepted
              </p>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{city}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// Skeleton loading state
export const ListingCardSkeleton = () => {
  return (
    <Card className="overflow-hidden h-full">
      <div className="relative aspect-square w-full bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-pulse" />
        <div className="h-5 bg-muted rounded w-2/3 animate-pulse" />
        <div className="h-7 bg-muted rounded w-1/2 animate-pulse" />
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-24 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}
