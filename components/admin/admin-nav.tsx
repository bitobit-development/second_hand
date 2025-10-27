'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, Users, BarChart, Menu, LogOut, FolderTree } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    label: 'Listings',
    href: '/admin/listings',
    icon: List,
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: FolderTree,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart,
    disabled: true,
  },
]

const handleLogout = async () => {
  await signOut({ callbackUrl: '/auth/login' })
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1" role="navigation" aria-label="Admin navigation">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => {
              if (item.disabled) {
                e.preventDefault()
                return
              }
              onNavigate?.()
            }}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isActive && !item.disabled
                ? 'bg-primary text-primary-foreground shadow-sm'
                : item.disabled
                ? 'text-muted-foreground/50 cursor-not-allowed'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
            aria-disabled={item.disabled}
            tabIndex={item.disabled ? -1 : 0}
          >
            <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
            {item.disabled && (
              <span className="ml-auto text-xs">(Soon)</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function LogoutButton({ className }: { className?: string }) {
  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className={cn(
        'w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive',
        className
      )}
      aria-label="Sign out"
    >
      <LogOut className="w-5 h-5" aria-hidden="true" />
      <span>Sign Out</span>
    </Button>
  )
}

export function AdminNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-background border-b flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          className="mr-2"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </Button>
        <h1 className="text-lg font-semibold">Admin</h1>
      </div>

      {/* Mobile Navigation Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="text-left">Admin Panel</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col h-full pt-6">
            <div className="flex-1 px-4">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </div>

            <Separator />

            <div className="p-4">
              <LogoutButton />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex w-60 flex-col border-r bg-background"
        role="complementary"
        aria-label="Admin sidebar"
      >
        {/* Logo/Title */}
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
          <NavLinks />
        </div>

        {/* Logout */}
        <div className="p-4 border-t">
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}
