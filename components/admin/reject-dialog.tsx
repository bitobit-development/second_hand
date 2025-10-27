'use client'

import { useState } from 'react'
import { XCircleIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingTitle: string
  onConfirm: (reason: string) => Promise<void>
}

const MIN_REASON_LENGTH = 10
const MAX_REASON_LENGTH = 500

export function RejectDialog({
  open,
  onOpenChange,
  listingTitle,
  onConfirm,
}: RejectDialogProps) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const characterCount = reason.length
  const isValid = characterCount >= MIN_REASON_LENGTH && characterCount <= MAX_REASON_LENGTH

  const handleConfirm = async () => {
    if (!isValid) {
      setError(`Reason must be between ${MIN_REASON_LENGTH} and ${MAX_REASON_LENGTH} characters`)
      return
    }

    setLoading(true)
    setError('')
    try {
      await onConfirm(reason)
      toast.success('Listing rejected successfully')
      onOpenChange(false)
      setReason('')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to reject listing'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      setReason('')
      setError('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <XCircleIcon className="size-5 text-orange-600 dark:text-orange-500" aria-hidden="true" />
            </div>
            <DialogTitle>Reject Listing</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Rejecting{' '}
            <span className="font-medium text-foreground">{listingTitle}</span>.
            Please provide a reason that will be sent to the seller.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reason">
            Reason for rejection <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="Explain why this listing cannot be approved (e.g., inappropriate content, missing information, violates policy)..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              setError('')
            }}
            disabled={loading}
            aria-invalid={!!error}
            aria-describedby={error ? 'reason-error' : 'character-count'}
            className="min-h-24 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && isValid) {
                e.preventDefault()
                handleConfirm()
              }
            }}
          />
          <div className="flex items-center justify-between text-xs">
            {error ? (
              <span id="reason-error" className="text-destructive" role="alert">
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

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || !isValid}
            className="bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-600"
          >
            {loading ? 'Rejecting...' : 'Reject Listing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
