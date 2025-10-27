'use client'

import { useState } from 'react'
import { CategoryFormDialog } from './category-form-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const CreateCategoryButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        Create Category
      </Button>

      <CategoryFormDialog
        mode="create"
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}
