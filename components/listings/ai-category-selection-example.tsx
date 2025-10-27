/**
 * AI Category Selection - Usage Example
 *
 * This file demonstrates how to use the AI-powered category suggestion components
 * in a complete listing creation flow.
 */

'use client'

import React from 'react'
import { Smartphone, Laptop, Camera } from 'lucide-react'
import { AISuggestionCard } from './ai-suggestion-card'
import { AIAnalyzingSkeleton } from './ai-analyzing-skeleton'
import { ManualCategoryGrid } from './manual-category-grid'
import { ConfidenceTooltip } from './confidence-tooltip'
import { SelectionMethodBadge } from './selection-method-badge'
import { CategoryReasoning } from './category-reasoning'

// Example 1: AI Analyzing State
export const AIAnalyzingExample = () => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Select Category</h2>
        <ConfidenceTooltip />
      </div>

      <AIAnalyzingSkeleton imageCount={3} />
    </div>
  )
}

// Example 2: AI Suggestions Displayed
export const AISuggestionsExample = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

  const suggestions = [
    {
      name: 'Smartphones',
      icon: Smartphone,
      confidence: 95,
      reasoning: 'Based on the images, I can see a modern smartphone with a distinctive camera array, glass back, and recognizable design elements typical of current flagship devices.',
      parentCategory: 'Electronics'
    },
    {
      name: 'Laptops',
      icon: Laptop,
      confidence: 78,
      reasoning: 'The images show some rectangular electronic devices that could be laptops, though the viewing angle makes it difficult to confirm definitively.',
      parentCategory: 'Electronics'
    },
    {
      name: 'Cameras',
      icon: Camera,
      confidence: 62,
      reasoning: 'While the device has camera lenses, they appear to be part of a smartphone rather than a standalone camera.',
      parentCategory: 'Electronics'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Category Suggestions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select the most appropriate category for your item
          </p>
        </div>
        <ConfidenceTooltip />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((category, index) => (
          <AISuggestionCard
            key={category.name}
            category={category}
            selected={selectedCategory === category.name}
            variant={index === 0 ? 'recommended' : category.confidence < 70 ? 'disabled' : 'default'}
            onSelect={() => setSelectedCategory(category.name)}
          />
        ))}
      </div>

      <ManualCategoryGrid
        categories={[
          {
            id: 'electronics',
            name: 'Electronics',
            description: 'Phones, laptops, tablets, and other electronic devices',
            icon: Smartphone
          },
          {
            id: 'cameras',
            name: 'Cameras',
            description: 'Digital cameras, DSLRs, action cameras, and accessories',
            icon: Camera
          }
        ]}
        selectedId={selectedCategory ?? undefined}
        onSelect={(id) => setSelectedCategory(id)}
      />

      {selectedCategory && (
        <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
          <SelectionMethodBadge
            method="ai"
            confidence={suggestions.find(s => s.name === selectedCategory)?.confidence}
          />
        </div>
      )}
    </div>
  )
}

// Example 3: Category Reasoning Component
export const CategoryReasoningExample = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Category Reasoning Example</h2>

      <CategoryReasoning
        reasoning="Based on the images, I can see a modern smartphone with a distinctive triple camera array, glass back, and premium build quality typical of current flagship devices."
        features={[
          'Triple rear camera system with advanced sensors',
          'Premium glass and metal construction',
          'Large OLED display with minimal bezels',
          'Wireless charging capability visible',
          'Flagship-tier specifications'
        ]}
      />
    </div>
  )
}

// Example 4: Selection Method Badges
export const SelectionBadgesExample = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Selection Method Badges</h2>

      <div className="flex flex-wrap gap-3">
        <SelectionMethodBadge method="ai" confidence={95} />
        <SelectionMethodBadge method="ai" confidence={78} />
        <SelectionMethodBadge method="ai" confidence={62} />
        <SelectionMethodBadge method="manual" />
      </div>
    </div>
  )
}

// Example 5: Complete Flow with State Management
export const CompleteFlowExample = () => {
  const [isAnalyzing, setIsAnalyzing] = React.useState(true)
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [selectionMethod, setSelectionMethod] = React.useState<'ai' | 'manual'>('ai')

  React.useEffect(() => {
    // Simulate AI analysis
    const timer = setTimeout(() => {
      setIsAnalyzing(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const suggestions = [
    {
      name: 'Smartphones',
      icon: Smartphone,
      confidence: 95,
      reasoning: 'Based on the images, I can see a modern smartphone with a distinctive camera array.',
      parentCategory: 'Electronics'
    }
  ]

  const handleAISelect = (categoryName: string) => {
    setSelectedCategory(categoryName)
    setSelectionMethod('ai')
  }

  const handleManualSelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectionMethod('manual')
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {isAnalyzing ? (
        <AIAnalyzingSkeleton imageCount={3} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {suggestions.map((category, index) => (
              <AISuggestionCard
                key={category.name}
                category={category}
                selected={selectedCategory === category.name && selectionMethod === 'ai'}
                variant={index === 0 ? 'recommended' : 'default'}
                onSelect={() => handleAISelect(category.name)}
              />
            ))}
          </div>

          <ManualCategoryGrid
            categories={[
              {
                id: 'electronics',
                name: 'Electronics',
                description: 'Phones, laptops, and other devices',
                icon: Smartphone
              }
            ]}
            selectedId={selectedCategory && selectionMethod === 'manual' ? selectedCategory : undefined}
            onSelect={handleManualSelect}
          />

          {selectedCategory && (
            <div className="mt-6 flex justify-center">
              <SelectionMethodBadge
                method={selectionMethod}
                confidence={
                  selectionMethod === 'ai'
                    ? suggestions.find(s => s.name === selectedCategory)?.confidence
                    : undefined
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
