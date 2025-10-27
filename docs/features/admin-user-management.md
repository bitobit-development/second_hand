# Admin User Management Feature Documentation

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

The Admin User Management system is a critical administrative interface that enables platform administrators to maintain user base integrity, security, and compliance through comprehensive user lifecycle management. This feature is essential for:

- **Security Control**: Managing user access and permissions to prevent unauthorized activities
- **Account Integrity**: Ensuring user accounts are legitimate and properly verified
- **Role Management**: Controlling administrative privileges and seller permissions
- **Compliance**: Meeting KYC/AML requirements for marketplace operations
- **User Support**: Resolving account issues and managing user relationships
- **Platform Safety**: Removing problematic users while protecting legitimate accounts

### Target Users

- **Platform Administrators**: Staff members with ADMIN role managing user accounts
- **Security Team**: Future role for fraud prevention and account verification
- **Customer Support**: Future role for assisting users with account issues
- **Compliance Officers**: Future role for regulatory compliance management

### Key Capabilities

1. **User Viewing & Search**
   - Browse all platform users with pagination
   - Search by name, email, or user ID
   - Filter by role (ADMIN, SELLER, BUYER)
   - View email verification status
   - Monitor account creation dates

2. **User Creation**
   - Create new users with role assignment
   - Set initial passwords securely
   - Send welcome emails automatically
   - Bypass email verification for admin-created accounts
   - Assign multiple roles as needed

3. **User Deletion**
   - Safely remove user accounts
   - **CRITICAL**: Prevent deletion of last ADMIN user
   - Handle cascade deletions (listings, transactions, offers)
   - Archive data for compliance before deletion
   - Audit log all deletion operations

4. **Role Management**
   - Promote users to ADMIN role
   - Demote ADMIN users (with safeguards)
   - Grant/revoke SELLER privileges
   - View role history and changes
   - Prevent self-demotion

5. **User Statistics**
   - View listings count per user
   - Monitor transaction history
   - Track user activity patterns
   - Identify dormant accounts
   - Generate user reports

---

## Architecture

### Route Structure

```
/admin/users/                  # User management dashboard
├── page.tsx                   # User list with filters and actions
├── create/                    # Create new user form
│   └── page.tsx
├── [id]/                      # Individual user detail view
│   ├── page.tsx              # User profile and history
│   └── edit/                 # Edit user details
│       └── page.tsx
├── actions.ts                # Server actions for user operations
└── stats/                    # User analytics dashboard
    └── page.tsx
```

### Security Model

The user management system implements a **defense-in-depth security approach**:

```
┌─────────────────────────────────────────────┐
│            1. Edge Middleware               │
│   (auth.config.ts - /admin/* protection)    │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│         2. Page-Level Protection            │
│      (requireAdmin() + role check)          │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│       3. Server Action Validation           │
│   (Session check + permission validation)    │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│        4. Business Rule Enforcement         │
│    (Last admin check, self-modify check)    │
└─────────────────┬───────────────────────────┘
                  ▼
┌─────────────────────────────────────────────┐
│         5. Database Constraints             │
│    (Unique emails, foreign keys, cascade)   │
└─────────────────────────────────────────────┘
```

### Data Flow

```
Admin Request → Auth Check → User Page → Server Action → Validation → Database
      ↑                                                        ↓
      └─────────── Response with Audit Log Entry ←────────────┘

1. Admin navigates to /admin/users
2. Middleware validates authentication and ADMIN role
3. Page component fetches user data via server action
4. Admin triggers action (create/delete/update role)
5. Server action validates permissions and business rules
6. Critical validation: Check for last admin on delete/demote
7. Database operation with transaction safety
8. Audit log entry created for accountability
9. Path revalidation triggers UI update
10. Success/error feedback with detailed message
```

### Component Hierarchy

```
/admin/users (layout.tsx)
├── page.tsx                        # User management dashboard
│   ├── <AdminUsersTable />        # Data table with actions
│   ├── <UserFilters />           # Filter controls
│   └── <UserSearchBar />         # Search functionality
│
├── /create/page.tsx               # User creation
│   ├── <CreateUserForm />        # Multi-field form
│   └── <RoleSelector />          # Role assignment
│
├── /[id]/page.tsx                 # User detail view
│   ├── <UserProfile />           # Basic information
│   ├── <UserStatistics />       # Activity metrics
│   ├── <UserListings />         # User's listings
│   └── <AdminUserActions />     # Action buttons
│
└── /[id]/edit/page.tsx           # Edit user
    ├── <EditUserForm />          # Editable fields
    └── <DeleteUserDialog />      # Deletion confirmation
```

---

## User Guide

### Accessing User Management

1. **Login Requirements**
   - Must have ADMIN role
   - Email must be verified
   - Session must be active

2. **Navigation**
   - Direct URL: `https://lotosale.co.za/admin/users`
   - Admin Dashboard → Users tab
   - Keyboard shortcut: `Ctrl+Shift+U` (when in admin area)

### Viewing All Users

Navigate to `/admin/users` to see the comprehensive user table:

```
┌────────────────────────────────────────────────────────────────┐
│ Filters: [Role ▼] [Status ▼] [Joined Date]  🔍 Search...       │
├────────────────────────────────────────────────────────────────┤
│ Name         | Email            | Role    | Status | Actions   │
├────────────────────────────────────────────────────────────────┤
│ John Admin   | admin@loto.co.za | ADMIN   | ✓     | [👁️][✏️][🗑️] │
│ Sarah Seller | sarah@email.com  | SELLER  | ✓     | [👁️][✏️][🗑️] │
│ Mike Buyer   | mike@gmail.com   | BUYER   | ✗     | [👁️][✏️][🗑️] │
│ Jane Doe     | jane@yahoo.com   | BUYER   | ✓     | [👁️][✏️][🗑️] │
└────────────────────────────────────────────────────────────────┘
[← Previous] [1] [2] [3] ... [42] [Next →]
```

### Creating a New User

1. Click **"+ Create User"** button
2. Fill in the user creation form:

   ```
   ┌────────────────────────────────────────┐
   │         Create New User                │
   ├────────────────────────────────────────┤
   │ Full Name*                              │
   │ ┌──────────────────────────────────┐  │
   │ │ John Smith                        │  │
   │ └──────────────────────────────────┘  │
   │                                        │
   │ Email Address*                         │
   │ ┌──────────────────────────────────┐  │
   │ │ john.smith@example.com           │  │
   │ └──────────────────────────────────┘  │
   │                                        │
   │ Password*                              │
   │ ┌──────────────────────────────────┐  │
   │ │ ••••••••••••                     │  │
   │ └──────────────────────────────────┘  │
   │ Min 8 characters, 1 uppercase, 1 number│
   │                                        │
   │ Role*                                  │
   │ ☐ BUYER (Can purchase items)          │
   │ ☑ SELLER (Can list items)             │
   │ ☐ ADMIN (Full platform access)        │
   │                                        │
   │ ☑ Send welcome email                  │
   │ ☑ Mark email as verified              │
   │                                        │
   │ [Cancel]            [Create User]      │
   └────────────────────────────────────────┘
   ```

3. System validates:
   - Email uniqueness
   - Password complexity
   - Role assignment validity
4. User created with audit log entry
5. Optional: Welcome email sent

### Deleting a User

1. Click the **Delete** button (🗑️) on the user row
2. Review deletion warning:

   ```
   ┌────────────────────────────────────────┐
   │     ⚠️ Delete User Account             │
   ├────────────────────────────────────────┤
   │ You are about to permanently delete:   │
   │                                        │
   │ User: Sarah Seller                     │
   │ Email: sarah@email.com                 │
   │ Joined: 2024-03-15                    │
   │                                        │
   │ This will also delete:                 │
   │ • 12 active listings                   │
   │ • 45 completed transactions            │
   │ • 8 pending offers                     │
   │ • All user data and history            │
   │                                        │
   │ ⚠️ This action cannot be undone!       │
   │                                        │
   │ Type "DELETE" to confirm:              │
   │ ┌──────────────────────────────────┐  │
   │ │                                  │  │
   │ └──────────────────────────────────┘  │
   │                                        │
   │ [Cancel]         [Delete Permanently]  │
   └────────────────────────────────────────┘
   ```

3. **CRITICAL VALIDATION**: System checks:
   - Not the last ADMIN user
   - Not deleting your own account
   - User exists and is deletable
4. Cascade deletion executes:
   - User record archived for compliance
   - Associated data removed/anonymized
   - Audit log entry created

### Editing User Roles

1. Click **Edit** (✏️) button or navigate to user detail
2. Select new role configuration:

   ```
   ┌────────────────────────────────────────┐
   │        Update User Role                │
   ├────────────────────────────────────────┤
   │ User: Mike Buyer                       │
   │ Current Role: BUYER                    │
   │                                        │
   │ New Role:                              │
   │ ☐ BUYER                                │
   │ ☑ SELLER (Grant selling privileges)    │
   │ ☐ ADMIN (Grant admin access)          │
   │                                        │
   │ ⚠️ Warning: ADMIN role grants full     │
   │ platform access. Use with caution.     │
   │                                        │
   │ Reason for change (optional):          │
   │ ┌──────────────────────────────────┐  │
   │ │ User requested seller access     │  │
   │ └──────────────────────────────────┘  │
   │                                        │
   │ [Cancel]           [Update Role]       │
   └────────────────────────────────────────┘
   ```

3. System validates:
   - Cannot demote last ADMIN
   - Cannot modify own role
   - Valid role transition
4. Role updated with audit entry

### Viewing User Statistics

Click on a user to see detailed statistics:

```
┌─────────────────────────────────────────────────────┐
│              User Details: Sarah Seller             │
├─────────────────────────────────────────────────────┤
│ Account Information                                 │
│ • ID: uuid-12345-67890                             │
│ • Email: sarah@email.com ✓ (verified)              │
│ • Joined: March 15, 2024                           │
│ • Last Login: 2 hours ago                          │
│ • Role: SELLER                                     │
│                                                     │
│ Activity Statistics                                 │
│ ┌─────────────┬─────────────┬──────────────┐      │
│ │  Listings   │   Sales     │   Revenue    │      │
│ │     45      │     28      │  R124,500    │      │
│ └─────────────┴─────────────┴──────────────┘      │
│                                                     │
│ ┌─────────────┬─────────────┬──────────────┐      │
│ │   Active    │   Pending   │   Rating     │      │
│ │     12      │      3      │    4.8 ⭐    │      │
│ └─────────────┴─────────────┴──────────────┘      │
│                                                     │
│ Recent Activity                                     │
│ • Listed "iPhone 13" - 2 hours ago                 │
│ • Sold "Winter Jacket" - Yesterday                 │
│ • Updated profile - 3 days ago                     │
│                                                     │
│ [Edit User] [View Listings] [Send Message] [Delete]│
└─────────────────────────────────────────────────────┘
```

---

## Technical Specification

### Server Actions API Reference

All server actions are located in `/app/admin/users/actions.ts`:

#### `getAdminUsers(params)`

Fetches paginated users with optional filters.

```typescript
interface GetAdminUsersParams {
  role?: 'ADMIN' | 'SELLER' | 'BUYER'
  emailVerified?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'name' | 'email' | 'lastLogin'
  sortOrder?: 'asc' | 'desc'
  includeStats?: boolean
}

interface UserWithStats {
  id: string
  email: string
  name: string | null
  role: UserRole
  emailVerified: Date | null
  createdAt: Date
  lastLogin: Date | null
  _count?: {
    listings: number
    buyerTransactions: number
    sellerTransactions: number
  }
}

interface GetAdminUsersResponse {
  users: UserWithStats[]
  total: number
  page: number
  totalPages: number
}

/**
 * Fetches users for admin management
 * @requires ADMIN role
 */
async function getAdminUsers(
  params: GetAdminUsersParams
): Promise<GetAdminUsersResponse>

// Usage
const { users, total } = await getAdminUsers({
  role: 'SELLER',
  emailVerified: true,
  page: 1,
  limit: 20,
  includeStats: true
})
```

#### `createUser(data)`

Creates a new user with validation and optional email sending.

```typescript
interface CreateUserData {
  email: string
  password: string
  name: string
  role: 'ADMIN' | 'SELLER' | 'BUYER'
  emailVerified?: boolean
  sendWelcomeEmail?: boolean
  phone?: string
  city?: string
  province?: string
}

interface CreateUserResponse {
  success: boolean
  error?: string
  userId?: string
}

/**
 * Creates a new user account
 * @requires ADMIN role
 * @validates Email uniqueness
 * @validates Password complexity (min 8 chars, 1 upper, 1 number)
 */
async function createUser(
  data: CreateUserData
): Promise<CreateUserResponse>

// Validation rules:
// - email: Valid email format, unique in database
// - password: Min 8 chars, 1 uppercase, 1 number, 1 special char
// - name: 2-100 characters
// - role: Valid enum value

// Usage
const result = await createUser({
  email: 'newuser@example.com',
  password: 'SecureP@ss123',
  name: 'New User',
  role: 'BUYER',
  emailVerified: true,
  sendWelcomeEmail: true
})
```

#### `deleteUser(userId)`

Permanently deletes a user account with cascade handling.

```typescript
/**
 * Deletes a user account and all associated data
 * @requires ADMIN role
 * @critical PREVENTS deletion of last ADMIN user
 * @validates Cannot delete self
 * @cascades Listings, Transactions, Offers, Tokens
 */
async function deleteUser(
  userId: string
): Promise<{
  success: boolean
  error?: string
  deletedData?: {
    listings: number
    transactions: number
    offers: number
  }
}>

// Critical validations:
// 1. Check if user is last ADMIN
const adminCount = await prisma.user.count({
  where: { role: 'ADMIN' }
})
if (adminCount === 1 && targetUser.role === 'ADMIN') {
  return {
    success: false,
    error: 'Cannot delete the last admin user'
  }
}

// 2. Prevent self-deletion
if (session.user.id === userId) {
  return {
    success: false,
    error: 'Cannot delete your own account'
  }
}

// Usage
const result = await deleteUser('user-uuid-here')
if (!result.success) {
  // Handle error - might be last admin
  toast.error(result.error)
}
```

#### `updateUserRole(userId, role)`

Updates a user's role with safeguards.

```typescript
interface UpdateUserRoleData {
  userId: string
  role: 'ADMIN' | 'SELLER' | 'BUYER'
  reason?: string
}

/**
 * Updates user role with validation
 * @requires ADMIN role
 * @critical PREVENTS demotion of last ADMIN
 * @validates Cannot modify own role
 */
async function updateUserRole(
  data: UpdateUserRoleData
): Promise<{
  success: boolean
  error?: string
  previousRole?: string
}>

// Critical validations:
// 1. Cannot demote last ADMIN
if (currentRole === 'ADMIN' && role !== 'ADMIN') {
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN' }
  })
  if (adminCount === 1) {
    return {
      success: false,
      error: 'Cannot demote the last admin user'
    }
  }
}

// 2. Cannot modify own role
if (session.user.id === userId) {
  return {
    success: false,
    error: 'Cannot modify your own role'
  }
}

// Usage with audit logging
const result = await updateUserRole({
  userId: 'user-uuid',
  role: 'SELLER',
  reason: 'User requested seller privileges'
})
```

#### `getUserStatistics()`

Fetches user management dashboard metrics.

```typescript
interface UserStatistics {
  totalUsers: number
  adminCount: number
  sellerCount: number
  buyerCount: number
  verifiedUsers: number
  unverifiedUsers: number
  todaySignups: number
  weekSignups: number
  monthSignups: number
  activeUsers: number  // Logged in last 30 days
  dormantUsers: number // No login > 90 days
  usersWithListings: number
  topSellers: Array<{
    id: string
    name: string
    salesCount: number
    revenue: number
  }>
}

/**
 * Fetches comprehensive user statistics
 * @requires ADMIN role
 * @cached 5 minutes in production
 */
async function getUserStatistics(): Promise<UserStatistics>

// Usage
const stats = await getUserStatistics()
// Display in dashboard cards
```

### Component Props and Interfaces

#### AdminUsersTable

```typescript
interface AdminUsersTableProps {
  users: UserWithStats[]
  onDelete: (userId: string) => Promise<void>
  onRoleUpdate: (userId: string, role: UserRole) => Promise<void>
  onView: (userId: string) => void
  isLoading?: boolean
  currentUserId: string // To prevent self-actions
}

// Critical prop: currentUserId prevents self-deletion/modification
```

#### CreateUserDialog

```typescript
interface CreateUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: CreateUserData) => Promise<void>
}
```

#### DeleteUserDialog

```typescript
interface DeleteUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (userId: string) => Promise<void>
  user: {
    id: string
    name: string
    email: string
    role: UserRole
    _count?: {
      listings: number
      transactions: number
    }
  }
  isLastAdmin: boolean // Critical flag
}
```

#### UserRoleBadge

```typescript
interface UserRoleBadgeProps {
  role: 'ADMIN' | 'SELLER' | 'BUYER'
  className?: string
}

// Color coding:
// ADMIN: Red/Danger - High privilege
// SELLER: Blue/Info - Business user
// BUYER: Green/Success - Standard user
```

#### UserStatsCard

```typescript
interface UserStatsCardProps {
  title: string
  value: number | string
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    period: 'day' | 'week' | 'month'
  }
  className?: string
}
```

### Database Schema Considerations

The existing schema supports user management with these key aspects:

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  name              String?
  role              UserRole  @default(BUYER)
  emailVerified     DateTime?

  // Security fields
  failedLoginAttempts Int     @default(0)
  lockoutUntil      DateTime?

  // Relations (important for cascade)
  listings          Listing[]
  buyerTransactions Transaction[] @relation("BuyerTransactions")
  sellerTransactions Transaction[] @relation("SellerTransactions")
  offers            Offer[]

  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@index([email])
  @@index([role])
}

enum UserRole {
  ADMIN
  SELLER
  BUYER
}
```

### Audit Log Schema (Future Implementation)

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  userId      String   // Who performed the action
  action      String   // CREATE_USER, DELETE_USER, UPDATE_ROLE
  targetId    String?  // Affected user ID
  metadata    Json     // Additional context
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([targetId])
  @@index([action])
  @@index([timestamp])
}
```

---

## Development Guide

### File Structure

```
app/
├── admin/
│   ├── users/
│   │   ├── page.tsx                  # User list page
│   │   ├── loading.tsx               # Loading state
│   │   ├── error.tsx                 # Error boundary
│   │   ├── create/
│   │   │   └── page.tsx             # User creation form
│   │   ├── [id]/
│   │   │   ├── page.tsx             # User detail view
│   │   │   └── edit/
│   │   │       └── page.tsx         # Edit user form
│   │   ├── actions.ts               # Server actions
│   │   └── stats/
│   │       └── page.tsx             # User analytics
│
components/
├── admin/
│   ├── users/
│   │   ├── admin-users-table.tsx    # Main data table
│   │   ├── user-filters.tsx         # Filter controls
│   │   ├── user-search-bar.tsx      # Search input
│   │   ├── create-user-dialog.tsx   # Creation modal
│   │   ├── delete-user-dialog.tsx   # Deletion confirm
│   │   ├── user-role-badge.tsx      # Role indicator
│   │   ├── user-stats-card.tsx      # Metric display
│   │   ├── user-profile-card.tsx    # User details
│   │   └── edit-role-form.tsx       # Role update form
│
lib/
├── admin/
│   ├── user-validations.ts          # Validation schemas
│   ├── user-permissions.ts          # Permission checks
│   └── audit-log.ts                 # Audit utilities
```

### Implementation Patterns

#### Critical Validation Pattern

```typescript
/**
 * CRITICAL: Always check for last admin before delete/demote
 */
async function canDeleteOrDemoteAdmin(
  userId: string,
  currentRole: UserRole,
  newRole?: UserRole
): Promise<{ allowed: boolean; reason?: string }> {
  // If not affecting an admin, allow
  if (currentRole !== 'ADMIN') {
    return { allowed: true }
  }

  // Check if this would remove the last admin
  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN' }
  })

  // For deletion
  if (!newRole && adminCount === 1) {
    return {
      allowed: false,
      reason: 'Cannot delete the last admin user'
    }
  }

  // For demotion
  if (newRole && newRole !== 'ADMIN' && adminCount === 1) {
    return {
      allowed: false,
      reason: 'Cannot demote the last admin user'
    }
  }

  return { allowed: true }
}
```

#### Self-Modification Prevention

```typescript
/**
 * Prevent users from modifying their own account
 */
function preventSelfModification(
  sessionUserId: string,
  targetUserId: string
): void {
  if (sessionUserId === targetUserId) {
    throw new Error('Cannot modify your own account')
  }
}
```

#### Cascade Deletion Pattern

```typescript
/**
 * Safely delete user with all related data
 */
async function cascadeDeleteUser(userId: string) {
  return await prisma.$transaction(async (tx) => {
    // Archive user data for compliance
    const userData = await tx.user.findUnique({
      where: { id: userId },
      include: {
        listings: true,
        buyerTransactions: true,
        sellerTransactions: true,
        offers: true
      }
    })

    // Store in archive table (future)
    // await tx.archivedUser.create({ data: userData })

    // Delete in correct order (respect foreign keys)
    await tx.offer.deleteMany({ where: { userId } })
    await tx.transaction.deleteMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] }
    })
    await tx.listing.deleteMany({ where: { userId } })
    await tx.verificationToken.deleteMany({ where: { userId } })
    await tx.passwordResetToken.deleteMany({ where: { userId } })

    // Finally delete the user
    await tx.user.delete({ where: { id: userId } })

    return {
      deletedListings: userData?.listings.length || 0,
      deletedTransactions:
        (userData?.buyerTransactions.length || 0) +
        (userData?.sellerTransactions.length || 0),
      deletedOffers: userData?.offers.length || 0
    }
  })
}
```

#### Audit Logging Pattern

```typescript
/**
 * Create audit log entry for user management actions
 */
async function createAuditLog(
  action: string,
  userId: string,
  targetId?: string,
  metadata?: any
) {
  await prisma.auditLog.create({
    data: {
      action,
      userId,
      targetId,
      metadata: metadata || {},
      timestamp: new Date()
    }
  })
}

// Usage in actions
await createAuditLog(
  'DELETE_USER',
  session.user.id,
  targetUserId,
  {
    targetEmail: user.email,
    targetRole: user.role,
    cascadeStats: deletionResult
  }
)
```

### Common UI Patterns

#### Table with Actions Pattern

```typescript
'use client'

export function AdminUsersTable({ users, currentUserId }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (userId: string) => {
    if (userId === currentUserId) {
      toast.error('Cannot delete your own account')
      return
    }

    setDeletingId(userId)
    // Show confirmation dialog
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name || 'N/A'}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <UserRoleBadge role={user.role} />
            </TableCell>
            <TableCell>
              {user.emailVerified ? (
                <Badge variant="success">Verified</Badge>
              ) : (
                <Badge variant="warning">Unverified</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(user.id)}
                  disabled={user.id === currentUserId}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(user.id)}
                  disabled={
                    user.id === currentUserId ||
                    deletingId === user.id
                  }
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## Security & Permissions

### Critical Business Rules

#### 1. Last Admin Protection

**RULE**: The platform MUST always have at least one ADMIN user.

```typescript
// ⚠️ CRITICAL VALIDATION - DO NOT REMOVE
async function validateLastAdmin(
  userId: string,
  operation: 'DELETE' | 'DEMOTE'
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (user?.role !== 'ADMIN') {
    return true // Not an admin, operation allowed
  }

  const adminCount = await prisma.user.count({
    where: { role: 'ADMIN' }
  })

  if (adminCount <= 1) {
    // This is the last admin - BLOCK operation
    throw new Error(
      `Cannot ${operation.toLowerCase()} the last admin user. ` +
      'The platform must have at least one administrator.'
    )
  }

  return true
}
```

#### 2. Self-Modification Prevention

**RULE**: Users cannot modify their own role or delete their own account.

```typescript
// Prevents accidental or malicious self-demotion
function validateNotSelf(
  sessionUserId: string,
  targetUserId: string
): void {
  if (sessionUserId === targetUserId) {
    throw new Error(
      'You cannot modify your own account. ' +
      'Please ask another administrator.'
    )
  }
}
```

#### 3. Email Uniqueness

**RULE**: Email addresses must be unique across the platform.

```typescript
async function validateUniqueEmail(email: string): Promise<void> {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })

  if (existing) {
    throw new Error('This email address is already registered')
  }
}
```

### Permission Matrix

| Action | Required Role | Additional Checks |
|--------|--------------|-------------------|
| View Users | ADMIN | - |
| Create User | ADMIN | Unique email |
| Delete User | ADMIN | Not last admin, not self |
| Update Role | ADMIN | Not last admin, not self |
| View User Details | ADMIN | - |
| Export Users | ADMIN | Rate limited |
| Bulk Operations | ADMIN | Additional confirmation |

### Password Requirements

```typescript
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// Additional checks
function validatePasswordStrength(password: string): boolean {
  // Check against common passwords list
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    throw new Error('This password is too common')
  }

  // Check for sequential characters
  if (/(?:abc|bcd|cde|123|234|345)/i.test(password)) {
    throw new Error('Password contains sequential characters')
  }

  return true
}
```

### Audit Requirements

All user management actions MUST be logged:

```typescript
interface AuditEntry {
  action:
    | 'CREATE_USER'
    | 'DELETE_USER'
    | 'UPDATE_ROLE'
    | 'UPDATE_USER'
    | 'LOGIN_ADMIN'
    | 'FAILED_ADMIN_ACTION'
  performedBy: string  // Admin user ID
  performedAt: Date
  targetUser?: string  // Affected user ID
  previousValue?: any  // State before change
  newValue?: any       // State after change
  ipAddress: string
  userAgent: string
  success: boolean
  errorMessage?: string
}
```

---

## Testing

### Test Coverage Requirements

- **Unit Tests**: 85% minimum coverage for critical paths
- **Integration Tests**: All user management workflows
- **Security Tests**: Permission bypass attempts, last admin protection
- **E2E Tests**: Complete user lifecycle scenarios
- **Load Tests**: Bulk operations performance

### Test File Structure

```
__tests__/
├── app/
│   └── admin/
│       └── users/
│           ├── page.test.tsx              # User list page tests
│           ├── actions.test.ts            # Server action tests
│           ├── create/
│           │   └── page.test.tsx         # Creation form tests
│           └── [id]/
│               ├── page.test.tsx         # Detail view tests
│               └── edit/
│                   └── page.test.tsx     # Edit form tests
│
└── components/
    └── admin/
        └── users/
            ├── admin-users-table.test.tsx
            ├── create-user-dialog.test.tsx
            ├── delete-user-dialog.test.tsx
            └── user-role-badge.test.tsx
```

### Critical Test Scenarios

#### Last Admin Protection Tests

```typescript
describe('Last Admin Protection', () => {
  it('should prevent deletion of last admin', async () => {
    // Setup: Create single admin
    const admin = await createTestUser({ role: 'ADMIN' })
    mockSession({ id: 'other-admin', role: 'ADMIN' })

    // Attempt to delete
    const result = await deleteUser(admin.id)

    // Verify protection
    expect(result.success).toBe(false)
    expect(result.error).toContain('last admin')

    // Verify admin still exists
    const stillExists = await prisma.user.findUnique({
      where: { id: admin.id }
    })
    expect(stillExists).toBeDefined()
  })

  it('should prevent demotion of last admin', async () => {
    const admin = await createTestUser({ role: 'ADMIN' })
    mockSession({ id: 'other-admin', role: 'ADMIN' })

    const result = await updateUserRole({
      userId: admin.id,
      role: 'BUYER'
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('last admin')

    const user = await prisma.user.findUnique({
      where: { id: admin.id }
    })
    expect(user?.role).toBe('ADMIN') // Unchanged
  })

  it('should allow deletion when multiple admins exist', async () => {
    const admin1 = await createTestUser({ role: 'ADMIN' })
    const admin2 = await createTestUser({ role: 'ADMIN' })
    mockSession({ id: admin1.id, role: 'ADMIN' })

    const result = await deleteUser(admin2.id)

    expect(result.success).toBe(true)
  })
})
```

#### Self-Modification Prevention Tests

```typescript
describe('Self-Modification Prevention', () => {
  it('should prevent user from deleting own account', async () => {
    const admin = await createTestUser({ role: 'ADMIN' })
    mockSession({ id: admin.id, role: 'ADMIN' })

    const result = await deleteUser(admin.id)

    expect(result.success).toBe(false)
    expect(result.error).toContain('own account')
  })

  it('should prevent user from changing own role', async () => {
    const admin = await createTestUser({ role: 'ADMIN' })
    mockSession({ id: admin.id, role: 'ADMIN' })

    const result = await updateUserRole({
      userId: admin.id,
      role: 'BUYER'
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('own role')
  })
})
```

#### Cascade Deletion Tests

```typescript
describe('Cascade Deletion', () => {
  it('should delete all user data when deleting account', async () => {
    const user = await createTestUser({ role: 'SELLER' })
    const listing = await createTestListing({ userId: user.id })
    const offer = await createTestOffer({ userId: user.id })

    mockSession({ id: 'admin-id', role: 'ADMIN' })
    const result = await deleteUser(user.id)

    expect(result.success).toBe(true)
    expect(result.deletedData).toEqual({
      listings: 1,
      transactions: 0,
      offers: 1
    })

    // Verify cascade
    const deletedListing = await prisma.listing.findUnique({
      where: { id: listing.id }
    })
    expect(deletedListing).toBeNull()
  })
})
```

#### UI Component Tests

```typescript
describe('AdminUsersTable', () => {
  it('should disable actions for current user', () => {
    const currentUser = mockUser({ id: 'current', role: 'ADMIN' })
    const otherUser = mockUser({ id: 'other', role: 'BUYER' })

    render(
      <AdminUsersTable
        users={[currentUser, otherUser]}
        currentUserId="current"
        onDelete={jest.fn()}
      />
    )

    const currentUserRow = screen.getByTestId('user-row-current')
    const deleteBtn = within(currentUserRow).getByRole('button', {
      name: /delete/i
    })

    expect(deleteBtn).toBeDisabled()
  })

  it('should show confirmation before delete', async () => {
    const onDelete = jest.fn()
    const user = mockUser({ role: 'BUYER' })

    render(
      <AdminUsersTable
        users={[user]}
        currentUserId="different"
        onDelete={onDelete}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(screen.getByText(/permanently delete/i)).toBeInTheDocument()
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument()
  })
})
```

### Running Tests

```bash
# Run all user management tests
pnpm test admin/users

# Run with coverage
pnpm test:coverage admin/users

# Run specific test suite
pnpm test "Last Admin Protection"

# Run in watch mode during development
pnpm test:watch admin/users

# Run security-specific tests
pnpm test --grep "permission|security|auth"
```

---

## Future Enhancements

### Phase 1: Enhanced User Profiles

- **Route**: `/admin/users/[id]/profile`
- **Features**:
  - Extended profile information
  - Avatar management
  - Address verification
  - KYC document uploads
  - Social media linking
  - Communication preferences

### Phase 2: Bulk User Operations

- **Features**:
  - Multi-select in table
  - Bulk role changes
  - Bulk email sending
  - Bulk account suspension
  - CSV import for user creation
  - Batch password resets

### Phase 3: Advanced Search & Filtering

- **Features**:
  - Full-text search across all fields
  - Advanced filter combinations
  - Date range filters (joined, last login)
  - Location-based filtering
  - Activity-based filtering
  - Saved filter presets

### Phase 4: User Activity Tracking

- **Route**: `/admin/users/[id]/activity`
- **Features**:
  - Login history with IP/location
  - Action timeline
  - Device management
  - Session management
  - Suspicious activity alerts
  - Failed login attempts log

### Phase 5: Role-Based Access Control (RBAC)

- **Database Changes**: New `Role` and `Permission` models
- **Features**:
  - Custom role creation
  - Granular permissions
  - Role inheritance
  - Permission matrix UI
  - Temporary role assignments
  - Role audit trail

```prisma
model Role {
  id          String       @id @default(uuid())
  name        String       @unique
  description String?
  permissions Permission[]
  users       User[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Permission {
  id          String   @id @default(uuid())
  name        String   @unique
  resource    String   // users, listings, transactions
  action      String   // create, read, update, delete
  roles       Role[]
}
```

### Phase 6: User Communication Hub

- **Route**: `/admin/users/communications`
- **Features**:
  - Direct messaging to users
  - Email campaign builder
  - SMS notifications (Twilio)
  - Push notification management
  - Message templates
  - Delivery tracking

### Phase 7: Compliance & Reporting

- **Route**: `/admin/users/compliance`
- **Features**:
  - GDPR data export
  - Right to be forgotten
  - Data retention policies
  - Compliance audit reports
  - Automated compliance checks
  - Legal hold management

### Phase 8: AI-Powered User Insights

- **Features**:
  - User behavior prediction
  - Churn risk scoring
  - Fraud detection
  - Automated user segmentation
  - Personalization recommendations
  - Anomaly detection

### Technical Improvements

1. **Performance Optimizations**
   - Implement cursor-based pagination
   - Add Redis caching for user queries
   - Optimize database indices
   - Implement virtual scrolling for large lists

2. **Enhanced Security**
   - Implement rate limiting per admin
   - Add IP allowlisting for admin access
   - Implement 2FA requirement for user management
   - Add break-glass emergency access

3. **Developer Experience**
   - Create admin CLI for user management
   - Add GraphQL API for flexible queries
   - Implement webhook system for user events
   - Create user management SDK

4. **Monitoring & Analytics**
   - Real-time admin action monitoring
   - User management metrics dashboard
   - Alert system for suspicious activities
   - Performance metrics tracking

---

## Appendix: Implementation Checklist

### Phase 1: Core User Management ⬜

- [ ] Create `/app/admin/users` directory structure
- [ ] Implement `getAdminUsers()` with pagination
- [ ] Create users table component
- [ ] Add search functionality
- [ ] Implement role filtering
- [ ] Add user statistics display

### Phase 2: User Creation ⬜

- [ ] Create user creation form
- [ ] Implement `createUser()` server action
- [ ] Add email uniqueness validation
- [ ] Implement password complexity rules
- [ ] Add welcome email sending
- [ ] Create success/error handling

### Phase 3: User Deletion ⬜

- [ ] Implement `deleteUser()` server action
- [ ] **CRITICAL**: Add last admin protection
- [ ] Add self-deletion prevention
- [ ] Implement cascade deletion
- [ ] Create confirmation dialog
- [ ] Add deletion audit logging

### Phase 4: Role Management ⬜

- [ ] Implement `updateUserRole()` action
- [ ] **CRITICAL**: Add last admin demotion check
- [ ] Add self-modification prevention
- [ ] Create role update UI
- [ ] Add role change confirmation
- [ ] Implement role audit logging

### Phase 5: Testing & Security ⬜

- [ ] Write last admin protection tests
- [ ] Add self-modification tests
- [ ] Create cascade deletion tests
- [ ] Implement security tests
- [ ] Add UI component tests
- [ ] Verify 85% code coverage

### Phase 6: Documentation & Deployment ⬜

- [ ] Complete inline documentation
- [ ] Add JSDoc comments
- [ ] Create user guide
- [ ] Update admin training materials
- [ ] Deploy to staging
- [ ] Production deployment

---

## Acceptance Criteria

### User Viewing
- ✅ Admins can view all users in paginated table
- ✅ Search works for name and email
- ✅ Role filtering shows correct users
- ✅ Email verification status is visible
- ✅ User statistics display correctly

### User Creation
- ✅ Form validates all required fields
- ✅ Email uniqueness is enforced
- ✅ Password meets complexity requirements
- ✅ Users receive welcome emails when configured
- ✅ Created users can log in immediately

### User Deletion
- ✅ **CRITICAL**: Cannot delete last ADMIN user
- ✅ Cannot delete own account
- ✅ Confirmation dialog shows impact
- ✅ All user data is properly cascaded
- ✅ Audit log entry is created

### Role Management
- ✅ **CRITICAL**: Cannot demote last ADMIN user
- ✅ Cannot modify own role
- ✅ Role changes take effect immediately
- ✅ Audit trail tracks all changes
- ✅ UI prevents invalid operations

### Security
- ✅ All actions require ADMIN role
- ✅ Session validation on every action
- ✅ Audit logging for all operations
- ✅ Rate limiting prevents abuse
- ✅ Input validation prevents injection

---

## Contact & Support

**Feature Owner**: Platform Security Team
**Technical Lead**: Admin Systems Team
**Documentation Maintained By**: Engineering Team
**Last Updated**: 2025-01-24

For questions or support regarding the Admin User Management system, please contact the platform team or refer to the internal wiki for additional resources.