import { Suspense } from 'react'
import { requireAdmin } from '@/lib/auth-helpers'
import { UserManagementClient } from './user-management-client'
import { getAdminUsers, getAdminUserStatistics } from './actions'
import { Skeleton } from '@/components/ui/skeleton'

interface PageProps {
  searchParams: Promise<{
    role?: string
    search?: string
    page?: string
  }>
}

export const metadata = {
  title: 'User Management | Admin',
  description: 'Manage platform users',
}

async function UserManagementContent({ searchParams }: PageProps) {
  const user = await requireAdmin()
  const params = await searchParams

  const [usersData, stats] = await Promise.all([
    getAdminUsers({
      role: params.role as any,
      search: params.search,
      page: params.page ? parseInt(params.page) : 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
    getAdminUserStatistics(),
  ])

  return (
    <UserManagementClient
      initialUsers={usersData.users}
      initialPagination={usersData.pagination}
      stats={stats}
      currentUserId={(user as any).id}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}

export default async function AdminUsersPage(props: PageProps) {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <UserManagementContent {...props} />
      </Suspense>
    </div>
  )
}
