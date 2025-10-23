'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchBar } from './search-bar'

export const SearchBarWrapper = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const handleSearch = React.useCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }

    // Reset cursor when search changes
    params.delete('cursor')

    const queryString = params.toString()
    const newUrl = queryString ? `/listings?${queryString}` : '/listings'
    router.push(newUrl, { scroll: false })
  }, [router, searchParams])

  return (
    <div className="mb-6">
      <SearchBar
        onSearch={handleSearch}
        defaultValue={initialQuery}
        className="max-w-2xl"
      />
    </div>
  )
}
