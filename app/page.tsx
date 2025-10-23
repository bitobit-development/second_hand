import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import { SearchBarClient } from '@/components/listings/search-bar-client'
import { ListingCard } from '@/components/listings/listing-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants/categories'
import { getListings } from './listings/actions'
import { deserializeDecimal } from '@/lib/helpers/listing-helpers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buy & Sell Pre-Owned Items | South Africa\'s Marketplace',
  description: 'Discover amazing deals on quality pre-owned items across South Africa. Browse thousands of listings from electronics to furniture. List your items for free.',
  openGraph: {
    title: 'Buy & Sell Pre-Owned Items | South Africa\'s Marketplace',
    description: 'Discover quality pre-owned items across South Africa',
  },
}


export default async function HomePage() {
  // Fetch all approved listings
  const { listings: allListings } = await getListings({ limit: 100, sortBy: "newest" })

  // Category background gradients - each category gets a unique Sky Blue shade
  const categoryBackgrounds: Record<typeof CATEGORIES[number]['value'], string> = {
    ELECTRONICS: 'bg-gradient-to-br from-sky-100 to-cyan-50',
    CLOTHING: 'bg-gradient-to-br from-blue-100 to-indigo-50',
    HOME_GARDEN: 'bg-gradient-to-br from-blue-50 to-sky-50',
    SPORTS: 'bg-gradient-to-br from-sky-200 to-cyan-100',
    BOOKS: 'bg-gradient-to-br from-slate-100 to-blue-50',
    TOYS: 'bg-gradient-to-br from-blue-100 to-violet-50',
    VEHICLES: 'bg-gradient-to-br from-cyan-100 to-slate-50',
    COLLECTIBLES: 'bg-gradient-to-br from-indigo-100 to-purple-50',
    BABY_KIDS: 'bg-gradient-to-br from-sky-50 to-blue-50',
    PET_SUPPLIES: 'bg-gradient-to-br from-teal-100 to-cyan-50',
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Sky Blue Theme */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="container px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            {/* Heading */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Browse. Find. Buy.
              <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mt-2">
                Sell Your Pre-Owned Items
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              South Africa's trusted marketplace for quality second-hand goods
            </p>

            {/* Search Bar */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <div className="w-full sm:max-w-lg">
                <SearchBarClient />
              </div>
            </div>

            {/* Desktop CTA */}
            <div className="mt-6 hidden sm:block">
              <Button
                asChild
                size="lg"
                className={cn(
                  'bg-gradient-to-r from-primary to-primary/90',
                  'text-primary-foreground font-semibold',
                  'shadow-lg hover:shadow-xl',
                  'hover:scale-105 transition-all duration-200',
                  'px-8'
                )}
              >
                <Link href="/sell">
                  <Plus className="w-5 h-5" aria-hidden="true" />
                  Start Selling Today
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative blur circles - Sky Blue */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl"
          aria-hidden="true"
        />
      </section>

      {/* Categories Section - Sky Blue Accents */}
      <section
        className="container px-4 py-10 sm:px-6 lg:px-8 sm:py-12"
        aria-labelledby="categories-heading"
      >
        <h2 id="categories-heading" className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">
          Browse by Category
        </h2>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((category) => (
            <Link
              key={category.value}
              href={`/listings?category=${category.value}`}
              className={cn(
                'group block',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl'
              )}
            >
              <Card
                className={cn(
                  'h-full transition-all duration-200',
                  'hover:shadow-lg hover:scale-[1.03]',
                  'hover:border-primary/60 hover:brightness-105',
                  'cursor-pointer border-border/50',
                  categoryBackgrounds[category.value]
                )}
              >
                <CardContent className="flex flex-col items-center justify-center p-5 text-center min-h-[110px]">
                  <div
                    className={cn(
                      'mb-3',
                      'transition-all duration-300',
                      'group-hover:scale-110 group-hover:rotate-6',
                      'text-muted-foreground group-hover:text-primary'
                    )}
                    aria-hidden="true"
                  >
                    <category.icon className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={1.5} />
                  </div>
                  <h3 className={cn(
                    'font-semibold text-xs sm:text-sm',
                    'transition-colors duration-200',
                    'group-hover:text-primary'
                  )}>
                    {category.label}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Listings - Primary Section */}
      <section
        className="bg-muted/30 border-y"
        aria-labelledby="listings-heading"
      >
        <div className="container px-4 py-10 sm:px-6 lg:px-8 sm:py-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 id="listings-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
                Latest Listings
              </h2>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                {allListings.length} items available
              </p>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex">
              <Link href="/listings">
                All Filters
                <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {allListings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={deserializeDecimal(listing.price) ?? undefined}
                pricingType={listing.pricingType}
                condition={listing.condition}
                primaryImage={listing.primaryImage}
                city={listing.city}
                createdAt={listing.createdAt}
              />
            ))}
          </div>

          {/* Mobile Advanced Filters Button */}
          <div className="mt-8 flex justify-center sm:hidden">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/listings">
                View with Filters
                <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
