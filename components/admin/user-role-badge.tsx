import { UserRole } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, ShoppingCart, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserRoleBadgeProps {
  role: UserRole
  className?: string
}

const roleConfig = {
  ADMIN: {
    label: 'Admin',
    variant: 'default' as const,
    icon: ShieldCheck,
    className: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40',
  },
  SELLER: {
    label: 'Seller',
    variant: 'default' as const,
    icon: Store,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/40',
  },
  BUYER: {
    label: 'Buyer',
    variant: 'default' as const,
    icon: ShoppingCart,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700',
  },
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const config = roleConfig[role]
  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, 'gap-1', className)}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{config.label}</span>
    </Badge>
  )
}
