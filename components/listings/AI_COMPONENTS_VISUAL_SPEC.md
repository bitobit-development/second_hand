# AI Category Selection - Visual Design Specification

## Component Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  Select Category                                     [i] (tooltip)   │
│  AI-powered suggestions based on your images                         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. AIAnalyzingSkeleton (Loading State)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                          ✨ (rotating)                               │
│                       (purple glow)                                  │
│                                                                       │
│               Analyzing your 3 images...                             │
│         Our AI is identifying the best category                      │
│                                                                       │
│                      ● ● ● (bouncing)                                │
│                                                                       │
│               This usually takes 2-3 seconds                         │
│                                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │
│  │ ░░░░░░░░ │  │ ░░░░░░░░ │  │ ░░░░░░░░ │                          │
│  │ ░░  ░░░░ │  │ ░░  ░░░░ │  │ ░░  ░░░░ │  (skeleton cards)        │
│  │          │  │          │  │          │                          │
│  │ ░░░░░░░░ │  │ ░░░░░░░░ │  │ ░░░░░░░░ │                          │
│  │ ░░░░░░░░ │  │ ░░░░░░░░ │  │ ░░░░░░░░ │                          │
│  └──────────┘  └──────────┘  └──────────┘                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Colors**:
- Sparkles icon: `text-purple-500`
- Glow: `bg-purple-500/20 blur-xl`
- Dots: `bg-purple-500` with staggered bounce
- Skeleton: `animate-pulse` gray

---

## 2. AISuggestionCard (Default State)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┬───────────┐ │
│ │                                                      │           │ │
│ │  ┌──────┐                                           │  95% ✓    │ │
│ │  │      │  Smartphones                              │  (green)  │ │
│ │  │  📱  │  Electronics                              │           │ │
│ │  │      │                                           └───────────┘ │
│ │  └──────┘                                                         │ │
│ │  (purple bg, icon centered)                                      │ │
│ │                                                                   │ │
│ ├───────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │  ┌─────────────────────────────────────────────────────────────┐ │ │
│ │  │        Select This Category                                 │ │ │
│ │  └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │  Why this category? ▼                                            │ │
│ │                                                                   │ │
│ └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Measurements**:
- Card: `rounded-lg`, padding `p-4`
- Icon container: `w-12 h-12 rounded-lg`
- Category name: `text-base font-semibold`
- Parent category: `text-xs text-muted-foreground`
- Confidence badge: `px-2.5 py-1 rounded-full`
- Button: `w-full h-10`

**Hover State**:
- Card: `shadow-lg`, `scale-[1.02]`, `border-primary/20`
- Icon: `scale-110`, `bg-purple-500/20`

---

## 3. AISuggestionCard (Recommended Variant)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                    ┌──────────────┐  │
│ ┌─────────────────────────────────────────────────│ ⭐ Recommended│  │
│ │                                                  └──────────────┘  │
│ │  ┌──────┐                                        ┌───────────┐    │
│ │  │      │  Smartphones                           │  95% ✓    │    │
│ │  │  📱  │  Electronics                           │  (green)  │    │
│ │  │      │                                        └───────────┘    │
│ │  └──────┘                                                         │
│ │  (purple bg, pulsing glow)                                       │
│ │                                                                   │
│ ├───────────────────────────────────────────────────────────────────┤
│ │                                                                   │
│ │  ┌─────────────────────────────────────────────────────────────┐ │
│ │  │        Select This Category                                 │ │
│ │  └─────────────────────────────────────────────────────────────┘ │
│ │                                                                   │
│ │  Why this category? ▼                                            │
│ │                                                                   │
│ └───────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────┘
```

**Recommended Badge**:
- Position: `absolute -top-2 -right-2 z-10`
- Color: `bg-purple-500 text-white`
- Size: `text-xs font-semibold`
- Icon: Star (filled)

---

## 4. AISuggestionCard (Selected State)

```
┌═════════════════════════════════════════════════════════════════════┐
║ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ ║
║ ┃                                                                 ┃ ║
║ ┃  ┌──────┐                                        ┌───────────┐ ┃ ║
║ ┃  │      │  Smartphones                           │  95% ✓    │ ┃ ║
║ ┃  │  📱  │  Electronics                           │  (green)  │ ┃ ║
║ ┃  │      │                                        └───────────┘ ┃ ║
║ ┃  └──────┘                                                      ┃ ║
║ ┃  (purple bg, scaled up)                                        ┃ ║
║ ┃                                                                 ┃ ║
║ ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫ ║
║ ┃                                                                 ┃ ║
║ ┃  ┌─────────────────────────────────────────────────────────┐   ┃ ║
║ ┃  │        Selected ✓                                       │   ┃ ║
║ ┃  └─────────────────────────────────────────────────────────┘   ┃ ║
║ ┃  (primary color button)                                        ┃ ║
║ ┃                                                                 ┃ ║
║ ┃  Why this category? ▼                                          ┃ ║
║ ┃                                                                 ┃ ║
║ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ ║
╚═════════════════════════════════════════════════════════════════════╝
```

**Selected Indicators**:
- Outer ring: `ring-2 ring-primary ring-offset-2`
- Background: `bg-primary/5`
- Border: `border-primary/30`
- Button: `bg-primary` (filled)
- Icon: `scale-110`, `bg-purple-500/20`

---

## 5. AISuggestionCard (Low Confidence Warning)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┬───────────┐ │
│ │                                                      │           │ │
│ │  ┌──────┐                                           │  62% ⚠    │ │
│ │  │      │  Cameras                                  │  (red)    │ │
│ │  │  📷  │  Electronics                              │           │ │
│ │  │      │                                           └───────────┘ │
│ │  └──────┘                                                         │ │
│ │                                                                   │ │
│ ├───────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │  ┌─────────────────────────────────────────────────────────────┐ │ │
│ │  │        Select This Category                                 │ │ │
│ │  └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │  ┌───────────────────────────────────────────────────────────┐  │ │
│ │  │ ⚠ Low confidence. Please verify this category is correct │  │ │
│ │  └───────────────────────────────────────────────────────────┘  │ │
│ │  (yellow/amber background with border)                          │ │
│ │                                                                   │ │
│ │  Why this category? ▼                                            │ │
│ │                                                                   │ │
│ └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Warning Box**:
- Background: `bg-yellow-500/10`
- Border: `border border-yellow-500/20`
- Text: `text-yellow-700 dark:text-yellow-300`
- Icon: `text-yellow-600 dark:text-yellow-400`

---

## 6. AISuggestionCard (Expanded Reasoning)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┬───────────┐ │
│ │                                                      │           │ │
│ │  ┌──────┐                                           │  95% ✓    │ │
│ │  │      │  Smartphones                              │  (green)  │ │
│ │  │  📱  │  Electronics                              │           │ │
│ │  │      │                                           └───────────┘ │
│ │  └──────┘                                                         │ │
│ │                                                                   │ │
│ ├───────────────────────────────────────────────────────────────────┤ │
│ │                                                                   │ │
│ │  ┌─────────────────────────────────────────────────────────────┐ │ │
│ │  │        Select This Category                                 │ │ │
│ │  └─────────────────────────────────────────────────────────────┘ │ │
│ │                                                                   │ │
│ │  Why this category? ▲  (expanded)                                │ │
│ │  ─────────────────────────────────────────────────────────────   │ │
│ │                                                                   │ │
│ │  Based on the images, I can see a modern smartphone with a       │ │
│ │  distinctive triple camera array, glass back, and premium        │ │
│ │  build quality typical of current flagship devices.              │ │
│ │                                                                   │ │
│ └───────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Expanded State**:
- Smooth height transition (`transition-all duration-300`)
- Top border separator
- Text: `text-sm text-muted-foreground leading-relaxed`
- Padding: `pt-2`

---

## 7. ConfidenceBadge Variants

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  Size: Small (default)                                               │
│  ┌──────┐  ┌───────┐  ┌───────┐                                    │
│  │✓ 95% │  │  78%  │  │⚠ 62% │                                     │
│  └──────┘  └───────┘  └───────┘                                    │
│  (green)   (yellow)    (red)                                        │
│                                                                       │
│  Size: Medium                                                        │
│  ┌────────┐  ┌─────────┐  ┌─────────┐                              │
│  │ ✓ 95%  │  │   78%   │  │ ⚠ 62%  │                               │
│  └────────┘  └─────────┘  └─────────┘                              │
│                                                                       │
│  Size: Large                                                         │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐                        │
│  │  ✓ 95%   │  │    78%    │  │  ⚠ 62%   │                         │
│  └──────────┘  └───────────┘  └───────────┘                        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Size Specifications**:
- **Small**: `px-2 py-0.5 text-xs`, icon `w-3 h-3`
- **Medium**: `px-2.5 py-1 text-sm`, icon `w-3.5 h-3.5`
- **Large**: `px-3 py-1.5 text-base`, icon `w-4 h-4`

---

## 8. ConfidenceTooltip

```
                        [i]  ← trigger (info icon)
                         │
                         ▼
        ┌──────────────────────────────────────┐
        │ AI Confidence Scores                 │
        │ ──────────────────────────────────── │
        │                                      │
        │ 🟢 90-100% - High confidence         │
        │    AI is very certain this is        │
        │    correct                           │
        │                                      │
        │ 🟡 70-89% - Medium confidence        │
        │    AI thinks this is likely          │
        │    correct                           │
        │                                      │
        │ 🔴 Below 70% - Low confidence        │
        │    Please verify this category       │
        │                                      │
        │ ──────────────────────────────────── │
        │ Our AI analyzes your images to       │
        │ suggest the most appropriate         │
        │ category                             │
        └──────────────────────────────────────┘
```

**Tooltip Styling**:
- Dark background (uses default tooltip theme)
- Max width: `max-w-xs`
- Padding: `p-4`
- Text size: `text-xs`
- Emoji size: `text-lg`

---

## 9. ManualCategoryGrid (Collapsed)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Or browse all categories manually                            ▼ ││
│  └─────────────────────────────────────────────────────────────────┘│
│  (muted background, hover effect)                                   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. ManualCategoryGrid (Expanded)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Or browse all categories manually                            ▲ ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 🔍  Search categories...                                        ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │
│  │ 📱       │  │ 💻       │  │ 👕       │                          │
│  │Electronics│ │ Laptops  │  │ Clothing │                          │
│  │ Phones... │  │ Compu... │  │ Apparel..│                          │
│  └──────────┘  └──────────┘  └──────────┘                          │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                          │
│  │ 🏠       │  │ 🏋️        │  │ 📚       │                          │
│  │ Home &   │  │ Sports & │  │ Books &  │                          │
│  │ Garden   │  │ Outdoors │  │ Media    │                          │
│  └──────────┘  └──────────┘  └──────────┘                          │
│                                                                       │
│  (More categories...)                                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Search Input**:
- Icon: Search (left, `absolute left-3`)
- Padding: `pl-10` (to accommodate icon)
- Full width

**Category Cards**:
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Gap: `gap-3`
- Icon size: `w-5 h-5`
- Description: `text-xs line-clamp-2`

---

## 11. SelectionMethodBadge

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  AI Selection:                                                       │
│  ┌──────────────────────┐                                           │
│  │ 🤖 AI Suggested (95%) │                                           │
│  └──────────────────────┘                                           │
│  (purple background)                                                 │
│                                                                       │
│  Manual Selection:                                                   │
│  ┌────────────────────────┐                                         │
│  │ 👤 Manually Selected   │                                         │
│  └────────────────────────┘                                         │
│  (gray background)                                                   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Badge Styling**:
- Size: `text-xs font-medium`
- Padding: `px-2.5 py-1`
- Shape: `rounded-full`
- Icons: `w-3.5 h-3.5`
- AI: Purple theme
- Manual: Gray theme

---

## 12. CategoryReasoning (Collapsed)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ✨ Why this category? ▼                                            │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 13. CategoryReasoning (Expanded)

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  ✨ Why this category? ▲                                            │
│  ──────────────────────────────────────────────────────────────────│
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ✨ Based on the images, I can see a modern smartphone with a   │ │
│  │    distinctive triple camera array, glass back, and premium    │ │
│  │    build quality typical of current flagship devices.          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  (purple tinted background)                                          │
│                                                                       │
│  KEY FEATURES IDENTIFIED                                             │
│  • Triple rear camera system with advanced sensors                   │
│  • Premium glass and metal construction                              │
│  • Large OLED display with minimal bezels                            │
│  • Wireless charging capability visible                              │
│  • Flagship-tier specifications                                      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Reasoning Box**:
- Background: `bg-purple-500/5`
- Border: `border border-purple-500/10`
- Padding: `p-3`
- Icon: Sparkles in purple

**Feature List**:
- Bullet style: Small purple dot (`w-1.5 h-1.5 rounded-full bg-purple-500`)
- Text: `text-sm text-muted-foreground`
- Spacing: `space-y-1.5`

---

## Responsive Layout Examples

### Mobile (<640px)

```
┌──────────────────────────┐
│ Select Category       [i]│
│                          │
│ ┌──────────────────────┐ │
│ │                      │ │
│ │  📱  Smartphones     │ │
│ │      95% ✓          │ │
│ │                      │ │
│ │  [Select This...]    │ │
│ │                      │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │                      │ │
│ │  💻  Laptops         │ │
│ │      78%            │ │
│ │                      │ │
│ │  [Select This...]    │ │
│ │                      │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │                      │ │
│ │  📷  Cameras         │ │
│ │      62% ⚠          │ │
│ │                      │ │
│ │  [Select This...]    │ │
│ │                      │ │
│ └──────────────────────┘ │
│                          │
└──────────────────────────┘
```

### Tablet (640px-1024px)

```
┌─────────────────────────────────────────────────┐
│ Select Category                              [i]│
│                                                  │
│ ┌──────────────────┐  ┌──────────────────┐     │
│ │                  │  │                  │     │
│ │  📱  Smartphones │  │  💻  Laptops     │     │
│ │      95% ✓      │  │      78%        │     │
│ │                  │  │                  │     │
│ │  [Select...]     │  │  [Select...]     │     │
│ │                  │  │                  │     │
│ └──────────────────┘  └──────────────────┘     │
│                                                  │
│ ┌──────────────────┐                            │
│ │                  │                            │
│ │  📷  Cameras     │                            │
│ │      62% ⚠      │                            │
│ │                  │                            │
│ │  [Select...]     │                            │
│ │                  │                            │
│ └──────────────────┘                            │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Desktop (>1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Select Category                                               [i]   │
│                                                                       │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐                     │
│ │            │  │            │  │            │                     │
│ │ 📱         │  │ 💻         │  │ 📷         │                     │
│ │ Smartphones│  │ Laptops    │  │ Cameras    │                     │
│ │ 95% ✓     │  │ 78%       │  │ 62% ⚠     │                     │
│ │            │  │            │  │            │                     │
│ │ [Select..] │  │ [Select..] │  │ [Select..] │                     │
│ │            │  │            │  │            │                     │
│ └────────────┘  └────────────┘  └────────────┘                     │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Color Reference

### Confidence Colors (with alpha transparency)

```
High (90-100%):
├─ Background: bg-green-500/10   (#22c55e at 10% opacity)
├─ Text:       text-green-700    (#15803d)
├─ Text Dark:  text-green-400    (#4ade80)
└─ Border:     border-green-500/20 (#22c55e at 20% opacity)

Medium (70-89%):
├─ Background: bg-yellow-500/10  (#eab308 at 10% opacity)
├─ Text:       text-yellow-700   (#a16207)
├─ Text Dark:  text-yellow-400   (#facc15)
└─ Border:     border-yellow-500/20 (#eab308 at 20% opacity)

Low (<70%):
├─ Background: bg-red-500/10     (#ef4444 at 10% opacity)
├─ Text:       text-red-700      (#b91c1c)
├─ Text Dark:  text-red-400      (#f87171)
└─ Border:     border-red-500/20 (#ef4444 at 20% opacity)
```

### AI Branding Colors

```
Purple Theme:
├─ Primary:    text-purple-500   (#a855f7)
├─ Background: bg-purple-500/10  (#a855f7 at 10% opacity)
├─ Text:       text-purple-700   (#7e22ce)
├─ Text Dark:  text-purple-400   (#c084fc)
└─ Border:     border-purple-500/20 (#a855f7 at 20% opacity)
```

---

## Animation Timing

```
State Changes:      300ms (transition-all duration-300)
Color Transitions:  200ms (transition-colors duration-200)
Hover Scale:        200ms (transform)
Expand/Collapse:    300ms (max-height + opacity)

Sparkles Rotation:  3s ease-in-out infinite
Dot Bounce:         1.4s ease-in-out infinite (staggered by 0.2s)
Skeleton Pulse:     2s cubic-bezier(0.4, 0, 0.6, 1) infinite
```

---

## Touch Target Sizes

```
Minimum:     44x44px   (WCAG AAA)
Recommended: 48x48px   (Material Design)

Component Sizes:
├─ Select Button:        Full width × 40px (10 in Tailwind)
├─ Expand Trigger:       Auto × 36px (min, with padding)
├─ Category Card:        Full card area (large enough)
├─ Tooltip Trigger:      24x24px (info icon with padding)
└─ Search Input:         Full width × 40px
```

---

**Version**: 1.0.0
**Last Updated**: 2025-10-26
**Design By**: Tal (Senior Front-End Developer)
