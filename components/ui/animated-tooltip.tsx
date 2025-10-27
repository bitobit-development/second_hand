"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type AnimatedTooltipProps = {
  items: {
    id: number
    name: string
    description?: string
    icon?: React.ReactNode
  }[]
  children: React.ReactNode
  className?: string
}

export function AnimatedTooltip({
  items,
  children,
  className,
}: AnimatedTooltipProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const springConfig = { stiffness: 100, damping: 5 }
  const x = useMotionValue(0)

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  )
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  )

  const handleMouseMove = (event: React.MouseEvent) => {
    const halfWidth = (event.currentTarget as HTMLElement).offsetWidth / 2
    x.set(event.nativeEvent.offsetX - halfWidth)
  }

  return (
    <div className={cn("relative inline-block", className)}>
      {React.Children.map(children, (child, idx) => (
        <div
          className="relative"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          onMouseMove={handleMouseMove}
        >
          <AnimatePresence>
            {hoveredIndex === idx && items[idx] && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-16 -left-1/2 translate-x-1/2 flex flex-col items-center justify-center rounded-lg bg-black text-white z-50 shadow-xl px-4 py-2"
              >
                <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px" />
                <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />
                <div className="font-bold text-white relative z-30 text-sm">
                  {items[idx].name}
                </div>
                {items[idx].description && (
                  <div className="text-white text-xs">{items[idx].description}</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {child}
        </div>
      ))}
    </div>
  )
}

// Simpler single tooltip variant
type TooltipContentProps = {
  children: React.ReactNode
  content: string
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function AnimatedTooltipSimple({
  children,
  content,
  side = "top",
  className,
}: TooltipContentProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const springConfig = { stiffness: 100, damping: 5 }
  const x = useMotionValue(0)

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-8, 8]),
    springConfig
  )
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-10, 10]),
    springConfig
  )

  const handleMouseMove = (event: React.MouseEvent) => {
    const halfWidth = (event.currentTarget as HTMLElement).offsetWidth / 2
    x.set(event.nativeEvent.offsetX - halfWidth)
  }

  const sideClasses = {
    top: "-top-12 left-1/2 -translate-x-1/2",
    bottom: "-bottom-12 left-1/2 -translate-x-1/2",
    left: "top-1/2 -left-12 -translate-y-1/2",
    right: "top-1/2 -right-12 -translate-y-1/2",
  }

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onMouseMove={handleMouseMove}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: side === "top" ? 10 : -10, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 15,
              },
            }}
            exit={{ opacity: 0, y: side === "top" ? 10 : -10, scale: 0.8 }}
            style={{
              translateX: translateX,
              rotate: rotate,
            }}
            className={cn(
              "absolute z-50 px-3 py-2 text-sm text-white bg-black rounded-lg shadow-xl whitespace-nowrap",
              sideClasses[side]
            )}
          >
            <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-primary to-transparent h-px" />
            {content}
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}
