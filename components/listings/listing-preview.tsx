'use client'

import { useState } from 'react'
import { MapPin, User, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  getCategoryConfig,
  getConditionConfig,
  formatZAR,
  calculateCommission,
  calculateNetAmount,
} from '@/lib/constants/categories'
import { ListingCategory, ListingCondition, PricingType } from '@/lib/generated/prisma'
import { cn } from '@/lib/utils'

type ListingPreviewData = {
  title: string
  description: string
  category: ListingCategory
  condition: ListingCondition
  images: string[]
  primaryImage: string
  pricingType: PricingType
  price?: number
  minOffer?: number
  city: string
  province: string
  sellerName?: string
  showCommissionInfo?: boolean
}

type ListingPreviewProps = {
  data: ListingPreviewData
  onEdit?: (section: string) => void
}

export const ListingPreview = ({ data, onEdit }: ListingPreviewProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const categoryConfig = getCategoryConfig(data.category)
  const conditionConfig = getConditionConfig(data.condition)

  // Get icon component
  const CategoryIcon = categoryConfig?.icon

  const commission = data.price ? calculateCommission(data.price) : 0
  const netAmount = data.price ? calculateNetAmount(data.price) : 0

  const currentImage = data.images[currentImageIndex] || data.primaryImage

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {/* Image Gallery */}
          <div className="space-y-4 mb-6">
            {/* Main Image */}
            <div className="relative aspect-video md:aspect-[4/3] rounded-lg overflow-hidden bg-muted">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {data.images.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {data.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      'aspect-square rounded-md overflow-hidden border-2 transition-all',
                      currentImageIndex === index
                        ? 'border-primary ring-2 ring-primary ring-offset-1'
                        : 'border-muted hover:border-muted-foreground/50'
                    )}
                  >
                    <img
                      src={image}
                      alt={`${data.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title and Price */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{data.title}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {CategoryIcon && <CategoryIcon className="inline w-4 h-4 mr-1" />} {categoryConfig?.label}
                </Badge>
                <Badge variant="outline">{conditionConfig?.label}</Badge>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-muted/50 rounded-lg p-4">
              {data.pricingType === 'FIXED' && data.price ? (
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {formatZAR(data.price)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fixed price
                  </p>
                </div>
              ) : data.pricingType === 'OFFERS' ? (
                <div>
                  <p className="text-xl font-semibold text-primary">
                    Accepting Offers
                  </p>
                  {data.minOffer && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimum offer: {formatZAR(data.minOffer)}
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            {/* Commission Info (for sellers) */}
            {data.showCommissionInfo && data.price && data.pricingType === 'FIXED' && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm flex-1">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Commission Breakdown
                    </p>
                    <div className="space-y-1 text-blue-800 dark:text-blue-200">
                      <div className="flex justify-between">
                        <span>Sale price:</span>
                        <span className="font-medium">{formatZAR(data.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform fee (20%):</span>
                        <span className="font-medium">- {formatZAR(commission)}</span>
                      </div>
                      <Separator className="my-2 bg-blue-200 dark:bg-blue-800" />
                      <div className="flex justify-between text-base font-semibold">
                        <span>You receive:</span>
                        <span>{formatZAR(netAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {data.description}
              </p>
            </div>

            <Separator />

            {/* Condition Details */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Condition</h3>
              <p className="text-muted-foreground">
                {conditionConfig?.label} - {conditionConfig?.description}
              </p>
            </div>

            <Separator />

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h3>
              <p className="text-muted-foreground">
                {data.city}, {data.province}
              </p>
            </div>

            {/* Seller Info Placeholder */}
            {data.sellerName && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Seller
                  </h3>
                  <p className="text-muted-foreground">{data.sellerName}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Buttons (for preview mode) */}
      {onEdit && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit('category')}
            className="text-sm text-primary hover:underline"
          >
            Edit Category
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            type="button"
            onClick={() => onEdit('details')}
            className="text-sm text-primary hover:underline"
          >
            Edit Details
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            type="button"
            onClick={() => onEdit('images')}
            className="text-sm text-primary hover:underline"
          >
            Edit Images
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            type="button"
            onClick={() => onEdit('pricing')}
            className="text-sm text-primary hover:underline"
          >
            Edit Pricing
          </button>
          <span className="text-muted-foreground">•</span>
          <button
            type="button"
            onClick={() => onEdit('location')}
            className="text-sm text-primary hover:underline"
          >
            Edit Location
          </button>
        </div>
      )}
    </div>
  )
}
