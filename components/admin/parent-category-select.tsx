'use client'

import { useEffect, useState } from 'react'
import { getCategories, type CategoryWithStats } from '@/app/admin/categories/actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import * as LucideIcons from 'lucide-react'

type ParentCategorySelectProps = {
  value: string | null | undefined
  onChange: (value: string | null) => void
  excludeId?: string
}

export const ParentCategorySelect = ({
  value,
  onChange,
  excludeId,
}: ParentCategorySelectProps) => {
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategories()
      if (result.success && result.data) {
        // Filter out the category being edited and its descendants
        const filtered = excludeId
          ? result.data.filter(c => c.id !== excludeId && c.parentId !== excludeId)
          : result.data
        setCategories(filtered)
      }
      setIsLoading(false)
    }
    loadCategories()
  }, [excludeId])

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select
      value={value || 'none'}
      onValueChange={(val) => onChange(val === 'none' ? null : val)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select parent category (optional)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-muted-foreground">None (Root Category)</span>
        </SelectItem>
        {categories.map((category) => {
          const IconComponent = (LucideIcons as any)[category.icon] as React.ComponentType<{ className?: string }>

          return (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className="w-4 h-4" />}
                <span>{category.name}</span>
                {!category.isActive && (
                  <span className="text-xs text-muted-foreground">(Inactive)</span>
                )}
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
