'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const CategoryFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams?.get('search') || '')
  const [isActive, setIsActive] = useState(searchParams?.get('isActive') || 'all')
  const [aiGenerated, setAiGenerated] = useState(searchParams?.get('aiGenerated') || 'all')

  const updateFilters = () => {
    const params = new URLSearchParams()

    if (search) params.set('search', search)
    if (isActive !== 'all') params.set('isActive', isActive)
    if (aiGenerated !== 'all') params.set('aiGenerated', aiGenerated)

    const queryString = params.toString()
    router.push(queryString ? `/admin/categories?${queryString}` : '/admin/categories')
  }

  useEffect(() => {
    const debounce = setTimeout(updateFilters, 300)
    return () => clearTimeout(debounce)
  }, [search, isActive, aiGenerated])

  const hasActiveFilters = search || isActive !== 'all' || aiGenerated !== 'all'

  const clearFilters = () => {
    setSearch('')
    setIsActive('all')
    setAiGenerated('all')
    router.push('/admin/categories')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select value={isActive} onValueChange={setIsActive}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="true">Active Only</SelectItem>
          <SelectItem value="false">Inactive Only</SelectItem>
        </SelectContent>
      </Select>

      {/* AI Generated Filter */}
      <Select value={aiGenerated} onValueChange={setAiGenerated}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="true">AI Generated</SelectItem>
          <SelectItem value="false">Manual</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearFilters}
          className="shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
