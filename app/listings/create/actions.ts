'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import {
  serverCreateListingSchema,
  updateListingSchema,
  listingIdSchema,
  type CreateListingFormData,
  type UpdateListingFormData,
} from '@/lib/validations/listing'

type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a new listing
 * Requires authentication
 * New listings default to PENDING status (requires admin approval)
 */
export const createListing = async (
  formData: CreateListingFormData
): Promise<ActionResult<{ id: string }>> => {
  try {
    // Require authentication
    const session = await requireAuth()

    // Validate input
    const validated = serverCreateListingSchema.parse({
      ...formData,
      sellerId: session.user.id,
    })

    // Create listing in database
    const listing = await prisma.listing.create({
      data: {
        sellerId: validated.sellerId,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        condition: validated.condition,
        images: validated.images,
        primaryImage: validated.primaryImage,
        pricingType: validated.pricingType,
        price: validated.price ? String(validated.price) : null,
        minOffer: validated.minOffer ? String(validated.minOffer) : null,
        city: validated.city,
        province: validated.province,
        status: 'PENDING', // All new listings require approval
        // AI metadata fields
        aiEnhancedImages: validated.aiEnhancedImages ?? false,
        aiGeneratedDesc: validated.aiGeneratedDesc ?? false,
        originalImages: validated.originalImages ?? [],
      },
    })

    // Revalidate relevant pages
    revalidatePath('/dashboard/listings')
    revalidatePath('/listings')

    return {
      success: true,
      data: { id: listing.id },
    }
  } catch (error) {
    console.error('Create listing error:', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to create listing. Please try again.',
    }
  }
}

/**
 * Update an existing listing
 * Only owner or admin can update
 */
export const updateListing = async (
  listingId: string,
  formData: UpdateListingFormData
): Promise<ActionResult<{ id: string }>> => {
  try {
    // Require authentication
    const session = await requireAuth()

    // Validate listing ID
    const { id } = listingIdSchema.parse({ id: listingId })

    // Check if listing exists and user has permission
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true },
    })

    if (!existingListing) {
      return {
        success: false,
        error: 'Listing not found',
      }
    }

    // Check ownership
    if (existingListing.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'You do not have permission to update this listing',
      }
    }

    // Validate input
    const validated = updateListingSchema.parse(formData)

    // Prepare update data
    const updateData: Record<string, unknown> = {}
    if (validated.title) updateData.title = validated.title
    if (validated.description) updateData.description = validated.description
    if (validated.category) updateData.category = validated.category
    if (validated.condition) updateData.condition = validated.condition
    if (validated.images) updateData.images = validated.images
    if (validated.primaryImage) updateData.primaryImage = validated.primaryImage
    if (validated.pricingType) updateData.pricingType = validated.pricingType
    if (validated.price !== undefined)
      updateData.price = validated.price ? String(validated.price) : null
    if (validated.minOffer !== undefined)
      updateData.minOffer = validated.minOffer ? String(validated.minOffer) : null
    if (validated.city) updateData.city = validated.city
    if (validated.province) updateData.province = validated.province

    // Update listing
    const listing = await prisma.listing.update({
      where: { id },
      data: updateData,
    })

    // Revalidate relevant pages
    revalidatePath('/dashboard/listings')
    revalidatePath(`/listings/${id}`)
    revalidatePath('/listings')

    return {
      success: true,
      data: { id: listing.id },
    }
  } catch (error) {
    console.error('Update listing error:', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to update listing. Please try again.',
    }
  }
}

/**
 * Delete a listing (soft delete by changing status)
 * Only owner or admin can delete
 */
export const deleteListing = async (
  listingId: string
): Promise<ActionResult> => {
  try {
    // Require authentication
    const session = await requireAuth()

    // Validate listing ID
    const { id } = listingIdSchema.parse({ id: listingId })

    // Check if listing exists and user has permission
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true, status: true },
    })

    if (!existingListing) {
      return {
        success: false,
        error: 'Listing not found',
      }
    }

    // Check ownership
    if (existingListing.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'You do not have permission to delete this listing',
      }
    }

    // Prevent deletion of sold listings
    if (existingListing.status === 'SOLD') {
      return {
        success: false,
        error: 'Cannot delete a sold listing',
      }
    }

    // Soft delete by updating status to REJECTED
    await prisma.listing.delete({
      where: { id },
    })

    // Revalidate relevant pages
    revalidatePath('/dashboard/listings')
    revalidatePath('/listings')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Delete listing error:', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to delete listing. Please try again.',
    }
  }
}

/**
 * Pause an active listing
 * Only owner can pause
 */
export const pauseListing = async (
  listingId: string
): Promise<ActionResult> => {
  try {
    // Require authentication
    const session = await requireAuth()

    // Validate listing ID
    const { id } = listingIdSchema.parse({ id: listingId })

    // Check if listing exists and user has permission
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true, status: true },
    })

    if (!existingListing) {
      return {
        success: false,
        error: 'Listing not found',
      }
    }

    // Check ownership
    if (existingListing.sellerId !== session.user.id) {
      return {
        success: false,
        error: 'You do not have permission to pause this listing',
      }
    }

    // Can only pause approved listings
    if (existingListing.status !== 'APPROVED') {
      return {
        success: false,
        error: 'Only approved listings can be paused',
      }
    }

    // Update status to PAUSED
    await prisma.listing.update({
      where: { id },
      data: { status: 'PAUSED' },
    })

    // Revalidate relevant pages
    revalidatePath('/dashboard/listings')
    revalidatePath(`/listings/${id}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Pause listing error:', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to pause listing. Please try again.',
    }
  }
}

/**
 * Resume a paused listing
 * Only owner can resume
 */
export const resumeListing = async (
  listingId: string
): Promise<ActionResult> => {
  try {
    // Require authentication
    const session = await requireAuth()

    // Validate listing ID
    const { id } = listingIdSchema.parse({ id: listingId })

    // Check if listing exists and user has permission
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true, status: true },
    })

    if (!existingListing) {
      return {
        success: false,
        error: 'Listing not found',
      }
    }

    // Check ownership
    if (existingListing.sellerId !== session.user.id) {
      return {
        success: false,
        error: 'You do not have permission to resume this listing',
      }
    }

    // Can only resume paused listings
    if (existingListing.status !== 'PAUSED') {
      return {
        success: false,
        error: 'Only paused listings can be resumed',
      }
    }

    // Update status back to APPROVED
    await prisma.listing.update({
      where: { id },
      data: { status: 'APPROVED' },
    })

    // Revalidate relevant pages
    revalidatePath('/dashboard/listings')
    revalidatePath(`/listings/${id}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error('Resume listing error:', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to resume listing. Please try again.',
    }
  }
}
