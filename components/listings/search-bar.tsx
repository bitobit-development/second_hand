'use client'

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SearchBarProps {
  placeholder?: string
  defaultValue?: string
  onSearch?: (query: string) => void
  debounceMs?: number
  className?: string
}

export const SearchBar = ({
  placeholder = 'Search for items...',
  defaultValue = '',
  onSearch,
  debounceMs = 300,
  className,
}: SearchBarProps) => {
  const [value, setValue] = React.useState(defaultValue)
  const [isFocused, setIsFocused] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const isFirstRender = React.useRef(true)

  // Debounced search handler
  React.useEffect(() => {
    // Skip calling onSearch on the initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      onSearch?.(value)
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, onSearch, debounceMs])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleClear = () => {
    setValue('')
    onSearch?.('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear()
      e.currentTarget.blur()
    }
  }

  return (
    <div
      className={cn(
        'relative w-full transition-all duration-200',
        className
      )}
    >
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <Search
          className={cn(
            'w-5 h-5 transition-colors duration-200',
            isFocused && 'text-primary'
          )}
          aria-hidden="true"
        />
      </div>

      {/* Input Field */}
      <Input
        type="search"
        role="searchbox"
        aria-label="Search listings"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'pl-10 pr-10 h-12 text-base',
          'bg-background/50 backdrop-blur-sm',
          'border-border/50 focus:border-primary/50',
          'placeholder:text-muted-foreground/60',
          'transition-all duration-200',
          // Mobile optimizations
          'sm:h-11 sm:text-sm'
        )}
      />

      {/* Clear Button */}
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleClear}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClear()
            }
          }}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'text-muted-foreground hover:text-foreground',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0'
          )}
          aria-label="Clear search"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}
