'use client'

import React from 'react'
import { type LucideIcon, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface CategoryOption {
  id: string
  name: string
  description: string
  icon: LucideIcon
}

interface ManualCategoryGridProps {
  categories: CategoryOption[]
  selectedId?: string
  onSelect: (categoryId: string) => void
  defaultExpanded?: boolean
  className?: string
}

export const ManualCategoryGrid = ({
  categories,
  selectedId,
  onSelect,
  defaultExpanded = false,
  className
}: ManualCategoryGridProps) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categories

    const query = searchQuery.toLowerCase()
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query)
    )
  }, [categories, searchQuery])

  return (
    <div className={cn('space-y-4', className)}>
      <Separator className="my-6" />

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center justify-between w-full px-4 py-3 rounded-lg',
          'bg-muted/50 hover:bg-muted transition-colors',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
        aria-expanded={isExpanded}
        aria-controls="manual-category-section"
      >
        <span className="text-sm font-medium text-muted-foreground">
          Or browse all categories manually
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        )}
      </button>

      <div
        id="manual-category-section"
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!isExpanded}
      >
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search categories"
            />
          </div>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                No categories found matching &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCategories.map((category) => {
                const Icon = category.icon
                const isSelected = selectedId === category.id

                return (
                  <Card
                    key={category.id}
                    className={cn(
                      'cursor-pointer transition-all duration-200',
                      'hover:shadow-md hover:border-primary/20 hover:scale-[1.02]',
                      isSelected && 'ring-2 ring-primary ring-offset-2 bg-primary/5 border-primary/30'
                    )}
                    onClick={() => onSelect(category.id)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelect(category.id)
                      }
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200',
                            'bg-primary/10 text-primary',
                            isSelected && 'bg-primary/20 scale-110'
                          )}
                        >
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm leading-tight truncate">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
