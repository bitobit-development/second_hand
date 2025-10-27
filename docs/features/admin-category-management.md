# Admin Category Management System

## Overview
Complete admin interface for managing product categories, including creation, editing, merging, hierarchy management, and analytics.

## Status
✅ **Fully Implemented** (Pending Database Migration)

All components are built and ready to use. The interface will become fully functional once the Category table migration is applied.

---

## Features

### 1. Category Management Page
**Route**: `/admin/categories`
**File**: `/app/admin/categories/page.tsx`

**Features**:
- List view and tree view toggle
- Search and filtering (active/inactive, AI-generated/manual)
- Category statistics dashboard
- Real-time data updates
- Responsive design (mobile-friendly)

### 2. Category Analytics Dashboard
**Component**: `CategoryAnalytics`
**File**: `/components/admin/category-analytics.tsx`

**Metrics Displayed**:
- Total categories (active/inactive breakdown)
- AI-generated vs manual categories
- Average items per category
- Empty categories (candidates for cleanup)
- Category distribution chart (top 10)
- Root categories vs subcategories

### 3. Category Creation/Editing
**Component**: `CategoryFormDialog`
**File**: `/components/admin/category-form-dialog.tsx`

**Form Fields**:
- Name (required, min 2 characters)
- Slug (auto-generated, editable)
- Icon (visual picker with popular icons)
- Description (min 10 characters)
- Parent category (optional, for subcategories)
- Active status toggle

**Validation**:
- Unique slug enforcement
- Circular hierarchy prevention
- Parent category validation

### 4. Category Merging
**Component**: `CategoryMergeDialog`
**File**: `/components/admin/category-merge-dialog.tsx`

**Functionality**:
- Merge items from source to target category
- Move subcategories to new parent
- Deactivate source category
- Preview changes before confirming
- Update denormalized item counts

### 5. Category Tree Visualization
**Component**: `CategoryTree`
**File**: `/components/admin/category-tree.tsx`

**Features**:
- Hierarchical tree structure
- Expand/collapse nodes
- Nested indentation for visual clarity
- Shows parent-child relationships

### 6. Icon Picker
**Component**: `IconPicker`
**File**: `/components/admin/icon-picker.tsx`

**Features**:
- 40+ popular Lucide icons
- Search functionality
- Visual preview
- Quick selection grid

### 7. Reusable Category Selector
**Component**: `CategorySelector`
**File**: `/components/listings/category-selector.tsx`

**Features** (Future-ready):
- Search functionality
- Hierarchy navigation
- Recently used categories
- Popular categories
- AI suggestions integration (ready for Phase 4)
- Mock data included for development

---

## Server Actions

**File**: `/app/admin/categories/actions.ts`

### Available Actions

#### `getCategories(filters?: CategoryFilters)`
Fetch categories with optional filtering.

**Filters**:
- `search`: Text search (name, description, slug)
- `isActive`: Boolean filter
- `aiGenerated`: Boolean filter
- `parentId`: Filter by parent (null for root categories)

**Returns**: `{ success, data: CategoryWithStats[], error }`

#### `createCategory(data: CategoryData)`
Create new category with validation.

**Validations**:
- Unique slug
- Parent exists (if provided)
- Required fields present

**Audit Log**: `CREATE_CATEGORY`

#### `updateCategory(id: string, data: Partial<CategoryData>)`
Update category details.

**Validations**:
- Slug uniqueness
- Circular hierarchy prevention
- Parent validation

**Audit Log**: `UPDATE_CATEGORY`

#### `mergeCategories(sourceId: string, targetId: string)`
Merge two categories.

**Process**:
1. Move all listings from source to target
2. Move subcategories to target as parent
3. Deactivate source category
4. Update item counts

**Audit Log**: `MERGE_CATEGORIES`

#### `toggleCategoryStatus(id: string)`
Toggle active/inactive status.

**Audit Log**: `TOGGLE_CATEGORY_STATUS`

#### `deleteCategory(id: string)`
Delete category (only if empty).

**Validations**:
- No associated listings
- No child categories

**Audit Log**: `DELETE_CATEGORY`

#### `getCategoryAnalytics()`
Fetch comprehensive analytics data.

**Returns**:
- Total, active, inactive counts
- AI-generated vs manual
- Root vs subcategories
- Distribution data for charts

---

## Database Schema

### Category Model
```prisma
model Category {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  parentId    String?
  icon        String
  description String
  isActive    Boolean   @default(true)
  itemCount   Int       @default(0)      // Denormalized for performance
  aiGenerated Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  parent      Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: Restrict)
  children    Category[] @relation("CategoryHierarchy")
  listings    Listing[]

  // Indexes
  @@index([slug])
  @@index([parentId])
  @@index([isActive])
  @@index([aiGenerated])
  @@index([itemCount])
}
```

### AdminAction Enum (Updated)
```prisma
enum AdminAction {
  // Category actions (NEW)
  CREATE_CATEGORY
  UPDATE_CATEGORY
  MERGE_CATEGORIES
  DELETE_CATEGORY
  TOGGLE_CATEGORY_STATUS

  // Existing actions...
}
```

### AuditTargetType Enum (Updated)
```prisma
enum AuditTargetType {
  CATEGORY  // NEW

  // Existing types...
}
```

---

## Installation & Setup

### 1. Install Missing Dependencies

```bash
pnpm add @radix-ui/react-scroll-area
```

### 2. Generate Prisma Client

After updating `schema.prisma`:

```bash
npx prisma generate
```

### 3. Create Migration

**IMPORTANT**: Do NOT run this yet! Wait for coordination with database team.

```bash
# When ready (coordinate with team first):
npx prisma migrate dev --name add_category_model_and_audit_enums
```

### 4. Seed Categories (After Migration)

Create seed script or use admin UI to create initial categories.

**Recommended Base Categories**:
1. Electronics
2. Clothing & Fashion
3. Home & Garden
4. Sports & Outdoors
5. Books & Media
6. Toys & Games
7. Vehicles & Parts
8. Collectibles & Art
9. Baby & Kids
10. Pet Supplies

---

## Usage Examples

### Creating a Category (Server Action)

```typescript
import { createCategory } from '@/app/admin/categories/actions'

const result = await createCategory({
  name: 'Smartphones',
  slug: 'smartphones',
  icon: 'Smartphone',
  description: 'Mobile phones and accessories',
  parentId: electronicsId, // Optional
  isActive: true,
})

if (result.success) {
  console.log('Category created:', result.data)
} else {
  console.error('Error:', result.error)
}
```

### Using Category Selector in Forms

```typescript
import { CategorySelector } from '@/components/listings/category-selector'

const [categoryId, setCategoryId] = useState('')

<CategorySelector
  value={categoryId}
  onChange={setCategoryId}
  placeholder="Select category..."
  showAISuggestions={true}
  aiSuggestedCategories={['cat-1', 'cat-2']}
  recentCategories={['cat-3', 'cat-4']}
/>
```

### Fetching Categories with Filters

```typescript
import { getCategories } from '@/app/admin/categories/actions'

// Get all active categories
const result = await getCategories({ isActive: true })

// Search for specific categories
const result = await getCategories({ search: 'electronics' })

// Get root categories only
const result = await getCategories({ parentId: null })
```

---

## Security & Permissions

### Admin-Only Access
All category management routes and actions are protected:

1. **Middleware Layer**: Checks authentication
2. **Page Level**: `requireAdmin()` validates ADMIN role
3. **Action Level**: Each server action validates admin session

### Audit Logging
All administrative actions are logged:
- User ID
- Action type
- Target entity
- Details (JSON)
- Timestamp
- IP address (optional)
- User agent (optional)

**Query Logs**:
```typescript
import { getAuditLogs } from '@/lib/audit-log'

const logs = await getAuditLogs({
  action: 'CREATE_CATEGORY',
  startDate: new Date('2025-01-01'),
})
```

---

## Testing Strategy

### Component Tests

**Test File**: `__tests__/components/admin/category-form.test.tsx`

```typescript
describe('CategoryFormDialog', () => {
  it('should create category with valid data', async () => {
    // Test form validation
    // Test slug auto-generation
    // Test API call
    // Test success toast
  })

  it('should prevent duplicate slugs', async () => {
    // Test error handling
  })

  it('should prevent circular hierarchy', async () => {
    // Test parent validation
  })
})
```

### Server Action Tests

**Test File**: `__tests__/app/admin/categories/actions.test.ts`

```typescript
describe('Category Actions', () => {
  it('should create category with admin session', async () => {
    // Mock admin session
    // Call createCategory
    // Verify database insertion
    // Verify audit log creation
  })

  it('should reject non-admin users', async () => {
    // Mock non-admin session
    // Expect error response
  })

  it('should merge categories correctly', async () => {
    // Create source and target
    // Create listings in source
    // Merge categories
    // Verify listings moved
    // Verify source deactivated
  })
})
```

### E2E Tests (Playwright)

**Test File**: `__tests__/e2e/admin-categories.spec.ts`

```typescript
test('admin can create and manage categories', async ({ page }) => {
  // Login as admin
  await page.goto('/admin/categories')

  // Create category
  await page.click('button:has-text("Create Category")')
  await page.fill('[name="name"]', 'Test Category')
  await page.fill('[name="description"]', 'Test description')
  await page.click('button:has-text("Create")')

  // Verify category appears
  await expect(page.locator('text=Test Category')).toBeVisible()

  // Edit category
  // Delete category
  // Merge categories
})
```

---

## Performance Considerations

### 1. Denormalized Item Counts
`itemCount` field is updated via `updateCategoryItemCounts()` helper:
- Called after merges
- Called after listing reassignments
- Can be run as scheduled job for accuracy

### 2. Index Strategy
Optimized indexes for common queries:
- `slug` (unique) - Fast lookups
- `parentId` - Hierarchy queries
- `isActive` - Filter active categories
- `itemCount` - Sort by popularity

### 3. Caching Recommendations
```typescript
// Cache category list (rarely changes)
const categories = await cache(
  () => getCategories({ isActive: true }),
  ['active-categories'],
  { revalidate: 3600 } // 1 hour
)
```

### 4. Query Performance
- Use `select` to limit joined fields
- Avoid deep nesting (limit hierarchy depth to 3 levels)
- Paginate large category lists if needed

---

## Known Limitations & Future Enhancements

### Current Limitations
1. ❌ Category table not yet migrated to database
2. ❌ No bulk operations (bulk activate/deactivate)
3. ❌ No category export/import
4. ❌ No category usage analytics over time

### Planned Enhancements (Phase 4)
1. ✅ AI-powered category suggestions (infrastructure ready)
2. ✅ Replace enum-based category selection in listing creation
3. 🔄 Category analytics dashboard (partially implemented)
4. 🔄 Category performance tracking
5. 🔄 Automated category cleanup (merge similar categories)

### Phase 4 Integration
When AI category suggestions are enabled:
1. Update `CategorySelector` to call AI suggestion API
2. Remove mock data from `CategorySelector`
3. Enable `showAISuggestions` prop in listing forms
4. Track AI suggestion acceptance rate

---

## Troubleshooting

### Issue: Circular Hierarchy Error
**Symptom**: Cannot set parent category
**Cause**: Attempting to create circular reference
**Solution**: The system prevents this automatically. Choose a different parent.

### Issue: Cannot Delete Category
**Symptom**: Delete button disabled or error
**Cause**: Category has listings or subcategories
**Solution**:
1. Merge category to move items
2. Reassign or delete subcategories
3. Then delete the empty category

### Issue: Slug Conflict
**Symptom**: "Category with this slug already exists"
**Cause**: Duplicate slug
**Solution**: Edit slug to be unique (slugs are URL-identifiers)

### Issue: Mock Data in CategorySelector
**Symptom**: Only seeing test categories
**Cause**: CategorySelector still using mock data (database not migrated)
**Solution**: This is expected. Replace mock data fetch with API call after migration.

---

## Files Created

### Server Components
- `/app/admin/categories/page.tsx` - Main category management page
- `/app/admin/categories/actions.ts` - Server actions

### Client Components
- `/components/admin/category-list.tsx` - List view wrapper
- `/components/admin/category-row.tsx` - Individual category row
- `/components/admin/category-tree.tsx` - Tree visualization
- `/components/admin/category-form-dialog.tsx` - Create/edit form
- `/components/admin/category-merge-dialog.tsx` - Merge interface
- `/components/admin/category-analytics.tsx` - Analytics dashboard
- `/components/admin/category-filters.tsx` - Search and filters
- `/components/admin/create-category-button.tsx` - Create button wrapper
- `/components/admin/icon-picker.tsx` - Icon selection UI
- `/components/admin/parent-category-select.tsx` - Parent dropdown
- `/components/listings/category-selector.tsx` - Reusable selector (future)

### UI Components
- `/components/ui/scroll-area.tsx` - Scrollable area (NEW)

### Schema Updates
- `prisma/schema.prisma` - Added Category model, AdminAction enum, AuditTargetType enum

### Navigation
- `components/admin/admin-nav.tsx` - Added Categories link

---

## Related Documentation

- [Category Migration Guide](../migrations/category-migration-guide.md)
- [AI Category Suggestions](./ai-category-suggestions.md)
- [Admin Dashboard Guide](./admin-backoffice-dashboard.md)
- [Admin Audit Logging](../admin-audit-logging.md)

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [Category Migration Guide](../migrations/category-migration-guide.md)
3. Consult database team before running migrations
4. Test in development environment first

---

**Last Updated**: 2025-10-26
**Status**: ✅ Ready for Migration
**Dependencies**: Prisma, Recharts, Radix UI, Zod, React Hook Form
