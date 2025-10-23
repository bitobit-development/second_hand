import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/'),
  redirect: jest.fn(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => {
  const MockImage = ({ src, alt, ...props }: any) => {
    // Return simple img element for testing
    return null // Simplified mock - just don't render
  }
  return {
    __esModule: true,
    default: MockImage,
  }
})

// Don't mock Next.js Link globally - let it work naturally in tests

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}
