'use client'

import { useState } from 'react'
import type { CategoryWithStats } from '@/app/admin/categories/actions'
import { CategoryRow } from './category-row'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type CategoryTreeProps = {
  categories: CategoryWithStats[]
}

type CategoryNodeProps = {
  category: CategoryWithStats
  allCategories: CategoryWithStats[]
  level?: number
}

const CategoryNode = ({ category, allCategories, level = 0 }: CategoryNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(level === 0)

  const children = allCategories.filter(c => c.parentId === category.id)
  const hasChildren = children.length > 0

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        {/* Expand/Collapse Button */}
        <div className="shrink-0 pt-4" style={{ marginLeft: `${level * 24}px` }}>
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <div className="w-6 h-6" />
          )}
        </div>

        {/* Category Row */}
        <div className="flex-1">
          <CategoryRow category={category} />
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-2">
          {children.map(child => (
            <CategoryNode
              key={child.id}
              category={child}
              allCategories={allCategories}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const CategoryTree = ({ categories }: CategoryTreeProps) => {
  // Get root categories (no parent)
  const rootCategories = categories.filter(c => !c.parentId)

  if (rootCategories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No root categories found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rootCategories.map(category => (
        <CategoryNode
          key={category.id}
          category={category}
          allCategories={categories}
        />
      ))}
    </div>
  )
}
