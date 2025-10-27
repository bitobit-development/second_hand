'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-log'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ============================================================================
// TYPES & VALIDATION
// ============================================================================

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  icon: z.string().min(1, 'Icon is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
})

export type CategoryFilters = {
  search?: string
  isActive?: boolean
  aiGenerated?: boolean
  parentId?: string | null
}

export type CategoryWithStats = {
  id: string
  name: string
  slug: string
  parentId: string | null
  icon: string
  description: string
  isActive: boolean
  itemCount: number
  aiGenerated: boolean
  createdAt: Date
  updatedAt: Date
  parent?: {
    id: string
    name: string
    slug: string
  } | null
  children: {
    id: string
    name: string
    slug: string
    itemCount: number
  }[]
  _count?: {
    listings: number
  }
}

export type CategoryAnalytics = {
  total: number
  active: number
  inactive: number
  aiGenerated: number
  manual: number
  withZeroItems: number
  rootCategories: number
  subcategories: number
  avgItemsPerCategory: number
  distribution: {
    categoryName: string
    itemCount: number
  }[]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate admin session
 */
const validateAdmin = async () => {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { error: 'Unauthorized', user: null }
  }
  return { user: session.user, error: null }
}

/**
 * Generate slug from name
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Update category item counts (denormalized for performance)
 */
const updateCategoryItemCounts = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { listings: true }
        }
      }
    })

    for (const category of categories) {
      await prisma.category.update({
        where: { id: category.id },
        data: { itemCount: category._count.listings }
      })
    }
  } catch (error) {
    console.error('Failed to update category item counts:', error)
  }
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Get all categories with optional filtering
 */
export const getCategories = async (filters?: CategoryFilters) => {
  try {
    const { error } = await validateAdmin()
    if (error) {
      return { success: false, error, data: null }
    }

    const where: any = {}

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    if (filters?.aiGenerated !== undefined) {
      where.aiGenerated = filters.aiGenerated
    }

    if (filters?.parentId !== undefined) {
      where.parentId = filters.parentId
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            itemCount: true,
          },
          orderBy: { name: 'asc' }
        },
        _count: {
          select: { listings: true }
        }
      },
      orderBy: [
        { parentId: 'asc' },
        { name: 'asc' }
      ]
    })

    return {
      success: true,
      data: categories as CategoryWithStats[],
      error: null
    }
  } catch (error) {
    console.error('Get categories error:', error)
    return {
      success: false,
      error: 'Failed to fetch categories',
      data: null
    }
  }
}

/**
 * Create new category
 */
export const createCategory = async (data: z.infer<typeof categorySchema>) => {
  try {
    const { user, error } = await validateAdmin()
    if (error || !user) {
      return { success: false, error: error || 'Unauthorized', data: null }
    }

    // Validate input
    const validatedData = categorySchema.parse(data)

    // Check for duplicate slug
    const existing = await prisma.category.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existing) {
      return {
        success: false,
        error: 'A category with this slug already exists',
        data: null
      }
    }

    // Validate parent exists if provided
    if (validatedData.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: validatedData.parentId }
      })

      if (!parent) {
        return {
          success: false,
          error: 'Parent category not found',
          data: null
        }
      }
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        icon: validatedData.icon,
        description: validatedData.description,
        parentId: validatedData.parentId || null,
        isActive: validatedData.isActive,
        aiGenerated: false,
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true }
        },
        children: {
          select: { id: true, name: true, slug: true, itemCount: true }
        }
      }
    })

    // Audit log
    await createAuditLog({
      userId: user.id!,
      action: 'CREATE_CATEGORY',
      targetType: 'CATEGORY',
      targetId: category.id,
      details: {
        name: category.name,
        slug: category.slug,
        parentId: category.parentId,
      }
    })

    revalidatePath('/admin/categories')

    return {
      success: true,
      data: category as CategoryWithStats,
      error: null
    }
  } catch (error) {
    console.error('Create category error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
        data: null
      }
    }

    return {
      success: false,
      error: 'Failed to create category',
      data: null
    }
  }
}

/**
 * Update category details
 */
export const updateCategory = async (
  id: string,
  data: Partial<z.infer<typeof categorySchema>>
) => {
  try {
    const { user, error } = await validateAdmin()
    if (error || !user) {
      return { success: false, error: error || 'Unauthorized', data: null }
    }

    // Check category exists
    const existing = await prisma.category.findUnique({
      where: { id }
    })

    if (!existing) {
      return {
        success: false,
        error: 'Category not found',
        data: null
      }
    }

    // Validate slug uniqueness if changing
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: data.slug }
      })

      if (slugExists) {
        return {
          success: false,
          error: 'A category with this slug already exists',
          data: null
        }
      }
    }

    // Prevent circular hierarchy
    if (data.parentId) {
      if (data.parentId === id) {
        return {
          success: false,
          error: 'A category cannot be its own parent',
          data: null
        }
      }

      // Check if new parent is a descendant
      const isDescendant = await checkIfDescendant(id, data.parentId)
      if (isDescendant) {
        return {
          success: false,
          error: 'Cannot set a descendant category as parent (circular hierarchy)',
          data: null
        }
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true }
        },
        children: {
          select: { id: true, name: true, slug: true, itemCount: true }
        }
      }
    })

    // Audit log
    await createAuditLog({
      userId: user.id!,
      action: 'UPDATE_CATEGORY',
      targetType: 'CATEGORY',
      targetId: category.id,
      details: {
        changes: data,
        previousName: existing.name,
      }
    })

    revalidatePath('/admin/categories')

    return {
      success: true,
      data: category as CategoryWithStats,
      error: null
    }
  } catch (error) {
    console.error('Update category error:', error)
    return {
      success: false,
      error: 'Failed to update category',
      data: null
    }
  }
}

/**
 * Check if a category is a descendant of another
 */
const checkIfDescendant = async (
  categoryId: string,
  potentialDescendantId: string
): Promise<boolean> => {
  const descendant = await prisma.category.findUnique({
    where: { id: potentialDescendantId },
    select: { parentId: true }
  })

  if (!descendant) return false
  if (!descendant.parentId) return false
  if (descendant.parentId === categoryId) return true

  return checkIfDescendant(categoryId, descendant.parentId)
}

/**
 * Merge categories (move all items from source to target)
 */
export const mergeCategories = async (sourceId: string, targetId: string) => {
  try {
    const { user, error } = await validateAdmin()
    if (error || !user) {
      return { success: false, error: error || 'Unauthorized' }
    }

    if (sourceId === targetId) {
      return {
        success: false,
        error: 'Cannot merge a category with itself'
      }
    }

    // Verify both categories exist
    const [source, target] = await Promise.all([
      prisma.category.findUnique({ where: { id: sourceId } }),
      prisma.category.findUnique({ where: { id: targetId } })
    ])

    if (!source || !target) {
      return {
        success: false,
        error: 'One or both categories not found'
      }
    }

    // Move all listings from source to target
    const updateResult = await prisma.listing.updateMany({
      where: { categoryId: sourceId },
      data: { categoryId: targetId }
    })

    // Move children categories to target as parent
    await prisma.category.updateMany({
      where: { parentId: sourceId },
      data: { parentId: targetId }
    })

    // Deactivate source category
    await prisma.category.update({
      where: { id: sourceId },
      data: {
        isActive: false,
        itemCount: 0,
      }
    })

    // Update item counts
    await updateCategoryItemCounts()

    // Audit log
    await createAuditLog({
      userId: user.id!,
      action: 'MERGE_CATEGORIES',
      targetType: 'CATEGORY',
      targetId: targetId,
      details: {
        sourceId,
        sourceName: source.name,
        targetName: target.name,
        itemsMoved: updateResult.count,
      }
    })

    revalidatePath('/admin/categories')

    return {
      success: true,
      data: {
        itemsMoved: updateResult.count,
        sourceName: source.name,
        targetName: target.name,
      },
      error: null
    }
  } catch (error) {
    console.error('Merge categories error:', error)
    return {
      success: false,
      error: 'Failed to merge categories'
    }
  }
}

/**
 * Toggle category active status
 */
export const toggleCategoryStatus = async (id: string) => {
  try {
    const { user, error } = await validateAdmin()
    if (error || !user) {
      return { success: false, error: error || 'Unauthorized', data: null }
    }

    const category = await prisma.category.findUnique({
      where: { id }
    })

    if (!category) {
      return {
        success: false,
        error: 'Category not found',
        data: null
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive }
    })

    // Audit log
    await createAuditLog({
      userId: user.id!,
      action: 'TOGGLE_CATEGORY_STATUS',
      targetType: 'CATEGORY',
      targetId: id,
      details: {
        previousStatus: category.isActive ? 'active' : 'inactive',
        newStatus: updated.isActive ? 'active' : 'inactive',
      }
    })

    revalidatePath('/admin/categories')

    return {
      success: true,
      data: updated,
      error: null
    }
  } catch (error) {
    console.error('Toggle category status error:', error)
    return {
      success: false,
      error: 'Failed to toggle category status',
      data: null
    }
  }
}

/**
 * Delete category (only if 0 items and no children)
 */
export const deleteCategory = async (id: string) => {
  try {
    const { user, error } = await validateAdmin()
    if (error || !user) {
      return { success: false, error: error || 'Unauthorized' }
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            listings: true,
            children: true,
          }
        }
      }
    })

    if (!category) {
      return {
        success: false,
        error: 'Category not found'
      }
    }

    if (category._count.listings > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${category._count.listings} listings. Merge or reassign listings first.`
      }
    }

    if (category._count.children > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${category._count.children} subcategories. Delete or reassign subcategories first.`
      }
    }

    await prisma.category.delete({
      where: { id }
    })

    // Audit log
    await createAuditLog({
      userId: user.id!,
      action: 'DELETE_CATEGORY',
      targetType: 'CATEGORY',
      targetId: id,
      details: {
        name: category.name,
        slug: category.slug,
      }
    })

    revalidatePath('/admin/categories')

    return {
      success: true,
      error: null
    }
  } catch (error) {
    console.error('Delete category error:', error)
    return {
      success: false,
      error: 'Failed to delete category'
    }
  }
}

/**
 * Get category analytics
 */
export const getCategoryAnalytics = async () => {
  try {
    const { error } = await validateAdmin()
    if (error) {
      return { success: false, error, data: null }
    }

    const [
      allCategories,
      activeCategories,
      aiGenerated,
      zeroItems
    ] = await Promise.all([
      prisma.category.count(),
      prisma.category.count({ where: { isActive: true } }),
      prisma.category.count({ where: { aiGenerated: true } }),
      prisma.category.count({ where: { itemCount: 0 } })
    ])

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        itemCount: true,
        parentId: true,
      }
    })

    const rootCategories = categories.filter(c => !c.parentId).length
    const subcategories = categories.length - rootCategories

    const totalItems = categories.reduce((sum, c) => sum + c.itemCount, 0)
    const avgItemsPerCategory = categories.length > 0 ? totalItems / categories.length : 0

    const distribution = categories
      .map(c => ({
        categoryName: c.name,
        itemCount: c.itemCount
      }))
      .sort((a, b) => b.itemCount - a.itemCount)
      .slice(0, 10) // Top 10

    const analytics: CategoryAnalytics = {
      total: allCategories,
      active: activeCategories,
      inactive: allCategories - activeCategories,
      aiGenerated,
      manual: allCategories - aiGenerated,
      withZeroItems: zeroItems,
      rootCategories,
      subcategories,
      avgItemsPerCategory: Math.round(avgItemsPerCategory * 10) / 10,
      distribution
    }

    return {
      success: true,
      data: analytics,
      error: null
    }
  } catch (error) {
    console.error('Get category analytics error:', error)
    return {
      success: false,
      error: 'Failed to fetch analytics',
      data: null
    }
  }
}

/**
 * Get single category by ID
 */
export const getCategoryById = async (id: string) => {
  try {
    const { error } = await validateAdmin()
    if (error) {
      return { success: false, error, data: null }
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: { id: true, name: true, slug: true }
        },
        children: {
          select: { id: true, name: true, slug: true, itemCount: true }
        },
        _count: {
          select: { listings: true }
        }
      }
    })

    if (!category) {
      return {
        success: false,
        error: 'Category not found',
        data: null
      }
    }

    return {
      success: true,
      data: category as CategoryWithStats,
      error: null
    }
  } catch (error) {
    console.error('Get category by ID error:', error)
    return {
      success: false,
      error: 'Failed to fetch category',
      data: null
    }
  }
}
