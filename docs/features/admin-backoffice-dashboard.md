# Admin Backoffice Dashboard Feature Documentation

## Table of Contents
1. [Feature Overview](#feature-overview)
2. [Architecture](#architecture)
3. [User Guide](#user-guide)
4. [Technical Specification](#technical-specification)
5. [Development Guide](#development-guide)
6. [Security & Permissions](#security--permissions)
7. [Testing](#testing)
8. [Future Enhancements](#future-enhancements)

---

## Feature Overview

### Purpose and Business Value

The Admin Backoffice Dashboard is a comprehensive administrative interface that enables platform moderators to maintain marketplace quality and safety through content moderation, user management, and platform analytics. This feature is essential for:

- **Quality Control**: Ensuring all listings meet platform standards before going live
- **Trust & Safety**: Preventing fraudulent or inappropriate content from reaching users
- **Compliance**: Meeting legal requirements for marketplace operations
- **Business Intelligence**: Monitoring platform health through key metrics
- **Operational Efficiency**: Streamlining administrative tasks with bulk operations

### Target Users

- **Platform Administrators**: Staff members with ADMIN role (`admin@secondhand.co.za`)
- **Content Moderators**: Future role for listing review specialists
- **Support Team**: Future role for handling user issues and disputes

### Key Capabilities

1. **Listing Moderation**
   - Review pending listings with full details and images
   - Approve listings for public visibility
   - Reject listings with specific reasons
   - Pause active listings temporarily
   - Delete inappropriate content permanently

2. **Dashboard Analytics**
   - Real-time platform statistics
   - Listing status distribution
   - User growth metrics
   - Transaction volume tracking

3. **Advanced Filtering**
   - Filter by status (PENDING, APPROVED, REJECTED, PAUSED, SOLD)
   - Filter by category (ELECTRONICS, CLOTHING, etc.)
   - Date range filtering
   - Search by title or seller

4. **Batch Operations** (Future)
   - Bulk approve/reject actions
   - Export filtered data
   - Mass notification sending

---

## Architecture

### Route Structure

```
/admin/                        # Dashboard overview with statistics
├── listings/                  # Listing management table
│   ├── [id]/                  # Individual listing detail view
│   └── actions.ts            # Server actions for listing operations
├── users/                     # User management (future)
│   ├── [id]/                 # User detail view (future)
│   └── actions.ts           # User management actions (future)
├── analytics/                 # Analytics dashboard (future)
│   └── revenue/              # Revenue analytics (future)
├── settings/                  # Admin settings (future)
└── audit-log/                # Activity audit trail (future)
```

### Security Model

The admin dashboard implements a **multi-layer security approach**:

```
┌─────────────────────────────────────────────┐
│            1. Edge Middleware               │
│   (auth.config.ts - Route Protection)       │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│         2. Page-Level Protection            │
│    (requireAdmin() helper function)         │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│       3. Server Action Validation           │
│     (Session role check per action)         │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│        4. Database Constraints              │
│    (UUID validation, status checks)         │
└─────────────────────────────────────────────┘
```

### Data Flow

```
User Request → Middleware Auth → Admin Page → Server Action → Database
     ↑                                              ↓
     └────────── Response with Revalidation ←──────┘

1. User navigates to /admin/*
2. Middleware checks authentication and ADMIN role
3. Page component calls requireAdmin() helper
4. User triggers action (approve/reject/pause/delete)
5. Server action validates session and permissions
6. Database operation with transaction safety
7. Path revalidation triggers UI update
8. Success/error feedback to user
```

### Component Hierarchy

```
/admin (layout.tsx)
├── <AdminNav />                    # Navigation sidebar/header
├── page.tsx                        # Dashboard overview
│   └── <AdminStatsCard />         # Metrics display cards
│
├── /listings/page.tsx              # Listings management
│   ├── <AdminListingsTable />     # Data table with actions
│   ├── <AdminListingFilters />    # Filter controls
│   └── <RejectListingDialog />    # Rejection reason modal
│
└── /listings/[id]/page.tsx        # Listing detail
    ├── <ListingImages />          # Image gallery
    ├── <ListingDetails />         # Full information
    └── <AdminActions />           # Action buttons
```

---

## User Guide

### Accessing the Admin Dashboard

1. **Login Requirements**
   - Email: `admin@secondhand.co.za`
   - Role: `ADMIN` in database
   - Email must be verified

2. **Navigation**
   - Direct URL: `https://second-hand-xi.vercel.app/admin`
   - Admin link in user menu (visible only to ADMIN users)
   - Bookmark for quick access

### Dashboard Overview

The admin dashboard homepage displays key platform metrics:

```
┌──────────────────────────────────────────────────┐
│                 Admin Dashboard                  │
├──────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Pending   │  │  Approved  │  │   Total    │ │
│  │    25      │  │    342     │  │   Users    │ │
│  │ Listings   │  │  Listings  │  │    1,245   │ │
│  └────────────┘  └────────────┘  └────────────┘ │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Today's   │  │   Week's   │  │  Revenue   │ │
│  │  Signups   │  │   Sales    │  │  R45,230   │ │
│  │     12     │  │     87     │  │    (20%)   │ │
│  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────────────────────────────────────┘
```

### Managing Listings

#### Viewing All Listings

Navigate to `/admin/listings` to see the comprehensive listings table:

```
┌─────────────────────────────────────────────────────────────┐
│ Filters: [Status ▼] [Category ▼] [Date Range] [Search...]  │
├─────────────────────────────────────────────────────────────┤
│ Title          | Seller    | Category | Status  | Actions  │
├─────────────────────────────────────────────────────────────┤
│ iPhone 13 Pro  | John D.   | ELECTRONICS | PENDING | [👁️][✓][✗] │
│ Winter Jacket  | Sarah M.  | CLOTHING | APPROVED | [👁️][⏸️][🗑️] │
│ Coffee Table   | Mike R.   | HOME_GARDEN | PAUSED | [👁️][▶️][🗑️] │
└─────────────────────────────────────────────────────────────┘
```

#### Approving a Listing

1. Click the **Approve** button (✓) on a PENDING listing
2. System validates the transition
3. Sets `approvedAt` timestamp
4. Updates status to APPROVED
5. Listing becomes visible to users

#### Rejecting a Listing

1. Click the **Reject** button (✗) on a PENDING listing
2. Dialog opens for rejection reason:

   ```
   ┌──────────────────────────────────┐
   │     Reject Listing              │
   ├──────────────────────────────────┤
   │ Reason for rejection:            │
   │ ┌────────────────────────────┐  │
   │ │ Poor quality images.       │  │
   │ │ Please request better      │  │
   │ │ photos from seller.        │  │
   │ └────────────────────────────┘  │
   │                                  │
   │ [Cancel]          [Reject]      │
   └──────────────────────────────────┘
   ```

3. Enter reason (10-500 characters)
4. Click **Reject** to confirm
5. Status updates to REJECTED
6. Seller receives notification with reason

#### Pausing a Listing

1. Click the **Pause** button (⏸️) on an APPROVED listing
2. Confirm the action
3. Listing hidden from public view
4. Can be resumed later

#### Deleting a Listing

1. Click the **Delete** button (🗑️)
2. Confirm permanent deletion:

   ```
   ⚠️ This action cannot be undone.
   Delete "iPhone 13 Pro" permanently?
   [Cancel] [Delete Forever]
   ```

3. Listing and all associated data removed
4. Cannot delete SOLD listings (historical record)

### Filtering and Search

#### Available Filters

- **Status**: PENDING | APPROVED | REJECTED | PAUSED | SOLD
- **Category**: All 10 marketplace categories
- **Date Range**: Created date filtering
- **Search**: Title or seller name

#### Filter Combinations

Filters work together with AND logic:
- Status: PENDING + Category: ELECTRONICS = Pending electronics only
- Add date range for time-based filtering
- Search narrows results within filters

---

## Technical Specification

### Server Actions API Reference

All server actions are located in `/app/admin/listings/actions.ts`:

#### `getAdminListings(params)`

Fetches paginated listings with optional filters.

```typescript
interface GetAdminListingsParams {
  status?: ListingStatus
  category?: ListingCategory
  search?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'price'
  sortOrder?: 'asc' | 'desc'
}

interface GetAdminListingsResponse {
  listings: SerializedListing[]
  total: number
  page: number
  totalPages: number
}

// Usage
const { listings, total } = await getAdminListings({
  status: 'PENDING',
  category: 'ELECTRONICS',
  page: 1,
  limit: 20
})
```

#### `approveListing(listingId)`

Approves a pending listing.

```typescript
async function approveListing(
  listingId: string
): Promise<{
  success: boolean
  error?: string
}>

// Usage
const result = await approveListing('uuid-here')
if (result.success) {
  // Show success toast
}
```

#### `rejectListing(listingId, reason)`

Rejects a pending listing with reason.

```typescript
async function rejectListing(
  listingId: string,
  reason: string
): Promise<{
  success: boolean
  error?: string
}>

// Validation
// - reason: 10-500 characters
// - Only PENDING listings can be rejected

// Usage
const result = await rejectListing('uuid-here', 'Poor image quality')
```

#### `adminPauseListing(listingId)`

Pauses an approved listing.

```typescript
async function adminPauseListing(
  listingId: string
): Promise<{
  success: boolean
  error?: string
}>

// Only APPROVED listings can be paused
```

#### `adminDeleteListing(listingId)`

Permanently deletes a listing.

```typescript
async function adminDeleteListing(
  listingId: string
): Promise<{
  success: boolean
  error?: string
}>

// Cannot delete SOLD listings
// Cascades to related offers
```

#### `getAdminStats()`

Fetches dashboard statistics.

```typescript
interface AdminStats {
  pendingListings: number
  approvedListings: number
  totalUsers: number
  todaySignups: number
  weekSales: number
  monthRevenue: number
}

async function getAdminStats(): Promise<AdminStats>
```

### Component Props and Interfaces

#### AdminListingsTable

```typescript
interface AdminListingsTableProps {
  listings: SerializedListing[]
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
  onPause: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}
```

#### RejectListingDialog

```typescript
interface RejectListingDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
  listingTitle: string
}
```

#### AdminStatsCard

```typescript
interface AdminStatsCardProps {
  title: string
  value: number | string
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}
```

### Database Schema Considerations

The existing schema supports admin operations without changes:

- `ListingStatus` enum includes all required states
- `rejectionReason` field stores rejection feedback
- `approvedAt` timestamp tracks approval time
- `User.role` identifies ADMIN users
- Indexes optimized for status-based queries

### Environment Variables

No additional environment variables required. Uses existing:
- `DATABASE_URL` - PostgreSQL connection
- `AUTH_SECRET` - NextAuth.js session encryption
- `NEXTAUTH_URL` - Application URL for callbacks

---

## Development Guide

### File Structure

```
app/
├── admin/
│   ├── layout.tsx                    # Admin layout with navigation
│   ├── page.tsx                      # Dashboard overview
│   ├── listings/
│   │   ├── page.tsx                  # Listings table page
│   │   ├── [id]/
│   │   │   └── page.tsx             # Listing detail page
│   │   └── actions.ts               # Server actions
│   └── loading.tsx                   # Loading state
│
components/
├── admin/
│   ├── admin-nav.tsx                # Navigation component
│   ├── admin-listings-table.tsx     # Listings data table
│   ├── admin-listing-filters.tsx    # Filter controls
│   ├── reject-listing-dialog.tsx    # Rejection modal
│   ├── admin-stats-card.tsx        # Metric card
│   └── admin-actions.tsx           # Action button group
│
lib/
├── admin/
│   ├── permissions.ts              # Permission helpers
│   └── admin-utils.ts             # Admin utilities
```

### Adding New Admin Features

1. **Create Route Structure**
   ```typescript
   // app/admin/new-feature/page.tsx
   import { requireAdmin } from '@/lib/admin/permissions'

   export default async function NewFeaturePage() {
     await requireAdmin()
     // Page content
   }
   ```

2. **Add Server Actions**
   ```typescript
   // app/admin/new-feature/actions.ts
   'use server'

   import { auth } from '@/auth'
   import prisma from '@/lib/prisma'

   export async function newFeatureAction() {
     const session = await auth()
     if (!session || session.user.role !== 'ADMIN') {
       return { success: false, error: 'Unauthorized' }
     }

     // Action logic
   }
   ```

3. **Create UI Components**
   ```typescript
   // components/admin/new-feature.tsx
   'use client'

   import { newFeatureAction } from '@/app/admin/new-feature/actions'

   export function NewFeatureComponent() {
     // Component logic
   }
   ```

### Common Patterns to Follow

#### Server Action Pattern
```typescript
export async function adminAction(params: Params) {
  // 1. Validate session
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  // 2. Validate input
  const validation = schema.safeParse(params)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message }
  }

  // 3. Execute with try-catch
  try {
    const result = await prisma.model.update({
      // Operation
    })

    // 4. Revalidate paths
    revalidatePath('/admin/feature')

    return { success: true, data: result }
  } catch (error) {
    console.error('Admin action error:', error)
    return { success: false, error: 'Operation failed' }
  }
}
```

#### Permission Helper Pattern
```typescript
// lib/admin/permissions.ts
export async function requireAdmin() {
  const session = await auth()

  if (!session) {
    redirect('/auth/login?callbackUrl=/admin')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return session
}
```

#### Client Component Pattern
```typescript
'use client'

export function AdminComponent() {
  const [isPending, startTransition] = useTransition()

  const handleAction = () => {
    startTransition(async () => {
      const result = await serverAction()
      if (result.success) {
        toast.success('Action completed')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button
      onClick={handleAction}
      disabled={isPending}
    >
      {isPending ? 'Processing...' : 'Perform Action'}
    </Button>
  )
}
```

---

## Security & Permissions

### Access Control Layers

#### Layer 1: Edge Middleware
- Location: `auth.config.ts`
- Checks authentication status
- Validates ADMIN role for `/admin/*` routes
- Redirects unauthorized users

```typescript
if (isOnAdmin) {
  if (isLoggedIn && auth.user.role === "ADMIN") return true
  return false // Redirect to login or home
}
```

#### Layer 2: Page-Level Protection
- Helper function: `requireAdmin()`
- Called at top of each admin page
- Double-checks authentication and role
- Provides session data to page

#### Layer 3: Server Action Validation
- Each action validates session independently
- Prevents direct API calls bypassing UI
- Returns error for unauthorized attempts

```typescript
const session = await auth()
if (!session || session.user.role !== 'ADMIN') {
  return { success: false, error: 'Unauthorized' }
}
```

#### Layer 4: Database Constraints
- UUID format validation
- Foreign key constraints
- Enum value validation
- Transaction isolation

### Validation Rules

#### Listing Status Transitions

```
PENDING ──┬──> APPROVED (approveListing)
          └──> REJECTED (rejectListing)

APPROVED ─┬──> PAUSED (adminPauseListing)
          └──> SOLD (user transaction)

PAUSED ────> APPROVED (adminResumeListing)

REJECTED ──> [Terminal State]

SOLD ──────> [Terminal State - Cannot modify]

Any ───────> DELETED (except SOLD)
```

#### Input Validation

- **UUID Format**: All listing IDs validated as UUID v4
- **Rejection Reason**: 10-500 characters, required
- **Status Values**: Must match enum values exactly
- **Pagination**: page >= 1, limit <= 100

### Error Handling

#### User-Facing Errors
```typescript
return {
  success: false,
  error: 'Listing not found' // Clear, actionable message
}
```

#### System Errors
```typescript
console.error('Admin action failed:', error)
return {
  success: false,
  error: 'An error occurred. Please try again.'
}
```

#### Audit Logging (Future)
```typescript
await prisma.auditLog.create({
  data: {
    userId: session.user.id,
    action: 'APPROVE_LISTING',
    targetId: listingId,
    metadata: { previousStatus: 'PENDING' },
    timestamp: new Date()
  }
})
```

---

## Testing

### Test Coverage Requirements

- **Unit Tests**: 80% minimum coverage
- **Integration Tests**: Critical workflows
- **E2E Tests**: Full user journeys
- **Security Tests**: Permission bypass attempts
- **Accessibility Tests**: WCAG 2.1 AA compliance

### Test File Locations

```
__tests__/
├── app/
│   └── admin/
│       ├── page.test.tsx              # Dashboard tests
│       ├── listings/
│       │   ├── page.test.tsx         # Listings table tests
│       │   ├── actions.test.ts       # Server action tests
│       │   └── [id]/
│       │       └── page.test.tsx     # Detail page tests
│       └── layout.test.tsx           # Admin layout tests
│
└── components/
    └── admin/
        ├── admin-nav.test.tsx
        ├── admin-listings-table.test.tsx
        ├── reject-listing-dialog.test.tsx
        └── admin-stats-card.test.tsx
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch

# Run specific test file
pnpm test admin-listings-table

# Run admin tests only
pnpm test admin/
```

### Example Test Cases

#### Server Action Test
```typescript
describe('approveListing', () => {
  it('should approve pending listing', async () => {
    const listing = await createTestListing({ status: 'PENDING' })
    const result = await approveListing(listing.id)

    expect(result.success).toBe(true)
    const updated = await prisma.listing.findUnique({
      where: { id: listing.id }
    })
    expect(updated?.status).toBe('APPROVED')
    expect(updated?.approvedAt).toBeDefined()
  })

  it('should reject non-admin users', async () => {
    mockSession({ role: 'BUYER' })
    const result = await approveListing('test-id')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })
})
```

#### Component Test
```typescript
describe('AdminListingsTable', () => {
  it('should display listings with action buttons', () => {
    const listings = mockListings(5)
    render(
      <AdminListingsTable
        listings={listings}
        onApprove={jest.fn()}
        onReject={jest.fn()}
      />
    )

    expect(screen.getAllByRole('row')).toHaveLength(6) // 5 + header
    expect(screen.getAllByText('Approve')).toHaveLength(2) // PENDING only
  })

  it('should call onApprove when approve clicked', async () => {
    const onApprove = jest.fn()
    const listings = [mockListing({ status: 'PENDING' })]

    render(<AdminListingsTable listings={listings} onApprove={onApprove} />)

    await userEvent.click(screen.getByText('Approve'))
    expect(onApprove).toHaveBeenCalledWith(listings[0].id)
  })
})
```

#### Accessibility Test
```typescript
describe('Admin Dashboard Accessibility', () => {
  it('should be keyboard navigable', async () => {
    render(<AdminDashboard />)

    const firstButton = screen.getAllByRole('button')[0]
    firstButton.focus()

    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(screen.getAllByRole('button')[1])
  })

  it('should have proper ARIA labels', () => {
    render(<RejectListingDialog />)

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true')
  })
})
```

---

## Future Enhancements

### Phase 2: User Management
- **Route**: `/admin/users`
- **Features**:
  - View all users with role badges
  - Suspend/unsuspend accounts
  - Reset passwords
  - View user activity history
  - Role management (promote to admin)

### Phase 3: Analytics Dashboard
- **Route**: `/admin/analytics`
- **Features**:
  - Revenue tracking with charts
  - User acquisition funnel
  - Category performance metrics
  - Geographic distribution maps
  - Time-based trend analysis
  - Export reports (CSV/PDF)

### Phase 4: Audit Logging
- **Route**: `/admin/audit-log`
- **Database Model**: New `AuditLog` table
- **Features**:
  - Track all admin actions
  - Filter by user, action type, date
  - Immutable log entries
  - Compliance reporting
  - Suspicious activity alerts

### Phase 5: Bulk Operations
- **Features**:
  - Select multiple listings
  - Bulk approve/reject
  - Batch status updates
  - Export selected data
  - Bulk messaging to sellers

### Phase 6: Advanced Moderation
- **AI Integration**:
  - Automatic content flagging
  - Image recognition for prohibited items
  - Price anomaly detection
  - Duplicate listing detection

- **Moderation Queue**:
  - Priority-based review system
  - Assignment to moderators
  - Review time tracking
  - Quality scoring

### Phase 7: Communication Center
- **Route**: `/admin/communications`
- **Features**:
  - Send platform announcements
  - Message individual users
  - Email campaign management
  - Push notification control
  - Template management

### Phase 8: Settings & Configuration
- **Route**: `/admin/settings`
- **Features**:
  - Platform configuration
  - Commission rate adjustment
  - Category management
  - Feature flags
  - Maintenance mode toggle

### Technical Debt & Improvements

1. **Performance Optimizations**
   - Implement Redis caching for stats
   - Add database query optimization
   - Lazy loading for large datasets
   - Background job processing

2. **Enhanced Security**
   - Two-factor authentication for admins
   - IP allowlisting
   - Session recording
   - Rate limiting per admin

3. **Developer Experience**
   - Admin CLI tools
   - Automated testing suite
   - Documentation generator
   - Mock data generators

4. **Monitoring & Alerting**
   - Real-time error tracking
   - Performance monitoring
   - Uptime monitoring
   - Custom alert rules

---

## Appendix: Implementation Checklist

### Phase 1: Core Implementation ✓
- [ ] Create `/app/admin` directory structure
- [ ] Implement `requireAdmin()` helper
- [ ] Create admin layout with navigation
- [ ] Build dashboard overview page
- [ ] Implement `getAdminStats()` server action
- [ ] Create stats card components

### Phase 2: Listing Management ✓
- [ ] Create listings table page
- [ ] Implement filter components
- [ ] Build data table with sorting
- [ ] Add pagination controls
- [ ] Create rejection dialog
- [ ] Implement all server actions

### Phase 3: Testing & Quality ✓
- [ ] Write unit tests for server actions
- [ ] Add component tests
- [ ] Create E2E test scenarios
- [ ] Run security audit
- [ ] Verify accessibility compliance
- [ ] Performance testing

### Phase 4: Documentation & Deployment ✓
- [ ] Complete feature documentation
- [ ] Add inline code comments
- [ ] Create admin user guide
- [ ] Deploy to staging
- [ ] UAT with stakeholders
- [ ] Production deployment

---

## Contact & Support

**Feature Owner**: Platform Team
**Technical Lead**: Development Team
**Documentation Maintained By**: Engineering Team
**Last Updated**: 2025-01-23

For questions or support regarding the Admin Backoffice Dashboard, please contact the platform team or refer to the internal wiki for additional resources.
