# AI-Enhanced Listing Creation - Task Breakdown

**Feature Documentation**: `/docs/features/ai-enhanced-listing-creation.md`
**Created**: 2025-10-23
**Status**: Ready for Implementation

---

## Executive Summary

This document provides a comprehensive, executable task breakdown for implementing the AI-Enhanced Listing Creation feature. The feature adds two main capabilities:
1. **AI Image Enhancement**: Cloudinary-powered background removal with white background addition
2. **AI Description Generation**: OpenAI GPT-4o Vision-powered product description writing

**Total Tasks**: 45 tasks across 8 phases
**Estimated Timeline**: 4-5 weeks with 3-4 developers working in parallel
**Total Effort**: 448 hours

---

## Task Distribution

### By Phase
- **Phase 0 (Preparation)**: 2 tasks
- **Phase 1 (Backend Infrastructure)**: 8 tasks
- **Phase 2 (Frontend Components)**: 6 tasks
- **Phase 3 (Integration)**: 5 tasks
- **Phase 4 (Database)**: 2 tasks
- **Phase 5 (Testing)**: 10 tasks
- **Phase 6 (Code Review & QA)**: 4 tasks
- **Phase 7 (Documentation)**: 4 tasks
- **Phase 8 (Rollout & Monitoring)**: 4 tasks

### By Agent
- **oren-backend**: 9 tasks (Backend API, utilities, monitoring)
- **uri-testing**: 12 tasks (Testing, QA, rollout validation)
- **tal-design**: 6 tasks (UI components, accessibility)
- **adi-fullstack**: 5 tasks (Integration, full-stack features)
- **maya-code-review**: 4 tasks (Code quality, security audits)
- **yael-technical-docs**: 4 tasks (Documentation)
- **noam-prompt-engineering**: 3 tasks (Prompt design & optimization)
- **gal-database**: 2 tasks (Schema changes, migrations)

### Critical Path (6-7 weeks)
```
ENV-001 → PROMPT-001 → BACK-001 → BACK-003 → FRONT-002 → INT-003 →
TEST-007 → TEST-008 → REVIEW-003 → TEST-010 → ROLL-001 → ROLL-002
```

---

## Phase 0: Preparation & Environment Setup

### Task ID: ENV-001
- **Title**: Set up OpenAI API integration and environment variables
- **Agent**: @oren-backend
- **Description**: Configure OpenAI API credentials by installing the `openai` npm package and setting up required environment variables. Verify that existing Cloudinary credentials are properly configured. Create a verification script to test API connectivity. This is a foundational task that blocks all AI functionality.
- **Deliverables**:
  - Updated `package.json` with openai dependency
  - Updated `.env` with `OPENAI_API_KEY`
  - Updated `.env.example` with documentation
  - Verification script at `scripts/verify-ai-setup.ts`
- **Dependencies**: None (Starting task)
- **Acceptance Criteria**:
  - ✅ `openai` package installed (latest stable version) and locked in `package.json`
  - ✅ `OPENAI_API_KEY` documented in `.env.example` with clear instructions
  - ✅ Cloudinary environment variables verified: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - ✅ Verification script successfully connects to OpenAI API and returns test response
  - ✅ No API keys or secrets committed to version control (verified in .gitignore)
  - ✅ TypeScript types for OpenAI client properly configured
- **Effort**: S (4 hours)
- **Files to Create/Modify**:
  - `package.json` (modify - add openai dependency)
  - `.env` (modify - add OPENAI_API_KEY)
  - `.env.example` (modify - document new variable)
  - `scripts/verify-ai-setup.ts` (create verification script)
  - `.gitignore` (verify .env is excluded)

---

### Task ID: PROMPT-001
- **Title**: Design and document AI prompt templates for description generation
- **Agent**: @noam-prompt-engineering
- **Description**: Create three optimized prompt templates (Detailed, Concise, SEO-Focused) for generating product descriptions using OpenAI GPT-4o Vision. Ensure prompts are context-aware, handle South African market specifics, produce consistent quality output, and include safety filters to prevent inappropriate content. Test prompts with diverse product images across all categories.
- **Deliverables**:
  - Prompt template library with three distinct variants
  - Documentation explaining prompt engineering rationale
  - Expected output samples for each template (5+ per category)
  - Edge case handling guidelines
  - Testing report with sample inputs/outputs
- **Dependencies**: None (Can start immediately)
- **Acceptance Criteria**:
  - ✅ Three prompt templates documented with clear use cases and recommendations
  - ✅ Prompts include South African market context (currency ZAR, local terminology)
  - ✅ Character limits specified and enforced: Detailed (100-200 words), Concise (50-75 words), SEO (120-180 words)
  - ✅ Safety measures implemented to prevent inappropriate or misleading content
  - ✅ Sample outputs provided for minimum 5 product categories (Electronics, Clothing, Furniture, Vehicles, Collectibles)
  - ✅ Prompts successfully tested with GPT-4o Vision API (20+ test images)
  - ✅ Edge cases documented: poor image quality, multi-item images, unusual products
  - ✅ Attribute extraction logic defined (color, material, brand, style, condition)
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `lib/ai/prompts/description-templates.ts` (create prompt library with TypeScript types)
  - `docs/ai/prompt-engineering-guide.md` (create detailed documentation)
  - `docs/ai/prompt-test-results.md` (create test report with examples)

---

## Phase 1: Backend Infrastructure

### Task ID: BACK-001
- **Title**: Create OpenAI utility function for description generation
- **Agent**: @oren-backend
- **Description**: Implement the core utility function that calls OpenAI GPT-4o Vision API to analyze product images and generate descriptions. Support all three description templates (Detailed, Concise, SEO-Focused). Handle image analysis, template selection, error handling, response parsing, and attribute extraction. Must integrate with prompt templates from PROMPT-001.
- **Deliverables**:
  - `lib/ai/generate-description.ts` with complete implementation
  - Comprehensive error handling for API failures
  - Response parsing and validation logic
  - Attribute extraction from AI response
  - TypeScript types and interfaces
- **Dependencies**: ENV-001, PROMPT-001
- **Acceptance Criteria**:
  - ✅ Function signature: `generateProductDescription({ imageUrl: string, title?: string, category: string, condition: string, template?: 'detailed' | 'concise' | 'seo' }): Promise<DescriptionResult>`
  - ✅ Successfully calls OpenAI GPT-4o Vision API with correct model (gpt-4o or gpt-4-turbo)
  - ✅ Supports all three templates with proper prompt selection
  - ✅ Returns structured response: `{ description: string, wordCount: number, characterCount: number, attributes: { color?, material?, brand?, style? } }`
  - ✅ Character limit enforcement (max 2000 chars, truncate gracefully if exceeded)
  - ✅ Error handling with descriptive error codes: OPENAI_ERROR, INVALID_IMAGE, NO_IMAGE, RATE_LIMIT
  - ✅ TypeScript types fully defined with strict mode compliance
  - ✅ Proper async/await error handling with try/catch
  - ✅ Timeout handling (30 second max per request)
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `lib/ai/generate-description.ts` (create main utility)
  - `lib/ai/types.ts` (create type definitions: DescriptionTemplate, DescriptionResult, GenerateDescriptionParams)
  - `lib/ai/errors.ts` (create custom error classes for AI operations)

---

### Task ID: BACK-002
- **Title**: Create Cloudinary image enhancement utility function
- **Agent**: @oren-backend
- **Description**: Implement utility function that uses Cloudinary's AI background removal transformation to enhance product images. Generate transformation URLs with background removal, white background addition, padding to square aspect ratio, and optimization. Validate input images are from Cloudinary. Handle error scenarios gracefully with clear messaging.
- **Deliverables**:
  - `lib/ai/enhance-image.ts` with complete implementation
  - Cloudinary transformation URL generation logic
  - Input validation for Cloudinary URLs
  - Error handling and validation
  - TypeScript types and interfaces
- **Dependencies**: ENV-001
- **Acceptance Criteria**:
  - ✅ Function signature: `enhanceProductImage(imageUrl: string): Promise<EnhancedImageResult>`
  - ✅ Generates correct Cloudinary transformation URL with parameters: `e_background_removal` (remove background), `b_white` (white background), `c_pad,w_1000,h_1000` (pad to 1000x1000), `q_auto:best` (quality optimization), `f_auto` (format optimization)
  - ✅ Validates input image URL is from Cloudinary (checks for res.cloudinary.com domain)
  - ✅ Returns structured result: `{ originalUrl: string, enhancedUrl: string, width: number, height: number, format: string }`
  - ✅ Error handling with descriptive error codes: INVALID_IMAGE, NON_CLOUDINARY_URL, CLOUDINARY_ERROR
  - ✅ TypeScript types fully defined with strict mode compliance
  - ✅ Helper function to extract public ID from Cloudinary URL
  - ✅ Helper function to revert enhanced URL back to original
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `lib/ai/enhance-image.ts` (create main utility)
  - `lib/cloudinary.ts` (modify - add helper functions for URL manipulation)
  - `lib/ai/types.ts` (modify - add EnhancedImageResult type)

---

### Task ID: BACK-003
- **Title**: Implement /api/generate-description API route with rate limiting
- **Agent**: @oren-backend
- **Description**: Create POST endpoint for AI description generation. Implement NextAuth authentication check, request validation with Zod schemas, rate limiting (5 req/min per user, 50 req/hour per user), call to OpenAI utility function, and return structured response. Handle errors gracefully with appropriate HTTP status codes and error messages.
- **Deliverables**:
  - API route implementation at `app/api/generate-description/route.ts`
  - Request/response validation with Zod schemas
  - Rate limiting middleware integration
  - Comprehensive error handling with status codes
  - API response logging
- **Dependencies**: BACK-001, BACK-005
- **Acceptance Criteria**:
  - ✅ POST endpoint at `/api/generate-description`
  - ✅ Requires authentication: validates NextAuth session, returns 401 if unauthenticated
  - ✅ Request validation with Zod: imageUrl (required, valid URL), title (optional, string, max 100 chars), category (required, valid enum), condition (required, valid enum), template (optional, default 'detailed')
  - ✅ Rate limiting enforced: 5 requests/minute per user, 50 requests/hour per user, returns 429 with retry-after header when exceeded
  - ✅ Success response (200): `{ success: true, data: { description, wordCount, characterCount, attributes } }`
  - ✅ Error responses (400/401/429/500): `{ success: false, error: string, code: string }`
  - ✅ Error codes: INVALID_IMAGE, OPENAI_ERROR, RATE_LIMIT_EXCEEDED, NO_IMAGE, MISSING_AUTH
  - ✅ Request/response logging for monitoring and debugging
  - ✅ Timeout handling (returns 504 if OpenAI takes >30 seconds)
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `app/api/generate-description/route.ts` (create API route)
  - `lib/validations/ai-schemas.ts` (create Zod schemas for request/response validation)

---

### Task ID: BACK-004
- **Title**: Implement /api/enhance-image API route with rate limiting
- **Agent**: @oren-backend
- **Description**: Create POST endpoint for AI image enhancement using Cloudinary. Implement NextAuth authentication check, request validation with Zod schemas, rate limiting (10 req/min per user, 100 req/hour per user), call to Cloudinary utility function, and return enhanced image data. Handle errors with fallback options and clear messaging.
- **Deliverables**:
  - API route implementation at `app/api/enhance-image/route.ts`
  - Request/response validation with Zod schemas
  - Rate limiting middleware integration
  - Comprehensive error handling with status codes
  - API response logging
- **Dependencies**: BACK-002, BACK-005
- **Acceptance Criteria**:
  - ✅ POST endpoint at `/api/enhance-image`
  - ✅ Requires authentication: validates NextAuth session, returns 401 if unauthenticated
  - ✅ Request validation with Zod: imageUrl (required, valid Cloudinary URL)
  - ✅ Rate limiting enforced: 10 requests/minute per user, 100 requests/hour per user, returns 429 with retry-after header when exceeded
  - ✅ Success response (200): `{ success: true, data: { originalUrl, enhancedUrl, width, height, format } }`
  - ✅ Error responses (400/401/429/500): `{ success: false, error: string, code: string }`
  - ✅ Error codes: INVALID_IMAGE, NON_CLOUDINARY_URL, CLOUDINARY_ERROR, RATE_LIMIT_EXCEEDED, MISSING_AUTH
  - ✅ Request/response logging for monitoring and debugging
  - ✅ Proper async error handling with try/catch
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `app/api/enhance-image/route.ts` (create API route)
  - `lib/validations/ai-schemas.ts` (modify - add schemas for image enhancement)

---

### Task ID: BACK-005
- **Title**: Implement rate limiting infrastructure for AI API routes
- **Agent**: @oren-backend
- **Description**: Create rate limiting utility using in-memory Map storage (or Redis if available) to prevent API abuse, control costs, and ensure fair usage. Support per-user rate limits with different thresholds for different endpoints (image enhancement: 10/min 100/hr, description generation: 5/min 50/hr). Provide clear rate limit exceeded messages with retry-after information. Implement automatic cleanup of old entries to prevent memory leaks.
- **Deliverables**:
  - Rate limiter utility function with configurable limits
  - Middleware helper for API routes
  - Configuration object for different rate limit tiers
  - Rate limit headers in API responses (X-RateLimit-*)
  - Automatic cleanup mechanism
- **Dependencies**: ENV-001
- **Acceptance Criteria**:
  - ✅ Rate limiter supports per-user limits with sliding window algorithm
  - ✅ Configurable limits: requests per minute and requests per hour (independent tracking)
  - ✅ Returns 429 status code when limit exceeded with clear error message
  - ✅ Includes rate limit headers in all responses: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset (timestamp)
  - ✅ Automatic cleanup of entries older than 1 hour to prevent memory leaks
  - ✅ TypeScript types fully defined with generic support for different limit configurations
  - ✅ Works seamlessly with NextAuth session for user identification
  - ✅ Graceful handling when user session unavailable (fallback to IP-based limiting)
  - ✅ Unit testable design with mock-friendly architecture
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `lib/ai/rate-limiter.ts` (create rate limiter utility)
  - `lib/ai/middleware.ts` (create middleware helpers for API routes)
  - `lib/ai/types.ts` (modify - add rate limit types: RateLimitConfig, RateLimitResult)

---

### Task ID: BACK-006
- **Title**: Add AI usage tracking to listing creation server action
- **Agent**: @oren-backend
- **Description**: Modify the listing creation server action (`createListing`) to accept and store AI usage metadata flags: `aiEnhancedImages` (boolean) and `aiGeneratedDesc` (boolean). This enables business analytics tracking to measure AI feature adoption, effectiveness, and ROI. Maintain backward compatibility with existing listing creation flow that doesn't use AI features.
- **Deliverables**:
  - Updated server action with optional AI tracking parameters
  - Database write logic for AI metadata
  - Type definitions for new parameters
  - Backward compatibility handling
- **Dependencies**: DB-001
- **Acceptance Criteria**:
  - ✅ Server action accepts optional parameters: `aiEnhancedImages?: boolean`, `aiGeneratedDesc?: boolean`, `originalImages?: string[]`
  - ✅ Parameters properly validated and sanitized before database write
  - ✅ AI metadata stored in database when provided (uses new Prisma schema fields)
  - ✅ No breaking changes to existing listing creation flow (all new params optional with sensible defaults)
  - ✅ Type definitions updated in validation schemas
  - ✅ Server action still works correctly when AI params omitted (backward compatibility)
  - ✅ Error handling doesn't break listing creation if AI metadata fails to save
- **Effort**: S (4 hours)
- **Files to Create/Modify**:
  - `app/listings/create/actions.ts` (modify `createListing` function)
  - `lib/validations/listing.ts` (modify `createListingSchema` to add optional AI fields)

---

### Task ID: FULL-001
- **Title**: Update Cloudinary utility to handle enhanced image URL generation
- **Agent**: @adi-fullstack
- **Description**: Extend existing Cloudinary utilities (`lib/cloudinary.ts`) to support AI enhancement transformations. Provide helper functions for generating enhanced image URLs, extracting public IDs, and reverting enhanced URLs to originals. Ensure full compatibility with existing image upload flow without breaking changes.
- **Deliverables**:
  - Enhanced Cloudinary utility functions
  - Helper functions for URL manipulation
  - Integration tests with existing upload flow
  - TypeScript type updates
- **Dependencies**: BACK-002
- **Acceptance Criteria**:
  - ✅ No breaking changes to existing Cloudinary upload or delete functions
  - ✅ Helper function: `extractPublicId(url: string): string` - extracts public ID from Cloudinary URL
  - ✅ Helper function: `generateEnhancedUrl(originalUrl: string): string` - generates enhanced version URL
  - ✅ Helper function: `revertToOriginal(enhancedUrl: string): string` - converts enhanced URL back to original
  - ✅ Helper function: `isCloudinaryUrl(url: string): boolean` - validates if URL is from Cloudinary
  - ✅ All helper functions have comprehensive JSDoc comments
  - ✅ TypeScript types fully defined and exported
  - ✅ Edge case handling: malformed URLs, non-Cloudinary URLs, missing public IDs
- **Effort**: S (4 hours)
- **Files to Create/Modify**:
  - `lib/cloudinary.ts` (modify - add helper functions)
  - `lib/cloudinary.test.ts` (create - unit tests for new helpers)

---

### Task ID: PROMPT-002
- **Title**: Test and optimize AI prompts with real product images
- **Agent**: @noam-prompt-engineering
- **Description**: Run extensive testing of prompt templates using diverse, real product images from all marketplace categories. Analyze output quality, consistency, and relevance. Adjust prompts to improve consistency and handle edge cases (poor quality images, unusual products, multi-item images, complex backgrounds). Document optimization results with before/after comparisons.
- **Deliverables**:
  - Optimized prompt templates (updated versions)
  - Comprehensive test report with before/after comparisons
  - Edge case handling documentation
  - Quality metrics analysis
  - Recommendations for future improvements
- **Dependencies**: BACK-001, BACK-003
- **Acceptance Criteria**:
  - ✅ Prompts tested with minimum 50 diverse product images across all 10 categories
  - ✅ Output quality rated 4+/5 for 80%+ of test cases (by human reviewers)
  - ✅ Minimum 10 edge cases identified and documented (e.g., poor lighting, multiple items, transparent backgrounds)
  - ✅ Prompts adjusted to handle common issues: background distractions, poor lighting, multi-item images, unusual angles
  - ✅ Optimization report includes quantitative metrics: average word count (by template), description relevance score (1-5), attribute extraction accuracy (% correct)
  - ✅ Before/after examples documented for at least 10 images showing improvement
  - ✅ Testing includes all three templates with comparison analysis
  - ✅ Edge case prompts added for challenging scenarios
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `lib/ai/prompts/description-templates.ts` (modify with optimizations)
  - `docs/ai/prompt-optimization-report.md` (create comprehensive report)
  - `docs/ai/edge-cases.md` (create edge case documentation)

---

## Phase 2: Frontend Components

### Task ID: FRONT-001
- **Title**: Create AI Image Enhancer component with comparison UI
- **Agent**: @tal-design
- **Description**: Design and implement the AIImageEnhancer React component with side-by-side comparison view, loading states, success/error feedback, and revert functionality. Must be mobile-responsive, follow shadcn/ui design patterns, and include accessibility features. Display "AI Enhanced" badge for enhanced images. Component should handle API calls to `/api/enhance-image` and manage local state for original vs enhanced versions.
- **Deliverables**:
  - AIImageEnhancer React component with TypeScript
  - ComparisonView UI subcomponent (reusable)
  - Loading states with progress indicator
  - Success/error toast notifications
  - Revert functionality
  - Mobile-responsive design
- **Dependencies**: BACK-004
- **Acceptance Criteria**:
  - ✅ Component fully typed with TypeScript (no `any` types)
  - ✅ Mobile-first responsive design (works on 320px+ screens)
  - ✅ Side-by-side comparison on desktop (≥640px breakpoint), stacked on mobile (<640px)
  - ✅ "Enhance" button triggers API call to `/api/enhance-image` with loading state
  - ✅ Loading state shows spinner with message "Enhancing image..." (disable interactions during loading)
  - ✅ Success state shows comparison with "Use Original" / "Use Enhanced" buttons (clear labeling)
  - ✅ Enhanced images display "AI Enhanced" badge (using shadcn/ui Badge component)
  - ✅ Error state shows clear error message with retry button
  - ✅ Accessible: keyboard navigation (Tab/Enter/Escape), ARIA labels, screen reader support
  - ✅ Uses shadcn/ui components: Button, Card, Badge, Alert, Spinner
  - ✅ Smooth transitions between states (loading → success, loading → error)
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `components/listings/ai-image-enhancer.tsx` (create main component)
  - `components/ui/comparison-view.tsx` (create reusable comparison UI component)
  - `hooks/use-image-enhancement.ts` (create custom hook for enhancement logic)

---

### Task ID: FRONT-002
- **Title**: Create AI Description Generator component with template selector
- **Agent**: @tal-design
- **Description**: Design and implement the AIDescriptionGenerator React component with "Generate with AI" button, template selector (Detailed/Concise/SEO), loading states with creative messaging, editable output textarea, real-time character counter, and regenerate functionality. Must integrate smoothly with existing description field in listing creation form. Component handles API calls to `/api/generate-description`.
- **Deliverables**:
  - AIDescriptionGenerator React component with TypeScript
  - Template selector UI (radio buttons or segmented control)
  - Loading states with rotating creative messages
  - Editable textarea with character count
  - Regenerate functionality
  - Mobile-responsive design
- **Dependencies**: BACK-003
- **Acceptance Criteria**:
  - ✅ Component fully typed with TypeScript (no `any` types)
  - ✅ "Generate with AI" button prominently placed, visually distinct
  - ✅ Template selector with three options: Detailed (default, recommended badge), Concise, SEO-Focused (with descriptions)
  - ✅ Button disabled if no images uploaded (with tooltip explaining "Upload at least one image first")
  - ✅ Loading state shows spinner with rotating messages every 2s: "Analyzing image...", "Crafting description...", "Polishing details..."
  - ✅ Generated description populates textarea (user can edit freely, no restrictions)
  - ✅ Character counter updates in real-time (format: "1234 / 2000 characters", red warning if >1900)
  - ✅ "Regenerate" button allows trying different template without re-uploading
  - ✅ Error state shows clear error message with fallback to manual entry option
  - ✅ Accessible: keyboard navigation, ARIA live regions for loading messages, screen reader announcements
  - ✅ Uses shadcn/ui components: Button, RadioGroup, Textarea, Label, Alert, Tooltip
  - ✅ Smooth transitions and micro-interactions (fade in description, button states)
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `components/listings/ai-description-generator.tsx` (create main component)
  - `hooks/use-description-generation.ts` (create custom hook for generation logic)

---

### Task ID: FRONT-003
- **Title**: Update Image Upload component to integrate AI enhancement
- **Agent**: @tal-design
- **Description**: Modify existing `components/listings/image-upload.tsx` to add AI enhancement capabilities. Add "Enhance" button to each uploaded image, show "AI Enhanced" badges, store both original and enhanced URLs in component state, allow switching between versions, and support batch enhancement ("Enhance All" button). Maintain all existing upload functionality without breaking changes.
- **Deliverables**:
  - Updated ImageUpload component with AI features
  - Batch enhancement UI ("Enhance All" button)
  - Version switching functionality
  - Enhanced state management
  - Visual indicators for enhanced images
- **Dependencies**: FRONT-001
- **Acceptance Criteria**:
  - ✅ No breaking changes to existing upload functionality (drag-drop, file selection, remove, reorder)
  - ✅ Each uploaded image shows "Enhance" button (positioned consistently, e.g., top-right corner)
  - ✅ "Enhance All" button appears when 2+ images uploaded (positioned above image grid)
  - ✅ Enhanced images display "AI Enhanced" badge (persistent, non-removable)
  - ✅ User can toggle between original and enhanced version (small toggle button or icon)
  - ✅ Both versions stored in component state: `Map<string, { original: string, enhanced?: string, useEnhanced: boolean }>`
  - ✅ Visual indicator clearly shows which version is selected (border highlight, checkmark)
  - ✅ Mobile-responsive design (buttons scale appropriately)
  - ✅ Accessible: keyboard navigation for toggle, ARIA labels for all buttons
  - ✅ Batch enhancement shows progress: "Enhancing 1 of 5..."
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `components/listings/image-upload.tsx` (modify to integrate AI enhancement)

---

### Task ID: FRONT-004
- **Title**: Design and implement AI feature onboarding tooltips
- **Agent**: @tal-design
- **Description**: Create subtle, non-intrusive onboarding tooltips to educate users about AI features on first use. Include brief explanations, best practices tips, and privacy notices. Tooltips must be dismissible, respect user preferences (don't show again after dismissed), and not block UI functionality. Design should be consistent with shadcn/ui patterns.
- **Deliverables**:
  - Tooltip component for AI features
  - First-time user experience flow
  - Privacy notice UI
  - Dismissible hints system with persistence
  - Onboarding state management hook
- **Dependencies**: FRONT-001, FRONT-002
- **Acceptance Criteria**:
  - ✅ Tooltips appear on first interaction with AI features (image enhancement, description generation)
  - ✅ Privacy notice tooltip: "Your image will be analyzed by AI to generate a description. Your data is processed securely and not stored by AI providers."
  - ✅ Best practices tooltip for image enhancement: "For best results, upload clear, well-lit photos with simple backgrounds"
  - ✅ Best practices tooltip for description generation: "Upload high-quality images for more accurate descriptions"
  - ✅ Tooltips dismissible with "Got it" button or X close button
  - ✅ Dismissed state persisted in localStorage (key: `ai-onboarding-dismissed-v1`)
  - ✅ Non-intrusive design: positioned near feature, doesn't block core functionality, auto-dismiss after 10s
  - ✅ Accessible: keyboard dismissible (Escape key), screen reader announcements, focus management
  - ✅ Uses shadcn/ui Tooltip or Popover components with custom styling
- **Effort**: S (4 hours)
- **Files to Create/Modify**:
  - `components/listings/ai-feature-tooltip.tsx` (create tooltip component)
  - `hooks/use-onboarding.ts` (create hook for managing onboarding state with localStorage)

---

### Task ID: FRONT-005
- **Title**: Implement loading states and error handling UI for AI features
- **Agent**: @tal-design
- **Description**: Design consistent, user-friendly loading states, error messages, and retry mechanisms for all AI features. Ensure graceful degradation when AI services are unavailable or fail. Provide clear guidance on next steps when errors occur. Never block listing creation due to AI failures - always offer manual alternatives.
- **Deliverables**:
  - Loading state components with spinners and contextual messages
  - Error alert components with retry buttons
  - Fallback UI when AI unavailable
  - Consistent error messaging system across AI features
  - Error recovery flow diagrams
- **Dependencies**: FRONT-001, FRONT-002
- **Acceptance Criteria**:
  - ✅ Consistent loading spinner design across all AI features (unified component)
  - ✅ Loading messages are contextual and informative (e.g., "Enhancing image...", "Generating description...")
  - ✅ Error messages clearly explain what went wrong in user-friendly language (avoid technical jargon)
  - ✅ Retry buttons available for recoverable errors (API timeouts, network issues)
  - ✅ Non-recoverable errors provide manual alternatives: "AI enhancement failed. You can continue with the original image or try again later."
  - ✅ Never blocks listing creation: users can always proceed without AI features
  - ✅ Error codes mapped to user-friendly messages in `lib/ai/error-messages.ts`
  - ✅ Uses shadcn/ui Alert component for errors, custom Spinner component for loading
  - ✅ Accessible: error messages announced to screen readers, focus management after errors
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `components/listings/ai-error-handler.tsx` (create error handling component)
  - `components/ui/ai-loading.tsx` (create loading component)
  - `lib/ai/error-messages.ts` (create error message mapping utility)

---

### Task ID: FRONT-006
- **Title**: Ensure WCAG 2.1 AA accessibility compliance for all AI components
- **Agent**: @tal-design
- **Description**: Conduct comprehensive accessibility audit of all AI-related components. Ensure full keyboard navigation support, screen reader compatibility, proper color contrast, focus management, and ARIA attributes. Test with actual screen readers (NVDA on Windows, VoiceOver on Mac) and keyboard-only navigation. Fix any compliance issues discovered during audit.
- **Deliverables**:
  - Accessibility audit report with findings
  - Fixes for all compliance issues
  - Keyboard navigation documentation
  - Screen reader testing results
  - Automated accessibility test suite
- **Dependencies**: FRONT-001, FRONT-002, FRONT-003, FRONT-004, FRONT-005
- **Acceptance Criteria**:
  - ✅ All interactive elements keyboard accessible (Tab for navigation, Enter for activation, Escape for dismissal)
  - ✅ Focus indicators visible and clear (min 2px outline, high contrast)
  - ✅ Color contrast meets WCAG 2.1 AA: 4.5:1 for normal text, 3:1 for large text, 3:1 for UI components
  - ✅ ARIA labels on all buttons, inputs, and interactive elements (descriptive, not redundant)
  - ✅ ARIA live regions for dynamic content (loading messages, errors, success notifications)
  - ✅ Screen reader announces loading states, errors, and state changes
  - ✅ No keyboard traps in modal dialogs or comparison views (Escape to close, Tab cycles within)
  - ✅ Tested with NVDA (Windows) and VoiceOver (Mac) - all features usable
  - ✅ Automated accessibility tests pass using @axe-core/react (zero violations)
  - ✅ Manual testing report documents all test scenarios and results
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `docs/accessibility/ai-features-audit.md` (create audit report)
  - All AI component files (modify with accessibility fixes as needed)
  - `__tests__/accessibility/ai-components.test.tsx` (create automated tests)

---

## Phase 3: Integration with Listing Creation Flow

### Task ID: INT-001
- **Title**: Integrate AI Image Enhancer into listing creation Step 3 (Images)
- **Agent**: @adi-fullstack
- **Description**: Add AIImageEnhancer component to Step 3 of the listing creation form (`app/listings/create/page.tsx`). Manage enhanced/original image state at form level using React Hook Form. Handle user selections (original vs enhanced) and ensure selected image URLs are included in form submission. Maintain full backward compatibility with existing image upload flow for users who don't use AI enhancement.
- **Deliverables**:
  - Updated Step 3 with AIImageEnhancer integration
  - Form-level state management for enhanced images
  - Form submission logic updates
  - Enhanced image URL handling in validation
- **Dependencies**: FRONT-001, FRONT-003
- **Acceptance Criteria**:
  - ✅ AIImageEnhancer component appears in Step 3 immediately after images are uploaded
  - ✅ Form state tracks both original and enhanced URLs: `enhancedImages: Map<string, { original: string, enhanced?: string, selected: 'original' | 'enhanced' }>`
  - ✅ User selection (original vs enhanced) persists through form navigation (Step 3 → Step 4 → back to Step 3)
  - ✅ Form submission includes selected image URLs (enhanced if user chose enhanced, original otherwise)
  - ✅ No breaking changes to existing upload flow (users can skip AI enhancement entirely)
  - ✅ Works correctly with multi-image upload (each image tracks independently)
  - ✅ Form validation still works correctly (min 1 image, max 10 images)
  - ✅ React Hook Form integration: enhanced images registered as form field
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `app/listings/create/page.tsx` (modify Step 3 section to integrate AI enhancer)
  - `lib/validations/listing.ts` (verify schema handles enhanced image URLs)

---

### Task ID: INT-002
- **Title**: Update listing creation form state to track AI usage metadata
- **Agent**: @adi-fullstack
- **Description**: Extend the listing creation form data structure to track AI usage metadata: which images were enhanced, whether description was AI-generated, original image URLs (before enhancement), and description source (user-written, AI-generated, or mixed). This metadata will be submitted with the listing and stored in database for business analytics.
- **Deliverables**:
  - Updated form state type definitions
  - State management for AI metadata
  - Form submission with AI tracking data
  - TypeScript types for metadata
- **Dependencies**: INT-001
- **Acceptance Criteria**:
  - ✅ Form state includes new fields: `enhancedImages: Map<string, EnhancedImageData>`, `isImageEnhanced: boolean[]`, `descriptionSource: 'user' | 'ai' | 'mixed'`, `originalImages: string[]`
  - ✅ AI metadata automatically captured when user uses AI features (no manual input required)
  - ✅ Metadata submitted with listing creation server action
  - ✅ TypeScript types fully defined: `EnhancedImageData`, `DescriptionSource`, `AIMetadata`
  - ✅ No impact on existing form validation rules
  - ✅ Metadata fields optional (not required for form submission)
  - ✅ Description source tracking: set to 'ai' when generated, 'mixed' when user edits AI text, 'user' when manual
- **Effort**: S (4 hours)
- **Files to Create/Modify**:
  - `app/listings/create/page.tsx` (modify state management to add AI metadata)
  - `lib/validations/listing.ts` (modify schema to include optional AI metadata fields)
  - `lib/types/listing.ts` (create types for AI metadata)

---

### Task ID: INT-003
- **Title**: Integrate AI Description Generator into listing creation Step 2 (Details)
- **Agent**: @adi-fullstack
- **Description**: Add AIDescriptionGenerator component to Step 2 of listing creation form. Handle description generation flow, populate description textarea with AI-generated content, track whether description is AI-generated/user-written/mixed, and allow full user editing of AI content. Ensure smooth UX when switching between manual and AI-generated descriptions.
- **Deliverables**:
  - Updated Step 2 with AIDescriptionGenerator
  - Description generation logic with image dependency check
  - Edit tracking for AI-generated content (user vs ai vs mixed)
  - Form submission with description source tracking
- **Dependencies**: FRONT-002, INT-002
- **Acceptance Criteria**:
  - ✅ AIDescriptionGenerator button appears in Step 2 near description field (positioned prominently but not intrusively)
  - ✅ Button disabled if no images uploaded (shows tooltip: "Upload at least one image first")
  - ✅ Generated description populates description textarea (using React Hook Form setValue)
  - ✅ User can edit AI-generated description freely (no restrictions, full editing capability)
  - ✅ Description source tracked: 'user' (manual entry), 'ai' (unedited AI), 'mixed' (AI edited by user)
  - ✅ Template selection persists during session (localStorage: `ai-description-template-preference`)
  - ✅ Regenerate option works correctly (maintains category/condition context, uses new template)
  - ✅ Form validation works with AI-generated content (min length, max length checks)
  - ✅ Character counter updates in real-time as user edits
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `app/listings/create/page.tsx` (modify Step 2 section to integrate AI description generator)
  - `hooks/use-description-tracking.ts` (create hook to track description source changes)

---

### Task ID: INT-004
- **Title**: Update listing creation server action to save AI metadata
- **Agent**: @adi-fullstack
- **Description**: Modify `createListing` server action to accept AI usage metadata parameters and persist them to database via Prisma. Ensure full backward compatibility - existing listings without AI data continue to work. Handle edge cases gracefully (partial AI metadata, invalid data).
- **Deliverables**:
  - Updated server action with AI metadata parameters
  - Database write logic for AI fields
  - Backward compatibility handling
  - Input validation for AI metadata
- **Dependencies**: BACK-006, INT-002, DB-001
- **Acceptance Criteria**:
  - ✅ Server action accepts AI metadata: `aiEnhancedImages?: boolean`, `aiGeneratedDesc?: boolean`, `originalImages?: string[]`
  - ✅ Metadata saved to database using Prisma (maps to Listing model AI fields)
  - ✅ Existing listings without AI data continue to work (no migration issues)
  - ✅ No breaking changes to server action API contract (all new params optional)
  - ✅ Error handling for invalid AI metadata (doesn't break listing creation if metadata is malformed)
  - ✅ Validation ensures originalImages array contains valid URLs if provided
  - ✅ Transaction safety: listing created successfully even if AI metadata fails to save
- **Effort**: S (4 hours)
- **Files to Create/Modify**:
  - `app/listings/create/actions.ts` (modify `createListing` function to handle AI metadata)

---

### Task ID: INT-005
- **Title**: Add user feedback mechanism for AI-generated content quality
- **Agent**: @adi-fullstack
- **Description**: Implement simple, non-intrusive thumbs up/down feedback UI for AI-generated descriptions and enhanced images. Store feedback in database for future prompt optimization and quality monitoring. Make feedback completely optional and dismissible - must not interrupt listing creation flow.
- **Deliverables**:
  - AIFeedback React component (thumbs up/down UI)
  - Feedback submission API endpoint
  - Feedback storage in database (AIFeedback model)
  - Analytics tracking integration
- **Dependencies**: INT-003, INT-001, DB-002
- **Acceptance Criteria**:
  - ✅ Feedback UI appears after AI generation (description) or enhancement (image) completes
  - ✅ Thumbs up/down buttons clearly labeled with tooltips ("This AI result was helpful" / "This AI result needs improvement")
  - ✅ Feedback submission is completely optional (user can dismiss and proceed)
  - ✅ Feedback stored with context: userId, listingId (if available), featureType (IMAGE_ENHANCEMENT | DESCRIPTION_GENERATION), rating (1 for up, -1 for down), timestamp
  - ✅ No impact on listing creation flow if feedback skipped or fails to submit
  - ✅ Feedback can be submitted multiple times per session (e.g., regenerate → rate again)
  - ✅ Accessible feedback buttons (keyboard, screen reader)
  - ✅ POST endpoint at `/api/ai-feedback` handles submission
- **Effort**: S (4 hours)
- **Files to Create/Modify**:
  - `components/listings/ai-feedback.tsx` (create feedback UI component)
  - `app/api/ai-feedback/route.ts` (create feedback submission endpoint)

---

## Phase 4: Database & Analytics

### Task ID: DB-001
- **Title**: Update Prisma schema to add AI tracking fields to Listing model
- **Agent**: @gal-database
- **Description**: Add three optional fields to the Listing model in Prisma schema to track AI feature usage: `aiEnhancedImages` (Boolean, default false), `aiGeneratedDesc` (Boolean, default false), and `originalImages` (String array for storing pre-enhancement URLs). Create and apply migration to development database. Ensure full backward compatibility with existing listings in production.
- **Deliverables**:
  - Updated `prisma/schema.prisma` with new fields
  - Migration file (SQL)
  - Applied migration to development DB
  - Regenerated Prisma client
  - Migration documentation
- **Dependencies**: None (Can start immediately)
- **Acceptance Criteria**:
  - ✅ Schema includes three new fields in Listing model: `aiEnhancedImages Boolean @default(false)`, `aiGeneratedDesc Boolean @default(false)`, `originalImages String[]`
  - ✅ All fields optional/nullable or have defaults (no breaking changes to existing queries)
  - ✅ Migration created with descriptive name: `YYYYMMDD_add_ai_tracking_fields`
  - ✅ Migration applied successfully to development database (tested locally)
  - ✅ Prisma client regenerated: `npx prisma generate`
  - ✅ No breaking changes to existing Prisma queries or mutations
  - ✅ Existing listings automatically get default values (false, false, [])
  - ✅ Migration SQL reviewed for safety (no data loss risk)
- **Effort**: S (4 hours)
- **Files to Create/Modify**:
  - `prisma/schema.prisma` (modify Listing model)
  - `prisma/migrations/YYYYMMDD_add_ai_tracking_fields/migration.sql` (create migration)
  - `docs/database/ai-tracking-fields.md` (document new fields and their purpose)

---

### Task ID: DB-002
- **Title**: Create AIFeedback model for storing user feedback on AI features
- **Agent**: @gal-database
- **Description**: Create new Prisma model `AIFeedback` to store user feedback on AI-generated content (thumbs up/down ratings). Include fields for feature type (image enhancement or description generation), rating, user ID, optional listing ID, and timestamp. Create migration and apply to database. Add indexes on userId and createdAt for efficient analytics queries.
- **Deliverables**:
  - New AIFeedback Prisma model
  - Migration file (SQL)
  - Applied migration to development DB
  - Regenerated Prisma client
  - Indexes for performance
- **Dependencies**: DB-001
- **Acceptance Criteria**:
  - ✅ Model includes fields: `id` (String, @id @default(cuid())), `userId` (String), `listingId` (String?, optional), `featureType` (Enum: IMAGE_ENHANCEMENT | DESCRIPTION_GENERATION), `rating` (Int: 1 for thumbs up, -1 for thumbs down), `createdAt` (DateTime @default(now()))
  - ✅ Relations defined: `user` (User model), `listing` (Listing model, optional)
  - ✅ Indexes added: `@@index([userId])`, `@@index([createdAt])` for efficient analytics queries
  - ✅ Migration created with descriptive name: `YYYYMMDD_create_ai_feedback_model`
  - ✅ Migration applied successfully to development database
  - ✅ Prisma client regenerated
  - ✅ FeatureType enum created in schema: `enum AIFeatureType { IMAGE_ENHANCEMENT, DESCRIPTION_GENERATION }`
- **Effort**: S (4 hours)
- **Files to Create/Modify**:
  - `prisma/schema.prisma` (add AIFeedback model and AIFeatureType enum)
  - `prisma/migrations/YYYYMMDD_create_ai_feedback_model/migration.sql` (create migration)

---

## Phase 5: Testing

### Task ID: TEST-001
- **Title**: Write unit tests for OpenAI description generation utility
- **Agent**: @uri-testing
- **Description**: Create comprehensive unit tests for `lib/ai/generate-description.ts` utility. Mock OpenAI API calls using Jest. Test all three description templates (detailed, concise, SEO), successful generation scenarios, error handling (network errors, API errors, rate limits), input validation, character limits, and attribute extraction. Aim for 90%+ code coverage.
- **Deliverables**:
  - Unit test file with 15+ test cases
  - Mocked OpenAI API responses (success and error scenarios)
  - Coverage report
  - Test documentation
- **Dependencies**: BACK-001
- **Acceptance Criteria**:
  - ✅ Tests for all three templates: detailed, concise, seo (verify correct prompt selection)
  - ✅ Tests for successful description generation with valid inputs
  - ✅ Tests for OpenAI API errors: network timeout, authentication error, rate limit exceeded, invalid model
  - ✅ Tests for invalid inputs: missing imageUrl, invalid URL format, missing required params
  - ✅ Tests for character limit enforcement (verify truncation at 2000 chars)
  - ✅ Tests for attribute extraction (color, material, brand, style)
  - ✅ Tests for edge cases: empty response, malformed JSON, very long descriptions
  - ✅ Code coverage ≥90% for utility file (lines, branches, functions)
  - ✅ All tests pass consistently (no flaky tests)
  - ✅ Tests run in <5 seconds (fast feedback)
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `__tests__/lib/ai/generate-description.test.ts` (create comprehensive unit tests)
  - `__tests__/lib/ai/__mocks__/openai.ts` (create OpenAI API mocks)

---

### Task ID: TEST-002
- **Title**: Write unit tests for Cloudinary image enhancement utility
- **Agent**: @uri-testing
- **Description**: Create unit tests for `lib/ai/enhance-image.ts` utility. Test transformation URL generation with correct parameters, input validation (Cloudinary URL checks), error handling, and helper functions. Mock Cloudinary API as needed. Aim for 90%+ code coverage.
- **Deliverables**:
  - Unit test file with 10+ test cases
  - Mocked Cloudinary transformation logic
  - Coverage report
  - Test documentation
- **Dependencies**: BACK-002
- **Acceptance Criteria**:
  - ✅ Tests for successful enhancement URL generation with correct transformation params
  - ✅ Tests for correct transformation parameters: e_background_removal, b_white, c_pad, w_1000, h_1000, q_auto:best, f_auto
  - ✅ Tests for invalid Cloudinary URLs (non-Cloudinary domain)
  - ✅ Tests for non-Cloudinary URLs returning clear error
  - ✅ Tests for edge cases: missing public ID, malformed URLs, special characters in public ID
  - ✅ Tests for helper functions: extractPublicId, generateEnhancedUrl, revertToOriginal
  - ✅ Code coverage ≥90% for utility file
  - ✅ All tests pass consistently
  - ✅ Tests run in <3 seconds
- **Effort**: S (4 hours)
- **Files to Create/Modify**:
  - `__tests__/lib/ai/enhance-image.test.ts` (create unit tests)

---

### Task ID: TEST-003
- **Title**: Write unit tests for rate limiting infrastructure
- **Agent**: @uri-testing
- **Description**: Create comprehensive tests for rate limiter utility (`lib/ai/rate-limiter.ts`). Test per-user limits, minute and hour window tracking, rate limit reset timing, concurrent requests handling, and memory cleanup of old entries. Use Jest fake timers for time-based testing. Aim for 90%+ coverage.
- **Deliverables**:
  - Unit test file with 12+ test cases
  - Time-based test mocking (Jest fake timers)
  - Coverage report
  - Test documentation
- **Dependencies**: BACK-005
- **Acceptance Criteria**:
  - ✅ Tests for rate limit enforcement: minute window (e.g., 5 req/min), hour window (e.g., 50 req/hr)
  - ✅ Tests for rate limit headers in responses: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
  - ✅ Tests for rate limit reset timing (verify limits reset after window expires)
  - ✅ Tests for concurrent requests from same user (verify atomic counter updates)
  - ✅ Tests for different users having isolated limits (no interference)
  - ✅ Tests for memory cleanup of entries older than 1 hour
  - ✅ Tests for edge cases: rapid requests, requests exactly at limit boundary
  - ✅ Code coverage ≥90% for rate limiter utility
  - ✅ All tests pass consistently
  - ✅ Tests run in <5 seconds
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `__tests__/lib/ai/rate-limiter.test.ts` (create comprehensive tests)

---

### Task ID: TEST-004
- **Title**: Write integration tests for /api/generate-description endpoint
- **Agent**: @uri-testing
- **Description**: Create integration tests for description generation API route. Test full request/response cycle including authentication, request validation, rate limiting, successful generation, and error scenarios. Mock OpenAI API and NextAuth session. Aim for 80%+ route coverage.
- **Deliverables**:
  - Integration test file with 12+ test cases
  - Mocked NextAuth sessions (authenticated and unauthenticated)
  - Mocked OpenAI API responses
  - Coverage report
- **Dependencies**: BACK-003
- **Acceptance Criteria**:
  - ✅ Tests for unauthenticated requests (expect 401 response)
  - ✅ Tests for invalid request body: missing fields, wrong types, invalid enums (expect 400)
  - ✅ Tests for successful generation with valid inputs (expect 200 with correct response structure)
  - ✅ Tests for rate limit exceeded (expect 429 with retry-after header)
  - ✅ Tests for OpenAI API errors: timeout, authentication, server error (expect 500 with error code)
  - ✅ Tests for all three templates: detailed, concise, seo (verify different outputs)
  - ✅ Tests for response structure validation (matches API spec)
  - ✅ Tests for rate limit headers present in all responses
  - ✅ Code coverage ≥80% for API route file
  - ✅ All tests pass consistently
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `__tests__/app/api/generate-description/route.test.ts` (create integration tests)
  - `__tests__/__mocks__/next-auth.ts` (create NextAuth session mocks)

---

### Task ID: TEST-005
- **Title**: Write integration tests for /api/enhance-image endpoint
- **Agent**: @uri-testing
- **Description**: Create integration tests for image enhancement API route. Test authentication, request validation, rate limiting, successful enhancement, and error scenarios. Mock Cloudinary transformation and NextAuth session. Aim for 80%+ route coverage.
- **Deliverables**:
  - Integration test file with 10+ test cases
  - Mocked NextAuth sessions
  - Mocked Cloudinary API
  - Coverage report
- **Dependencies**: BACK-004
- **Acceptance Criteria**:
  - ✅ Tests for unauthenticated requests (expect 401)
  - ✅ Tests for invalid request body: missing imageUrl, non-Cloudinary URL (expect 400)
  - ✅ Tests for successful enhancement with valid Cloudinary URL (expect 200 with enhanced URL)
  - ✅ Tests for rate limit exceeded (expect 429)
  - ✅ Tests for Cloudinary errors: transformation failure, invalid public ID (expect 500)
  - ✅ Tests for invalid image URLs: malformed, non-image file type
  - ✅ Tests for response structure validation (originalUrl, enhancedUrl, width, height, format)
  - ✅ Tests for rate limit headers in all responses
  - ✅ Code coverage ≥80% for API route file
  - ✅ All tests pass consistently
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `__tests__/app/api/enhance-image/route.test.ts` (create integration tests)

---

### Task ID: TEST-006
- **Title**: Write component tests for AI Image Enhancer component
- **Agent**: @uri-testing
- **Description**: Create unit tests for AIImageEnhancer React component using React Testing Library. Test enhancement trigger (button click), comparison view rendering, user selection (original vs enhanced), revert functionality, loading states, error handling, and accessibility. Mock API calls. Aim for 80%+ component coverage.
- **Deliverables**:
  - Component test file with 15+ test cases
  - Mocked API calls (fetch or axios)
  - Coverage report
  - Accessibility test scenarios
- **Dependencies**: FRONT-001
- **Acceptance Criteria**:
  - ✅ Tests for "Enhance" button click (triggers API call with correct image URL)
  - ✅ Tests for API call with correct parameters (imageUrl)
  - ✅ Tests for loading state display (spinner, "Enhancing image..." message)
  - ✅ Tests for comparison view rendering after successful enhancement (side-by-side on desktop, stacked on mobile)
  - ✅ Tests for "Use Original" / "Use Enhanced" button functionality
  - ✅ Tests for user selection persistence (selected version stays selected)
  - ✅ Tests for revert functionality (switch back to original after selecting enhanced)
  - ✅ Tests for error state display (clear error message, retry button)
  - ✅ Tests for retry mechanism (calls API again after error)
  - ✅ Tests for "AI Enhanced" badge display on enhanced images
  - ✅ Tests for accessibility: keyboard navigation, ARIA labels, screen reader announcements
  - ✅ Code coverage ≥80% for component file
  - ✅ All tests pass consistently
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `__tests__/components/listings/ai-image-enhancer.test.tsx` (create component tests)

---

### Task ID: TEST-007
- **Title**: Write component tests for AI Description Generator component
- **Agent**: @uri-testing
- **Description**: Create unit tests for AIDescriptionGenerator React component using React Testing Library. Test generation trigger, template selection, loading states with rotating messages, description population in textarea, user editing, character counter, regenerate functionality, and error handling. Mock API calls. Aim for 80%+ coverage.
- **Deliverables**:
  - Component test file with 15+ test cases
  - Mocked API calls
  - Coverage report
  - Accessibility test scenarios
- **Dependencies**: FRONT-002
- **Acceptance Criteria**:
  - ✅ Tests for "Generate with AI" button click (triggers API call)
  - ✅ Tests for template selection: Detailed, Concise, SEO (different templates call API with different params)
  - ✅ Tests for API call with correct parameters (imageUrl, category, condition, template)
  - ✅ Tests for loading state with rotating messages (verify messages change every 2s)
  - ✅ Tests for description population in textarea after successful generation
  - ✅ Tests for user editing of generated description (description source changes to 'mixed')
  - ✅ Tests for character counter updates in real-time (verify count accuracy)
  - ✅ Tests for character limit warning (red text when >1900 chars)
  - ✅ Tests for regenerate functionality (calls API again with potentially different template)
  - ✅ Tests for error state display (clear message, manual entry fallback)
  - ✅ Tests for button disabled when no images (with tooltip)
  - ✅ Tests for accessibility: keyboard navigation, ARIA live regions, screen reader announcements
  - ✅ Code coverage ≥80% for component file
  - ✅ All tests pass consistently
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `__tests__/components/listings/ai-description-generator.test.tsx` (create component tests)

---

### Task ID: TEST-008
- **Title**: Write integration tests for full listing creation flow with AI features
- **Agent**: @uri-testing
- **Description**: Create end-to-end integration tests for the complete listing creation flow including AI features. Test critical paths: upload image → enhance → navigate to Step 2 → generate description → submit listing. Verify AI metadata is correctly saved to database. Mock all external APIs (OpenAI, Cloudinary, NextAuth). Test error recovery and backward compatibility (flows without AI).
- **Deliverables**:
  - Integration test file with 8+ test cases covering full flows
  - Mocked NextAuth sessions
  - Mocked API routes
  - Database state verification (Prisma mocks or test DB)
  - Flow diagrams documenting test scenarios
- **Dependencies**: INT-001, INT-003, INT-004
- **Acceptance Criteria**:
  - ✅ Test complete happy path: upload → enhance → generate description → submit (verify listing created with AI metadata)
  - ✅ Test flow with image enhancement only (no description generation)
  - ✅ Test flow with description generation only (no image enhancement)
  - ✅ Test flow with neither AI feature (backward compatibility - verify existing flow still works)
  - ✅ Test flow with batch image enhancement (multiple images enhanced at once)
  - ✅ Test AI metadata saved correctly in database: aiEnhancedImages, aiGeneratedDesc, originalImages
  - ✅ Test form validation works with AI-generated content (description min/max length)
  - ✅ Test error recovery: AI API fails, user continues manually (listing still created)
  - ✅ Test navigation persistence: enhance in Step 3, go to Step 2, come back (enhanced images still there)
  - ✅ All tests pass consistently
- **Effort**: XL (24 hours)
- **Files to Create/Modify**:
  - `__tests__/app/listings/create/ai-integration.test.tsx` (create comprehensive integration tests)
  - `__tests__/__mocks__/prisma.ts` (create Prisma client mocks for database verification)

---

### Task ID: TEST-009
- **Title**: Perform accessibility testing on all AI components
- **Agent**: @uri-testing
- **Description**: Run automated accessibility tests using @axe-core/react on all AI components. Perform manual testing for keyboard navigation, screen reader support, color contrast, and focus management. Test with actual screen readers (NVDA on Windows, VoiceOver on Mac). Document all issues found with severity ratings. Work with @tal-design to verify fixes resolve issues.
- **Deliverables**:
  - Automated accessibility test suite (axe-core)
  - Manual testing report (keyboard and screen reader)
  - Issues list with severity ratings (critical, serious, moderate, minor)
  - Fix verification testing results
- **Dependencies**: FRONT-006
- **Acceptance Criteria**:
  - ✅ Automated tests using @axe-core/react implemented for all AI components: AIImageEnhancer, AIDescriptionGenerator, AIFeedback
  - ✅ Tests run on all component states: default, loading, success, error
  - ✅ Manual keyboard testing performed: Tab navigation, Enter activation, Escape dismissal (all flows documented)
  - ✅ Manual screen reader testing performed: NVDA (Windows) and/or VoiceOver (Mac)
  - ✅ Zero critical or serious accessibility violations remaining (all fixed)
  - ✅ All issues documented with: description, severity (critical/serious/moderate/minor), WCAG criterion violated, steps to reproduce, screenshots/videos
  - ✅ Fixes verified with re-testing (automated + manual)
  - ✅ Test report includes: summary, methodology, findings, recommendations
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `__tests__/accessibility/ai-components.test.tsx` (create automated accessibility tests)
  - `docs/accessibility/ai-features-testing-report.md` (create comprehensive test report)

---

### Task ID: TEST-010
- **Title**: Perform end-to-end manual testing across devices and browsers
- **Agent**: @uri-testing
- **Description**: Conduct comprehensive manual E2E testing on multiple devices (mobile phones, tablets, desktops) and browsers (Chrome, Firefox, Safari, Edge). Test image enhancement quality with real diverse product images, description generation quality with various product categories, error scenarios (API failures, network issues), and slow network conditions (3G simulation). Document all findings in detailed test report.
- **Deliverables**:
  - E2E test plan document (test scenarios, acceptance criteria)
  - Test execution results spreadsheet (device × browser × scenario matrix)
  - Bug reports for any issues found (with severity, priority, steps to reproduce)
  - Video recordings of critical flows (screen recordings)
  - Image quality assessment report
- **Dependencies**: INT-001, INT-003, INT-004, TEST-008
- **Acceptance Criteria**:
  - ✅ Tested on devices: iOS Safari (iPhone 12+), Android Chrome (Samsung/Pixel), iPad, Windows desktop, Mac desktop
  - ✅ Tested on browsers: Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
  - ✅ Tested with minimum 20 diverse product images across all 10 categories (Electronics, Clothing, Home & Garden, Sports, Books, Toys, Vehicles, Collectibles, Baby & Kids, Pet Supplies)
  - ✅ Image enhancement quality assessed: background removal accuracy (90%+ acceptable), white background quality, no artifacts
  - ✅ Description generation quality assessed: relevance (4+/5), accuracy (factual, no hallucinations), readability
  - ✅ Tested error scenarios: API failures (OpenAI/Cloudinary down), network timeouts, invalid inputs, rate limits
  - ✅ Tested slow network conditions: 3G simulation (Chrome DevTools) for all critical flows
  - ✅ Zero critical bugs blocking release (all must be fixed)
  - ✅ All medium/high priority bugs documented and assigned
  - ✅ Test results matrix completed: device × browser × scenario with pass/fail/notes
- **Effort**: XL (24 hours)
- **Files to Create/Modify**:
  - `docs/testing/e2e-test-plan.md` (create comprehensive test plan)
  - `docs/testing/e2e-test-results.xlsx` (create test results spreadsheet)
  - `docs/testing/e2e-bug-reports/` (create directory with individual bug report files)

---

## Phase 6: Code Review & Quality Assurance

### Task ID: REVIEW-001
- **Title**: Code review of backend infrastructure (Phase 1)
- **Agent**: @maya-code-review
- **Description**: Comprehensive code review of all Phase 1 backend code: API routes (`/api/enhance-image`, `/api/generate-description`), utility functions (`enhance-image.ts`, `generate-description.ts`), rate limiting infrastructure, and error handling. Focus on security vulnerabilities, proper error handling, code quality, TypeScript strictness, and performance optimizations. Provide actionable feedback with code examples. All critical issues must be resolved before proceeding to Phase 2.
- **Deliverables**:
  - Code review report with findings categorized by severity
  - Security audit results (vulnerability scan)
  - Performance recommendations
  - Required fixes list (blocking issues)
  - Optional improvements list (non-blocking)
- **Dependencies**: BACK-001, BACK-002, BACK-003, BACK-004, BACK-005, BACK-006
- **Acceptance Criteria**:
  - ✅ Review all backend files for security vulnerabilities: SQL injection, XSS, CSRF, API key exposure in logs/errors, insufficient authentication
  - ✅ Verify rate limiting is properly implemented and cannot be easily bypassed
  - ✅ Verify error handling is comprehensive: all async operations wrapped in try/catch, errors logged appropriately, user-friendly error messages
  - ✅ Check TypeScript types are strict: no unjustified `any` types, all function parameters and returns typed, Prisma types used correctly
  - ✅ Verify API routes follow NextAuth authentication patterns consistently
  - ✅ Check input validation is comprehensive: all user inputs validated with Zod, edge cases handled
  - ✅ Identify performance bottlenecks: inefficient database queries, unnecessary API calls, missing caching opportunities
  - ✅ Provide actionable feedback: specific issues cited with line numbers, code examples of fixes, links to best practices
  - ✅ Critical issues (security, breaking bugs) must be resolved before Phase 2
  - ✅ Review includes positive feedback highlighting well-written code
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `docs/code-review/phase1-backend-review.md` (create comprehensive review report)

---

### Task ID: REVIEW-002
- **Title**: Code review of frontend components (Phase 2)
- **Agent**: @maya-code-review
- **Description**: Comprehensive code review of all Phase 2 frontend AI components: AIImageEnhancer, AIDescriptionGenerator, updated ImageUpload, tooltips, error handling components. Check for React best practices, accessibility compliance (WCAG 2.1 AA), performance optimizations, code quality, and TypeScript strictness. Verify state management patterns, effect dependencies, and component composition. Critical issues must be resolved before Phase 3.
- **Deliverables**:
  - Code review report with findings categorized by severity
  - Accessibility compliance audit (WCAG 2.1 AA)
  - Performance recommendations (bundle size, re-renders)
  - Required fixes list (blocking issues)
  - Optional improvements list
- **Dependencies**: FRONT-001, FRONT-002, FRONT-003, FRONT-004, FRONT-005, FRONT-006
- **Acceptance Criteria**:
  - ✅ Review all frontend components for React best practices: proper hooks usage (dependency arrays, cleanup), state management patterns (no unnecessary state), effect usage (avoid effect chains)
  - ✅ Verify accessibility compliance: WCAG 2.1 AA standards met, keyboard navigation works, screen reader support, color contrast ratios, ARIA attributes used correctly
  - ✅ Check for performance issues: unnecessary re-renders (React.memo where appropriate), large bundle size (code splitting), inefficient algorithms, missing useMemo/useCallback
  - ✅ Verify TypeScript types are strict: no unjustified `any`, props interfaces complete, event handlers typed
  - ✅ Check responsive design implementation: mobile-first CSS, proper breakpoints, touch-friendly interactions
  - ✅ Verify error handling is user-friendly: clear messages, recovery options, graceful degradation
  - ✅ Identify component reusability opportunities: common patterns extracted to shared components
  - ✅ Provide actionable feedback with code examples and links to documentation
  - ✅ Critical issues must be resolved before Phase 3
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `docs/code-review/phase2-frontend-review.md` (create comprehensive review report)

---

### Task ID: REVIEW-003
- **Title**: Code review of integration and full feature (Phase 3)
- **Agent**: @maya-code-review
- **Description**: Final comprehensive code review of integrated listing creation flow with AI features. Check state management across form steps, form validation with AI content, error handling and recovery, user experience consistency, and data persistence (AI metadata saving). Verify all quality gates met. Provide go/no-go recommendation for rollout based on code quality, security, and completeness.
- **Deliverables**:
  - Code review report with findings
  - Integration quality audit (state management, data flow)
  - Final security review (end-to-end)
  - User experience evaluation
  - Go/no-go recommendation for rollout
- **Dependencies**: INT-001, INT-002, INT-003, INT-004, INT-005, TEST-008
- **Acceptance Criteria**:
  - ✅ Review integrated listing creation flow for state management: form state persists correctly, navigation doesn't lose AI data, concurrent state updates handled
  - ✅ Verify form validation works correctly with AI features: description length validation, image count validation, AI metadata validation
  - ✅ Verify AI metadata properly saved to database: fields mapped correctly, Prisma transactions used appropriately, error handling doesn't lose listing
  - ✅ Check for race conditions or timing issues: async operations complete before navigation, API calls don't overlap
  - ✅ Final security audit: authentication on all routes, authorization checks, no data leakage, rate limiting effective, API keys secure
  - ✅ Verify graceful degradation: listing creation works without AI features, API failures don't block user, error messages helpful
  - ✅ Check user experience consistency: flows intuitive, feedback clear, loading states smooth, error recovery obvious
  - ✅ Provide go/no-go recommendation: GO if zero critical issues, NO-GO if critical issues or poor UX
  - ✅ All critical issues must be resolved before rollout
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `docs/code-review/phase3-integration-review.md` (create final review report with go/no-go decision)

---

### Task ID: REVIEW-004
- **Title**: Security audit and penetration testing for AI API endpoints
- **Agent**: @maya-code-review
- **Description**: Conduct focused security audit and basic penetration testing on AI API endpoints (`/api/enhance-image`, `/api/generate-description`). Test for common vulnerabilities: authentication bypass, rate limit bypass, API key exposure, injection attacks (prompt injection, SQL), and excessive API costs through abuse. Use tools like OWASP ZAP or Burp Suite. Document all findings with severity ratings and remediation steps. All critical/high vulnerabilities must be fixed.
- **Deliverables**:
  - Security audit report with vulnerability details
  - Penetration testing results (attempted exploits)
  - Vulnerability severity ratings (Critical, High, Medium, Low)
  - Remediation recommendations with priority
  - Verification that fixes resolve issues
- **Dependencies**: BACK-003, BACK-004, BACK-005
- **Acceptance Criteria**:
  - ✅ Test authentication enforcement: attempt to call API without session (expect 401), with invalid session (expect 401), with expired session (expect 401)
  - ✅ Attempt to bypass rate limiting: rapid requests, concurrent requests, requests from multiple IPs (same user), clock manipulation
  - ✅ Test for API key exposure: check response bodies, error messages, headers, logs (no keys exposed)
  - ✅ Test for injection attacks: prompt injection (malicious prompts to OpenAI), SQL injection in Prisma queries, NoSQL injection if applicable
  - ✅ Test for excessive API costs: sending extremely large images, requesting max rate continuously, batch abuse scenarios
  - ✅ Test authorization: user A cannot enhance/generate for user B's listing, cannot access other users' feedback
  - ✅ Zero critical or high severity vulnerabilities unresolved (all must be fixed)
  - ✅ All findings documented: vulnerability description, severity (CVSS score), reproduction steps, impact, remediation
  - ✅ Fixes verified with re-testing (no regressions)
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `docs/security/ai-endpoints-security-audit.md` (create detailed security audit report)
  - `docs/security/penetration-testing-report.md` (create penetration testing report)

---

## Phase 7: Documentation

### Task ID: DOCS-001
- **Title**: Write API documentation for AI endpoints
- **Agent**: @yael-technical-docs
- **Description**: Create comprehensive, developer-friendly API documentation for both AI endpoints: `/api/enhance-image` and `/api/generate-description`. Include full request/response schemas with types, authentication requirements, rate limits with examples, error codes with descriptions, and code examples in TypeScript and cURL. Optionally create OpenAPI/Swagger specification for automated API doc generation. Documentation should be clear, complete, and usable by both internal developers and potential API consumers.
- **Deliverables**:
  - API documentation markdown file (detailed, formatted)
  - OpenAPI/Swagger specification (optional, YAML/JSON)
  - Code examples in TypeScript and cURL
  - Error code reference table
  - Rate limit documentation with examples
- **Dependencies**: BACK-003, BACK-004
- **Acceptance Criteria**:
  - ✅ Documentation includes full request/response schemas: field names, types (TypeScript), required vs optional, validation rules, examples
  - ✅ Authentication requirements clearly documented: NextAuth session required, how to authenticate, what happens if unauthenticated
  - ✅ Rate limits documented thoroughly: requests per minute, requests per hour, rate limit headers, what happens when exceeded, how to handle 429 responses
  - ✅ All error codes documented: INVALID_IMAGE, OPENAI_ERROR, CLOUDINARY_ERROR, RATE_LIMIT_EXCEEDED, etc. (with descriptions, HTTP status codes, example responses)
  - ✅ Code examples for successful requests: TypeScript (fetch), cURL
  - ✅ Code examples for error handling: how to catch errors, retry logic, handling rate limits
  - ✅ Usage examples for all templates (description generation): Detailed, Concise, SEO with expected outputs
  - ✅ Documentation reviewed by backend team for accuracy
  - ✅ OpenAPI spec (if created) validates successfully and generates docs
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `docs/api/ai-endpoints.md` (create comprehensive API documentation)
  - `docs/api/openapi-ai-spec.yaml` (create OpenAPI specification - optional)

---

### Task ID: DOCS-002
- **Title**: Update CLAUDE.md with AI feature architecture and patterns
- **Agent**: @yael-technical-docs
- **Description**: Update the project's `CLAUDE.md` file (root directory) to comprehensively document AI feature architecture, component patterns, utility functions, API routes, database schema changes, testing approach, and development guidelines for future AI features. This documentation helps onboard new developers and provides a reference for working with AI features. Include architecture diagrams, code examples, and links to related documentation.
- **Deliverables**:
  - Updated CLAUDE.md with comprehensive AI sections
  - Architecture diagrams (text-based or Mermaid)
  - Component usage examples with code
  - Development guidelines for extending AI features
  - Testing instructions specific to AI components
- **Dependencies**: REVIEW-003
- **Acceptance Criteria**:
  - ✅ AI feature architecture documented: system overview, data flow diagram, component hierarchy, API interaction patterns
  - ✅ Component patterns documented: AIImageEnhancer usage, AIDescriptionGenerator usage, props, integration examples
  - ✅ Utility functions documented: `enhance-image.ts`, `generate-description.ts` with function signatures, parameters, return types, usage examples
  - ✅ API routes documented: endpoints, authentication, request/response formats, error handling patterns
  - ✅ Database schema changes documented: new Listing fields (aiEnhancedImages, aiGeneratedDesc, originalImages), AIFeedback model, migration references
  - ✅ Development guidelines: how to add new AI features, prompt engineering best practices, testing requirements, code review checklist
  - ✅ Testing instructions: how to run AI feature tests, mocking strategies, coverage requirements
  - ✅ Environment setup: required API keys, configuration steps, verification script usage
  - ✅ Links to related documentation: feature doc, API docs, component docs, testing docs
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `CLAUDE.md` (modify - add comprehensive AI feature section ~200-300 lines)

---

### Task ID: DOCS-003
- **Title**: Create component documentation for AI features
- **Agent**: @yael-technical-docs
- **Description**: Write detailed, developer-focused component documentation for AIImageEnhancer, AIDescriptionGenerator, and updated ImageUpload components. Include component purpose/overview, complete props API reference with types and defaults, usage examples with code snippets, integration guidelines for using in other pages/features, accessibility features and considerations, and known limitations or edge cases. Documentation should enable developers to use these components effectively.
- **Deliverables**:
  - Component documentation files (one per component)
  - Props API reference tables
  - Usage examples with code snippets
  - Integration guidelines
  - Accessibility documentation
  - Known limitations section
- **Dependencies**: FRONT-001, FRONT-002, FRONT-003
- **Acceptance Criteria**:
  - ✅ Each component documented with: purpose statement, high-level overview, when to use, visual examples/screenshots
  - ✅ Props API fully documented: prop name, type, required/optional, default value, description, example values (in table format)
  - ✅ Usage examples with complete, runnable code snippets (TypeScript, JSX)
  - ✅ Integration guidelines: how to integrate into other pages, state management requirements, API dependencies, error handling
  - ✅ Accessibility features documented: keyboard navigation support, screen reader support, ARIA attributes used, focus management
  - ✅ Known limitations or edge cases: scenarios where component may not work as expected, workarounds, future improvements planned
  - ✅ Visual examples or screenshots showing component in different states (default, loading, success, error)
  - ✅ Internal links to related documentation (API docs, architecture docs)
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `docs/components/ai-image-enhancer.md` (create ~100 lines)
  - `docs/components/ai-description-generator.md` (create ~100 lines)
  - `docs/components/image-upload-ai.md` (create ~80 lines documenting AI enhancements)

---

### Task ID: DOCS-004
- **Title**: Create user-facing help documentation for AI features
- **Agent**: @yael-technical-docs
- **Description**: Write user-friendly, non-technical help articles for sellers explaining how to use AI features in listing creation. Create step-by-step guides with screenshots, best practices for getting optimal results, FAQ section answering common questions, privacy/security information in clear language, and troubleshooting tips for common issues. Also create a video tutorial script (2-3 minutes) for recording a demo video. Content should be reviewed by a non-technical user for clarity.
- **Deliverables**:
  - Help article: "How to Use AI Image Enhancement" with screenshots
  - Help article: "AI-Powered Description Writing" with screenshots
  - FAQ section (10+ questions)
  - Video tutorial script (2-3 minutes)
  - Best practices guide
- **Dependencies**: TEST-010
- **Acceptance Criteria**:
  - ✅ "How to Use AI Image Enhancement" guide: step-by-step instructions with 5+ annotated screenshots, what to expect, how to choose between original/enhanced
  - ✅ "AI-Powered Description Writing" guide: step-by-step instructions with 5+ screenshots, template explanations, how to edit AI text
  - ✅ Best practices for optimal AI results: photo tips (lighting, angles, backgrounds), when to use each template, how to improve AI output
  - ✅ FAQ with 10+ common questions: "Is my data safe?", "How much does it cost?", "Can I edit AI content?", "What if AI makes a mistake?", "Why is AI enhancement not working?", etc.
  - ✅ Privacy information clearly explained: what data is sent to AI services, how data is processed, data retention policies, security measures
  - ✅ Troubleshooting section: common issues (enhancement fails, description irrelevant, button disabled) with solutions
  - ✅ Video tutorial script (2-3 minutes): narration, actions to show on screen, key points to emphasize, call to action
  - ✅ Content reviewed for clarity by non-technical user (no jargon, easy to follow)
  - ✅ Mobile-friendly formatting (readable on small screens)
- **Effort**: L (16 hours)
- **Files to Create/Modify**:
  - `docs/help/ai-image-enhancement.md` (create ~150 lines with screenshot references)
  - `docs/help/ai-description-writing.md` (create ~150 lines with screenshot references)
  - `docs/help/ai-faq.md` (create ~100 lines)
  - `docs/help/ai-best-practices.md` (create ~80 lines)
  - `docs/help/ai-video-script.md` (create ~50 lines)

---

## Phase 8: Rollout & Monitoring

### Task ID: ROLL-001
- **Title**: Conduct alpha testing with internal team
- **Agent**: @uri-testing
- **Description**: Organize and execute alpha testing with 5-10 internal team members (developers, QA, product). Provide clear testing guidelines, collect structured feedback on usability and AI quality, identify and document bugs with severity ratings, measure AI output quality ratings, and validate feature value proposition. Duration: 1 week. Create summary report with go/no-go recommendation for beta testing. All critical bugs must be fixed before proceeding to beta.
- **Deliverables**:
  - Alpha testing plan with scenarios and acceptance criteria
  - Feedback collection form/survey (Google Forms, Typeform, or similar)
  - Bug reports with severity and priority
  - Alpha testing summary report with metrics
  - Go/no-go recommendation for beta
- **Dependencies**: REVIEW-003, DOCS-004, TEST-010
- **Acceptance Criteria**:
  - ✅ 5-10 internal users recruited and onboarded for alpha testing
  - ✅ Each tester creates minimum 5 listings using AI features (covering different categories)
  - ✅ Feedback collected on: usability (1-5 scale), AI image quality (1-5 scale), AI description quality (1-5 scale), bugs encountered, suggestions
  - ✅ All critical bugs identified, documented, and fixed (blocking issues resolved)
  - ✅ High priority bugs documented with fix timeline
  - ✅ AI output quality rated 4+/5 by 80%+ of testers (both image and description)
  - ✅ Zero blocking issues remaining (users can complete listing creation successfully)
  - ✅ Summary report includes: participation metrics, usability scores, AI quality scores, bug summary, tester quotes, recommendations
  - ✅ Go/no-go recommendation: GO if metrics met and no blockers, NO-GO otherwise
- **Effort**: M (8 hours for planning + coordination, 1 week duration)
- **Files to Create/Modify**:
  - `docs/rollout/alpha-testing-plan.md` (create detailed plan)
  - `docs/rollout/alpha-feedback-form.md` (create survey questions)
  - `docs/rollout/alpha-summary-report.md` (create report after testing)

---

### Task ID: ROLL-002
- **Title**: Conduct beta testing with 50 selected sellers
- **Agent**: @uri-testing
- **Description**: Organize and execute beta testing with 50 active, diverse sellers (power sellers across categories). Monitor adoption rate, user satisfaction, API error rates, and business impact metrics (time savings, completion rates). Collect detailed feedback via surveys and optional interviews. Duration: 2 weeks. Create comprehensive summary report with go/no-go recommendation for gradual rollout to all users. Fix all high-priority bugs before full rollout.
- **Deliverables**:
  - Beta testing plan with user selection criteria
  - User recruitment and onboarding materials
  - Feedback surveys (weekly check-ins)
  - Usage analytics dashboard or report
  - Beta testing summary report with business metrics
  - Go/no-go recommendation for full rollout
- **Dependencies**: ROLL-001
- **Acceptance Criteria**:
  - ✅ 50 active sellers invited and onboarded for beta (diverse: categories, experience levels, devices)
  - ✅ 60%+ adoption rate among beta users (30+ users try AI features)
  - ✅ Satisfaction score 70%+ (survey: would recommend to other sellers)
  - ✅ API error rate <2% (tracked via monitoring dashboard)
  - ✅ Feedback collected via surveys: weekly check-in surveys (response rate 60%+), exit survey (response rate 80%+), optional interviews with 10+ sellers
  - ✅ Usage metrics tracked: adoption rate (% using AI), feature usage (image enhancement vs description), completion rate improvement, time savings per listing
  - ✅ All high priority bugs fixed before full rollout recommendation
  - ✅ Summary report includes: participation metrics, adoption rate, satisfaction scores, time savings analysis, API performance, cost analysis, bug summary, user testimonials, recommendations
  - ✅ Go/no-go recommendation: GO if adoption 60%+, satisfaction 70%+, error rate <2%, NO-GO otherwise
- **Effort**: L (16 hours for planning + coordination, 2 weeks duration)
- **Files to Create/Modify**:
  - `docs/rollout/beta-testing-plan.md` (create comprehensive plan)
  - `docs/rollout/beta-user-selection-criteria.md` (create selection criteria)
  - `docs/rollout/beta-feedback-survey.md` (create survey questions)
  - `docs/rollout/beta-summary-report.md` (create comprehensive report after testing)

---

### Task ID: ROLL-003
- **Title**: Set up monitoring and alerting for AI features
- **Agent**: @oren-backend
- **Description**: Implement production monitoring and alerting infrastructure for AI features. Track key metrics: API response times (p50, p95, p99), error rates by endpoint, feature usage rates (% of listings), API costs per listing, and AI output quality (via user feedback). Set up automated alerts for anomalies: high error rates, slow response times, cost spikes. Create operational runbook for responding to alerts. Integrate with existing monitoring tools (e.g., Vercel Analytics, Sentry, DataDog) or build custom dashboard.
- **Deliverables**:
  - Monitoring dashboard (or integration with existing monitoring)
  - Alert configurations (email, Slack, PagerDuty)
  - Metrics tracking implementation (instrumentation code)
  - Operational runbook for alert response
  - Cost tracking dashboard
- **Dependencies**: BACK-003, BACK-004, INT-005
- **Acceptance Criteria**:
  - ✅ Metrics tracked and visualized: API response times (p50, p95, p99 in milliseconds), error rates (% by endpoint), feature usage rates (% of listings using image enhancement, % using description generation), cost per listing (OpenAI + Cloudinary costs), user satisfaction (% positive feedback via thumbs up/down)
  - ✅ Alerts configured with appropriate thresholds: error rate >5% (5 min window), p95 response time >15s (10 min window), hourly cost >$50 (1 hour window), daily error count >100 (24 hour window)
  - ✅ Dashboard displays real-time metrics (refresh every 1-5 minutes) or integrates with existing monitoring solution
  - ✅ Operational runbook documented: alert types, severity levels, troubleshooting steps, escalation procedures, common issues and solutions
  - ✅ Alerts tested and working correctly (simulate error scenarios, verify notifications)
  - ✅ Cost tracking includes breakdown: OpenAI costs, Cloudinary costs, total per listing, daily/monthly projections
  - ✅ Metrics exportable for business reporting (CSV, API, or database queries)
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `lib/monitoring/ai-metrics.ts` (create metrics collection utility)
  - `lib/monitoring/ai-alerts.ts` (create alert logic)
  - `docs/operations/ai-monitoring-runbook.md` (create operational runbook)
  - `docs/operations/ai-alert-thresholds.md` (document alert configurations)

---

### Task ID: PROMPT-003
- **Title**: Optimize AI prompts based on beta feedback and user edits
- **Agent**: @noam-prompt-engineering
- **Description**: Analyze user feedback (thumbs up/down ratings) and edit patterns from beta testing to identify opportunities for prompt optimization. Review 50+ AI-generated descriptions that users edited to understand common improvement patterns (e.g., users remove generic phrases, add specific details, adjust tone). Refine prompt templates to address these patterns. Test optimized prompts with new images and measure improvement in user acceptance (reduce edit rate, increase positive feedback). Deploy optimized prompts to production.
- **Deliverables**:
  - Analysis report of user edits and feedback patterns
  - Optimized prompt templates (updated versions)
  - A/B test plan for new prompts (optional if applicable)
  - Optimization results report (before/after metrics)
  - Deployment plan for optimized prompts
- **Dependencies**: ROLL-002
- **Acceptance Criteria**:
  - ✅ Analysis of minimum 50 AI-generated descriptions with user edits (tracked via `descriptionSource: 'mixed'`)
  - ✅ Common improvement patterns identified: what users typically add (e.g., pricing context, personal notes), what users remove (e.g., generic phrases like "great condition", repetitive words), tone adjustments (e.g., more casual, more detailed)
  - ✅ Prompts optimized to address top 5 common issues (e.g., add instruction to avoid generic phrases, increase specificity)
  - ✅ Optimized prompts tested with 20+ new images across categories
  - ✅ Measurable improvement: user edit rate reduced by 20%+ (fewer edits needed), AI quality ratings improved by 10%+ (more thumbs up)
  - ✅ A/B test plan created if rolling out gradually (optional: 50% users get old prompts, 50% get new)
  - ✅ Optimized prompts deployed to production (update `lib/ai/prompts/description-templates.ts`)
  - ✅ Deployment monitored for regressions (verify improvements hold in production)
- **Effort**: M (8 hours)
- **Files to Create/Modify**:
  - `lib/ai/prompts/description-templates.ts` (modify with optimized prompts v2)
  - `docs/ai/prompt-optimization-v2-report.md` (create optimization report)
  - `docs/ai/user-edit-analysis.md` (create analysis of user editing patterns)

---

## Task Dependencies Visualization

### Critical Path (Sequential)
```
ENV-001 (Environment Setup)
  → PROMPT-001 (Prompt Design)
    → BACK-001 (OpenAI Utility)
      → BACK-003 (Description API)
        → FRONT-002 (Description Generator)
          → INT-003 (Integrate Description)
            → TEST-007 (Test Description Component)
              → TEST-008 (Integration Tests)
                → REVIEW-003 (Final Review)
                  → TEST-010 (E2E Testing)
                    → ROLL-001 (Alpha Testing)
                      → ROLL-002 (Beta Testing)
```

### Parallel Work Opportunities

**Can Start Immediately (No Dependencies)**:
- ENV-001 (Environment Setup)
- PROMPT-001 (Prompt Design)
- DB-001 (Database Schema)

**After ENV-001 Completes**:
- BACK-002 (Cloudinary Utility) - parallel with BACK-001
- BACK-005 (Rate Limiter) - parallel with BACK-001

**After BACK-001, BACK-002, BACK-005 Complete**:
- BACK-003 (Description API) - parallel with BACK-004
- BACK-004 (Enhancement API) - parallel with BACK-003

**After BACK-003, BACK-004 Complete**:
- FRONT-001 (Image Enhancer) - parallel with FRONT-002
- FRONT-002 (Description Generator) - parallel with FRONT-001
- TEST-001 through TEST-005 (Backend tests) - all parallel

**After FRONT-001, FRONT-002 Complete**:
- FRONT-003, FRONT-004, FRONT-005, FRONT-006 - can work in parallel
- TEST-006, TEST-007 (Component tests) - parallel with frontend work

**After Integration Complete**:
- All documentation (DOCS-001 through DOCS-004) can be written in parallel

---

## Effort Summary by Agent

| Agent | Tasks | Total Effort (hours) | % of Total |
|-------|-------|---------------------|------------|
| **uri-testing** | 12 tasks | 116 hours | 25.9% |
| **oren-backend** | 9 tasks | 88 hours | 19.6% |
| **tal-design** | 6 tasks | 64 hours | 14.3% |
| **adi-fullstack** | 5 tasks | 36 hours | 8.0% |
| **yael-technical-docs** | 4 tasks | 40 hours | 8.9% |
| **maya-code-review** | 4 tasks | 56 hours | 12.5% |
| **noam-prompt-engineering** | 3 tasks | 32 hours | 7.1% |
| **gal-database** | 2 tasks | 8 hours | 1.8% |
| **TOTAL** | **45 tasks** | **448 hours** | **100%** |

---

## Timeline Estimate

### With 1 Developer (Sequential)
- **Total Duration**: 448 hours = ~11-12 weeks (56 working days at 8 hours/day)

### With 3-4 Developers (Optimal Parallelization)
- **Phase 0**: 1 week (ENV-001, PROMPT-001 can overlap)
- **Phase 1**: 2 weeks (backend work mostly parallel)
- **Phase 2**: 2 weeks (frontend work mostly parallel)
- **Phase 3**: 1 week (integration work sequential)
- **Phase 4**: 1 week (database + testing in parallel)
- **Phase 5**: 2 weeks (testing in parallel)
- **Phase 6**: 1 week (code reviews sequential)
- **Phase 7**: 1 week (documentation in parallel)
- **Phase 8**: 3 weeks (alpha 1 week + beta 2 weeks + monitoring setup)
- **Total Duration**: 14 weeks

### Accelerated Timeline (More Developers + Aggressive Parallelization)
- **Total Duration**: 8-10 weeks (with 5-6 developers and accepted risk of rework)

---

## How to Use This Document

### For Project Managers
1. Assign tasks to agents based on "Agent" field
2. Track progress using "Status" field (add status tracking to each task)
3. Monitor dependencies - don't start a task until its dependencies complete
4. Use effort estimates for sprint planning and timeline projections
5. Focus on critical path tasks to minimize overall timeline

### For Developers
1. Find your assigned tasks (filter by agent)
2. Review dependencies before starting - ensure prerequisite tasks complete
3. Read "Description" and "Acceptance Criteria" carefully
4. Deliver all items listed in "Deliverables"
5. Verify all acceptance criteria met before marking complete
6. Update "Files to Create/Modify" if you discover additional files needed

### For QA/Testing
1. Review acceptance criteria for each task - these become test cases
2. Focus on TEST-* tasks (Phase 5)
3. Participate in alpha/beta testing (ROLL-001, ROLL-002)
4. Document bugs with references to task IDs

### For Technical Writers
1. Focus on DOCS-* tasks (Phase 7)
2. Coordinate with developers to get technical details
3. Ensure documentation aligns with actual implementation

---

## Status Tracking Template

To track progress, add a status field to each task:

```markdown
- **Status**: 🔴 Not Started | 🟡 In Progress | 🟢 Complete | 🔵 Blocked
- **Assignee**: [Developer Name]
- **Started**: [Date]
- **Completed**: [Date]
- **Blockers**: [Description of any blocking issues]
```

---

## Success Criteria for Feature Launch

**Must achieve before full production rollout**:
- ✅ All 45 tasks completed and verified
- ✅ Zero critical bugs remaining
- ✅ All high-priority bugs resolved or scheduled for post-launch
- ✅ Code coverage ≥80% for all new code
- ✅ Accessibility compliance: zero critical WCAG violations
- ✅ Beta testing: 60%+ adoption rate, 70%+ satisfaction score
- ✅ API error rate <2% in beta
- ✅ Security audit: zero critical/high vulnerabilities
- ✅ All documentation complete and reviewed
- ✅ Monitoring and alerting operational
- ✅ Go/no-go approval from: Engineering Lead, Product Manager, QA Lead

---

**Next Steps**: Assign tasks to agents and begin Phase 0 (Preparation & Environment Setup)

**Questions or Issues**: Contact project lead or refer to feature documentation at `/docs/features/ai-enhanced-listing-creation.md`

---

*Document maintained by: Strategic Project Orchestrator (rotem-strategy agent)*
*Last updated: 2025-10-23*
