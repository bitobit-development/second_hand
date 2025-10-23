import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import SellPage, { metadata } from '@/app/sell/page'

// Mock the auth module
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}))

// Mock Next.js redirect - it should throw to stop execution (like the real redirect does)
jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`)
  }),
}))

describe('Sell Route', () => {
  beforeEach(() => {
    // Clear all mocks before each test - this is critical for isolated tests
    jest.clearAllMocks()
  })

  describe('Metadata', () => {
    it('has correct title', () => {
      expect(metadata.title).toBe('Sell Your Item')
    })

    it('has correct description', () => {
      expect(metadata.description).toBe('List your items for sale on our marketplace')
    })
  })

  describe('Authentication and Redirects', () => {
    it('redirects authenticated user to /listings/create', async () => {
      // Mock authenticated session
      const mockSession = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
      }
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(mockSession as any)

      // Call the page component - it should throw due to redirect
      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT: /listings/create')

      // Verify auth was called
      expect(auth).toHaveBeenCalledTimes(1)

      // Verify redirect was called with correct URL
      expect(redirect).toHaveBeenCalledWith('/listings/create')
      expect(redirect).toHaveBeenCalledTimes(1)
    })

    it('redirects unauthenticated user to login with callback URL', async () => {
      // Mock unauthenticated session (null)
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(null)

      // Call the page component - it should throw due to redirect
      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT: /auth/login?callbackUrl=/listings/create')

      // Verify auth was called
      expect(auth).toHaveBeenCalledTimes(1)

      // Verify redirect was called with login URL and callback
      expect(redirect).toHaveBeenCalledWith('/auth/login?callbackUrl=/listings/create')
      expect(redirect).toHaveBeenCalledTimes(1)
    })

    it('redirects when session exists but user is undefined', async () => {
      // Mock session without user
      const mockSession = {
        user: undefined,
      }
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(mockSession as any)

      // Call the page component - should throw redirect
      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT')

      // Should redirect to login since no user
      expect(redirect).toHaveBeenCalledWith('/auth/login?callbackUrl=/listings/create')
    })

    it('redirects when session user is null', async () => {
      // Mock session with null user
      const mockSession = {
        user: null,
      }
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(mockSession as any)

      // Call the page component - should throw redirect
      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT')

      // Should redirect to login since user is null
      expect(redirect).toHaveBeenCalledWith('/auth/login?callbackUrl=/listings/create')
    })
  })

  describe('Session Handling', () => {
    it('handles authenticated user with minimal session data', async () => {
      // Mock session with minimal user data
      const mockSession = {
        user: {
          id: '123',
        },
      }
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(mockSession as any)

      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT')

      // Should redirect to create listing
      expect(redirect).toHaveBeenCalledWith('/listings/create')
    })

    it('handles authenticated user with full session data', async () => {
      // Mock session with complete user data
      const mockSession = {
        user: {
          id: 'user456',
          email: 'seller@example.com',
          name: 'Seller User',
          image: 'https://example.com/avatar.jpg',
        },
        expires: '2025-12-31',
      }
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(mockSession as any)

      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT')

      // Should redirect to create listing
      expect(redirect).toHaveBeenCalledWith('/listings/create')
    })
  })

  describe('Error Handling', () => {
    it('handles auth function throwing an error', async () => {
      // Mock auth throwing an error
      ;(auth as jest.MockedFunction<typeof auth>).mockRejectedValue(new Error('Auth failed'))

      // Should throw the error
      await expect(SellPage()).rejects.toThrow('Auth failed')

      // Redirect should not be called
      expect(redirect).not.toHaveBeenCalled()
    })

    it('handles auth returning undefined', async () => {
      // Mock auth returning undefined
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(undefined as any)

      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT')

      // Should redirect to login
      expect(redirect).toHaveBeenCalledWith('/auth/login?callbackUrl=/listings/create')
    })
  })

  describe('URL Construction', () => {
    it('constructs correct callback URL for unauthenticated users', async () => {
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(null)

      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT')

      const redirectCall = (redirect as jest.MockedFunction<typeof redirect>).mock.calls[0][0]
      expect(redirectCall).toContain('/auth/login')
      expect(redirectCall).toContain('callbackUrl=/listings/create')
      expect(redirectCall).toBe('/auth/login?callbackUrl=/listings/create')
    })

    it('uses correct direct URL for authenticated users', async () => {
      const mockSession = { user: { id: '123' } }
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(mockSession as any)

      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT')

      const redirectCall = (redirect as jest.MockedFunction<typeof redirect>).mock.calls[0][0]
      expect(redirectCall).toBe('/listings/create')
    })
  })

  describe('Page Behavior', () => {
    it('always redirects, never renders content', async () => {
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(null)

      // Call the component - should throw redirect
      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT')

      // The function throws before returning any JSX
      expect(redirect).toHaveBeenCalled()
    })

    it('calls auth exactly once per page load', async () => {
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(null)

      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT')

      expect(auth).toHaveBeenCalledTimes(1)
    })

    it('calls redirect exactly once per page load', async () => {
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(null)

      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT')

      expect(redirect).toHaveBeenCalledTimes(1)
    })
  })

  describe('Integration with Auth Flow', () => {
    it('simulates complete authenticated flow', async () => {
      // User is logged in
      const mockSession = {
        user: {
          id: 'user789',
          email: 'authenticated@example.com',
          name: 'Authenticated User',
        },
      }
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(mockSession as any)

      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT')

      // Verify correct authentication check
      expect(auth).toHaveBeenCalled()
      // Verify direct redirect to listing creation
      expect(redirect).toHaveBeenCalledWith('/listings/create')
      // Should not redirect to login
      expect(redirect).not.toHaveBeenCalledWith(expect.stringContaining('/auth/login'))
    })

    it('simulates complete unauthenticated flow', async () => {
      // User is not logged in
      ;(auth as jest.MockedFunction<typeof auth>).mockResolvedValue(null)

      await expect(SellPage()).rejects.toThrow('NEXT_REDIRECT')

      // Verify authentication check
      expect(auth).toHaveBeenCalled()
      // Verify redirect to login with callback
      expect(redirect).toHaveBeenCalledWith('/auth/login?callbackUrl=/listings/create')
      // Should not redirect to listing create
      expect(redirect).not.toHaveBeenCalledWith('/listings/create')
    })
  })
})
