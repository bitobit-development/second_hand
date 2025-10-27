import { ListingStatus } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ListingStatusBadgeProps {
  status: ListingStatus
}

const statusConfig = {
  PENDING: {
    label: 'Pending',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
  },
  APPROVED: {
    label: 'Approved',
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  },
  REJECTED: {
    label: 'Rejected',
    variant: 'destructive' as const,
    className: '',
  },
  PAUSED: {
    label: 'Paused',
    variant: 'secondary' as const,
    className: '',
  },
  SOLD: {
    label: 'Sold',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  },
} as const

export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className)}
    >
      {config.label}
    </Badge>
  )
}
