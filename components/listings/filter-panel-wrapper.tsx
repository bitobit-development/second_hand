'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FilterPanel, type FilterState } from './filter-panel'
import type { ListingCategory, ListingCondition, PricingType } from '@/lib/generated/prisma'

export const FilterPanelWrapper = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filter state from URL parameters
  const initialFilters = React.useMemo((): FilterState => {
    const categories = searchParams.get('category')
      ?.split(',')
      .filter((c): c is ListingCategory => !!c) ?? []

    const conditions = searchParams.get('condition')
      ?.split(',')
      .filter((c): c is ListingCondition => !!c) ?? []

    const pricingTypes = searchParams.get('pricingType')
      ?.split(',')
      .filter((t): t is PricingType => !!t) ?? []

    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const province = searchParams.get('province')

    return {
      categories,
      conditions,
      pricingTypes,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      province: province ?? undefined,
    }
  }, [searchParams])

  const [filters, setFilters] = React.useState<FilterState>(initialFilters)

  // Update URL when filters change
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    // Update filter params
    if (filters.categories.length > 0) {
      params.set('category', filters.categories.join(','))
    } else {
      params.delete('category')
    }

    if (filters.conditions.length > 0) {
      params.set('condition', filters.conditions.join(','))
    } else {
      params.delete('condition')
    }

    if (filters.pricingTypes.length > 0) {
      params.set('pricingType', filters.pricingTypes.join(','))
    } else {
      params.delete('pricingType')
    }

    if (filters.minPrice !== undefined) {
      params.set('minPrice', filters.minPrice.toString())
    } else {
      params.delete('minPrice')
    }

    if (filters.maxPrice !== undefined) {
      params.set('maxPrice', filters.maxPrice.toString())
    } else {
      params.delete('maxPrice')
    }

    if (filters.province) {
      params.set('province', filters.province)
    } else {
      params.delete('province')
    }

    // Reset cursor when filters change
    params.delete('cursor')

    // Update URL without page reload
    const queryString = params.toString()
    const newUrl = queryString ? `/listings?${queryString}` : '/listings'
    router.push(newUrl, { scroll: false })
  }, [filters, router, searchParams])

  const handleFiltersChange = React.useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  return <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
}
