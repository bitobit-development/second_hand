'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, ChevronsUpDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'

// Mock data type (will be replaced with actual API call when Category table exists)
type Category = {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  parentId: string | null
  isActive: boolean
  aiGenerated: boolean
  itemCount: number
  parent?: {
    name: string
  }
}

type CategorySelectorProps = {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  showAISuggestions?: boolean
  aiSuggestedCategories?: string[]
  recentCategories?: string[]
  disabled?: boolean
}

/**
 * Reusable Category Selector Component
 *
 * Features:
 * - Search functionality
 * - Hierarchy navigation (breadcrumbs)
 * - Recently used categories
 * - Popular categories
 * - AI suggestions integration (props for future connection)
 *
 * This component is designed to eventually replace the fixed enum selector
 * in the listing creation flow (Phase 4).
 *
 * TODO: Replace mock data with actual API call when Category migration is complete
 */
export const CategorySelector = ({
  value,
  onChange,
  placeholder = 'Select category...',
  showAISuggestions = false,
  aiSuggestedCategories = [],
  recentCategories = [],
  disabled = false,
}: CategorySelectorProps) => {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // TODO: Replace with actual API call to fetch categories
  // Example: const { data } = await getCategories({ isActive: true })
  useEffect(() => {
    // Mock data for development
    const mockCategories: Category[] = [
      {
        id: '1',
        name: 'Electronics',
        slug: 'electronics',
        icon: 'Smartphone',
        description: 'Phones, computers, gaming',
        parentId: null,
        isActive: true,
        aiGenerated: false,
        itemCount: 245,
      },
      {
        id: '2',
        name: 'Smartphones',
        slug: 'smartphones',
        icon: 'Smartphone',
        description: 'Mobile phones',
        parentId: '1',
        isActive: true,
        aiGenerated: false,
        itemCount: 120,
        parent: { name: 'Electronics' }
      },
      {
        id: '3',
        name: 'Clothing',
        slug: 'clothing',
        icon: 'Shirt',
        description: 'Apparel and fashion',
        parentId: null,
        isActive: true,
        aiGenerated: false,
        itemCount: 180,
      },
      {
        id: '4',
        name: 'Home & Garden',
        slug: 'home-garden',
        icon: 'Home',
        description: 'Furniture and decor',
        parentId: null,
        isActive: true,
        aiGenerated: false,
        itemCount: 95,
      },
    ]

    // Simulate API delay
    setTimeout(() => {
      setCategories(mockCategories)
      setIsLoading(false)
    }, 300)
  }, [])

  const selectedCategory = categories.find(c => c.id === value)

  // Group categories
  const aiSuggested = categories.filter(c => aiSuggestedCategories.includes(c.id))
  const recent = categories.filter(c => recentCategories.includes(c.id))
  const popular = categories.filter(c => c.itemCount > 100).slice(0, 5)
  const rootCategories = categories.filter(c => !c.parentId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : selectedCategory ? (
            <div className="flex items-center gap-2">
              {(() => {
                const IconComponent = (LucideIcons as any)[selectedCategory.icon] as React.ComponentType<{ className?: string }>
                return IconComponent ? <IconComponent className="w-4 h-4" /> : null
              })()}
              <span>{selectedCategory.name}</span>
              {selectedCategory.parent && (
                <span className="text-xs text-muted-foreground">
                  in {selectedCategory.parent.name}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <ScrollArea className="h-[400px]">
            <CommandList>
              {/* AI Suggestions */}
              {showAISuggestions && aiSuggested.length > 0 && (
                <>
                  <CommandGroup heading="AI Suggestions">
                    {aiSuggested.map((category) => {
                      const IconComponent = (LucideIcons as any)[category.icon] as React.ComponentType<{ className?: string }>

                      return (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          onSelect={() => {
                            onChange(category.id)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              value === category.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            {IconComponent && <IconComponent className="w-4 h-4" />}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span>{category.name}</span>
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  AI
                                </Badge>
                              </div>
                              {category.parent && (
                                <div className="text-xs text-muted-foreground">
                                  in {category.parent.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Recent Categories */}
              {recent.length > 0 && (
                <>
                  <CommandGroup heading="Recently Used">
                    {recent.map((category) => {
                      const IconComponent = (LucideIcons as any)[category.icon] as React.ComponentType<{ className?: string }>

                      return (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          onSelect={() => {
                            onChange(category.id)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              value === category.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            {IconComponent && <IconComponent className="w-4 h-4" />}
                            <div className="flex-1">
                              <span>{category.name}</span>
                              {category.parent && (
                                <div className="text-xs text-muted-foreground">
                                  in {category.parent.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Popular Categories */}
              {popular.length > 0 && (
                <>
                  <CommandGroup heading="Popular">
                    {popular.map((category) => {
                      const IconComponent = (LucideIcons as any)[category.icon] as React.ComponentType<{ className?: string }>

                      return (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          onSelect={() => {
                            onChange(category.id)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              value === category.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            {IconComponent && <IconComponent className="w-4 h-4" />}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span>{category.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {category.itemCount} items
                                </span>
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* All Categories */}
              <CommandGroup heading="All Categories">
                {rootCategories.map((category) => {
                  const IconComponent = (LucideIcons as any)[category.icon] as React.ComponentType<{ className?: string }>
                  const subcategories = categories.filter(c => c.parentId === category.id)

                  return (
                    <div key={category.id}>
                      <CommandItem
                        value={category.name}
                        onSelect={() => {
                          onChange(category.id)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            value === category.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="w-4 h-4" />}
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </CommandItem>

                      {/* Subcategories */}
                      {subcategories.map((sub) => {
                        const SubIconComponent = (LucideIcons as any)[sub.icon] as React.ComponentType<{ className?: string }>

                        return (
                          <CommandItem
                            key={sub.id}
                            value={sub.name}
                            onSelect={() => {
                              onChange(sub.id)
                              setOpen(false)
                            }}
                            className="pl-8"
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                value === sub.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex items-center gap-2">
                              {SubIconComponent && <SubIconComponent className="w-4 h-4" />}
                              <span>{sub.name}</span>
                            </div>
                          </CommandItem>
                        )
                      })}
                    </div>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
