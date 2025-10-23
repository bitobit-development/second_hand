import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import HomePage, { metadata } from '@/app/page'
import { getListings } from '@/app/listings/actions'

// Mock the getListings server action
jest.mock('@/app/listings/actions', () => ({
  getListings: jest.fn(),
}))

// Mock SearchBarClient component
jest.mock('@/components/listings/search-bar-client', () => ({
  SearchBarClient: () => null,
}))

// Mock ListingCard component
jest.mock('@/components/listings/listing-card', () => ({
  ListingCard: () => null,
}))

// Mock SellFAB component
jest.mock('@/components/listings/sell-fab', () => ({
  SellFAB: () => null,
}))

describe('Homepage', () => {
  const mockListings = [
    {
      id: '1',
      title: 'iPhone 13 Pro',
      price: { toJSON: () => '12999' },
      pricingType: 'FIXED',
      condition: 'LIKE_NEW',
      primaryImage: 'https://example.com/iphone.jpg',
      city: 'Cape Town',
      createdAt: new Date('2025-10-20'),
    },
    {
      id: '2',
      title: 'Samsung Galaxy S21',
      price: { toJSON: () => '8999' },
      pricingType: 'FIXED',
      condition: 'GOOD',
      primaryImage: 'https://example.com/samsung.jpg',
      city: 'Johannesburg',
      createdAt: new Date('2025-10-19'),
    },
    {
      id: '3',
      title: 'MacBook Air M1',
      price: { toJSON: () => '15999' },
      pricingType: 'OFFERS',
      condition: 'NEW',
      primaryImage: 'https://example.com/macbook.jpg',
      city: 'Durban',
      createdAt: new Date('2025-10-18'),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getListings as jest.MockedFunction<typeof getListings>).mockResolvedValue({
      listings: mockListings as any,
      hasMore: false,
      nextCursor: null,
    })
  })

  describe('Metadata', () => {
    it('has correct title', () => {
      expect(metadata.title).toBe("Buy & Sell Pre-Owned Items | South Africa's Marketplace")
    })

    it('has correct description', () => {
      expect(metadata.description).toContain('Discover amazing deals')
      expect(metadata.description).toContain('South Africa')
    })

    it('has Open Graph metadata', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.title).toBe("Buy & Sell Pre-Owned Items | South Africa's Marketplace")
      expect(metadata.openGraph?.description).toContain('South Africa')
    })
  })

  describe('Data Fetching', () => {
    it('fetches listings on page load', async () => {
      await HomePage()

      expect(getListings).toHaveBeenCalledTimes(1)
    })

    it('calls getListings with correct limit', async () => {
      await HomePage()

      expect(getListings).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100,
        })
      )
    })

    it('calls getListings with correct sortBy', async () => {
      await HomePage()

      expect(getListings).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'newest',
        })
      )
    })

    it('calls getListings with both limit and sortBy', async () => {
      await HomePage()

      expect(getListings).toHaveBeenCalledWith({
        limit: 100,
        sortBy: 'newest',
      })
    })
  })

  describe('Page Component', () => {
    it('executes without errors', async () => {
      await expect(HomePage()).resolves.toBeDefined()
    })

    it('returns JSX element', async () => {
      const result = await HomePage()
      expect(result).toBeDefined()
      expect(result).not.toBeNull()
    })

    it('handles successful data fetching', async () => {
      const result = await HomePage()

      // Verify getListings was called
      expect(getListings).toHaveBeenCalled()
      // Verify page component returns
      expect(result).toBeDefined()
    })
  })

  describe('Empty Listings State', () => {
    it('handles empty listings array', async () => {
      ;(getListings as jest.MockedFunction<typeof getListings>).mockResolvedValue({
        listings: [],
        hasMore: false,
        nextCursor: null,
      })

      const result = await HomePage()

      expect(result).toBeDefined()
      expect(getListings).toHaveBeenCalled()
    })

    it('does not crash with no listings', async () => {
      ;(getListings as jest.MockedFunction<typeof getListings>).mockResolvedValue({
        listings: [],
        hasMore: false,
        nextCursor: null,
      })

      await expect(HomePage()).resolves.toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('handles getListings throwing an error', async () => {
      ;(getListings as jest.MockedFunction<typeof getListings>).mockRejectedValue(
        new Error('Database error')
      )

      await expect(HomePage()).rejects.toThrow('Database error')
    })

    it('handles getListings returning malformed data', async () => {
      ;(getListings as jest.MockedFunction<typeof getListings>).mockResolvedValue({
        listings: null as any,
        hasMore: false,
        nextCursor: null,
      })

      // Should handle gracefully or throw
      try {
        await HomePage()
      } catch (error) {
        // Expected if validation fails
        expect(error).toBeDefined()
      }
    })
  })

  describe('Data Transformation', () => {
    it('receives listings data from getListings', async () => {
      await HomePage()

      const mockCall = (getListings as jest.MockedFunction<typeof getListings>).mock.calls[0]
      expect(mockCall).toBeDefined()
      expect(mockCall[0]).toEqual({
        limit: 100,
        sortBy: 'newest',
      })
    })

    it('processes multiple listings', async () => {
      const manyListings = Array.from({ length: 50 }, (_, i) => ({
        id: `listing-${i}`,
        title: `Item ${i}`,
        price: { toJSON: () => String(1000 + i) },
        pricingType: 'FIXED' as const,
        condition: 'GOOD' as const,
        primaryImage: `https://example.com/item${i}.jpg`,
        city: 'Cape Town',
        createdAt: new Date(),
      }))

      ;(getListings as jest.MockedFunction<typeof getListings>).mockResolvedValue({
        listings: manyListings as any,
        hasMore: true,
        nextCursor: 'cursor-50',
      })

      const result = await HomePage()
      expect(result).toBeDefined()
      expect(getListings).toHaveBeenCalled()
    })
  })

  describe('SEO and Performance', () => {
    it('includes relevant keywords in metadata', () => {
      expect(metadata.description).toContain('pre-owned')
      expect(metadata.description).toContain('South Africa')
      expect(metadata.description).toContain('listings')
    })

    it('has descriptive page title', () => {
      expect(metadata.title).toContain('Buy & Sell')
      expect(metadata.title).toContain('Marketplace')
    })

    it('has SEO-friendly title structure', () => {
      // Title should include key value propositions
      const title = metadata.title as string
      expect(title).toMatch(/buy|sell/i)
      expect(title).toMatch(/south africa/i)
    })
  })

  describe('Component Integration', () => {
    it('page executes with all mocked components', async () => {
      const result = await HomePage()

      // Verify the page component executes successfully
      expect(result).toBeDefined()

      // Verify data fetching occurred
      expect(getListings).toHaveBeenCalledWith({
        limit: 100,
        sortBy: 'newest',
      })
    })
  })

  describe('Pagination and Limits', () => {
    it('requests correct number of listings (100)', async () => {
      await HomePage()

      expect(getListings).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100,
        })
      )
    })

    it('sorts by newest by default', async () => {
      await HomePage()

      expect(getListings).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'newest',
        })
      )
    })
  })
})
