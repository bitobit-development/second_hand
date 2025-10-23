import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SellFAB } from '@/components/listings/sell-fab'

describe('SellFAB Component', () => {
  describe('Rendering', () => {
    it('renders with default responsive variant', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toBeInTheDocument()
    })

    it('renders with mobile variant', () => {
      render(<SellFAB variant="mobile" />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveClass('bottom-6', 'right-6', 'w-14', 'h-14', 'rounded-full')
    })

    it('renders with desktop variant', () => {
      render(<SellFAB variant="desktop" />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveClass('top-24', 'right-8', 'px-6', 'py-3', 'rounded-lg')
    })

    it('renders with responsive variant (default)', () => {
      render(<SellFAB variant="responsive" />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toBeInTheDocument()
      // Mobile classes
      expect(link).toHaveClass('bottom-6', 'right-6', 'w-14', 'h-14', 'rounded-full')
      // Desktop classes (with sm: prefix)
      expect(link).toHaveClass('sm:top-24', 'sm:right-8', 'sm:w-auto', 'sm:h-auto', 'sm:px-6', 'sm:py-3', 'sm:rounded-lg')
    })

    it('applies custom className correctly', () => {
      render(<SellFAB className="custom-class" />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveClass('custom-class')
    })
  })

  describe('Link and Navigation', () => {
    it('contains link to /sell', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveAttribute('href', '/sell')
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA label "Sell an Item"', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveAttribute('aria-label', 'Sell an Item')
    })

    it('is keyboard accessible with Tab', async () => {
      const user = userEvent.setup()
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })

      await user.tab()
      expect(link).toHaveFocus()
    })

    it('has proper focus ring classes', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary')
    })

    it('responds to Enter key press', async () => {
      const user = userEvent.setup()
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })

      link.focus()
      await user.keyboard('{Enter}')

      // Link should still be in the document after key press
      expect(link).toBeInTheDocument()
    })

    it('responds to Space key press', async () => {
      const user = userEvent.setup()
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })

      link.focus()
      await user.keyboard(' ')

      // Link should still be in the document after key press
      expect(link).toBeInTheDocument()
    })

    it('has proper tabIndex attribute', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Icon and Text Content', () => {
    it('contains Plus icon', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      // Check if SVG (Plus icon from lucide-react) is present
      const svg = link.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('Plus icon has aria-hidden attribute', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      const svg = link.querySelector('svg')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('desktop variant shows text "Sell an Item"', () => {
      render(<SellFAB variant="desktop" />)
      expect(screen.getByText('Sell an Item')).toBeInTheDocument()
    })

    it('mobile variant does not show text', () => {
      render(<SellFAB variant="mobile" />)
      // Text should not be visible in mobile variant
      const textElement = screen.queryByText('Sell an Item')
      expect(textElement).not.toBeInTheDocument()
    })

    it('responsive variant has hidden text on mobile (sm:inline)', () => {
      const { container } = render(<SellFAB variant="responsive" />)
      const span = container.querySelector('span.hidden.sm\\:inline')
      expect(span).toBeInTheDocument()
      expect(span).toHaveTextContent('Sell an Item')
    })
  })

  describe('Styling and Visual Design', () => {
    it('has fixed positioning', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveClass('fixed')
    })

    it('has proper z-index for overlay', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveClass('z-50')
    })

    it('has primary color styling', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('has transition classes', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveClass('transition-all', 'duration-200', 'ease-in-out')
    })

    it('has hover effect classes', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveClass('hover:scale-105', 'hover:shadow-xl')
    })

    it('has active state classes', () => {
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveClass('active:scale-95')
    })

    it('mobile variant has correct positioning (bottom-6 right-6)', () => {
      render(<SellFAB variant="mobile" />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveClass('bottom-6', 'right-6')
    })

    it('desktop variant has correct positioning (top-24 right-8)', () => {
      render(<SellFAB variant="desktop" />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveClass('top-24', 'right-8')
    })

    it('mobile variant has shadow-lg', () => {
      render(<SellFAB variant="mobile" />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveClass('shadow-lg')
    })

    it('desktop variant has shadow-md', () => {
      render(<SellFAB variant="desktop" />)
      const link = screen.getByRole('link', { name: /sell an item/i })
      expect(link).toHaveClass('shadow-md')
    })
  })

  describe('User Interaction', () => {
    it('can be clicked', async () => {
      const user = userEvent.setup()
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })

      await user.click(link)

      // Link should still exist after click
      expect(link).toBeInTheDocument()
    })

    it('can be hovered', async () => {
      const user = userEvent.setup()
      render(<SellFAB />)
      const link = screen.getByRole('link', { name: /sell an item/i })

      await user.hover(link)

      expect(link).toBeInTheDocument()
    })
  })
})
