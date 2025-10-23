import { z } from 'zod'
import { ListingCategory, ListingCondition, PricingType } from '@prisma/client'
import { SA_PROVINCES } from '@/lib/constants/categories'

// Step 1: Category Selection
export const categorySchema = z.object({
  category: z.nativeEnum(ListingCategory, {
    error: 'Please select a category',
  }),
})

export type CategoryFormData = z.infer<typeof categorySchema>

// Step 2: Details
export const detailsSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim(),
  condition: z.nativeEnum(ListingCondition, {
    error: 'Please select a condition',
  }),
})

export type DetailsFormData = z.infer<typeof detailsSchema>

// Step 3: Images
export const imagesSchema = z.object({
  images: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'At least 1 image is required')
    .max(10, 'Maximum 10 images allowed'),
  primaryImage: z.string().url('Invalid primary image URL'),
})

export type ImagesFormData = z.infer<typeof imagesSchema>

// Step 4: Pricing
export const pricingSchema = z
  .object({
    pricingType: z.nativeEnum(PricingType, {
      error: 'Please select a pricing type',
    }),
    price: z
      .number({
        error: 'Price must be a valid number',
      })
      .positive('Price must be greater than 0')
      .optional(),
    minOffer: z
      .number({
        error: 'Minimum offer must be a valid number',
      })
      .positive('Minimum offer must be greater than 0')
      .optional(),
  })
  .refine(
    (data) => {
      // If FIXED pricing, price is required
      if (data.pricingType === 'FIXED') {
        return data.price !== undefined && data.price > 0
      }
      return true
    },
    {
      message: 'Price is required for fixed pricing',
      path: ['price'],
    }
  )
  .refine(
    (data) => {
      // If OFFERS pricing with minOffer, validate it's less than price (if price exists)
      if (data.pricingType === 'OFFERS' && data.minOffer && data.price) {
        return data.minOffer <= data.price
      }
      return true
    },
    {
      message: 'Minimum offer must be less than or equal to price',
      path: ['minOffer'],
    }
  )

export type PricingFormData = z.infer<typeof pricingSchema>

// Step 5: Location
export const locationSchema = z.object({
  city: z.string().min(2, 'City is required').max(100, 'City name too long').trim(),
  province: z.enum(SA_PROVINCES, {
    error: 'Please select a valid South African province',
  }),
})

export type LocationFormData = z.infer<typeof locationSchema>

// Combined schema for complete listing creation
export const createListingSchema = categorySchema
  .merge(detailsSchema)
  .merge(imagesSchema)
  .merge(pricingSchema)
  .merge(locationSchema)

export type CreateListingFormData = z.infer<typeof createListingSchema>

// Server-side validation for creating a listing
export const serverCreateListingSchema = createListingSchema.extend({
  sellerId: z.string().uuid('Invalid seller ID'),
  // AI metadata fields (optional)
  aiEnhancedImages: z.boolean().optional(),
  aiGeneratedDesc: z.boolean().optional(),
  originalImages: z.array(z.string().url('Invalid original image URL')).optional(),
})

export type ServerCreateListingData = z.infer<typeof serverCreateListingSchema>

// Update listing schema (allows partial updates)
export const updateListingSchema = createListingSchema.partial()

export type UpdateListingFormData = z.infer<typeof updateListingSchema>

// Schema for listing ID validation
export const listingIdSchema = z.object({
  id: z.string().uuid('Invalid listing ID'),
})

export type ListingIdData = z.infer<typeof listingIdSchema>
