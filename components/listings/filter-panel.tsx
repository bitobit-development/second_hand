'use client'

import * as React from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { CATEGORIES, CONDITIONS, SA_PROVINCES, formatZAR } from '@/lib/constants/categories'
import type { ListingCategory, ListingCondition, PricingType } from '@/lib/generated/prisma'

export interface FilterState {
  categories: ListingCategory[]
  conditions: ListingCondition[]
  pricingTypes: PricingType[]
  minPrice?: number
  maxPrice?: number
  province?: string
}

export interface FilterPanelProps {
  filters: FilterState
  onFiltersChange?: (filters: FilterState) => void
  className?: string
}

const FilterContent = ({
  filters,
  onFiltersChange,
}: {
  filters: FilterState
  onFiltersChange?: (filters: FilterState) => void
}) => {
  const handleCategoryToggle = (category: ListingCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    onFiltersChange?.({ ...filters, categories: newCategories })
  }

  const handleConditionToggle = (condition: ListingCondition) => {
    const newConditions = filters.conditions.includes(condition)
      ? filters.conditions.filter((c) => c !== condition)
      : [...filters.conditions, condition]
    onFiltersChange?.({ ...filters, conditions: newConditions })
  }

  const handlePricingTypeToggle = (type: PricingType) => {
    const newTypes = filters.pricingTypes.includes(type)
      ? filters.pricingTypes.filter((t) => t !== type)
      : [...filters.pricingTypes, type]
    onFiltersChange?.({ ...filters, pricingTypes: newTypes })
  }

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const numValue = value ? parseFloat(value) : undefined
    onFiltersChange?.({ ...filters, [field]: numValue })
  }

  const handleProvinceChange = (province: string) => {
    onFiltersChange?.({ ...filters, province: province === 'all' ? undefined : province })
  }

  const handleClearFilters = () => {
    onFiltersChange?.({
      categories: [],
      conditions: [],
      pricingTypes: [],
      minPrice: undefined,
      maxPrice: undefined,
      province: undefined,
    })
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.conditions.length > 0 ||
    filters.pricingTypes.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.province !== undefined

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filters.categories.length + filters.conditions.length + filters.pricingTypes.length} filters active
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-primary hover:text-primary/90"
            aria-label="Clear all filters"
          >
            <X className="w-4 h-4 mr-1" aria-hidden="true" />
            Clear All
          </Button>
        </div>
      )}

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Category</Label>
        <div className="space-y-2.5">
          {CATEGORIES.map((category) => (
            <div key={category.value} className="flex items-start space-x-3">
              <Checkbox
                id={`category-${category.value}`}
                checked={filters.categories.includes(category.value)}
                onCheckedChange={() => handleCategoryToggle(category.value)}
                aria-label={`Filter by ${category.label}`}
              />
              <div className="grid gap-1 leading-none flex-1">
                <label
                  htmlFor={`category-${category.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center"
                >
                  <category.icon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {category.label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Condition Filter */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Condition</Label>
        <div className="space-y-2.5">
          {CONDITIONS.map((condition) => (
            <div key={condition.value} className="flex items-start space-x-3">
              <Checkbox
                id={`condition-${condition.value}`}
                checked={filters.conditions.includes(condition.value)}
                onCheckedChange={() => handleConditionToggle(condition.value)}
                aria-label={`Filter by ${condition.label} condition`}
              />
              <div className="grid gap-1 leading-none flex-1">
                <label
                  htmlFor={`condition-${condition.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {condition.label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Pricing Type Filter */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Pricing Type</Label>
        <div className="space-y-2.5">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="pricing-FIXED"
              checked={filters.pricingTypes.includes('FIXED')}
              onCheckedChange={() => handlePricingTypeToggle('FIXED')}
              aria-label="Show fixed price listings"
            />
            <div className="grid gap-1 leading-none flex-1">
              <label
                htmlFor="pricing-FIXED"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Fixed Price
              </label>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="pricing-OFFERS"
              checked={filters.pricingTypes.includes('OFFERS')}
              onCheckedChange={() => handlePricingTypeToggle('OFFERS')}
              aria-label="Show listings accepting offers"
            />
            <div className="grid gap-1 leading-none flex-1">
              <label
                htmlFor="pricing-OFFERS"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Accepts Offers
              </label>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Price Range</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="min-price" className="text-sm text-muted-foreground">
              Min (ZAR)
            </Label>
            <Input
              id="min-price"
              type="number"
              min="0"
              placeholder="Min"
              value={filters.minPrice ?? ''}
              onChange={(e) => handlePriceChange('minPrice', e.target.value)}
              aria-label="Minimum price"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-price" className="text-sm text-muted-foreground">
              Max (ZAR)
            </Label>
            <Input
              id="max-price"
              type="number"
              min="0"
              placeholder="Max"
              value={filters.maxPrice ?? ''}
              onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
              aria-label="Maximum price"
            />
          </div>
        </div>
        {filters.minPrice !== undefined && filters.maxPrice !== undefined && (
          <p className="text-xs text-muted-foreground">
            {formatZAR(filters.minPrice)} - {formatZAR(filters.maxPrice)}
          </p>
        )}
      </div>

      <Separator />

      {/* Province Filter */}
      <div className="space-y-3">
        <Label htmlFor="province" className="text-base font-semibold">
          Province
        </Label>
        <Select
          value={filters.province ?? 'all'}
          onValueChange={handleProvinceChange}
        >
          <SelectTrigger id="province" aria-label="Select province">
            <SelectValue placeholder="All Provinces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Provinces</SelectItem>
            {SA_PROVINCES.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export const FilterPanel = ({ filters, onFiltersChange, className }: FilterPanelProps) => {
  return (
    <>
      {/* Mobile: Sheet Drawer */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="w-full sm:w-auto"
              aria-label="Open filter menu"
            >
              <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
              Filters
              {(filters.categories.length + filters.conditions.length + filters.pricingTypes.length > 0) && (
                <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                  {filters.categories.length + filters.conditions.length + filters.pricingTypes.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-[380px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Sidebar */}
      <aside
        className={cn(
          'hidden lg:block w-80 shrink-0',
          'border-r border-border/50 pr-6',
          className
        )}
        aria-label="Filter sidebar"
      >
        <div className="sticky top-6">
          <h2 className="text-xl font-semibold mb-6">Filters</h2>
          <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
        </div>
      </aside>
    </>
  )
}
