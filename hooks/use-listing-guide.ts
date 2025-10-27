'use client'

import { useState, useEffect, useCallback } from 'react'

export type GuideStep = 1 | 2 | 3 | 4 | 5 | 6

export type GuideStatus = 'active' | 'dismissed' | 'completed' | 'never-shown'

export type GuideState = {
  status: GuideStatus
  currentStep: GuideStep
  lastSeen: number
  dontShowAgain: boolean
}

const STORAGE_KEY = 'listing-creation-guide'
const DEFAULT_STATE: GuideState = {
  status: 'active',
  currentStep: 1,
  lastSeen: Date.now(),
  dontShowAgain: false,
}

export type UseListingGuideProps = {
  formStep: number
  hasImages: boolean
  hasCategory: boolean
  hasTitle: boolean
  hasDescription: boolean
  hasPricing: boolean
  hasLocation: boolean
}

export function useListingGuide({
  formStep,
  hasImages,
  hasCategory,
  hasTitle,
  hasDescription,
  hasPricing,
  hasLocation,
}: UseListingGuideProps) {
  const [guideState, setGuideState] = useState<GuideState>(DEFAULT_STATE)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GuideState
        setGuideState(parsed)
      } catch (error) {
        console.error('Failed to parse guide state:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guideState))
    }
  }, [guideState, isLoaded])

  // Auto-advance guide based on form progress
  useEffect(() => {
    if (!isLoaded || guideState.status !== 'active') return

    const shouldAdvance = (() => {
      switch (guideState.currentStep) {
        case 1:
          return hasImages && formStep >= 2
        case 2:
          return hasCategory && formStep >= 3
        case 3:
          return hasTitle && hasDescription && formStep >= 4
        case 4:
          return hasPricing && formStep >= 5
        case 5:
          return hasLocation && formStep >= 6
        case 6:
          return false // Don't auto-advance from final step
        default:
          return false
      }
    })()

    if (shouldAdvance) {
      // Wait 500ms before advancing to let user see the success
      const timer = setTimeout(() => {
        nextStep()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [
    guideState.currentStep,
    guideState.status,
    hasImages,
    hasCategory,
    hasTitle,
    hasDescription,
    hasPricing,
    hasLocation,
    formStep,
    isLoaded,
  ])

  const startGuide = useCallback(() => {
    setGuideState({
      status: 'active',
      currentStep: 1,
      lastSeen: Date.now(),
      dontShowAgain: false,
    })
  }, [])

  const nextStep = useCallback(() => {
    setGuideState((prev) => {
      if (prev.currentStep === 6) {
        return {
          ...prev,
          status: 'completed',
          lastSeen: Date.now(),
        }
      }
      return {
        ...prev,
        currentStep: (prev.currentStep + 1) as GuideStep,
        lastSeen: Date.now(),
      }
    })
  }, [])

  const previousStep = useCallback(() => {
    setGuideState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1) as GuideStep,
      lastSeen: Date.now(),
    }))
  }, [])

  const dismissGuide = useCallback((permanent: boolean = false) => {
    setGuideState((prev) => ({
      ...prev,
      status: 'dismissed',
      dontShowAgain: permanent,
      lastSeen: Date.now(),
    }))
  }, [])

  const completeGuide = useCallback(() => {
    setGuideState((prev) => ({
      ...prev,
      status: 'completed',
      lastSeen: Date.now(),
    }))
  }, [])

  const resetGuide = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setGuideState(DEFAULT_STATE)
  }, [])

  return {
    guideState,
    isActive: guideState.status === 'active' && isLoaded,
    currentStep: guideState.currentStep,
    isCompleted: guideState.status === 'completed',
    isDismissed: guideState.status === 'dismissed',
    startGuide,
    nextStep,
    previousStep,
    dismissGuide,
    completeGuide,
    resetGuide,
    isLoaded,
  }
}
