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
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingTitle: string
  onConfirm: (reason: string) => Promise<void>
}

const MIN_REASON_LENGTH = 10
const MAX_REASON_LENGTH = 500
const CONFIRMATION_TEXT = 'DELETE'

export function DeleteDialog({
  open,
  onOpenChange,
  listingTitle,
  onConfirm,
}: DeleteDialogProps) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')

  const characterCount = reason.length
  const isReasonValid = characterCount >= MIN_REASON_LENGTH && characterCount <= MAX_REASON_LENGTH
  const isConfirmationValid = confirmation === CONFIRMATION_TEXT
  const isFormValid = isReasonValid && isConfirmationValid

  const handleConfirm = async () => {
    if (!isReasonValid) {
      setError(`Reason must be between ${MIN_REASON_LENGTH} and ${MAX_REASON_LENGTH} characters`)
      return
    }

    if (!isConfirmationValid) {
      setError(`Please type "${CONFIRMATION_TEXT}" to confirm`)
      return
    }

    setLoading(true)
    setError('')
    try {
      await onConfirm(reason)
      toast.success('Listing permanently deleted')
      onOpenChange(false)
      setReason('')
      setConfirmation('')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete listing'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      setReason('')
      setConfirmation('')
      setError('')
    }
    onOpenChange(open)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangleIcon className="size-5 text-red-600 dark:text-red-500" aria-hidden="true" />
            </div>
            <AlertDialogTitle>Permanently Delete Listing</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete{' '}
            <span className="font-medium text-foreground">{listingTitle}</span>{' '}
            and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delete-reason">
              Reason for deletion <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="delete-reason"
              placeholder="Explain why this listing must be permanently deleted (e.g., fraudulent content, severe policy violation, legal concerns)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError('')
              }}
              disabled={loading}
              aria-invalid={!!error && !isReasonValid}
              aria-describedby="delete-reason-error character-count"
              className="min-h-24 resize-none"
            />
            <div className="flex items-center justify-between text-xs">
              {error && !isReasonValid ? (
                <span id="delete-reason-error" className="text-destructive" role="alert">
                  {error}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Minimum {MIN_REASON_LENGTH} characters
                </span>
              )}
              <span
                id="character-count"
                className={
                  characterCount > MAX_REASON_LENGTH
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }
                aria-live="polite"
              >
                {characterCount}/{MAX_REASON_LENGTH}
              </span>
            </div>
          </div>

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
                if (e.key === 'Enter' && isFormValid) {
                  e.preventDefault()
                  handleConfirm()
                }
              }}
            />
            {error && !isConfirmationValid && isReasonValid && (
              <span id="delete-confirmation-error" className="text-xs text-destructive" role="alert">
                {error}
              </span>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || !isFormValid}
          >
            {loading ? 'Deleting...' : 'Permanently Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
