'use client'

import { useState } from 'react'
import type { CategoryWithStats } from '@/app/admin/categories/actions'
import { toggleCategoryStatus, deleteCategory } from '@/app/admin/categories/actions'
import { CategoryFormDialog } from './category-form-dialog'
import { CategoryMergeDialog } from './category-merge-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { MoreHorizontal, Edit, Power, GitMerge, Trash2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import * as LucideIcons from 'lucide-react'

type CategoryRowProps = {
  category: CategoryWithStats
}

export const CategoryRow = ({ category }: CategoryRowProps) => {
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const IconComponent = (LucideIcons as any)[category.icon] as React.ComponentType<{ className?: string }>

  const handleToggleStatus = async () => {
    setIsLoading(true)
    try {
      const result = await toggleCategoryStatus(category.id)
      if (result.success) {
        toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'}`)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to toggle status')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const result = await deleteCategory(category.id)
      if (result.success) {
        toast.success('Category deleted')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete category')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        {/* Icon */}
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
          {IconComponent && <IconComponent className="w-5 h-5" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{category.name}</h3>
            {!category.isActive && (
              <Badge variant="secondary" className="text-xs">
                Inactive
              </Badge>
            )}
            {category.aiGenerated && (
              <Badge variant="outline" className="text-xs gap-1">
                <Sparkles className="w-3 h-3" />
                AI
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="truncate">{category.description}</span>
            {category.parent && (
              <span className="text-xs">
                in <span className="font-medium">{category.parent.name}</span>
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm shrink-0">
          <div className="text-center">
            <div className="font-semibold">{category.itemCount}</div>
            <div className="text-xs text-muted-foreground">Items</div>
          </div>
          {category.children.length > 0 && (
            <div className="text-center">
              <div className="font-semibold">{category.children.length}</div>
              <div className="text-xs text-muted-foreground">Subcategories</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isLoading}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleStatus}>
              <Power className="w-4 h-4 mr-2" />
              {category.isActive ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsMergeDialogOpen(true)}>
              <GitMerge className="w-4 h-4 mr-2" />
              Merge
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive focus:text-destructive"
              disabled={category.itemCount > 0 || category.children.length > 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Dialog */}
      <CategoryFormDialog
        mode="edit"
        category={category}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      {/* Merge Dialog */}
      <CategoryMergeDialog
        sourceCategory={category}
        open={isMergeDialogOpen}
        onOpenChange={setIsMergeDialogOpen}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{category.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
