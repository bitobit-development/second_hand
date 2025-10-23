'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  ariaLabel: string
  isSell?: boolean
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: <Home className="w-5 h-5" aria-hidden="true" />,
    ariaLabel: 'Home',
  },
  {
    href: '/listings',
    label: 'Browse',
    icon: <List className="w-5 h-5" aria-hidden="true" />,
    ariaLabel: 'Browse listings',
  },
  {
    href: '/sell',
    label: 'Sell',
    icon: <Plus className="w-6 h-6" aria-hidden="true" />,
    ariaLabel: 'Sell an item',
    isSell: true,
  },
  {
    href: '/dashboard',
    label: 'Account',
    icon: <User className="w-5 h-5" aria-hidden="true" />,
    ariaLabel: 'My account',
  },
]

export function MobileNav() {
  const pathname = usePathname()

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href) ?? false
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'sm:hidden',
        'bg-background/95 backdrop-blur',
        'border-t shadow-lg',
        'supports-[backdrop-filter]:bg-background/90'
      )}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-4 safe-area-inset-bottom">
        {navItems.map((item) => {
          const active = isActive(item.href)

          if (item.isSell) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center',
                  'min-w-[64px] min-h-[64px]',
                  'relative -top-4',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full'
                )}
                aria-label={item.ariaLabel}
              >
                <div
                  className={cn(
                    'flex items-center justify-center',
                    'w-14 h-14 rounded-full',
                    'bg-primary text-primary-foreground',
                    'shadow-lg hover:shadow-xl',
                    'transition-all duration-200',
                    'hover:scale-105 active:scale-95'
                  )}
                >
                  {item.icon}
                </div>
                <span className="sr-only">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1',
                'min-w-[64px] min-h-[44px] py-2',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.ariaLabel}
              aria-current={active ? 'page' : undefined}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
