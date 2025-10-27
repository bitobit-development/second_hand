'use client'

import { useState } from 'react'
import { UserRole } from '@prisma/client'
import {
  MoreHorizontal,
  Trash2,
  Shield,
  Mail,
  CheckCircle2,
  XCircle,
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
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UserRoleBadge } from './user-role-badge'
import { cn } from '@/lib/utils'

interface UserData {
  id: string
  name: string
  email: string
  role: UserRole
  emailVerified: Date | null
  createdAt: Date
  _count: {
    listings: number
    purchases: number
    sales: number
  }
}

interface AdminUsersTableProps {
  users: UserData[]
  onDelete: (userId: string, userName: string, userEmail: string, userRole: UserRole) => void
  onChangeRole: (userId: string, currentRole: UserRole) => void
  isLoading?: boolean
  currentUserId: string
}

export function AdminUsersTable({
  users,
  onDelete,
  onChangeRole,
  isLoading = false,
  currentUserId,
}: AdminUsersTableProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

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
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4">
          <Shield className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No users found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    )
  }

  const isCurrentUser = (userId: string) => userId === currentUserId

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Activity</TableHead>
            <TableHead className="hidden lg:table-cell">Joined</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isProcessing = processingIds.has(user.id)
            const isVerified = !!user.emailVerified
            const isSelf = isCurrentUser(user.id)

            return (
              <TableRow key={user.id} className={cn(isProcessing && 'opacity-50')}>
                {/* Avatar placeholder */}
                <TableCell>
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </TableCell>

                {/* User info */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      {isSelf && (
                        <span className="text-xs text-muted-foreground">(You)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" aria-hidden="true" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Role */}
                <TableCell>
                  <UserRoleBadge role={user.role} />
                </TableCell>

                {/* Verification status */}
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    {isVerified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        <span className="text-sm text-emerald-600 dark:text-emerald-400">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                        <span className="text-sm text-amber-600 dark:text-amber-400">Unverified</span>
                      </>
                    )}
                  </div>
                </TableCell>

                {/* Activity stats */}
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <span>{user._count.listings} listings</span>
                    <span>{user._count.purchases + user._count.sales} transactions</span>
                  </div>
                </TableCell>

                {/* Join date */}
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {formatRelativeTime(user.createdAt)}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isProcessing}
                        aria-label={`Actions for ${user.name}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {!isSelf && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onChangeRole(user.id, user.role)}
                            disabled={isProcessing}
                          >
                            <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(user.id, user.name, user.email, user.role)}
                            disabled={isProcessing}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                            Delete User
                          </DropdownMenuItem>
                        </>
                      )}

                      {isSelf && (
                        <DropdownMenuItem disabled className="text-muted-foreground">
                          Cannot modify own account
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
