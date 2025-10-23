'use client'

import * as React from 'react'
import Link from 'next/link'
import { Package, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        'border-b bg-background/95 backdrop-blur',
        'supports-[backdrop-filter]:bg-background/80'
      )}
    >
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link
            href="/"
            className={cn(
              'flex items-center gap-2',
              'font-semibold text-lg transition-colors',
              'hover:text-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md'
            )}
            aria-label="Home"
          >
            <Package className="w-6 h-6 text-primary" aria-hidden="true" />
            <span className="hidden sm:inline">Second-Hand Market</span>
            <span className="sm:hidden">SHM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden sm:flex items-center gap-6"
            aria-label="Main navigation"
          >
            <Link
              href="/listings"
              className={cn(
                'text-sm font-medium transition-colors',
                'hover:text-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'
              )}
            >
              Browse
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                'text-sm font-medium transition-colors',
                'hover:text-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'
              )}
            >
              My Listings
            </Link>
            <Button
              asChild
              size="default"
              className={cn(
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90',
                'shadow-sm hover:shadow-md',
                'transition-all duration-200'
              )}
            >
              <Link href="/sell">
                <Plus className="w-4 h-4" aria-hidden="true" />
                Sell an Item
              </Link>
            </Button>
          </nav>

          {/* Mobile Navigation (Account Only) */}
          <div className="flex sm:hidden items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-sm font-medium"
            >
              <Link href="/dashboard">Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
