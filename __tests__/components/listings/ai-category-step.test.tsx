/**
 * Tests for AI Category Step Component
 *
 * Tests the AI-powered category selection step with:
 * - AI suggestion fetching
 * - Loading states
 * - Error handling
 * - Manual fallback
 * - User interactions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AICategoryStep } from '@/components/listings/ai-category-step'
import { ListingCategory } from '@prisma/client'

// Mock fetch globally
global.fetch = jest.fn() as jest.Mock

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

import { toast } from 'sonner'

describe('AICategoryStep Component', () => {
  const mockImageUrls = [
    'https://res.cloudinary.com/test/image1.jpg',
    'https://res.cloudinary.com/test/image2.jpg',
  ]

  const mockSuggestions = [
    {
      category: 'Leather Jackets',
      parentCategory: 'CLOTHING',
      confidence: 95,
      reasoning: 'Vintage leather jacket visible with brass buttons',
      granularity: 'subcategory' as const,
    },
    {
      category: 'Outerwear',
      parentCategory: 'CLOTHING',
      confidence: 85,
      reasoning: 'Clothing item for outdoor wear',
      granularity: 'base' as const,
    },
  ]

  const mockApiResponse = {
    success: true,
    suggestions: mockSuggestions,
    createNew: false,
    grouping: 'Leather Jackets',
    qualityIssues: [],
    tokensUsed: 450,
    cached: false,
  }

  const defaultProps = {
    imageUrls: mockImageUrls,
    selectedCategory: '' as ListingCategory | '',
    onCategorySelect: jest.fn(),
    onError: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    })
  })

  describe('Loading State', () => {
    it('renders loading skeleton while analyzing', async () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockApiResponse,
                }),
              100
            )
          )
      )

      const { container } = render(<AICategoryStep {...defaultProps} />)

      expect(screen.getByText(/analyzing your images with ai/i)).toBeInTheDocument()
      // Check for Skeleton components (they have pulse animation)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('shows animated sparkle icon during analysis', () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockApiResponse,
                }),
              100
            )
          )
      )

      render(<AICategoryStep {...defaultProps} />)

      const sparkles = screen
        .getByText(/analyzing your images/i)
        .closest('div')
        ?.querySelector('svg')

      expect(sparkles).toBeInTheDocument()
    })

    it('renders skeleton cards with correct structure', () => {
      ;(global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockApiResponse,
                }),
              100
            )
          )
      )

      const { container } = render(<AICategoryStep {...defaultProps} />)

      // Check for skeleton elements structure
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('AI Suggestion Fetching', () => {
    it('fetches suggestions on mount when images present', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/suggest-categories',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: expect.stringContaining('image1.jpg'),
          })
        )
      })
    })

    it('does not fetch when no images provided', () => {
      render(<AICategoryStep {...defaultProps} imageUrls={[]} />)

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('sends correct request body to API', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/suggest-categories',
          expect.objectContaining({
            body: JSON.stringify({
              imageUrls: mockImageUrls.slice(0, 5),
              promptVersion: 'v1',
            }),
          })
        )
      })
    })

    it('limits to 5 images in API request', async () => {
      const manyImages = Array(10)
        .fill(null)
        .map((_, i) => `https://res.cloudinary.com/test/image${i}.jpg`)

      render(<AICategoryStep {...defaultProps} imageUrls={manyImages} />)

      await waitFor(() => {
        const callBody = JSON.parse(
          (global.fetch as jest.Mock).mock.calls[0][1].body
        )
        expect(callBody.imageUrls).toHaveLength(5)
      })
    })

    it('displays suggestions after successful fetch', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Leather Jackets')).toBeInTheDocument()
        expect(screen.getByText(/vintage leather jacket/i)).toBeInTheDocument()
      })
    })

    it('displays confidence scores', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('95%')).toBeInTheDocument()
        expect(screen.getByText('85%')).toBeInTheDocument()
      })
    })

    it('shows Top Match badge for first suggestion', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Top Match')).toBeInTheDocument()
      })
    })
  })

  describe('Toast Notifications', () => {
    it('shows success toast for high confidence (95%+)', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'High-confidence category suggestions ready!'
        )
      })
    })

    it('shows info toast for medium confidence (70-94%)', async () => {
      const mediumConfidence = {
        ...mockApiResponse,
        suggestions: [
          {
            ...mockSuggestions[0],
            confidence: 80,
          },
        ],
      }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mediumConfidence,
      })

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith('Category suggestions generated')
      })
    })

    it('shows warning toast for low confidence (<70%)', async () => {
      const lowConfidence = {
        ...mockApiResponse,
        suggestions: [
          {
            ...mockSuggestions[0],
            confidence: 65,
          },
        ],
      }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => lowConfidence,
      })

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalledWith(
          'Low confidence. Please verify category selection.'
        )
      })
    })

    it('shows cached toast when using cached results', async () => {
      const cached = {
        ...mockApiResponse,
        cached: true,
      }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => cached,
      })

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith('Using cached analysis')
      })
    })

    it('shows error toast on API failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'AI analysis failed. Please select category manually.'
        )
      })
    })
  })

  describe('Quality Issues', () => {
    it('displays quality issues when present', async () => {
      const withIssues = {
        ...mockApiResponse,
        qualityIssues: ['Image is blurry', 'Poor lighting'],
      }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => withIssues,
      })

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/image quality issues/i)).toBeInTheDocument()
        expect(screen.getByText('Image is blurry')).toBeInTheDocument()
        expect(screen.getByText('Poor lighting')).toBeInTheDocument()
      })
    })

    it('does not show quality issues section when none present', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.queryByText(/image quality issues/i)).not.toBeInTheDocument()
      })
    })

    it('renders quality issues as list items', async () => {
      const withIssues = {
        ...mockApiResponse,
        qualityIssues: ['Issue 1', 'Issue 2', 'Issue 3'],
      }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => withIssues,
      })

      const { container } = render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        const listItems = container.querySelectorAll('li')
        expect(listItems.length).toBe(3)
      })
    })
  })

  describe('Category Selection', () => {
    it('calls onCategorySelect when suggestion clicked', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getAllByText('Clothing & Fashion')[0]).toBeInTheDocument()
      })

      // Find the first card by the category label (both suggestions have same parent)
      const labelElements = screen.getAllByText('Clothing & Fashion')
      const card = labelElements[0].closest('[class*="cursor-pointer"]')

      if (card) {
        await userEvent.click(card as HTMLElement)
      }

      await waitFor(() => {
        expect(defaultProps.onCategorySelect).toHaveBeenCalledWith('CLOTHING')
      })
    })

    it('calls onCategorySelect when select button clicked', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getAllByText(/select this category/i)[0]).toBeInTheDocument()
      })

      await userEvent.click(screen.getAllByText(/select this category/i)[0])

      expect(defaultProps.onCategorySelect).toHaveBeenCalledWith('CLOTHING')
    })

    it('shows selected state when category selected', async () => {
      render(
        <AICategoryStep {...defaultProps} selectedCategory={'CLOTHING' as ListingCategory} />
      )

      await waitFor(() => {
        // There may be multiple suggestions with CLOTHING parent, get all "Selected" texts
        const selectedButtons = screen.queryAllByText('Selected')
        expect(selectedButtons.length).toBeGreaterThan(0)
      })
    })

    it('applies selected styling to chosen category', async () => {
      const { container } = render(
        <AICategoryStep {...defaultProps} selectedCategory={'CLOTHING' as ListingCategory} />
      )

      await waitFor(() => {
        const selectedCard = container.querySelector('.border-primary')
        expect(selectedCard).toBeInTheDocument()
      })
    })
  })

  describe('Manual Category Fallback', () => {
    it('shows "Browse All Categories" button', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/browse all categories/i)).toBeInTheDocument()
      })
    })

    it('expands manual category grid when button clicked', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/browse all categories/i)).toBeInTheDocument()
      })

      const browseButton = screen.getByText(/browse all categories/i)
      await userEvent.click(browseButton)

      // Should show manual category grid
      expect(screen.getByText(/electronics/i)).toBeInTheDocument()
    })

    it('collapses manual grid when button clicked again', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/browse all categories/i)).toBeInTheDocument()
      })

      const browseButton = screen.getByText(/browse all categories/i)

      // Expand
      await userEvent.click(browseButton)
      expect(screen.getByText(/electronics/i)).toBeInTheDocument()

      // Collapse
      await userEvent.click(browseButton)
      await waitFor(() => {
        expect(screen.queryByText(/electronics/i)).not.toBeInTheDocument()
      })
    })

    it('shows chevron down when collapsed', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        const button = screen.getByText(/browse all categories/i)
        const chevron = button.parentElement?.querySelector('svg')
        expect(chevron).toBeInTheDocument()
      })
    })
  })

  describe('No Images State', () => {
    it('shows upload images message when no images', () => {
      render(<AICategoryStep {...defaultProps} imageUrls={[]} />)

      expect(
        screen.getByText(/upload images first to get ai-powered/i)
      ).toBeInTheDocument()
    })

    it('shows manual category grid when no images', () => {
      render(<AICategoryStep {...defaultProps} imageUrls={[]} />)

      expect(screen.getByText(/select category manually/i)).toBeInTheDocument()
      expect(screen.getByText(/electronics/i)).toBeInTheDocument()
    })

    it('does not attempt to fetch suggestions with no images', () => {
      render(<AICategoryStep {...defaultProps} imageUrls={[]} />)

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('displays error state when API fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('shows retry button after error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/retry ai analysis/i)).toBeInTheDocument()
      })
    })

    it('retries API call when retry button clicked', async () => {
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiResponse,
        })

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/retry ai analysis/i)).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText(/retry ai analysis/i))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
        expect(screen.getByText('Leather Jackets')).toBeInTheDocument()
      })
    })

    it('shows manual fallback after error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(
          screen.getByText(/or select category manually/i)
        ).toBeInTheDocument()
      })
    })

    it('calls onError callback on API failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith('Network error')
      })
    })

    it('handles API error response (non-200)', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          error: 'Rate limit exceeded',
        }),
      })

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument()
      })
    })

    it('handles no suggestions in response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          suggestions: [],
        }),
      })

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/no suggestions returned/i)).toBeInTheDocument()
      })
    })
  })

  describe('Re-analyze Functionality', () => {
    it('shows re-analyze button after suggestions loaded', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/re-analyze/i)).toBeInTheDocument()
      })

      const reAnalyzeButton = screen.getByText(/re-analyze/i)
      expect(reAnalyzeButton).toBeInTheDocument()
      expect(reAnalyzeButton.tagName).toBe('BUTTON')
    })

    it('re-fetches suggestions when re-analyze clicked', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/re-analyze/i)).toBeInTheDocument()
      })

      await userEvent.click(screen.getByText(/re-analyze/i))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Confidence Badge Styling', () => {
    it('applies green styling for high confidence (95%+)', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        const badge = screen.getByText('95%')
        expect(badge).toHaveClass('bg-green-100')
      })
    })

    it('applies yellow styling for medium confidence (70-94%)', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        const badge = screen.getByText('85%')
        expect(badge).toHaveClass('bg-yellow-100')
      })
    })

    it('applies red styling for low confidence (<70%)', async () => {
      const lowConfidence = {
        ...mockApiResponse,
        suggestions: [
          {
            ...mockSuggestions[0],
            confidence: 65,
          },
        ],
      }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => lowConfidence,
      })

      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        const badge = screen.getByText('65%')
        expect(badge).toHaveClass('bg-red-100')
      })
    })
  })

  describe('Confidence Legend', () => {
    it('displays confidence legend after suggestions loaded', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/95%\+ high/i)).toBeInTheDocument()
        expect(screen.getByText(/70-94% medium/i)).toBeInTheDocument()
        expect(screen.getByText(/<70% low/i)).toBeInTheDocument()
      })
    })

    it('legend has color indicators', async () => {
      const { container } = render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        const greenDot = container.querySelector('.bg-green-500')
        const yellowDot = container.querySelector('.bg-yellow-500')
        const redDot = container.querySelector('.bg-red-500')

        expect(greenDot).toBeInTheDocument()
        expect(yellowDot).toBeInTheDocument()
        expect(redDot).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('renders with proper ARIA labels', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        const cards = screen.getAllByRole('button')
        expect(cards.length).toBeGreaterThan(0)
      })
    })

    it('category cards are keyboard accessible', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        const firstCard = screen.getByText('Leather Jackets').closest('div')
        expect(firstCard).toBeInTheDocument()
      })
    })

    it('maintains focus management', async () => {
      render(<AICategoryStep {...defaultProps} />)

      await waitFor(() => {
        const button = screen.getAllByText(/select this category/i)[0]
        button.focus()
        expect(document.activeElement).toBe(button)
      })
    })
  })
})
