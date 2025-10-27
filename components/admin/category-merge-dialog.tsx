'use client'

import { useState, useEffect } from 'react'
import { mergeCategories, getCategories, type CategoryWithStats } from '@/app/admin/categories/actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, GitMerge, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import * as LucideIcons from 'lucide-react'

type CategoryMergeDialogProps = {
  sourceCategory: CategoryWithStats
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CategoryMergeDialog = ({
  sourceCategory,
  open,
  onOpenChange,
}: CategoryMergeDialogProps) => {
  const router = useRouter()
  const [targetCategoryId, setTargetCategoryId] = useState<string>('')
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategories()
      if (result.success && result.data) {
        // Filter out the source category and its children
        const filtered = result.data.filter(
          c => c.id !== sourceCategory.id && c.parentId !== sourceCategory.id
        )
        setCategories(filtered)
      }
      setIsLoading(false)
    }

    if (open) {
      loadCategories()
    }
  }, [open, sourceCategory.id])

  const handleMerge = async () => {
    if (!targetCategoryId) {
      toast.error('Please select a target category')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await mergeCategories(sourceCategory.id, targetCategoryId)
      if (result.success) {
        toast.success(`Successfully merged ${result.data?.itemsMoved || 0} items`)
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to merge categories')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const targetCategory = categories.find(c => c.id === targetCategoryId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="w-5 h-5" />
            Merge Category
          </DialogTitle>
          <DialogDescription>
            Move all items and subcategories from <strong>{sourceCategory.name}</strong> to another category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Source Category Info */}
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Source Category:</p>
                <div className="flex items-center justify-between text-sm">
                  <span>{sourceCategory.name}</span>
                  <div className="flex gap-4 text-muted-foreground">
                    <span>{sourceCategory.itemCount} items</span>
                    <span>{sourceCategory.children.length} subcategories</span>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Target Category Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Category</label>
            <Select
              value={targetCategoryId}
              onValueChange={setTargetCategoryId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? 'Loading...' : 'Select target category'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const IconComponent = (LucideIcons as any)[category.icon] as React.ComponentType<{ className?: string }>

                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                        <span>{category.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({category.itemCount} items)
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {targetCategory && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">After merge:</p>
                  <ul className="text-sm space-y-1">
                    <li>
                      • <strong>{targetCategory.name}</strong> will have{' '}
                      {targetCategory.itemCount + sourceCategory.itemCount} items
                    </li>
                    <li>
                      • <strong>{sourceCategory.name}</strong> will be deactivated
                    </li>
                    {sourceCategory.children.length > 0 && (
                      <li>
                        • {sourceCategory.children.length} subcategories will be moved
                      </li>
                    )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Warning */}
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              This action cannot be undone. The source category will be deactivated after merging.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMerge}
            disabled={!targetCategoryId || isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Merge Categories
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
