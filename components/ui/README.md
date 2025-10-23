# shadcn/ui Component Library

This directory contains all shadcn/ui components installed for the Second-Hand Marketplace platform. All components are built with accessibility (WCAG 2.1 AA compliant), dark mode support, and mobile-first responsive design.

## Installed Components

### Form Components (8 components)
Essential for user input and data collection:

- **Button** (`button.tsx`) - Primary action component with variants
- **Input** (`input.tsx`) - Text input field
- **Textarea** (`textarea.tsx`) - Multi-line text input
- **Select** (`select.tsx`) - Dropdown selection component
- **Radio Group** (`radio-group.tsx`) - Single choice selection
- **Checkbox** (`checkbox.tsx`) - Multiple choice selection
- **Label** (`label.tsx`) - Form field labels
- **Form** (`form.tsx`) - Form wrapper with validation (React Hook Form + Zod)

### Layout Components (5 components)
For structuring pages and organizing content:

- **Card** (`card.tsx`) - Content container with header, body, footer
- **Separator** (`separator.tsx`) - Visual divider between sections
- **Tabs** (`tabs.tsx`) - Tabbed content organization
- **Sheet** (`sheet.tsx`) - Slide-out panel (mobile menu, filters)
- **Dialog** (`dialog.tsx`) - Modal dialogs and confirmations

### Data Display Components (4 components)
For presenting information to users:

- **Badge** (`badge.tsx`) - Status indicators and tags
- **Avatar** (`avatar.tsx`) - User profile images with fallback
- **Skeleton** (`skeleton.tsx`) - Loading placeholders
- **Table** (`table.tsx`) - Data tables with headers and rows

### Feedback Components (3 components)
For user notifications and feedback:

- **Sonner** (`sonner.tsx`) - Toast notifications (modern toast system)
- **Alert** (`alert.tsx`) - Inline alert messages
- **Progress** (`progress.tsx`) - Progress bars and loading indicators

### Navigation Components (4 components)
For site navigation and wayfinding:

- **Breadcrumb** (`breadcrumb.tsx`) - Hierarchical navigation
- **Pagination** (`pagination.tsx`) - Page navigation for lists
- **Navigation Menu** (`navigation-menu.tsx`) - Main site navigation
- **Dropdown Menu** (`dropdown-menu.tsx`) - Contextual menus

### Additional UI Components (5 components)
For enhanced interactions and specialized use cases:

- **Slider** (`slider.tsx`) - Range selection (price filters)
- **Switch** (`switch.tsx`) - Toggle switches
- **Calendar** (`calendar.tsx`) - Date picker component
- **Popover** (`popover.tsx`) - Floating content panels
- **Command** (`command.tsx`) - Command palette (search, quick actions)

## Total Components: 29

---

## Usage Examples

### Form with Validation

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Log in</Button>
      </form>
    </Form>
  )
}
```

### Responsive Card Grid

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function ListingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>iPhone 12 Pro</CardTitle>
          <CardDescription>128GB, Space Grey</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge>Electronics</Badge>
          <p className="mt-2 text-2xl font-bold">R 8,500</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full">View Details</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

### Toast Notifications

```tsx
"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function ToastDemo() {
  return (
    <Button
      onClick={() => {
        toast.success("Listing created successfully!", {
          description: "Your item is pending admin approval.",
        })
      }}
    >
      Create Listing
    </Button>
  )
}

// Add <Toaster /> to your root layout:
// import { Toaster } from "@/components/ui/sonner"
//
// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body>
//         {children}
//         <Toaster />
//       </body>
//     </html>
//   )
// }
```

### Dialog Modal

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function ConfirmDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Listing</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your listing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Mobile-First Responsive Patterns

All components are designed with mobile-first approach. Use Tailwind breakpoints:

```tsx
// Mobile (default, < 640px)
<div className="flex flex-col gap-2 p-4">

// Tablet (sm: 640px+)
<div className="flex flex-col gap-2 p-4 sm:flex-row sm:gap-4">

// Desktop (md: 768px+, lg: 1024px+)
<div className="flex flex-col gap-2 p-4 sm:flex-row sm:gap-4 lg:p-6 xl:max-w-7xl xl:mx-auto">
```

### Responsive Grid Example

```tsx
// 1 column on mobile, 2 on tablet, 3 on desktop, 4 on large screens
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Content */}
</div>
```

---

## Accessibility Requirements

All components meet WCAG 2.1 AA compliance:

### Keyboard Navigation
- All interactive elements are keyboard accessible (Tab, Enter, Space, Arrow keys)
- Focus indicators visible with `focus:ring-2 focus:ring-blue-500`
- Logical tab order maintained

### Screen Reader Support
- Semantic HTML elements used (`<button>`, `<nav>`, `<form>`, etc.)
- ARIA labels on icons and controls
- Form fields have associated labels
- Error messages announced

### Color Contrast
- Text contrast ratios meet 4.5:1 minimum (WCAG AA)
- UI elements meet 3.1 minimum
- Dark mode colors also meet contrast requirements

### Touch Targets
- Minimum 44x44px touch target size on mobile
- Adequate spacing between interactive elements

### Implementation Example

```tsx
<button
  type="button"
  aria-label="Close menu"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClose()
    }
  }}
  className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  <X className="w-5 h-5" aria-hidden="true" />
</button>
```

---

## Dark Mode Support

All components support dark mode using the `.dark` class. Theme colors are defined in `app/globals.css` using CSS variables.

```tsx
// Automatically adapts to dark mode
<Card className="bg-background text-foreground">
  <CardHeader>
    <CardTitle>Dark Mode Ready</CardTitle>
  </CardHeader>
</Card>
```

---

## TypeScript Integration

All components are fully typed with TypeScript interfaces:

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  asChild?: boolean
}
```

Use type-safe props:

```tsx
<Button variant="destructive" size="lg" disabled>
  Delete
</Button>
```

---

## Component Composition

shadcn/ui components are designed for composition over configuration:

```tsx
// ✅ GOOD: Compose multiple components
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Product Title</CardTitle>
      <Badge>New</Badge>
    </div>
  </CardHeader>
  <CardContent>
    <p>Description here</p>
  </CardContent>
  <CardFooter>
    <Button>View</Button>
  </CardFooter>
</Card>

// ❌ AVOID: Excessive prop drilling
<Card title="Product" badge="New" description="..." buttonText="View" />
```

---

## Styling with Tailwind CSS

IMPORTANT: Always use Tailwind utility classes. Never use inline styles or `<style>` tags.

```tsx
// ✅ CORRECT: Tailwind classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
</div>

// ❌ WRONG: Inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

### Using cn() Utility

Use the `cn()` utility from `@/lib/utils` for conditional classes:

```tsx
import { cn } from "@/lib/utils"

<Button
  className={cn(
    "base-classes",
    isActive && "bg-blue-500 text-white",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click me
</Button>
```

---

## Integration with Next.js

### Server Components (Default)
Most components can be used in Server Components:

```tsx
// app/page.tsx (Server Component)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
    </Card>
  )
}
```

### Client Components
For interactive components, use `"use client"` directive:

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"

export function InteractiveComponent() {
  const [open, setOpen] = useState(false)
  // ... interactive logic
}
```

### Next.js Link Integration
Use `asChild` prop to compose with Next.js Link:

```tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

<Button asChild>
  <Link href="/listings">View Listings</Link>
</Button>
```

---

## Best Practices

### Component Organization
- Keep components small and focused
- Use composition over inheritance
- Extract reusable patterns into custom components

### Performance
- Server Components by default (no client-side JavaScript)
- Use `"use client"` only when needed (state, events, browser APIs)
- Lazy load heavy components with `dynamic()` import

### Accessibility Checklist
- [ ] Semantic HTML elements
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation support (Tab, Enter, Space)
- [ ] Focus indicators visible
- [ ] Form labels associated with inputs
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets at least 44x44px
- [ ] Screen reader friendly

---

## Next Steps for Frontend Development

With all components installed, frontend agents can now:

1. **Build Authentication UI** (Login, Register, Password Reset forms)
2. **Create Listing Forms** (Multi-step forms with image upload)
3. **Design Product Cards** (Grid/list views with responsive layouts)
4. **Implement Navigation** (Header, sidebar, breadcrumbs)
5. **Add User Dashboards** (Seller/buyer/admin panels)
6. **Create Admin Moderation UI** (Approval workflows)
7. **Build Offer System UI** (Offer forms, negotiation interface)
8. **Design Search & Filters** (Search bar, filter panels)

---

## Resources

- **shadcn/ui Documentation**: https://ui.shadcn.com
- **Radix UI Primitives**: https://www.radix-ui.com
- **Tailwind CSS**: https://tailwindcss.com
- **React Hook Form**: https://react-hook-form.com
- **Zod Validation**: https://zod.dev

---

**Component Library Status**: ✅ Complete and Production Ready

All 29 components are installed, TypeScript compilation successful, and ready for frontend development.
