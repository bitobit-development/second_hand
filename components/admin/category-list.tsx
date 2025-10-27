'use client'

import { useState } from 'react'
import type { CategoryWithStats } from '@/app/admin/categories/actions'
import { CategoryRow } from './category-row'
import { CategoryTree } from './category-tree'
import { Button } from '@/components/ui/button'
import { LayoutList, Network } from 'lucide-react'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'tree'

type CategoryListProps = {
  categories: CategoryWithStats[]
}

export const CategoryList = ({ categories }: CategoryListProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No categories found. Create your first category to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {categories.length} {categories.length === 1 ? 'category' : 'categories'}
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={cn(
              'gap-2',
              viewMode === 'list' && 'shadow-sm'
            )}
          >
            <LayoutList className="w-4 h-4" />
            List View
          </Button>
          <Button
            variant={viewMode === 'tree' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('tree')}
            className={cn(
              'gap-2',
              viewMode === 'tree' && 'shadow-sm'
            )}
          >
            <Network className="w-4 h-4" />
            Tree View
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="space-y-2">
          {categories.map(category => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <CategoryTree categories={categories} />
      )}
    </div>
  )
}
