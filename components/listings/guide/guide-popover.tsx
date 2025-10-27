'use client'

import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type GuidePopoverProps = {
  open: boolean
  children: React.ReactNode
  title: string
  description: string
  tip?: string
  currentStep: number
  totalSteps: number
  onNext?: () => void
  onBack?: () => void
  onSkip: () => void
  onClose: () => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  showBackButton?: boolean
  showNextButton?: boolean
}

export function GuidePopover({
  open,
  children,
  title,
  description,
  tip,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  onClose,
  side = 'bottom',
  align = 'center',
  showBackButton = true,
  showNextButton = true,
}: GuidePopoverProps) {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          initial={{ opacity: 0, y: side === 'top' ? 20 : -20, scale: 0.85 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 20,
            },
          }}
          exit={{ opacity: 0, y: side === 'top' ? 20 : -20, scale: 0.85 }}
          className="fixed inset-0 flex items-center justify-center z-[100] p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          />

          {/* Tooltip Card */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            </div>

            {/* Close button */}
            <motion.button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/10 transition-colors"
              whileHover={{
                scale: 1.1,
                rotate: 90,
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }}
              whileTap={{ scale: 0.9 }}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              <motion.div
                whileHover={{ rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-4 w-4" />
              </motion.div>
              <span className="sr-only">Close guide</span>
            </motion.button>

            {/* Content */}
            <div className="relative z-10 p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-lg"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{title}</h3>
                  <p className="text-sm text-slate-300">
                    Step {currentStep} of {totalSteps}
                  </p>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'h-1.5 flex-1 rounded-full origin-left',
                      index < currentStep
                        ? 'bg-gradient-to-r from-primary to-emerald-500'
                        : index === currentStep - 1
                        ? 'bg-primary/60'
                        : 'bg-slate-700'
                    )}
                  />
                ))}
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed text-slate-200">
                {description}
              </p>

              {/* Tip */}
              {tip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3"
                >
                  <p className="text-xs text-amber-200 leading-relaxed">
                    <span className="font-semibold">💡 Tip:</span> {tip}
                  </p>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="flex gap-2">
                  {showBackButton && currentStep > 1 && (
                    <button
                      onClick={onBack}
                      className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                  <button
                    onClick={onSkip}
                    className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    Skip
                  </button>
                </div>

                {showNextButton && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNext}
                    className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 rounded-lg shadow-lg transition-all flex items-center gap-1"
                  >
                    {currentStep === totalSteps ? 'Finish' : 'Next'}
                    {currentStep < totalSteps && <ChevronRight className="w-4 h-4" />}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
