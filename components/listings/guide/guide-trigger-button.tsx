'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type GuideTriggerButtonProps = {
  onClick: () => void
  isActive?: boolean
  className?: string
}

export function GuideTriggerButton({
  onClick,
  isActive = false,
  className,
}: GuideTriggerButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(
        'fixed right-8 top-1/2 -translate-y-1/2 z-40',
        'w-14 h-14 rounded-full',
        'flex items-center justify-center',
        'transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'shadow-lg',
        isActive
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
          : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white',
        className
      )}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      aria-label={isActive ? 'Hide listing guide' : 'Show listing guide'}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Pulsing glow effect */}
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-blue-400/40',
          'animate-pulse-glow'
        )}
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Icon with animation */}
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </motion.div>
        ) : (
          <motion.div
            key="lightbulb"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <Lightbulb className="w-6 h-6 fill-white" aria-hidden="true" />
            {/* Sparkle effect */}
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ripple effect on click */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-300"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  )
}
