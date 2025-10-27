# AI-Powered Category Selection Components

Beautiful, accessible UI components for AI-assisted category suggestions in the listing creation flow.

## Overview

These components provide a polished, professional interface for the images-first listing creation flow, where AI analyzes uploaded images and suggests appropriate categories with confidence scores.

## Components

### 1. ConfidenceBadge

**File**: `confidence-badge.tsx`

A color-coded badge displaying AI confidence percentage.

**Props**:
```typescript
interface ConfidenceBadgeProps {
  confidence: number        // 0-100
  size?: 'sm' | 'md' | 'lg' // default: 'sm'
  showIcon?: boolean        // default: true
  className?: string
}
```

**Usage**:
```tsx
import { ConfidenceBadge } from '@/components/listings/confidence-badge'

<ConfidenceBadge confidence={95} size="md" />
```

**Visual Design**:
- 🟢 Green (90-100%): High confidence with checkmark icon
- 🟡 Yellow (70-89%): Medium confidence
- 🔴 Red (<70%): Low confidence with alert icon

---

### 2. AISuggestionCard

**File**: `ai-suggestion-card.tsx`

Interactive card displaying an AI category suggestion with reasoning.

**Props**:
```typescript
interface AISuggestionCardProps {
  category: {
    name: string
    icon: LucideIcon
    confidence: number
    reasoning: string
    parentCategory?: string
  }
  selected: boolean
  variant?: 'default' | 'recommended' | 'disabled'
  onSelect: () => void
  className?: string
}
```

**Usage**:
```tsx
import { AISuggestionCard } from '@/components/listings/ai-suggestion-card'
import { Smartphone } from 'lucide-react'

<AISuggestionCard
  category={{
    name: 'Smartphones',
    icon: Smartphone,
    confidence: 95,
    reasoning: 'AI detected a smartphone based on...',
    parentCategory: 'Electronics'
  }}
  selected={selectedId === 'smartphones'}
  variant="recommended"
  onSelect={() => setSelectedId('smartphones')}
/>
```

**Features**:
- Large category icon with hover animation
- Confidence badge in top-right
- "Select This Category" button
- Expandable "Why this category?" reasoning
- Low confidence warning (when <70%)
- Recommended badge (for highest confidence)
- Keyboard accessible (Tab + Enter/Space)

---

### 3. AIAnalyzingSkeleton

**File**: `ai-analyzing-skeleton.tsx`

Engaging loading state while AI analyzes images.

**Props**:
```typescript
interface AIAnalyzingSkeletonProps {
  imageCount?: number  // default: 1
  className?: string
}
```

**Usage**:
```tsx
import { AIAnalyzingSkeleton } from '@/components/listings/ai-analyzing-skeleton'

<AIAnalyzingSkeleton imageCount={3} />
```

**Features**:
- Animated sparkles icon (rotates)
- "Analyzing your images..." message
- Dot loading animation
- Skeleton cards preview (3 cards)
- Estimated time notice
- Screen reader announcements

---

### 4. ManualCategoryGrid

**File**: `manual-category-grid.tsx`

Collapsible fallback for manual category selection.

**Props**:
```typescript
interface ManualCategoryGridProps {
  categories: CategoryOption[]
  selectedId?: string
  onSelect: (categoryId: string) => void
  defaultExpanded?: boolean
  className?: string
}

interface CategoryOption {
  id: string
  name: string
  description: string
  icon: LucideIcon
}
```

**Usage**:
```tsx
import { ManualCategoryGrid } from '@/components/listings/manual-category-grid'
import { Smartphone, Laptop, Camera } from 'lucide-react'

<ManualCategoryGrid
  categories={[
    { id: 'electronics', name: 'Electronics', description: '...', icon: Smartphone },
    { id: 'laptops', name: 'Laptops', description: '...', icon: Laptop }
  ]}
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>
```

**Features**:
- Starts collapsed, expands on click
- Search/filter functionality
- Responsive grid (1/2/3 columns)
- Hover effects on cards
- Selected state highlighting
- Clear visual separation from AI suggestions

---

### 5. ConfidenceTooltip

**File**: `confidence-tooltip.tsx`

Informative tooltip explaining AI confidence scores.

**Props**:
```typescript
interface ConfidenceTooltipProps {
  className?: string
}
```

**Usage**:
```tsx
import { ConfidenceTooltip } from '@/components/listings/confidence-tooltip'

<div className="flex items-center gap-2">
  <h2>AI Suggestions</h2>
  <ConfidenceTooltip />
</div>
```

**Content**:
- 🟢 90-100%: High confidence explanation
- 🟡 70-89%: Medium confidence explanation
- 🔴 <70%: Low confidence explanation
- Hover/click to reveal
- Dark theme with clean typography

---

### 6. SelectionMethodBadge

**File**: `selection-method-badge.tsx`

Badge indicating how category was selected (AI vs manual).

**Props**:
```typescript
interface SelectionMethodBadgeProps {
  method: 'ai' | 'manual'
  confidence?: number  // Only for AI selections
  className?: string
}
```

**Usage**:
```tsx
import { SelectionMethodBadge } from '@/components/listings/selection-method-badge'

{/* AI selection */}
<SelectionMethodBadge method="ai" confidence={95} />
{/* Output: 🤖 AI Suggested (95%) */}

{/* Manual selection */}
<SelectionMethodBadge method="manual" />
{/* Output: 👤 Manually Selected */}
```

**Use Cases**:
- Listing preview page
- Admin review interface
- User dashboard (show how they selected category)

---

### 7. CategoryReasoning

**File**: `category-reasoning.tsx`

Expandable section showing detailed AI reasoning.

**Props**:
```typescript
interface CategoryReasoningProps {
  reasoning: string
  features?: string[]  // Key features identified
  className?: string
}
```

**Usage**:
```tsx
import { CategoryReasoning } from '@/components/listings/category-reasoning'

<CategoryReasoning
  reasoning="Based on the images, I can see a modern smartphone..."
  features={[
    'Triple rear camera system',
    'Premium glass and metal construction',
    'Large OLED display'
  ]}
/>
```

**Features**:
- Collapsed by default
- "Why this category?" trigger with sparkles icon
- Smooth expand/collapse animation
- Bullet points for identified features
- Purple accent color (AI branding)

---

## Complete Flow Example

```tsx
'use client'

import { useState, useEffect } from 'react'
import { AISuggestionCard } from '@/components/listings/ai-suggestion-card'
import { AIAnalyzingSkeleton } from '@/components/listings/ai-analyzing-skeleton'
import { ManualCategoryGrid } from '@/components/listings/manual-category-grid'
import { ConfidenceTooltip } from '@/components/listings/confidence-tooltip'
import { SelectionMethodBadge } from '@/components/listings/selection-method-badge'

export default function CategorySelectionStep() {
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectionMethod, setSelectionMethod] = useState<'ai' | 'manual'>('ai')

  // Simulate AI analysis
  useEffect(() => {
    const timer = setTimeout(() => setIsAnalyzing(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const aiSuggestions = [
    {
      name: 'Smartphones',
      icon: Smartphone,
      confidence: 95,
      reasoning: 'Based on the images...',
      parentCategory: 'Electronics'
    },
    {
      name: 'Laptops',
      icon: Laptop,
      confidence: 78,
      reasoning: 'The images show...',
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

  if (isAnalyzing) {
    return <AIAnalyzingSkeleton imageCount={3} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Select Category</h2>
        <ConfidenceTooltip />
      </div>

      {/* AI Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiSuggestions.map((category, index) => (
          <AISuggestionCard
            key={category.name}
            category={category}
            selected={selectedCategory === category.name && selectionMethod === 'ai'}
            variant={index === 0 ? 'recommended' : 'default'}
            onSelect={() => handleAISelect(category.name)}
          />
        ))}
      </div>

      {/* Manual Fallback */}
      <ManualCategoryGrid
        categories={allCategories}
        selectedId={selectionMethod === 'manual' ? selectedCategory : undefined}
        onSelect={handleManualSelect}
      />

      {/* Selection Badge */}
      {selectedCategory && (
        <div className="flex justify-center">
          <SelectionMethodBadge
            method={selectionMethod}
            confidence={
              selectionMethod === 'ai'
                ? aiSuggestions.find(s => s.name === selectedCategory)?.confidence
                : undefined
            }
          />
        </div>
      )}
    </div>
  )
}
```

---

## Design System

### Color Palette

**Confidence Colors**:
```tsx
// High (90-100%)
'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20'

// Medium (70-89%)
'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'

// Low (<70%)
'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
```

**AI Branding**:
```tsx
// Primary
'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'

// Accent
'text-purple-500' // For sparkles icon
```

**Interactive States**:
```tsx
// Hover
'hover:bg-accent hover:border-primary/20 hover:scale-[1.02]'

// Selected
'ring-2 ring-primary ring-offset-2 bg-primary/5 border-primary/30'

// Focus
'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
```

### Typography

```tsx
// Card title
'text-base font-semibold leading-tight'

// Parent category
'text-xs text-muted-foreground'

// Reasoning text
'text-sm text-muted-foreground leading-relaxed'

// Badge text
'text-xs font-medium' (sm)
'text-sm font-medium' (md)
'text-base font-medium' (lg)
```

### Spacing

```tsx
// Card padding
'p-4' (mobile)
'p-6' (desktop)

// Grid gaps
'gap-4' (default)
'gap-3' (compact)

// Component spacing
'space-y-3' (internal)
'space-y-6' (section)
```

### Border Radius

```tsx
// Cards
'rounded-lg'

// Badges
'rounded-full'

// Buttons
'rounded-md'
```

---

## Responsive Breakpoints

### Mobile (<640px)
- Single column grid
- Full-width cards
- Confidence badge in top-right corner
- Touch-friendly targets (min 44x44px)
- Larger text for readability

### Tablet (640px-1024px)
- 2-column grid for suggestions
- Side-by-side elements
- Compact spacing
- Balanced layout

### Desktop (>1024px)
- 3-column grid for suggestions
- More white space
- Prominent hover effects
- Optimal scanning pattern

---

## Accessibility

All components meet **WCAG 2.1 AA** standards:

✅ **Keyboard Navigation**
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys for navigation (where applicable)

✅ **Screen Reader Support**
- Semantic HTML elements
- ARIA labels on all interactive elements
- Status announcements for loading/changes
- Descriptive text for icons

✅ **Visual Accessibility**
- Color contrast ratio ≥ 4.5:1 for text
- Information not conveyed by color alone
- Visible focus indicators
- Touch targets ≥ 44x44px

✅ **Motion**
- Respects `prefers-reduced-motion`
- Smooth transitions under 300ms
- No auto-playing animations

See `AI_COMPONENTS_ACCESSIBILITY_CHECKLIST.md` for full audit.

---

## Animation Guidelines

### Transitions
```tsx
'transition-all duration-300' // State changes
'transition-colors duration-200' // Color changes
```

### Hover Effects
```tsx
'hover:scale-[1.02]' // Cards
'hover:scale-110' // Icons
'hover:bg-accent' // Backgrounds
```

### Loading Animations
```tsx
'animate-pulse' // Skeletons
'animate-bounce' // Dots
'animate-[spin_3s_ease-in-out_infinite]' // Sparkles
```

---

## Testing

### Unit Tests
See `ai-category-selection-example.tsx` for usage examples that can be converted to tests.

### Visual Testing
1. Test in light and dark modes
2. Verify all breakpoints (mobile/tablet/desktop)
3. Check hover and focus states
4. Test with color blindness simulators

### Accessibility Testing
1. Keyboard-only navigation
2. Screen reader testing (VoiceOver/NVDA)
3. Color contrast verification (axe DevTools)
4. Touch target sizing on mobile devices

### Browser Testing
- Chrome, Firefox, Safari, Edge
- iOS Safari, Android Chrome
- Desktop and mobile viewports

---

## Dependencies

### Required Components (shadcn/ui)
- Card, CardHeader, CardContent
- Button
- Input
- Skeleton
- Tooltip, TooltipProvider, TooltipTrigger, TooltipContent
- Separator

### Icons
- Lucide React (Sparkles, Check, AlertTriangle, Info, Bot, User, ChevronDown, ChevronUp, Search, Star)

### Utilities
- `cn()` from `@/lib/utils` (clsx + tailwind-merge)

---

## Best Practices

### State Management
```tsx
// Track selection method separately
const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
const [selectionMethod, setSelectionMethod] = useState<'ai' | 'manual'>('ai')

// Handle AI selection
const handleAISelect = (categoryName: string) => {
  setSelectedCategory(categoryName)
  setSelectionMethod('ai')
}

// Handle manual selection
const handleManualSelect = (categoryId: string) => {
  setSelectedCategory(categoryId)
  setSelectionMethod('manual')
}
```

### Performance
- Use `React.memo()` for card components if rendering many
- Debounce search input in manual grid
- Lazy load category icons if list is large
- Use `useCallback()` for handlers passed to children

### Error Handling
- Show fallback UI if AI analysis fails
- Always provide manual selection option
- Display clear error messages
- Log errors for debugging

---

## Future Enhancements

### Potential Features
- [ ] Confidence score history/trend
- [ ] Multi-language support
- [ ] Category hierarchy visualization
- [ ] Comparison mode (side-by-side suggestions)
- [ ] User feedback mechanism ("Was this helpful?")
- [ ] Explain confidence score in detail
- [ ] Suggest multiple images for better accuracy

### Performance Optimizations
- [ ] Virtual scrolling for large category lists
- [ ] Progressive image loading
- [ ] Prefetch category data
- [ ] Optimize animations for low-end devices

---

## Support

For questions or issues:
1. Check `ai-category-selection-example.tsx` for usage examples
2. Review `AI_COMPONENTS_ACCESSIBILITY_CHECKLIST.md` for accessibility guidance
3. Consult shadcn/ui documentation for base components
4. Reference CLAUDE.md for project architecture

---

**Version**: 1.0.0
**Last Updated**: 2025-10-26
**Maintained By**: Tal (Senior Front-End Developer)
**License**: Project License
