# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Second-Hand Marketplace Platform** for the South African market, built with Next.js 16.0.0, React 19.2.0, TypeScript, and Tailwind CSS v4. The platform enables users to buy and sell pre-owned items with admin moderation, offer negotiation, and a 20% commission model.

The project follows the Next.js App Router architecture with React Server Components (RSC) enabled, using shadcn/ui for component design and a mobile-first responsive approach.

## Development Commands

- **Start dev server**: `npm run dev` (runs on port 3000)
  - If port 3000 is in use: `npx kill-port 3000 && npm run dev`
- **Build production**: `npm run build`
- **Start production server**: `npm start`
- **Lint**: `npm run lint` (uses ESLint with Next.js config)
- **Test**: `npm test` (run all tests)
- **Test watch mode**: `npm run test:watch` (re-run on file changes)
- **Test coverage**: `npm run test:coverage` (generate coverage report)
- **Database commands**:
  - Generate Prisma client: `npx prisma generate`
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
  - `api/` - API routes (auth, webhooks)
- `components/` - React components organized by feature
  - `ui/` - shadcn/ui base components
  - `auth/` - Authentication forms and UI
  - `listings/` - Listing cards, filters, search, image upload, sell FAB
  - `dashboard/` - Dashboard-specific components
  - `theme-provider.tsx` - next-themes wrapper
- `lib/` - Core utilities and configurations
  - `prisma.ts` - Singleton Prisma client instance
  - `auth-helpers.ts` - Authentication utilities
  - `validations/` - Zod schemas for forms
  - `generated/prisma/` - Generated Prisma client (DO NOT EDIT)
- `prisma/` - Database schema and migrations
  - `schema.prisma` - Database models and enums
  - `migrations/` - Migration history
- `scripts/` - Utility scripts
  - `seed-neon.ts` - Database seeding script
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
- **React Hook Form** + **Zod** for form validation
- **bcryptjs** for password hashing
- **Lucide React** for icons
- **Geist fonts** from next/font
- **Jest** + **React Testing Library** for testing
- **@testing-library/jest-dom** for custom matchers

### Path Aliases
The project uses `@/*` path alias mapping to root directory:
- `@/components` → components directory
- `@/lib/utils` → lib/utils.ts
- `@/lib/generated/prisma` → Prisma client (auto-generated)
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

**Prisma Client Usage**
- ALWAYS import from `@/lib/prisma` (singleton instance)
- NEVER instantiate `new PrismaClient()` directly
- Custom output path: `lib/generated/prisma`
- After schema changes: `npx prisma generate && npx prisma db push`

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
- **Admin**: Moderate listings, manage platform, view analytics

### Core Workflows
- **Selling Flow**: User clicks "Sell" → `/sell` gateway → Auth check → `/listings/create` form
  - Unauthenticated: `/sell` → `/auth/login?callbackUrl=/listings/create` → `/listings/create`
  - Authenticated: `/sell` → `/listings/create`
- **Listing Creation**: Multi-step form → Admin approval → Public listing
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
- Categories: ELECTRONICS, CLOTHING, HOME_GARDEN, SPORTS, BOOKS, TOYS, VEHICLES, COLLECTIBLES, BABY_KIDS, PET_SUPPLIES
- Condition: NEW, LIKE_NEW, GOOD, FAIR, POOR
- Pricing: FIXED (with price) or OFFERS (minimum price optional)
- Status flow: PENDING → APPROVED → SOLD (or REJECTED/PAUSED)
- Images: Array of URLs, primaryImage field
- Search: title + description (no full-text search yet)
- Location: city + province (South African provinces)

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
- All tests: `npm test`
- Watch mode: `npm run test:watch`
- Coverage report: `npm run test:coverage`

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
- Prisma ORM with custom output path: `lib/generated/prisma`
- Migrations stored in `prisma/migrations/`
- Seed script: `scripts/seed-neon.ts`

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
- Example: "R1,299.00", "R285,000"

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

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
