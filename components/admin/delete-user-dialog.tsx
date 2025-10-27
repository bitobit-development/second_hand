'use client'

import { useState } from 'react'
import { AlertTriangleIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserRole } from '@prisma/client'

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  userEmail: string
  userRole: UserRole
  onConfirm: () => Promise<void>
}

const CONFIRMATION_TEXT = 'DELETE'

export function DeleteUserDialog({
  open,
  onOpenChange,
  userName,
  userEmail,
  userRole,
  onConfirm,
}: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')

  const isConfirmationValid = confirmation === CONFIRMATION_TEXT

  const handleConfirm = async () => {
    if (!isConfirmationValid) {
      setError(`Please type "${CONFIRMATION_TEXT}" to confirm`)
      return
    }

    setLoading(true)
    setError('')
    try {
      await onConfirm()
      toast.success('User deleted successfully')
      onOpenChange(false)
      setConfirmation('')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete user'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      setConfirmation('')
      setError('')
    }
    onOpenChange(open)
  }

  const isAdminUser = userRole === 'ADMIN'

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangleIcon className="size-5 text-red-600 dark:text-red-500" aria-hidden="true" />
            </div>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete{' '}
            <span className="font-medium text-foreground">{userName}</span>{' '}
            ({userEmail}) and all associated data including listings, offers, and transactions.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isAdminUser && (
          <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-900/20">
            <div className="flex gap-3">
              <AlertTriangleIcon className="size-5 shrink-0 text-amber-600 dark:text-amber-500" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Warning: Deleting Admin User
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  This user has admin privileges. Make sure at least one other admin account exists before proceeding.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="delete-confirmation">
            Type <span className="font-mono font-semibold">{CONFIRMATION_TEXT}</span> to confirm{' '}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="delete-confirmation"
            type="text"
            placeholder={CONFIRMATION_TEXT}
            value={confirmation}
            onChange={(e) => {
              setConfirmation(e.target.value)
              setError('')
            }}
            disabled={loading}
            aria-invalid={!!error && !isConfirmationValid}
            aria-describedby="delete-confirmation-error"
            className="font-mono"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isConfirmationValid) {
                e.preventDefault()
                handleConfirm()
              }
            }}
          />
          {error && !isConfirmationValid && (
            <span id="delete-confirmation-error" className="text-xs text-destructive" role="alert">
              {error}
            </span>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || !isConfirmationValid}
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
