'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type TimeRange = '7d' | '30d' | '90d' | 'all'

interface DateRangeSelectorProps {
  defaultValue?: TimeRange
  onValueChange?: (value: TimeRange) => void
  className?: string
}

/**
 * DateRangeSelector Component
 *
 * Tab-based selector for filtering data by time range
 *
 * Features:
 * - Four time range options: 7d, 30d, 90d, All
 * - URL sync with searchParams
 * - Controlled or uncontrolled mode
 * - Keyboard accessible
 *
 * Accessibility:
 * - ARIA labels for screen readers
 * - Keyboard navigation (arrow keys)
 * - Focus indicators
 * - Role="tablist" with proper ARIA attributes
 */
export function DateRangeSelector({
  defaultValue = '30d',
  onValueChange,
  className,
}: DateRangeSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRange, setSelectedRange] = useState<TimeRange>(
    (searchParams.get('range') as TimeRange) || defaultValue
  )

  // Sync state with URL changes
  useEffect(() => {
    const rangeFromUrl = searchParams.get('range') as TimeRange
    if (rangeFromUrl && rangeFromUrl !== selectedRange) {
      setSelectedRange(rangeFromUrl)
    }
  }, [searchParams, selectedRange])

  const handleValueChange = (value: string) => {
    const timeRange = value as TimeRange
    setSelectedRange(timeRange)

    // Update URL with new range
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', timeRange)

    // Check if URL actually changed before pushing
    const newUrl = `?${params.toString()}`
    const currentUrl = window.location.search
    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false })
    }

    // Call optional callback
    onValueChange?.(timeRange)
  }

  return (
    <Tabs
      value={selectedRange}
      onValueChange={handleValueChange}
      className={className}
      aria-label="Select time range for data display"
    >
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger
          value="7d"
          className="text-xs sm:text-sm"
          aria-label="Last 7 days"
        >
          7 Days
        </TabsTrigger>
        <TabsTrigger
          value="30d"
          className="text-xs sm:text-sm"
          aria-label="Last 30 days"
        >
          30 Days
        </TabsTrigger>
        <TabsTrigger
          value="90d"
          className="text-xs sm:text-sm"
          aria-label="Last 90 days"
        >
          90 Days
        </TabsTrigger>
        <TabsTrigger
          value="all"
          className="text-xs sm:text-sm"
          aria-label="All time"
        >
          All Time
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
