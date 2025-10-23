'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { SearchBar } from './search-bar'

export const SearchBarClient = () => {
  const router = useRouter()

  const handleSearch = React.useCallback((query: string) => {
    if (query.trim()) {
      router.push(`/listings?q=${encodeURIComponent(query)}`)
    } else {
      router.push('/listings')
    }
  }, [router])

  return <SearchBar onSearch={handleSearch} placeholder="Search for items..." className="shadow-lg" />
}
