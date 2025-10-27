# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Second-Hand Marketplace Platform** for the South African market, built with Next.js 16.0.0, React 19.2.0, TypeScript, and Tailwind CSS v4. The platform enables users to buy and sell pre-owned items with admin moderation, offer negotiation, and a 20% commission model.

The project follows the Next.js App Router architecture with React Server Components (RSC) enabled, using shadcn/ui for component design and a mobile-first responsive approach.

## Development Commands

**Package Manager**: This project uses **pnpm** (not npm). Always use `pnpm` commands.

- **Start dev server**: `pnpm dev` (runs on port 3000)
  - If port 3000 is in use: `npx kill-port 3000 && pnpm dev`

**Pre-Testing Workflow (REQUIRED before any feature testing):**
1. **Check Dev Server Status**:
   - Run `lsof -ti:3000` to check if server is running
   - If not running: `pnpm dev` in background, wait 5-10 seconds
   - If running: Continue to next step
   - If port occupied by wrong process: `npx kill-port 3000 && pnpm dev`

**Post-Feature Workflow (MANDATORY after any feature change):**
1. **Ensure Dev Server Running**: Follow Pre-Testing Workflow above
2. **Update Library Docs**: Use context7 MCP (`resolve-library-id` + `get-library-docs`) to ensure subagents have current documentation for any libraries used in the feature
3. **Browser Testing**: Use Playwright MCP to test the feature in a real browser environment
4. **Run Tests**: Execute `pnpm test` to ensure no regressions
5. **Manual Verification**: If applicable, perform manual testing of critical user paths
- **Build production**: `pnpm build`
- **Start production server**: `pnpm start`
- **Lint**: `pnpm lint` (uses ESLint with Next.js config)
- **Install dependencies**: `pnpm install` (regenerates pnpm-lock.yaml)
- **Test**: `pnpm test` (run all tests)
- **Test watch mode**: `pnpm test:watch` (re-run on file changes)
- **Test coverage**: `pnpm test:coverage` (generate coverage report)
- **Database commands**:
  - Generate Prisma client: `npx prisma generate` (auto-runs via postinstall hook)
  - Create migration: `npx prisma migrate dev --name migration_name`
  - Apply migrations: `npx prisma migrate deploy`
  - Push schema changes (dev only): `npx prisma db push`
  - Reset database: `npx prisma migrate reset`
  - Seed database: `npx tsx scripts/seed-neon.ts`
  - Studio (GUI): `npx prisma studio`

## Architecture & Structure

### Directory Structure
- `app/` - Next.js App Router pages with server actions
  - `page.tsx` - Homepage with listings-first design
  - `layout.tsx` - Root layout with Geist fonts, theme provider, Toaster
  - `globals.css` - Global Tailwind styles with CSS variables
  - `auth/` - Authentication routes (login, register, verify-email, reset-password)
  - `listings/` - Browse, view, and create listings
  - `sell/` - Authentication gateway for listing creation
  - `dashboard/` - User dashboard (my-listings, settings)
  - `admin/` - Admin backoffice (dashboard, listings, users)
  - `api/` - API routes (auth, webhooks, generate-description, suggest-category)
- `components/` - React components organized by feature
  - `ui/` - shadcn/ui base components (alert-dialog, chart, etc.)
  - `auth/` - Authentication forms and UI
  - `listings/` - Listing cards, filters, search, image upload, sell FAB, AI description generator, category selector, category reasoning
  - `dashboard/` - Dashboard-specific components
  - `admin/` - Admin backoffice components
  - `theme-provider.tsx` - next-themes wrapper
- `lib/` - Core utilities and configurations
  - `prisma.ts` - Singleton Prisma client instance
  - `auth-helpers.ts` - Authentication utilities (requireAdmin, isAdmin, etc.)
  - `audit-log.ts` - Admin audit trail utilities
  - `cloudinary.ts` - Image upload utilities
  - `email.ts` - Email sending utilities
  - `validations/` - Zod schemas for forms
  - `helpers/` - Helper functions (e.g., `listing-helpers.ts` for Decimal serialization)
  - `ai/` - AI-powered features
    - `prompts/` - AI prompt templates (description generation, category suggestion)
    - `category-suggester.ts` - Category suggestion service
    - `category-matcher.ts` - Category matching and scoring logic
    - `category-cache.ts` - Caching layer for AI suggestions
  - `constants/` - Category definitions, provinces, etc.
- `prisma/` - Database schema and migrations
  - `schema.prisma` - Database models and enums
  - `migrations/` - Migration history
- `scripts/` - Utility scripts
  - `seed-neon.ts` - Database seeding script
  - `check-admin.ts` - Verify admin user exists
  - `reset-admin-password.ts` - Reset admin credentials
- `docs/features/` - Feature documentation
  - `admin-backoffice-dashboard.md` - Admin dashboard comprehensive guide
  - `ai-enhanced-listing-creation.md` - AI description generation guide
  - `admin-user-management.md` - User management feature docs
- `docs/user-guides/` - End-user documentation
  - `ai-category-suggestions.md` - How to use AI category suggestions
- `docs/admin-guides/` - Admin documentation
  - `category-management.md` - Category management guide
- `docs/fix_bugs/` - Bug fix documentation and history
  - `README.md` - Guidelines and bug fixes log
  - `2025-01-27-image-upload-category-ai-fixes.md` - AI category suggestion fix
- `__tests__/` - Test files mirroring app and components structure
  - `app/` - Page component tests
  - `components/` - Component unit tests
- `auth.ts` & `auth.config.ts` - NextAuth.js v5 configuration
- `middleware.ts` - Route protection middleware
- `jest.config.ts` & `jest.setup.ts` - Jest testing configuration

### Key Technologies
- **Next.js 16.0.0** with App Router and React Server Components
- **React 19.2.0** with Suspense boundaries
- **TypeScript 5** with strict mode enabled
- **Tailwind CSS v4** with PostCSS and CSS variables
- **shadcn/ui** components (New York style)
- **Prisma ORM** with PostgreSQL (Neon serverless DB)
- **NextAuth.js v5** (beta.29) with credentials provider
- **Cloudinary** for image uploads and CDN
- **Resend** for transactional emails
- **OpenAI GPT-4o Vision** for AI-assisted listing descriptions
- **React Hook Form** + **Zod v4** for form validation
- **bcryptjs** for password hashing
- **Lucide React** for icons
- **Recharts 2.15.4** for admin analytics charts
- **Geist fonts** from next/font
- **Jest** + **React Testing Library** for testing
- **@testing-library/jest-dom** for custom matchers
- **Playwright MCP** for browser automation and E2E testing
- **Context7 MCP** for up-to-date library documentation

### Path Aliases
The project uses `@/*` path alias mapping to root directory:
- `@/components` → components directory
- `@/lib/utils` → lib/utils.ts
- `@prisma/client` → Prisma client (auto-generated in node_modules)
- `@/components/ui` → shadcn/ui components
- `@/hooks` → custom React hooks

### Important Architectural Patterns

**Server Actions Pattern**
- Each route with forms has an `actions.ts` file for server-side mutations
- Server actions are marked with `'use server'` directive
- Return type is always `Promise<{ success: boolean; error?: string; ... }>`
- Use `revalidatePath()` and `redirect()` for navigation after mutations
- Example: `app/listings/create/actions.ts`, `app/auth/login/actions.ts`

**Client Components Pattern**
- Wrapper components separate URL state management from UI components
- Pattern: `*-wrapper.tsx` (client) wraps pure UI component (can be server/client)
- URL state synced via `useSearchParams()` and `router.push()`
- Examples: `search-bar-wrapper.tsx`, `filter-panel-wrapper.tsx`
- **CRITICAL**: When using `useEffect` with `searchParams` dependency and `router.push()`, ALWAYS check if URL actually changed before pushing to prevent infinite loops:
  ```typescript
  useEffect(() => {
    const newUrl = buildUrl()
    const currentUrl = getCurrentUrl()
    if (newUrl !== currentUrl) {
      router.push(newUrl, { scroll: false })
    }
  }, [filters, router, searchParams])
  ```

**Prisma Client Usage**
- ALWAYS import from `@/lib/prisma` for the singleton client instance
- NEVER instantiate `new PrismaClient()` directly
- Import types from `@prisma/client` (e.g., `import { Prisma, ListingStatus } from '@prisma/client'`)
- Prisma client generates to `node_modules/@prisma/client` (default location)
- After schema changes: `npx prisma generate && npx prisma db push`
- The `postinstall` script automatically runs `prisma generate` after dependency installation

**Image Handling**
- Images uploaded to Cloudinary via `lib/cloudinary.ts`
- Next.js Image component configured for Cloudinary and Unsplash domains
- Images stored as URL strings in database
- Primary image is duplicated from first image in array

**Authentication Flow**
- NextAuth.js v5 with custom credentials provider
- Session strategy: JWT (no database sessions)
- Protected routes enforced in `middleware.ts`
- Email verification required before full access
- Password reset via time-limited tokens stored in database
- Account lockout after 5 failed login attempts (30 min cooldown)

**Selling Flow Pattern**
- `/sell` route acts as authentication gateway for listing creation
- Unauthenticated users redirected to login with callback URL
- Authenticated users redirected directly to `/listings/create`
- SellFAB component provides quick access from any page
- User journey: Click "Sell" → Auth check → `/listings/create`

**AI-Powered Listing Creation**
- OpenAI GPT-4o Vision API integration for intelligent content generation
- Flow: Upload images → AI generates title AND description from images
- Multi-step form order: Category → Images → AI-Assisted Details → Pricing → Location
- AI description generator component: `/components/listings/ai-description-generator.tsx`
- API endpoint: `/app/api/generate-description/route.ts`
- Three template styles: Detailed, Concise, Storytelling
- Title extraction via regex pattern: `/^TITLE:\s*(.+?)(?:\n\n|\n)/`
- User can edit AI suggestions before applying
- Templates in `/lib/ai/prompts/description-templates.ts`

**AI-Powered Category System**
- **Images-First Flow**: New listing creation prioritizes images over category selection
- **Category Suggestion API**: GPT-4o Vision analyzes product images to suggest categories
  - Service: `/lib/ai/category-suggester.ts`
  - Prompts: `/lib/ai/prompts/category-suggestion.ts` (v1, v2, v3 variants)
  - Returns 2-3 ranked suggestions with confidence scores (0-100)
  - A/B testing support for prompt optimization
  - Token-efficient with 'low' detail images (65 tokens vs 1105 for 'high')
- **Dynamic Category Model**: Replaced fixed enum with flexible database table
  - Model: `Category` in `prisma/schema.prisma`
  - Hierarchical structure with parent-child relationships
  - Fields: name, slug, icon, description, isActive, itemCount, aiGenerated
  - Admin can create, merge, and manage categories
- **Category Selector Component**: `/components/listings/category-selector.tsx`
  - Search functionality with smart filtering
  - AI suggestions section (Sparkles badge)
  - Recently used categories
  - Popular categories by item count
  - Hierarchical navigation with breadcrumbs
- **Category Reasoning UI**: `/components/listings/category-reasoning.tsx`
  - Expandable panel showing AI reasoning
  - Key features identified by vision model
  - Purple sparkles icon for AI-powered features
- **Admin Category Management**: `/admin/categories`
  - List and tree view modes
  - Create, edit, merge, and delete categories
  - Analytics: category distribution charts
  - Audit logging for all category actions
  - Components in `/components/admin/category-*.tsx`

### Styling Approach
- Tailwind CSS v4 with CSS variables for theming
- `cn()` utility function for merging class names (clsx + tailwind-merge)
- Dark mode supported via `next-themes` with class strategy
- Base color: neutral
- Custom radius: `--radius: 0.625rem`
- OKLCH color space for all theme colors
- No custom prefix for Tailwind classes

## Business Logic & Domain Concepts

### User Roles
- **Seller**: Creates listings, manages items, receives offers
- **Buyer**: Browse items, make purchases, submit offers
- **Admin**: Moderate listings, manage platform, view analytics (requires `role: ADMIN` in database)

### Admin Access
- **Authentication**: Two-layer security model
  - Layer 1: Middleware checks authentication via `auth.config.ts`
  - Layer 2: Page-level `requireAdmin()` helper validates ADMIN role
- **Helper Functions** (`lib/auth-helpers.ts`):
  - `requireAdmin()` - Redirects non-admin users, use in server components
  - `getAdminSession()` - Returns admin user or null, non-redirecting
  - `isAdmin()` - Boolean check for current session
  - `isAdminUser(user)` - Synchronous role check
- **Audit Logging**: Admin actions tracked via `AdminAuditLog` model
  - Use `createAuditLog()` from `lib/audit-log.ts` for all admin actions
  - Non-blocking: Audit failures don't interrupt admin operations
  - Queryable via `getAuditLogs()`, `getAuditLogsByTarget()`, `countAuditLogs()`

### Core Workflows
- **Selling Flow**: User clicks "Sell" → `/sell` gateway → Auth check → `/listings/create` form
  - Unauthenticated: `/sell` → `/auth/login?callbackUrl=/listings/create` → `/listings/create`
  - Authenticated: `/sell` → `/listings/create`
- **Listing Creation**: Multi-step form → Admin approval → Public listing
  1. **Images First** (up to 10 images via Cloudinary)
  2. **AI Category Suggestion** (automatic analysis of uploaded images)
  3. Category selection (with AI suggestions highlighted)
  4. Details (title + description, with AI generation option)
  5. Pricing (fixed price or accept offers)
  6. Location (city + province)
  7. Preview and Submit
- **Preview Submit Pattern**: After submission, listing is saved but user stays on preview page with "Continue" button instead of auto-redirecting. This allows users to review their final listing before proceeding to success page.
- **AI-Assisted Content**: After uploading images, users can generate title and description via GPT-4o Vision
- **Pricing Options**: Fixed price OR accept offers (with optional minimum)
- **Commission**: 20% platform fee on all successful transactions
- **Approval Process**: All user-created listings require admin approval before going live

### Key Data Models

All models defined in `prisma/schema.prisma`:

**User**
- Authentication: email/password with bcrypt hashing
- Role: BUYER, SELLER, or ADMIN (can have multiple roles functionally)
- Email verification required (`emailVerified` timestamp)
- Account security: `failedLoginAttempts`, `lockoutUntil`
- Profile: name, phone, city, province, rating, reviewCount

**Listing**
- Categories: Now references `Category` table (dynamic, admin-managed)
  - Legacy enum: ELECTRONICS, CLOTHING, HOME_GARDEN, SPORTS, BOOKS, TOYS, VEHICLES, COLLECTIBLES, BABY_KIDS, PET_SUPPLIES (still exists for backwards compatibility)
  - New approach: Flexible category hierarchy with parent-child relationships
- Condition: NEW, LIKE_NEW, GOOD, FAIR, POOR
- Pricing: FIXED (with price) or OFFERS (minimum price optional)
- Status flow: PENDING → APPROVED → SOLD (or REJECTED/PAUSED)
- Images: Array of URLs, primaryImage field
- Search: title + description (no full-text search yet)
- Location: city + province (South African provinces)

**Category** (New Dynamic Model)
- Hierarchical structure: parent-child relationships via `parentId`
- Fields: name, slug (unique), icon (Lucide icon name), description
- Status: `isActive` boolean for soft-enable/disable
- Metrics: `itemCount` tracks number of listings per category
- AI Integration: `aiGenerated` boolean marks AI-suggested categories
- Self-referential relation: `parent` and `children` for tree navigation
- Cascade protection: `onDelete: Restrict` prevents deleting categories with children
- Indexed for performance: slug, parentId, isActive, aiGenerated, itemCount

**Transaction** (not yet fully implemented)
- Links buyer, seller, and listing
- Commission calculation: 20% platform fee
- Status: PENDING, COMPLETED, CANCELLED, REFUNDED

**Offer** (not yet implemented)
- Negotiation system for listings with OFFERS pricing type
- Status: PENDING, ACCEPTED, REJECTED, EXPIRED, COUNTERED
- Expiry timestamp for time-limited offers

**Tokens** (VerificationToken, PasswordResetToken)
- Time-limited tokens for email verification and password reset
- Automatically cleaned up on use or expiry

**AdminAuditLog**
- Tracks all administrative actions for compliance and accountability
- Fields: userId, action (enum), targetType (enum), targetId, details (JSON)
- Indexed for efficient queries by user, action, target, and date
- Actions: APPROVE_LISTING, REJECT_LISTING, PAUSE_LISTING, DELETE_LISTING, CREATE_USER, UPDATE_USER_ROLE, etc.
- Managed via `lib/audit-log.ts` helper functions

## UI/UX Patterns

### Mobile-First Responsive Design
- **Default (unprefixed)**: Mobile styles (< 640px)
- **Progressive enhancement**: Use `sm:`, `md:`, `lg:`, `xl:` breakpoints
- Example: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

### Homepage Design
- **Listings-first marketplace approach**: Primary focus on browsing items
- **Reduced marketing content**: ~40% less promotional content than traditional landing pages
- **Compact hero section**: Brief value proposition, quick access to selling
- **SellFAB integration**: Floating action button for easy listing creation
- **Direct listing display**: Homepage shows live marketplace inventory

### FAB Component Pattern
- **Fixed positioning**: Bottom-right (mobile) or top-right (desktop)
- **Responsive variants**: Adapts layout at 640px breakpoint
- **Mobile**: Circular button with icon only
- **Desktop**: Pill-shaped button with icon and text
- **Accessibility**: Keyboard navigable (Tab + Enter), WCAG 2.1 AA compliant
- **Usage**: Add to any page for quick access to selling flow

### shadcn/ui Component Usage
- **Composition over props**: Use component composition pattern
- **Form handling**: React Hook Form + Zod validation
- **Accessibility**: WCAG 2.1 AA compliance required
- Components are copy-paste and customizable (in `components/ui/`)
- Use `cn()` utility from `@/lib/utils` for conditional classes

### Theming
- Uses Tailwind CSS v4 with OKLCH color space
- Dark mode supported via `.dark` class
- CSS variables defined in `app/globals.css`
- Custom radius: `--radius: 0.625rem` with variants (sm, md, lg, xl)

## Component Library

### SellFAB Component

**File:** `/components/listings/sell-fab.tsx`
**Type:** Client component
**Purpose:** Floating action button for easy access to listing creation

**Usage:**
```tsx
import { SellFAB } from '@/components/listings/sell-fab'

export default function Page() {
  return (
    <>
      {/* Page content */}
      <SellFAB />
    </>
  )
}
```

**Props:**
- `variant?: 'mobile' | 'desktop' | 'responsive'` - Layout variant (default: responsive)
- `className?: string` - Additional CSS classes

**Features:**
- Responsive design (adapts at 640px breakpoint)
- Keyboard accessible (Tab + Enter)
- WCAG 2.1 AA compliant
- Links to `/sell` route

**Responsive Behavior:**
- Mobile (< 640px): Circular button, bottom-right, icon only
- Desktop (≥ 640px): Pill button, top-right, icon + "Sell an Item" text

## Testing

**Framework:** Jest + React Testing Library
**Configuration:** `jest.config.ts`, `jest.setup.ts`
**Test Location:** `__tests__/` directory (mirrors `app/` and `components/` structure)

**Running Tests:**
- All tests: `pnpm test`
- Watch mode: `pnpm test:watch`
- Coverage report: `pnpm test:coverage`

**Playwright MCP Browser Testing:**
- Use Playwright MCP for end-to-end browser testing after feature changes
- Available tools: `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_fill_form`, `browser_take_screenshot`
- ALWAYS test UI features in the browser before considering them complete
- Test workflow: Navigate → Snapshot → Interact → Verify

**Coverage Thresholds:**
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

**Test Files:**
- `__tests__/components/listings/sell-fab.test.tsx` - SellFAB component tests (21 tests)
- `__tests__/app/sell/page.test.tsx` - Sell gateway route tests (13 tests)
- `__tests__/app/home/page.test.tsx` - Homepage tests (34 tests)

**Testing Patterns:**
- Use `render()` from `@testing-library/react` for component mounting
- Use `screen.getBy*()` queries for element selection
- Use `userEvent` for simulating user interactions
- Mock Next.js router with `jest.mock('next/navigation')`
- Mock NextAuth sessions with `jest.mock('next-auth')`
- Use `waitFor()` for async assertions

## Database & Backend

**Database: Neon (Serverless PostgreSQL)**
- Connection string in `.env` as `DATABASE_URL`
- Prisma ORM with default client location (`node_modules/@prisma/client`)
- Migrations stored in `prisma/migrations/`
- Seed script: `scripts/seed-neon.ts`
- The `postinstall` hook ensures Prisma client is generated after `pnpm install`

**Authentication: NextAuth.js v5**
- Configuration split: `auth.ts` (runtime) + `auth.config.ts` (edge-compatible)
- JWT session strategy (no database sessions)
- Credentials provider with bcrypt password verification
- Email verification workflow via Resend
- Password reset with time-limited tokens

**File Storage: Cloudinary**
- Upload utilities in `lib/cloudinary.ts`
- Configured via `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Images optimized and served via Cloudinary CDN
- Next.js Image component configured for Cloudinary domain

**Email Service: Resend**
- Transactional emails via Resend API
- Utilities in `lib/email.ts`
- Templates: verification emails, password reset emails
- Configured via `RESEND_API_KEY` and `EMAIL_FROM`

**Environment Variables**
Required variables (see `.env.example`):
```
DATABASE_URL              # Neon PostgreSQL connection string
AUTH_SECRET               # NextAuth.js secret (generate with openssl rand -base64 32)
NEXTAUTH_URL              # App URL (http://localhost:3000 in dev)
NEXT_PUBLIC_APP_URL       # Public-facing app URL
RESEND_API_KEY            # Resend API key
EMAIL_FROM                # Sender email address
CLOUDINARY_CLOUD_NAME     # Cloudinary cloud name
CLOUDINARY_API_KEY        # Cloudinary API key
CLOUDINARY_API_SECRET     # Cloudinary API secret
OPENAI_API_KEY            # OpenAI API key for GPT-4o Vision (AI description generation)
```

## Important Notes

**React Server Components (RSC)**
- Default for all components unless marked with `'use client'`
- Server components can directly query database (via server actions or inline)
- Client components need server actions for data mutations
- Use Suspense boundaries for streaming and loading states

**Decimal Handling**
- Prisma Decimal type serialized as JSON in server components
- Helper functions in `lib/helpers/listing-helpers.ts`:
  - `serializeDecimal()` - Convert Decimal to JSON
  - `deserializeDecimal()` - Convert JSON back to Decimal
  - `formatPrice()` - Format as "R1,299.00"

**Search & Filtering**
- Browse page: `/listings` with URL-based filters
- Query params: `q`, `category`, `condition`, `pricingType`, `minPrice`, `maxPrice`, `province`, `sortBy`, `cursor`
- Cursor-based pagination for infinite scroll potential
- Server action: `getListings()` in `app/listings/actions.ts`

**Selling Flow**
- `/sell` route acts as authentication gateway
- Unauthenticated users redirected to login with callback
- After login, users land on `/listings/create`
- SellFAB component provides quick access from any page
- Protected route enforced via `middleware.ts`

**Currency**
- South African Rand (ZAR)
- Format: "R" prefix with comma thousands separator
- Example: "R 1,299" (no decimals for whole amounts), "R 15,999.95" (with decimals)
- Helper function: `formatZAR()` in `/lib/constants/categories.ts`
- IMPORTANT: Uses manual formatting (not `Intl.NumberFormat`) to ensure consistent server/client rendering and avoid hydration mismatches

**React Icon Component Rendering**
- NEVER render icon components directly as `{category.icon}` or `{config?.icon}`
- ALWAYS extract the component first, then render as JSX:
  ```typescript
  const Icon = category.icon
  {Icon && <Icon className="w-4 h-4" />}
  ```
- This prevents "Objects are not valid as a React child" errors

**Controlled Input Patterns**
- For text/enum fields: Use empty string (`''`) as default value, not `undefined`
- For number fields: Use `undefined` as default, then explicitly control value:
  ```typescript
  <Input
    type="number"
    value={field.value ?? ''}
    onChange={(e) => {
      const value = e.target.value ? parseFloat(e.target.value) : undefined
      field.onChange(value)
    }}
  />
  ```
- This prevents "uncontrolled to controlled" React warnings

**Hydration Best Practices**
- Add `suppressHydrationWarning` to `<html>` and `<body>` tags to handle browser extension interference
- Use consistent formatting between server and client (especially for numbers, dates, locales)
- Avoid `Intl.NumberFormat` or locale-dependent formatting that differs between environments

**TypeScript Configuration**
- Strict mode enabled
- Target: ES2017
- Module resolution: "bundler"
- Path aliases: `@/*` maps to root

**Testing Infrastructure**
- Jest + React Testing Library configured and operational
- 68 tests with 100% pass rate
- Coverage thresholds enforced: 80% for all metrics
- Test files in `__tests__/` directory
- Mock utilities for Next.js router and NextAuth
- Run tests before pushing changes
- **AI Feature Testing**:
  - Category matcher tests: `__tests__/lib/ai/category-matcher.test.ts`
  - Mock OpenAI API responses for consistent testing
  - Test coverage for confidence scoring, edge cases, and error handling

**Zod Validation Error Handling**
- ALWAYS use `.issues` (not `.errors`) when accessing Zod validation errors
- Correct pattern: `zodError.issues[0]?.message`
- Incorrect pattern: `zodError.errors[0]?.message` (will cause TypeScript errors)
- This applies to all server actions that parse form data with Zod schemas

**Vercel Deployment**
- Project uses pnpm as package manager (specified in package.json)
- `pnpm-lock.yaml` must be committed and kept in sync with `package.json`
- `postinstall` script runs `prisma generate` automatically during build
- Prisma client generates to default `node_modules/@prisma/client` location
- Required environment variables for production (see Environment Variables section)
- Production domain: `second-hand-xi.vercel.app` (set in `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`)

**Admin Dashboard Architecture**
- **Route**: `/admin` with nested routes for listings, users, analytics
- **Security**: Multi-layer protection (middleware → page-level → action-level)
- **Features**:
  - Dashboard overview with platform statistics
  - Listing moderation (approve/reject/pause/delete)
  - User management (in progress)
  - Audit logging for all admin actions
- **Key Files**:
  - `app/admin/` - Admin pages and layouts
  - `components/admin/` - Admin-specific UI components
  - `lib/auth-helpers.ts` - Admin authentication helpers
  - `lib/audit-log.ts` - Audit trail utilities
- **Documentation**: See `docs/features/admin-backoffice-dashboard.md` for comprehensive guide

**Server Action Best Practices**
- ALWAYS validate admin session at the start of admin server actions:
  ```typescript
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }
  ```
- Use `revalidatePath()` after mutations to update UI
- Return consistent `{ success: boolean; error?: string; data?: T }` shape
- Log admin actions using `createAuditLog()` for compliance
- Wrap database operations in try-catch and return user-friendly errors

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
