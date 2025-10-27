'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { createAuditLog } from '@/lib/audit-log'
import { UserRole, Prisma } from '@prisma/client'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Standard action result type for all server actions
 */
export interface ActionResult<T = unknown> {
  success: boolean
  error?: string
  data?: T
}

/**
 * Parameters for fetching admin users with filters and pagination
 */
export interface GetAdminUsersParams {
  /** Filter by user role */
  role?: UserRole
  /** Search query for name/email */
  search?: string
  /** Page number (1-indexed) */
  page?: number
  /** Results per page (default: 20, max: 100) */
  limit?: number
  /** Sort field */
  sortBy?: 'createdAt' | 'name' | 'email'
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}

/**
 * User data for admin view (excludes password)
 */
export interface AdminUserData {
  id: string
  email: string
  name: string
  phone: string | null
  city: string | null
  province: string | null
  role: UserRole
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
  _count: {
    listings: number
    purchases: number
    sales: number
  }
}

/**
 * Paginated response for admin users
 */
export interface GetAdminUsersResponse {
  users: AdminUserData[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

/**
 * Statistics for admin users dashboard
 */
export interface AdminUserStatistics {
  totalUsers: number
  adminCount: number
  sellerCount: number
  buyerCount: number
  verifiedUsers: number
  usersThisMonth: number
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for creating a new user
 */
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must not exceed 100 characters'),
  role: z.enum(['BUYER', 'SELLER', 'ADMIN']),
  phone: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
})

type CreateUserInput = z.infer<typeof createUserSchema>

/**
 * Schema for updating user role
 */
const updateUserRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['BUYER', 'SELLER', 'ADMIN']),
})

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user is the last admin
 * CRITICAL: This prevents deleting or downgrading the last admin
 */
async function isLastAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN') {
    return false
  }

  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN' },
  })

  return adminCount === 1
}

/**
 * Build where clause for user filtering
 */
function buildUserWhereClause(params: GetAdminUsersParams): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {}

  if (params.role) {
    where.role = params.role
  }

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { email: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  return where
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Get paginated list of users with filters
 * @param params - Filter and pagination parameters
 * @returns Paginated users with counts
 */
export async function getAdminUsers(
  params: GetAdminUsersParams = {}
): Promise<GetAdminUsersResponse> {
  const session = await requireAdmin()

  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params

  const validatedLimit = Math.min(Math.max(1, limit), 100)
  const skip = (page - 1) * validatedLimit

  const where = buildUserWhereClause(params)

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          city: true,
          province: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              listings: true,
              purchases: true,
              sales: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: validatedLimit,
      }),
      prisma.user.count({ where }),
    ])

    return {
      users,
      pagination: {
        total,
        page,
        limit: validatedLimit,
        totalPages: Math.ceil(total / validatedLimit),
      },
    }
  } catch (error) {
    console.error('Failed to fetch admin users:', error)
    throw new Error('Failed to fetch users')
  }
}

/**
 * Get user management statistics
 * @returns Statistics about users
 */
export async function getAdminUserStatistics(): Promise<AdminUserStatistics> {
  const session = await requireAdmin()

  try {
    const [
      totalUsers,
      adminCount,
      sellerCount,
      buyerCount,
      verifiedUsers,
      usersThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.user.count({ where: { emailVerified: { not: null } } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ])

    return {
      totalUsers,
      adminCount,
      sellerCount,
      buyerCount,
      verifiedUsers,
      usersThisMonth,
    }
  } catch (error) {
    console.error('Failed to fetch user statistics:', error)
    throw new Error('Failed to fetch statistics')
  }
}

/**
 * Create a new user
 * @param input - User creation data
 * @returns Action result with created user ID
 */
export async function createUser(
  input: CreateUserInput
): Promise<ActionResult<{ userId: string }>> {
  const user = await requireAdmin()

  // Validate input
  const validation = createUserSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  const data = validation.data

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return {
        success: false,
        error: 'A user with this email already exists',
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role,
        phone: data.phone,
        city: data.city,
        province: data.province,
        emailVerified: new Date(), // Admin-created users are auto-verified
      },
    })

    // Create audit log
    await createAuditLog({
      userId: (user as any).id,
      action: 'CREATE_USER',
      targetType: 'USER',
      targetId: newUser.id,
      details: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      data: { userId: newUser.id },
    }
  } catch (error) {
    console.error('Failed to create user:', error)
    return {
      success: false,
      error: 'Failed to create user. Please try again.',
    }
  }
}

/**
 * Delete a user
 * CRITICAL: Prevents deletion of the last admin
 * @param userId - ID of user to delete
 * @returns Action result
 */
export async function deleteUser(userId: string): Promise<ActionResult> {
  const currentUser = await requireAdmin()

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    return {
      success: false,
      error: 'Invalid user ID format',
    }
  }

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // 🚨 CRITICAL: Check if this is the last admin
    if (await isLastAdmin(userId)) {
      return {
        success: false,
        error: 'Cannot delete the last admin user. At least one admin must remain.',
      }
    }

    // Prevent admin from deleting themselves (UX safeguard)
    if (userId === (currentUser as any).id) {
      return {
        success: false,
        error: 'You cannot delete your own account',
      }
    }

    // Delete user (cascading will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    })

    // Create audit log
    await createAuditLog({
      userId: (currentUser as any).id,
      action: 'DELETE_USER',
      targetType: 'USER',
      targetId: userId,
      details: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    revalidatePath('/admin/users')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to delete user:', error)
    return {
      success: false,
      error: 'Failed to delete user. Please try again.',
    }
  }
}

/**
 * Update user role
 * CRITICAL: Prevents downgrading the last admin
 * @param input - User ID and new role
 * @returns Action result
 */
export async function updateUserRole(
  input: { userId: string; role: UserRole }
): Promise<ActionResult> {
  const currentUser = await requireAdmin()

  // Validate input
  const validation = updateUserRoleSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Invalid input',
    }
  }

  const { userId, role } = validation.data

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // 🚨 CRITICAL: If downgrading from ADMIN, check if last admin
    if (user.role === 'ADMIN' && role !== 'ADMIN') {
      if (await isLastAdmin(userId)) {
        return {
          success: false,
          error: 'Cannot remove admin role from the last admin user. At least one admin must remain.',
        }
      }
    }

    // Prevent admin from changing their own role (UX safeguard)
    if (userId === (currentUser as any).id) {
      return {
        success: false,
        error: 'You cannot change your own role',
      }
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    })

    // Create audit log
    await createAuditLog({
      userId: (currentUser as any).id,
      action: 'UPDATE_USER_ROLE',
      targetType: 'USER',
      targetId: userId,
      details: {
        email: user.email,
        name: user.name,
        oldRole: user.role,
        newRole: role,
      },
    })

    revalidatePath('/admin/users')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to update user role:', error)
    return {
      success: false,
      error: 'Failed to update user role. Please try again.',
    }
  }
}
