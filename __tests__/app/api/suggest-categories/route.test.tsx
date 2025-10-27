/**
 * Tests for /api/suggest-categories API Endpoint
 *
 * Tests AI-powered category suggestion API with:
 * - Authentication
 * - Request validation
 * - Rate limiting
 * - Caching
 * - Error handling
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { POST, GET } from '@/app/api/suggest-categories/route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/ai/category-suggester', () => ({
  suggestCategories: jest.fn(),
}))

jest.mock('@/lib/ai/middleware', () => ({
  withRateLimit: jest.fn((req, limiter, handler) => handler()),
}))

jest.mock('@/lib/ai/limiters', () => ({
  categorySuggestionLimiter: {},
}))

jest.mock('@/lib/ai/category-cache', () => ({
  getCachedCategorySuggestion: jest.fn(),
  setCachedCategorySuggestion: jest.fn(),
  getCategoryCacheMetrics: jest.fn(() => ({
    size: 5,
    hits: 10,
    misses: 5,
    hitRate: 0.67,
  })),
}))

// Import mocked modules
import { suggestCategories } from '@/lib/ai/category-suggester'
import { withRateLimit } from '@/lib/ai/middleware'
import {
  getCachedCategorySuggestion,
  setCachedCategorySuggestion,
} from '@/lib/ai/category-cache'

describe('POST /api/suggest-categories', () => {
  // Mock data
  const mockSuggestion = {
    category: 'Leather Jackets',
    parentCategory: 'CLOTHING',
    confidence: 95,
    reasoning: 'Vintage leather jacket visible with brass buttons',
    granularity: 'subcategory' as const,
  }

  const mockResult = {
    suggestions: [mockSuggestion],
    createNew: false,
    grouping: 'Leather Jackets',
    qualityIssues: [],
    tokensUsed: 450,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(suggestCategories as jest.Mock).mockResolvedValue({
      suggestions: [mockSuggestion],
      createNew: false,
      grouping: 'Leather Jackets',
      qualityIssues: [],
    })
    ;(getCachedCategorySuggestion as jest.Mock).mockReturnValue(null)
    ;(withRateLimit as jest.Mock).mockImplementation((req, limiter, handler) =>
      handler()
    )
  })

  describe('Request Validation', () => {
    it('returns success for valid request', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
          promptVersion: 'v1',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.suggestions).toHaveLength(1)
      expect(data.suggestions[0].category).toBe('Leather Jackets')
    })

    it('validates image URLs are required', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: [],
          promptVersion: 'v1',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('At least one image is required')
    })

    it('validates maximum 5 images', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: Array(6).fill('https://res.cloudinary.com/test/image.jpg'),
          promptVersion: 'v1',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Maximum 5 images allowed')
    })

    it('validates image URLs are valid URLs', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['not-a-url'],
          promptVersion: 'v1',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid image URL')
    })

    it('validates context length (max 500 chars)', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
          context: 'A'.repeat(501),
          promptVersion: 'v1',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Context must be less than 500 characters')
    })

    it('validates prompt version is valid enum', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
          promptVersion: 'v99',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('returns 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: 'invalid-json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Invalid JSON')
    })

    it('returns 400 for missing body', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('Rate Limiting', () => {
    it('calls rate limiter middleware', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
        }),
      })

      await POST(request)

      expect(withRateLimit).toHaveBeenCalled()
    })

    it('returns 429 when rate limit exceeded', async () => {
      ;(withRateLimit as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve(
          Response.json(
            {
              success: false,
              error: 'Rate limit exceeded',
              code: 'RATE_LIMIT',
            },
            { status: 429 }
          )
        )
      )

      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
    })
  })

  describe('Caching', () => {
    it('returns cached result when available', async () => {
      ;(getCachedCategorySuggestion as jest.Mock).mockReturnValueOnce(mockResult)

      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.cached).toBe(true)
      expect(data.suggestions[0].category).toBe('Leather Jackets')
      expect(suggestCategories).not.toHaveBeenCalled()
    })

    it('caches new results after API call', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
        }),
      })

      await POST(request)

      expect(setCachedCategorySuggestion).toHaveBeenCalledWith(
        'https://res.cloudinary.com/test/image.jpg',
        expect.objectContaining({
          suggestions: expect.any(Array),
          createNew: false,
          grouping: 'Leather Jackets',
        })
      )
    })

    it('uses first image URL as cache key', async () => {
      const imageUrls = [
        'https://res.cloudinary.com/test/image1.jpg',
        'https://res.cloudinary.com/test/image2.jpg',
      ]

      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({ imageUrls }),
      })

      await POST(request)

      expect(getCachedCategorySuggestion).toHaveBeenCalledWith(imageUrls[0])
      expect(setCachedCategorySuggestion).toHaveBeenCalledWith(
        imageUrls[0],
        expect.any(Object)
      )
    })
  })

  describe('AI Category Suggestion', () => {
    it('calls suggestCategories with correct parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
          promptVersion: 'v2',
        }),
      })

      await POST(request)

      expect(suggestCategories).toHaveBeenCalledWith({
        images: ['https://res.cloudinary.com/test/image.jpg'],
        promptVersion: 'v2',
        includeFewShot: false,
        maxTokens: 300,
        temperature: 0.2,
      })
    })

    it('uses only first 2 images for cost optimization', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: [
            'https://res.cloudinary.com/test/image1.jpg',
            'https://res.cloudinary.com/test/image2.jpg',
            'https://res.cloudinary.com/test/image3.jpg',
          ],
        }),
      })

      await POST(request)

      expect(suggestCategories).toHaveBeenCalledWith(
        expect.objectContaining({
          images: expect.arrayContaining([
            'https://res.cloudinary.com/test/image1.jpg',
            'https://res.cloudinary.com/test/image2.jpg',
          ]),
        })
      )

      const callArgs = (suggestCategories as jest.Mock).mock.calls[0][0]
      expect(callArgs.images).toHaveLength(2)
    })

    it('returns quality issues when present', async () => {
      ;(suggestCategories as jest.Mock).mockResolvedValueOnce({
        suggestions: [mockSuggestion],
        createNew: false,
        grouping: 'Leather Jackets',
        qualityIssues: ['Image is blurry', 'Poor lighting'],
      })

      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.qualityIssues).toEqual(['Image is blurry', 'Poor lighting'])
    })

    it('estimates token usage correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: [
            'https://res.cloudinary.com/test/image1.jpg',
            'https://res.cloudinary.com/test/image2.jpg',
          ],
          promptVersion: 'v1',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.tokensUsed).toBeGreaterThan(0)
      // 2 images * 65 tokens + v1 prompt (450) + response (150) = ~730 tokens
      expect(data.tokensUsed).toBeCloseTo(730, -1) // Within 10 tokens
    })

    it('defaults to v1 prompt version', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
        }),
      })

      await POST(request)

      expect(suggestCategories).toHaveBeenCalledWith(
        expect.objectContaining({
          promptVersion: 'v1',
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('handles AI errors gracefully', async () => {
      const aiError = {
        code: 'INVALID_IMAGE',
        message: 'Image quality too low',
      }
      ;(suggestCategories as jest.Mock).mockRejectedValueOnce(aiError)

      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('handles OpenAI API errors', async () => {
      const openAiError = {
        code: 'OPENAI_ERROR',
        message: 'OpenAI API error',
      }
      ;(suggestCategories as jest.Mock).mockRejectedValueOnce(openAiError)

      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('handles timeout errors', async () => {
      const timeoutError = {
        code: 'TIMEOUT',
        message: 'Request timeout',
      }
      ;(suggestCategories as jest.Mock).mockRejectedValueOnce(timeoutError)

      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('handles unexpected errors gracefully', async () => {
      ;(suggestCategories as jest.Mock).mockRejectedValueOnce(
        new Error('Unexpected error')
      )

      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toContain('unexpected error')
    })
  })

  describe('Response Format', () => {
    it('returns correct success response structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toMatchObject({
        success: true,
        suggestions: expect.any(Array),
        createNew: expect.any(Boolean),
        grouping: expect.any(String),
        tokensUsed: expect.any(Number),
        cached: expect.any(Boolean),
      })
    })

    it('includes quality issues when present', async () => {
      ;(suggestCategories as jest.Mock).mockResolvedValueOnce({
        suggestions: [mockSuggestion],
        createNew: false,
        grouping: 'Leather Jackets',
        qualityIssues: ['Blurry image'],
      })

      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: ['https://res.cloudinary.com/test/image.jpg'],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.qualityIssues).toEqual(['Blurry image'])
    })

    it('returns error response structure on failure', async () => {
      const request = new NextRequest('http://localhost:3000/api/suggest-categories', {
        method: 'POST',
        body: JSON.stringify({
          imageUrls: [],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data).toMatchObject({
        success: false,
        error: expect.any(String),
        code: expect.any(String),
      })
    })
  })
})

describe('GET /api/suggest-categories', () => {
  it('returns cache metrics', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.metrics).toMatchObject({
      size: expect.any(Number),
      hits: expect.any(Number),
      misses: expect.any(Number),
      hitRate: expect.any(Number),
    })
  })

  it('returns correct metric values', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.metrics.size).toBe(5)
    expect(data.metrics.hits).toBe(10)
    expect(data.metrics.misses).toBe(5)
    expect(data.metrics.hitRate).toBe(0.67)
  })
})
