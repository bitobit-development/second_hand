# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Second-Hand Marketplace Platform** for the South African market, built with Next.js 16.0.0, React 19.2.0, TypeScript, and Tailwind CSS v4. The platform enables users to buy and sell pre-owned items with admin moderation, offer negotiation, and a 20% commission model.

The project follows the Next.js App Router architecture with React Server Components (RSC) enabled, using shadcn/ui for component design and a mobile-first responsive approach.

## Development Commands

- **Start dev server**: `npm run dev` (runs on port 3000)
- **Build production**: `npm run build`
- **Start production server**: `npm start`
- **Lint**: `npm run lint` (uses ESLint with Next.js config)

## Architecture & Structure

### Directory Structure
- `app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global Tailwind styles
- `lib/` - Utility functions
  - `utils.ts` - Contains `cn()` utility for class name merging (clsx + tailwind-merge)
- `components/` - Reusable React components (empty, configured for shadcn/ui)

### Key Technologies
- **Next.js 16.0.0** with App Router and React Server Components
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** with PostCSS
- **shadcn/ui** integration configured (New York style, with path aliases)
- **Lucide React** for icons
- **Geist** and **Geist Mono** fonts from next/font

### Path Aliases
The project uses `@/*` path alias mapping to root directory:
- `@/components` → components directory
- `@/lib/utils` → lib/utils.ts
- `@/components/ui` → components/ui directory
- `@/hooks` → hooks directory

### Styling Approach
- Tailwind CSS v4 with CSS variables for theming
- `cn()` utility function for merging class names
- Dark mode support configured
- Base color: neutral
- No custom prefix for Tailwind classes

## Business Logic & Domain Concepts

### User Roles
- **Seller**: Creates listings, manages items, receives offers
- **Buyer**: Browse items, make purchases, submit offers
- **Admin**: Moderate listings, manage platform, view analytics

### Core Workflows
- **Listing Creation**: Multi-step form → Admin approval → Public listing
- **Pricing Options**: Fixed price OR accept offers (with optional minimum)
- **Commission**: 20% platform fee on all successful transactions
- **Approval Process**: All user-created listings require admin approval before going live

### Key Data Models (Planned)
Reference PRD.md for detailed schema. Core entities:
- User (with role: buyer/seller/admin)
- Listing (status: pending/approved/rejected/sold/paused)
- Transaction (with commission calculation)
- Offer (with expiry and status tracking)

## UI/UX Patterns

### Mobile-First Responsive Design
- **Default (unprefixed)**: Mobile styles (< 640px)
- **Progressive enhancement**: Use `sm:`, `md:`, `lg:`, `xl:` breakpoints
- Example: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

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

## Important Notes

- This project uses React 19.2.0 with React Server Components by default
- TypeScript target is ES2017 with strict mode enabled
- Module resolution uses "bundler" mode
- No test framework is currently configured
- Currency: South African Rand (ZAR), formatted as "R1,000"
- See PRD.md for comprehensive feature specifications and implementation phases
