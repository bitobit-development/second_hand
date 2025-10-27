'use client'

import { cn } from '@/lib/utils'

type GuideSpotlightProps = {
  active: boolean
  children: React.ReactNode
  className?: string
  showBeacon?: boolean
  pulseColor?: 'primary' | 'success' | 'warning'
}

export function GuideSpotlight({
  active,
  children,
  className,
  showBeacon = true,
  pulseColor = 'primary',
}: GuideSpotlightProps) {
  if (!active) {
    return <>{children}</>
  }

  const colorClasses = {
    primary: 'border-primary shadow-primary/50',
    success: 'border-green-500 shadow-green-500/50',
    warning: 'border-amber-500 shadow-amber-500/50',
  }

  const beaconColorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
  }

  return (
    <div className={cn('relative', className)}>
      {/* Spotlight border and glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-lg border-2 pointer-events-none z-10 animate-pulse',
          'shadow-lg transition-all duration-300',
          colorClasses[pulseColor]
        )}
        style={{
          animationDuration: '2s',
          animationIterationCount: 'infinite',
        }}
      />

      {/* Beacon dot indicator */}
      {showBeacon && (
        <div className="absolute -top-2 -right-2 z-20 pointer-events-none">
          <div className="relative">
            {/* Pulsing outer ring */}
            <div
              className={cn(
                'absolute inset-0 rounded-full animate-ping opacity-75',
                beaconColorClasses[pulseColor]
              )}
              style={{
                width: '16px',
                height: '16px',
                animationDuration: '1.5s',
              }}
            />
            {/* Solid inner dot */}
            <div
              className={cn(
                'relative rounded-full',
                beaconColorClasses[pulseColor]
              )}
              style={{
                width: '16px',
                height: '16px',
              }}
            />
          </div>
        </div>
      )}

      {/* Original content */}
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
