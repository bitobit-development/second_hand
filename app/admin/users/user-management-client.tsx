'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserPlus, Users as UsersIcon, Shield, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { UserRole } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatsCard } from '@/components/admin/stats-card'
import { AdminUsersTable } from '@/components/admin/users-table'
import { CreateUserDialog, CreateUserFormData } from '@/components/admin/create-user-dialog'
import { DeleteUserDialog } from '@/components/admin/delete-user-dialog'
import {
  AdminUserData,
  AdminUserStatistics,
  createUser,
  deleteUser,
  updateUserRole,
} from './actions'

interface UserManagementClientProps {
  initialUsers: AdminUserData[]
  initialPagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  stats: AdminUserStatistics
  currentUserId: string
}

export function UserManagementClient({
  initialUsers,
  initialPagination,
  stats,
  currentUserId,
}: UserManagementClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
    email: string
    role: UserRole
  } | null>(null)

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all')

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (roleFilter !== 'all') params.set('role', roleFilter)
    params.set('page', '1') // Reset to page 1 on filter change

    const newUrl = `/admin/users${params.toString() ? `?${params.toString()}` : ''}`
    const currentUrl = window.location.pathname + window.location.search

    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false })
    }
  }

  // Handle create user
  const handleCreateUser = async (data: CreateUserFormData) => {
    const result = await createUser(data)
    if (!result.success) {
      throw new Error(result.error || 'Failed to create user')
    }
    startTransition(() => {
      router.refresh()
    })
  }

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deleteTarget) return

    const result = await deleteUser(deleteTarget.id)
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete user')
    }
    startTransition(() => {
      router.refresh()
    })
  }

  // Handle change role (future implementation)
  const handleChangeRole = (userId: string, currentRole: UserRole) => {
    toast.info('Role management coming soon')
    // Future: Open role selection dialog and call updateUserRole
  }

  // Open delete dialog
  const openDeleteDialog = (
    userId: string,
    userName: string,
    userEmail: string,
    userRole: UserRole
  ) => {
    setDeleteTarget({ id: userId, name: userName, email: userEmail, role: userRole })
    setDeleteDialogOpen(true)
  }

  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="mt-2 text-muted-foreground">
          Create, manage, and delete user accounts
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UsersIcon}
          description="Registered accounts"
        />
        <StatsCard
          title="Admin Users"
          value={stats.adminCount}
          icon={Shield}
          description="Platform administrators"
        />
        <StatsCard
          title="Verified Users"
          value={stats.verifiedUsers}
          icon={CheckCircle2}
          description="Email confirmed"
        />
        <StatsCard
          title="This Month"
          value={stats.usersThisMonth}
          icon={UserPlus}
          description="New signups"
        />
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          {/* Search */}
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyFilters()
              }
            }}
            className="max-w-sm"
          />

          {/* Role filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="SELLER">Seller</SelectItem>
              <SelectItem value="BUYER">Buyer</SelectItem>
            </SelectContent>
          </Select>

          {/* Apply button */}
          <Button onClick={applyFilters} variant="secondary">
            Apply
          </Button>
        </div>

        {/* Create button */}
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
          Create User
        </Button>
      </div>

      {/* Users table */}
      <AdminUsersTable
        users={initialUsers}
        onDelete={openDeleteDialog}
        onChangeRole={handleChangeRole}
        isLoading={isPending}
        currentUserId={currentUserId}
      />

      {/* Pagination */}
      {initialPagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(initialPagination.page - 1) * initialPagination.limit + 1} to{' '}
            {Math.min(
              initialPagination.page * initialPagination.limit,
              initialPagination.total
            )}{' '}
            of {initialPagination.total} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set('page', String(initialPagination.page - 1))
                router.push(`/admin/users?${params.toString()}`)
              }}
              disabled={initialPagination.page === 1 || isPending}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString())
                params.set('page', String(initialPagination.page + 1))
                router.push(`/admin/users?${params.toString()}`)
              }}
              disabled={
                initialPagination.page === initialPagination.totalPages || isPending
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onConfirm={handleCreateUser}
      />

      {deleteTarget && (
        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          userName={deleteTarget.name}
          userEmail={deleteTarget.email}
          userRole={deleteTarget.role}
          onConfirm={handleDeleteUser}
        />
      )}
    </>
  )
}
