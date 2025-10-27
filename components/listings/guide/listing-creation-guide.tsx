'use client'

import { useEffect, useState } from 'react'
import { GuidePopover } from './guide-popover'
import { useListingGuide } from '@/hooks/use-listing-guide'

type ListingCreationGuideProps = {
  formStep: number
  hasImages: boolean
  hasCategory: boolean
  hasTitle: boolean
  hasDescription: boolean
  hasPricing: boolean
  hasLocation: boolean
  isGuideActive: boolean
  onToggleGuide: () => void
}

type GuideStepConfig = {
  title: string
  description: string
  tip?: string
  targetId: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

const GUIDE_STEPS: Record<number, GuideStepConfig> = {
  1: {
    title: 'Upload Your Images',
    description: 'Start by uploading 1-10 photos of your item. High-quality images help your listing stand out. You can drag and drop or click to browse.',
    tip: 'After uploading, you can enhance images with AI to remove backgrounds and add professional white backgrounds!',
    targetId: 'image-upload',
    side: 'bottom',
    align: 'center',
  },
  2: {
    title: 'Select a Category',
    description: 'Our AI analyzes your images to suggest the best category for your item. Click an AI suggestion or search manually to find the perfect category.',
    tip: 'AI suggestions have higher confidence and can help your listing appear in relevant searches!',
    targetId: 'category-select',
    side: 'bottom',
    align: 'start',
  },
  3: {
    title: 'Add Item Details',
    description: 'Use AI to generate a compelling title and description from your images, or write your own. Great descriptions help buyers understand what makes your item special.',
    tip: 'Detailed descriptions with specific brand names, models, and condition notes lead to faster sales!',
    targetId: 'details-form',
    side: 'bottom',
    align: 'start',
  },
  4: {
    title: 'Set Your Price',
    description: 'Choose Fixed Price for an immediate sale at your set price, or Accept Offers to negotiate with buyers and potentially get a better deal.',
    tip: 'Platform fee is 20% (you keep 80% of the sale price). Factor this into your pricing strategy!',
    targetId: 'pricing-options',
    side: 'bottom',
    align: 'start',
  },
  5: {
    title: 'Add Location',
    description: 'Enter your city and province to help buyers find local items. Many buyers prefer local pickup to save on shipping costs.',
    tip: 'Local pickup is popular in our marketplace and can help your items sell faster!',
    targetId: 'location-form',
    side: 'bottom',
    align: 'start',
  },
  6: {
    title: 'Review & Submit',
    description: 'Review your listing preview to make sure everything looks perfect. When you\'re ready, submit for admin approval. You\'ll be notified once it\'s live!',
    tip: 'Approval usually takes 24-48 hours. You can check your listing status in your dashboard.',
    targetId: 'submit-button',
    side: 'top',
    align: 'end',
  },
}

export function ListingCreationGuide({
  formStep,
  hasImages,
  hasCategory,
  hasTitle,
  hasDescription,
  hasPricing,
  hasLocation,
  isGuideActive,
  onToggleGuide,
}: ListingCreationGuideProps) {
  const {
    guideState,
    isActive,
    currentStep,
    nextStep,
    previousStep,
    dismissGuide,
    startGuide,
    isLoaded,
  } = useListingGuide({
    formStep,
    hasImages,
    hasCategory,
    hasTitle,
    hasDescription,
    hasPricing,
    hasLocation,
  })

  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)

  // Sync guide active state with parent
  useEffect(() => {
    if (!isActive && isGuideActive) {
      // Parent wants to show guide but hook state is inactive - start the guide
      startGuide()
    } else if (isActive && !isGuideActive) {
      onToggleGuide()
    }
  }, [isActive, isGuideActive, onToggleGuide, startGuide])

  // Find and highlight the current target element
  useEffect(() => {
    if (!isLoaded || !isActive || !isGuideActive) {
      setTargetElement(null)
      return
    }

    const currentStepConfig = GUIDE_STEPS[currentStep]
    if (!currentStepConfig) {
      setTargetElement(null)
      return
    }

    // Find the target element
    const target = document.querySelector(`[data-guide-target="${currentStepConfig.targetId}"]`) as HTMLElement
    if (target) {
      setTargetElement(target)

      // Scroll the element into view
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)

      // Add highlight class
      target.classList.add('guide-highlight-active')

      return () => {
        target.classList.remove('guide-highlight-active')
      }
    }
  }, [isLoaded, isActive, isGuideActive, currentStep])

  // Don't render until loaded to prevent flash
  if (!isLoaded || !isActive || !isGuideActive) {
    return null
  }

  const currentStepConfig = GUIDE_STEPS[currentStep]

  if (!currentStepConfig) {
    return null
  }

  const handleSkip = () => {
    dismissGuide(true)
    onToggleGuide()
  }

  const handleClose = () => {
    dismissGuide(false)
    onToggleGuide()
  }

  return (
    <>
      {/* Global styles for guide highlights */}
      <style jsx global>{`
        .guide-highlight-active {
          position: relative;
          z-index: 40;
        }

        .guide-highlight-active::before {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid hsl(var(--primary));
          border-radius: 0.625rem;
          pointer-events: none;
          animation: guide-pulse 2s ease-in-out infinite;
          box-shadow: 0 0 0 4px hsl(var(--primary) / 0.1);
        }

        .guide-highlight-active::after {
          content: '';
          position: absolute;
          top: -8px;
          right: -8px;
          width: 16px;
          height: 16px;
          background: hsl(var(--primary));
          border-radius: 50%;
          pointer-events: none;
          animation: guide-beacon 1.5s ease-in-out infinite;
          box-shadow: 0 0 0 0 hsl(var(--primary));
        }

        @keyframes guide-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes guide-beacon {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 hsl(var(--primary));
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 0 4px hsl(var(--primary) / 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 hsl(var(--primary) / 0);
          }
        }
      `}</style>

      <GuidePopover
        open={isActive}
        title={currentStepConfig.title}
        description={currentStepConfig.description}
        tip={currentStepConfig.tip}
        currentStep={currentStep}
        totalSteps={6}
        onNext={nextStep}
        onBack={previousStep}
        onSkip={handleSkip}
        onClose={handleClose}
        side={currentStepConfig.side}
        align={currentStepConfig.align}
        showBackButton={currentStep > 1}
        showNextButton={true}
      >
        <div />
      </GuidePopover>
    </>
  )
}

// Export wrapper component for backward compatibility (not used in current implementation)
export function GuideTarget({
  children,
  targetId,
  currentGuideStep,
  activeOnStep,
}: {
  children: React.ReactNode
  targetId: string
  currentGuideStep: number
  activeOnStep: number
}) {
  return (
    <div data-guide-target={targetId}>
      {children}
    </div>
  )
}
