/**
 * Listing Helper Functions
 * Utilities for working with listing data on the frontend
 */

/**
 * Convert Decimal string from backend to number for display
 * Handles null/undefined values safely
 */
export const deserializeDecimal = (value: string | null | undefined): number | null => {
  if (!value) return null
  const num = parseFloat(value)
  return isNaN(num) ? null : num
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago")
 * Uses Intl.RelativeTimeFormat for internationalization
 */
export const formatRelativeDate = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  // Define time intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  // Find the appropriate interval
  if (diffInSeconds < 60) {
    return 'Just now'
  }

  for (const [unit, seconds] of Object.entries(intervals)) {
    const diff = Math.floor(diffInSeconds / seconds)
    if (diff >= 1) {
      const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
      return formatter.format(-diff, unit as Intl.RelativeTimeFormatUnit)
    }
  }

  return 'Just now'
}

/**
 * Check if a listing was created within the last 24 hours
 * Used to show "NEW" badge on listing cards
 */
export const isNewListing = (createdAt: Date): boolean => {
  const now = new Date()
  const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
  return diffInHours <= 24
}

/**
 * Parse sort option from URL parameter
 * Returns default "newest" if invalid
 */
export const parseSortOption = (sortParam: string | undefined):
  'newest' | 'oldest' | 'price-low' | 'price-high' | 'most-viewed' => {
  const validSortOptions = ['newest', 'oldest', 'price-low', 'price-high', 'most-viewed']
  if (sortParam && validSortOptions.includes(sortParam)) {
    return sortParam as 'newest' | 'oldest' | 'price-low' | 'price-high' | 'most-viewed'
  }
  return 'newest'
}

/**
 * Parse number from URL parameter
 * Returns undefined if invalid or not provided
 */
export const parseNumberParam = (param: string | undefined): number | undefined => {
  if (!param) return undefined
  const num = parseFloat(param)
  return isNaN(num) || num < 0 ? undefined : num
}

/**
 * Build query string from filter params
 * Omits undefined/empty values
 */
export const buildQueryString = (params: Record<string, string | number | undefined>): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}
