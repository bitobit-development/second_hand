'use client'

import { useState } from 'react'
import { CheckCircleIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ApproveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingTitle: string
  onConfirm: () => Promise<void>
}

export function ApproveDialog({
  open,
  onOpenChange,
  listingTitle,
  onConfirm,
}: ApproveDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      toast.success('Listing approved successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to approve listing'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircleIcon className="size-5 text-green-600 dark:text-green-500" aria-hidden="true" />
            </div>
            <AlertDialogTitle>Approve Listing</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            Are you sure you want to approve the listing{' '}
            <span className="font-medium text-foreground">{listingTitle}</span>?
            This will make it visible to all users on the marketplace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 focus-visible:ring-green-600"
          >
            {loading ? 'Approving...' : 'Approve'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
