# Category Management - Admin Guide

## Overview

The LOTOSALE category management system provides admins with powerful tools to organize, maintain, and optimize the marketplace category structure. This guide covers all aspects of category administration, from creation to analytics.

## Table of Contents

1. [Accessing Category Management](#accessing-category-management)
2. [Understanding Category Structure](#understanding-category-structure)
3. [Creating Categories](#creating-categories)
4. [Editing Categories](#editing-categories)
5. [Merging Categories](#merging-categories)
6. [Managing AI-Generated Categories](#managing-ai-generated-categories)
7. [Category Analytics](#category-analytics)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Accessing Category Management

### Navigation

1. Log in with admin credentials
2. Navigate to **Admin Dashboard** (`/admin`)
3. Click **"Categories"** in the sidebar
4. You'll land on `/admin/categories`

### Required Permissions

- **Role**: ADMIN
- **Authentication**: Two-layer security
  - Middleware checks authentication
  - Page-level `requireAdmin()` validation
- All actions are audit-logged

### Interface Overview

```
┌────────────────────────────────────────────────────────┐
│  Categories                                     [+ New] │
├────────────────────────────────────────────────────────┤
│  Filters: [All] [Active] [Inactive] [AI-Generated]    │
│  View:    [List] [Tree]                               │
├────────────────────────────────────────────────────────┤
│  Search: [_________________________]                   │
├────────────────────────────────────────────────────────┤
│  📊 Analytics | 📋 List | 🌳 Tree                      │
└────────────────────────────────────────────────────────┘
```

## Understanding Category Structure

### Hierarchical Model

Categories use a **parent-child hierarchy**:

```
Electronics (Parent)
├── Smartphones (Child)
│   ├── Android Phones (Grandchild)
│   └── iPhones (Grandchild)
├── Laptops (Child)
└── Gaming Consoles (Child)

Home & Garden (Parent)
├── Kitchen Appliances (Child)
├── Furniture (Child)
└── Garden Tools (Child)
```

### Database Schema

```typescript
Category {
  id: string          // UUID
  name: string        // Display name
  slug: string        // URL-safe identifier (unique)
  parentId: string?   // Parent category ID (null for root)
  icon: string        // Lucide icon name
  description: string // Category description
  isActive: boolean   // Enabled/disabled status
  itemCount: number   // Number of listings
  aiGenerated: boolean // Created by AI?
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Hierarchy Rules

1. **Maximum Depth**: 3 levels (Parent → Child → Grandchild)
2. **Self-Reference**: Categories can have children via `parentId`
3. **Cascade Protection**: Cannot delete parent with active children
4. **Orphan Prevention**: Deleting parent requires reassignment or cascade

## Creating Categories

### Manual Creation

#### Step 1: Open Creation Dialog

1. Click **"+ New Category"** button
2. Category creation dialog appears

#### Step 2: Fill Required Fields

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Name** | Text | Yes | Display name (e.g., "Kitchen Appliances") |
| **Slug** | Text | Auto-generated | URL-safe identifier (e.g., "kitchen-appliances") |
| **Parent Category** | Dropdown | No | Leave empty for root category |
| **Icon** | Icon Picker | Yes | Lucide icon name (e.g., "UtensilsCrossed") |
| **Description** | Textarea | Yes | Brief description for users |
| **Active Status** | Toggle | Yes | Enable immediately? (default: Yes) |

**Example:**
```
Name: Kitchen Appliances
Slug: kitchen-appliances (auto-generated)
Parent: Home & Garden
Icon: UtensilsCrossed
Description: Small and large kitchen appliances including
             coffee makers, blenders, and refrigerators
Active: ✅ Yes
```

#### Step 3: Validate & Submit

- **Validation Checks:**
  - ✅ Name is unique within parent scope
  - ✅ Slug doesn't conflict with existing
  - ✅ Icon name exists in Lucide library
  - ✅ Description is 10-500 characters
  - ✅ Parent exists (if specified)

- **Click "Create Category"**
- Success toast appears
- New category added to list
- Audit log created: `CREATE_CATEGORY`

### Slug Generation Rules

**Automatic Slug Creation:**

```typescript
Input Name          → Generated Slug
"Kitchen Appliances" → "kitchen-appliances"
"Men's Clothing"     → "mens-clothing"
"Books & Media"      → "books-media"
"TV & Audio (4K)"    → "tv-audio-4k"
```

**Rules:**
- Lowercase conversion
- Spaces → hyphens
- Special chars removed (except hyphens)
- Apostrophes removed
- Multiple hyphens collapsed
- Leading/trailing hyphens trimmed

**Manual Override:**
- Click "Edit Slug" to customize
- Must remain unique
- Keep URL-friendly (a-z, 0-9, hyphens)

### Icon Selection

**Available Icons:**
- All icons from [Lucide React](https://lucide.dev/icons)
- Type icon name exactly (e.g., "Smartphone", "Home", "Shirt")
- Case-sensitive
- Preview shown in real-time

**Popular Category Icons:**

```
Electronics     → Smartphone, Laptop, Gamepad2
Clothing        → Shirt, ShoppingBag, Watch
Home & Garden   → Home, Sofa, Flower2
Sports          → Activity, Bike, Dumbbell
Books           → BookOpen, Library
Toys            → Baby, Puzzle
Vehicles        → Car, Bike, Wrench
Collectibles    → Gem, Award, Frame
Baby & Kids     → Baby, Stroller
Pet Supplies    → Dog, Cat, PawPrint
```

**Icon Picker Pro Tips:**
- Use thematic icons (don't overthink)
- Consistency matters (use same style across similar categories)
- Avoid overly generic icons (like "Circle" or "Square")

## Editing Categories

### Edit Single Category

1. **Locate category** in list or tree view
2. **Click edit icon** (pencil) on category row
3. **Modify fields** in edit dialog
4. **Save changes**
   - Validation runs again
   - Listings automatically updated
   - Audit log: `UPDATE_CATEGORY`

### Editable Fields

| Field | Can Edit? | Notes |
|-------|-----------|-------|
| Name | ✅ Yes | Updates all listings using this category |
| Slug | ✅ Yes | Be careful! Changes URLs |
| Parent | ⚠️ Limited | Cannot create circular references |
| Icon | ✅ Yes | Cosmetic change only |
| Description | ✅ Yes | Shown to users in selector |
| Active Status | ✅ Yes | Hides/shows in user interface |
| AI Generated | ❌ No | Read-only flag |
| Item Count | ❌ No | Auto-calculated |

### Bulk Editing

Currently **not supported**. Feature roadmap:

- [ ] Bulk status toggle (activate/deactivate)
- [ ] Bulk parent reassignment
- [ ] Bulk icon updates
- [ ] CSV import/export

## Merging Categories

### When to Merge

**Merge categories when you have:**

1. **Duplicate Categories**
   ```
   Example:
   - "Cell Phones" (15 items)
   - "Mobile Phones" (23 items)
   - "Smartphones" (67 items)

   Action: Merge all into "Smartphones"
   ```

2. **Overly Granular Categories**
   ```
   Example:
   - "Coffee Makers" (3 items)
   - "Blenders" (2 items)
   - "Toasters" (1 item)

   Action: Merge into "Kitchen Appliances"
   ```

3. **Inconsistent Naming**
   ```
   Example:
   - "TV & Audio"
   - "Television and Sound"

   Action: Merge into standardized "TV & Audio"
   ```

4. **AI-Generated Clutter**
   ```
   Example: Multiple AI-suggested categories with low item counts
   Action: Consolidate into appropriate parent categories
   ```

### Merge Process

#### Step 1: Select Categories

1. Navigate to category list
2. Check boxes next to categories to merge
3. Click **"Merge Selected"** button
4. Merge dialog appears

#### Step 2: Choose Target Category

**Merge Dialog Options:**

```
┌────────────────────────────────────────┐
│  Merge Categories                      │
├────────────────────────────────────────┤
│  Selected Categories (3):              │
│  • Cell Phones (15 items)              │
│  • Mobile Phones (23 items)            │
│  • Smartphones (67 items)              │
│                                        │
│  Merge into:                           │
│  ◉ Smartphones (keep existing)         │
│  ○ Create new category                 │
│                                        │
│  Actions:                              │
│  ☑️ Reassign all listings              │
│  ☑️ Delete source categories           │
│  ☑️ Create redirects (recommended)     │
│                                        │
│  [Cancel]  [Merge Categories]          │
└────────────────────────────────────────┘
```

**Options Explained:**

- **Keep Existing**: Use one of selected categories as target
- **Create New**: Define new category to merge into
- **Reassign Listings**: Move all listings to target category
- **Delete Sources**: Remove merged categories from database
- **Create Redirects**: Set up slug redirects (preserves URLs)

#### Step 3: Confirm & Execute

1. **Review impact summary**:
   ```
   Impact Summary:
   - 105 listings will be reassigned
   - 2 categories will be deleted
   - 2 URL redirects will be created
   - 8 users will be notified (if they have listings)
   ```

2. **Type confirmation**: `MERGE` (case-sensitive)

3. **Click "Confirm Merge"**

4. **Progress indicator** shows:
   - Reassigning listings...
   - Creating redirects...
   - Deleting source categories...
   - Updating item counts...
   - Creating audit logs...

5. **Success notification**:
   ```
   ✅ Successfully merged 3 categories into "Smartphones"
   - 105 listings reassigned
   - 2 categories removed
   - 2 redirects created
   ```

#### Step 4: Post-Merge Verification

**Checklist:**
- [ ] Verify listing counts are correct
- [ ] Test category selector shows merged category
- [ ] Check redirects work (visit old category URLs)
- [ ] Review audit logs for errors
- [ ] Notify affected sellers (optional)

### Merge Best Practices

**DO:**
- ✅ Merge during low-traffic hours
- ✅ Notify users with listings beforehand (if major merge)
- ✅ Create redirects to preserve SEO
- ✅ Keep the most popular category as target
- ✅ Update category descriptions after merge
- ✅ Review analytics post-merge

**DON'T:**
- ❌ Merge categories from different parent hierarchies
- ❌ Merge without reviewing all affected listings
- ❌ Delete source categories without redirects
- ❌ Merge categories with conflicting icons
- ❌ Rush the process (validate first!)

### Undoing a Merge

**There is NO automatic undo!**

Manual reversal process:
1. Create the deleted categories again
2. Manually reassign listings (if you tracked them)
3. Remove redirects
4. Contact support for database-level recovery (within 30 days)

**Prevention is key**: Always test on staging environment first.

## Managing AI-Generated Categories

### Understanding AI Categories

**What are they?**
- Categories created by the AI suggestion system
- Based on image analysis patterns
- Marked with `aiGenerated: true` flag
- Appear with ✨ sparkles icon in UI

**How they're created:**
1. User uploads listing images
2. AI analyzes images
3. AI suggests category (e.g., "Kitchen Appliances")
4. If confidence > 85% and category doesn't exist → create it
5. Admin reviews in bulk monthly

### Reviewing AI Categories

#### Daily Review Process

1. **Navigate to AI-Generated Filter**:
   - Click **"AI-Generated"** filter button
   - Sorted by creation date (newest first)

2. **Evaluate Each Category**:
   ```
   Category: "Wireless Earbuds"
   Parent: Electronics
   Items: 3
   Created: 2 days ago

   Decision:
   ✅ Keep (good granularity, growing)
   ❌ Merge into "Audio Accessories"
   ⏸️ Monitor (wait for more items)
   ```

3. **Decision Criteria**:

   | Keep If | Merge If | Delete If |
   |---------|----------|-----------|
   | 5+ items within 7 days | Similar to existing category | 0 items after 14 days |
   | Clear use case | Too specific (<3 potential items) | Duplicate of existing |
   | Fills a gap | Overlaps with parent | Inappropriate/spam |
   | Users searching for it | Low search volume | AI hallucination |

#### Monthly Cleanup Process

**Run this analysis monthly:**

```sql
-- AI-generated categories with low adoption
SELECT name, itemCount, createdAt
FROM Category
WHERE aiGenerated = true
  AND itemCount < 5
  AND createdAt < NOW() - INTERVAL '30 days'
ORDER BY itemCount ASC
```

**Cleanup Actions:**

1. **Consolidate Low-Count Categories**:
   - Merge categories with <5 items into parent
   - Keep those with steady growth trajectory

2. **Approve High-Performers**:
   - Mark `aiGenerated = false` for established categories
   - Indicates human-validated category

3. **Delete Zero-Item Categories**:
   - Remove categories with 0 items after 30 days
   - Create redirects if they had items previously

### AI Category Quality Control

#### Validating AI Suggestions

**Check these attributes:**

1. **Name Quality**:
   - ✅ Generic and broad (not brand-specific)
   - ✅ Proper capitalization
   - ✅ Clear and searchable
   - ❌ Too specific ("iPhone 13 Pro Max Cases")
   - ❌ Misspellings or typos

2. **Hierarchy Placement**:
   - ✅ Logical parent category
   - ✅ Appropriate depth level
   - ❌ Wrong parent category
   - ❌ Should be root category

3. **Icon Selection**:
   - ✅ Relevant icon from Lucide
   - ❌ Generic icon (Circle, Square)
   - ❌ Icon doesn't exist (AI hallucination)

4. **Description Quality**:
   - ✅ Helpful and accurate
   - ✅ SEO-friendly
   - ❌ Generic AI boilerplate
   - ❌ Misleading or incomplete

#### Correcting AI Errors

**Common AI Mistakes:**

| Issue | Example | Fix |
|-------|---------|-----|
| Too Specific | "Sony PlayStation 5 Consoles" | Rename to "Gaming Consoles" |
| Wrong Parent | "Dog Beds" under "Furniture" | Move to "Pet Supplies" |
| Duplicate | "Mobile Phones" exists as "Smartphones" | Merge categories |
| Brand Name | "Nike Shoes" | Generalize to "Athletic Footwear" |
| Hallucinated Icon | Icon: "PlaystationController" | Change to valid icon: "Gamepad2" |

**Correction Process:**
1. Edit the AI-generated category
2. Fix the identified issues
3. Uncheck `aiGenerated` flag (marks as human-reviewed)
4. Save changes
5. Audit log: `UPDATE_CATEGORY` with correction details

### Turning Off AI Generation

**To disable AI category creation entirely:**

```typescript
// In environment variables
AI_CATEGORY_CREATION_ENABLED=false

// Or in admin settings
Settings → AI Features → Auto-Create Categories: OFF
```

**Effects:**
- AI still suggests categories from existing database
- No new categories created automatically
- Manual creation still available
- Existing AI categories unaffected

## Category Analytics

### Overview Dashboard

**Navigate to**: `/admin/categories/analytics`

**Key Metrics Displayed:**

```
┌─────────────────────────────────────────────────────────┐
│  Category Performance                                   │
├─────────────────────────────────────────────────────────┤
│  📊 Total Categories: 156                               │
│  ✅ Active: 142 (91%)                                   │
│  ⏸️  Inactive: 14 (9%)                                  │
│  ✨ AI-Generated: 28 (18%)                              │
├─────────────────────────────────────────────────────────┤
│  📈 Listings Distribution                               │
│  [=======================================] Electronics  │
│  [========================] Clothing                     │
│  [==================] Home & Garden                     │
│  [============] Sports                                  │
└─────────────────────────────────────────────────────────┘
```

### Analytics Reports

#### 1. Category Distribution Chart

**What it shows:**
- Item count per category
- Visual bar/pie chart
- Percentage of total listings

**Use cases:**
- Identify underutilized categories (merge candidates)
- Spot trending categories (expand hierarchy)
- Balance marketplace offerings

**Chart Types:**
- **Bar Chart**: Compare all categories side-by-side
- **Pie Chart**: See proportional distribution
- **Tree Map**: Visualize hierarchy with item counts

#### 2. AI Performance Metrics

**Tracked Metrics:**

| Metric | Description | Ideal Range |
|--------|-------------|-------------|
| **Acceptance Rate** | % of AI suggestions accepted by users | 70-85% |
| **Avg Confidence** | Mean confidence score of suggestions | 75-90% |
| **Creation Rate** | AI categories created per week | 2-5 |
| **Survival Rate** | % of AI categories kept after 30 days | 60-75% |

**Performance Indicators:**

```
✅ Healthy: Acceptance rate 75%+, confidence 80%+
⚠️  Warning: Acceptance rate 50-75%, confidence 60-80%
❌ Critical: Acceptance rate <50%, confidence <60%
```

**Action on Low Performance:**
- Review AI prompt versions (v1, v2, v3)
- A/B test different configurations
- Retrain with better examples
- Adjust confidence thresholds

#### 3. Category Health Score

**Calculated per category:**

```typescript
healthScore = (
  itemCount * 0.4 +
  activityScore * 0.3 +
  searchVolume * 0.2 +
  conversionRate * 0.1
) / 4
```

**Health Tiers:**

| Score | Status | Action |
|-------|--------|--------|
| 90-100 | Excellent | Maintain, consider subcategories |
| 70-89 | Good | Monitor trends |
| 50-69 | Fair | Optimize listings, marketing |
| 30-49 | Poor | Consider merging or removing |
| 0-29 | Critical | Merge or delete |

#### 4. Hierarchy Depth Analysis

**Optimal Depth Metrics:**

```
Root Categories:        10-20 (too few = cluttered, too many = overwhelming)
Total Depth Levels:     2-3 (max)
Avg Children per Parent: 3-7 (sweet spot)
```

**Visualization:**

```
Electronics (depth 0)
├── Smartphones (depth 1)
│   ├── Android (depth 2) ✅
│   └── iOS (depth 2) ✅
├── Laptops (depth 1)
│   ├── Gaming (depth 2) ✅
│   │   └── High-End Gaming (depth 3) ⚠️ Too deep!
│   └── Business (depth 2) ✅
```

### Exporting Analytics

**Export Options:**

1. **CSV Export**:
   - Click "Export CSV" button
   - Includes: category name, item count, creation date, status
   - Use for: Excel analysis, reporting

2. **PDF Report**:
   - Click "Generate PDF Report"
   - Includes: charts, tables, insights
   - Use for: Stakeholder presentations

3. **JSON API**:
   ```typescript
   GET /api/admin/categories/analytics

   Response:
   {
     "totalCategories": 156,
     "activeCategories": 142,
     "aiGeneratedCategories": 28,
     "distribution": [...],
     "performance": {...}
   }
   ```

## Best Practices

### Category Naming Conventions

**Follow these rules:**

1. **Use Proper Capitalization**:
   - ✅ "Kitchen Appliances"
   - ❌ "kitchen appliances"
   - ❌ "KITCHEN APPLIANCES"

2. **Be Descriptive but Concise**:
   - ✅ "Athletic Footwear"
   - ❌ "Shoes"
   - ❌ "Athletic Sports Training Running Walking Footwear"

3. **Avoid Brand Names**:
   - ✅ "Smartphones"
   - ❌ "iPhones"
   - ❌ "Samsung Galaxy Phones"

4. **Use Plural Forms** (when applicable):
   - ✅ "Books", "Toys", "Vehicles"
   - ❌ "Book", "Toy", "Vehicle"

5. **Be Consistent Across Hierarchy**:
   ```
   ✅ Good:
   Electronics
   ├── Smartphones
   ├── Laptops
   └── Tablets

   ❌ Bad:
   Electronics
   ├── Phone Devices
   ├── Laptop Computers
   └── Tablet
   ```

### Hierarchy Design Principles

**1. Balance Breadth and Depth**

```
Too Shallow (Bad):                Too Deep (Bad):
Electronics (500 items)           Electronics
└── (no subcategories)            └── Smartphones
                                      └── Android
                                          └── Samsung
                                              └── Galaxy Series
                                                  └── S Series
                                                      └── S22 Models

Balanced (Good):
Electronics
├── Smartphones (120)
├── Laptops (85)
├── Tablets (40)
└── Gaming Consoles (30)
```

**2. Aim for 5-10 Root Categories**

- Easier navigation
- Clearer user experience
- Better for mobile displays

**3. Keep Siblings Similar in Size**

```
❌ Unbalanced:
Home & Garden
├── Kitchen Appliances (200 items)
├── Furniture (180 items)
├── Decor (150 items)
└── Light Bulbs (3 items)  ← Merge into "Lighting" or "Decor"

✅ Balanced:
Home & Garden
├── Kitchen Appliances (200 items)
├── Furniture (180 items)
├── Decor & Lighting (155 items)
└── Garden Tools (85 items)
```

### Maintenance Schedule

**Daily (5 min):**
- Review new AI-generated categories
- Quick approval/rejection decisions
- Monitor active listings distribution

**Weekly (30 min):**
- Analyze category performance metrics
- Merge duplicate/low-count categories
- Update descriptions as needed

**Monthly (2 hours):**
- Deep-dive analytics review
- Major hierarchy restructuring (if needed)
- A/B test AI prompt variations
- Export reports for stakeholders

**Quarterly (4 hours):**
- User feedback analysis
- Competitive marketplace research
- Strategic category expansion
- Clean up inactive categories

### SEO & Discoverability

**Optimize for Search:**

1. **Category Names = Keywords**:
   - Use terms buyers search for
   - Research Google Trends
   - Check competitor marketplaces

2. **Write SEO-Friendly Descriptions**:
   ```
   ❌ Generic:
   "This category contains various electronic items."

   ✅ SEO-Optimized:
   "Browse second-hand smartphones including iPhones, Samsung
   Galaxy, and Android devices. Find used mobile phones in
   excellent condition at affordable prices in South Africa."
   ```

3. **Use Canonical Slugs**:
   - Keep slugs consistent (don't change frequently)
   - Use redirects when merging
   - Hyphen-separated, lowercase

4. **Cross-Link Related Categories**:
   - Add "Related Categories" section (future feature)
   - Help users discover adjacent products

## Troubleshooting

### Common Issues

#### 1. "Cannot delete category with children"

**Error Message:**
```
Error: Cannot delete category "Electronics" because it has
active child categories. Delete or reassign children first.
```

**Solution:**
1. View category children in tree view
2. Either:
   - **Option A**: Delete all child categories first
   - **Option B**: Reassign children to different parent
   - **Option C**: Use merge feature instead
3. Then delete parent category

#### 2. "Slug already exists"

**Error Message:**
```
Error: Category slug "kitchen-appliances" already exists.
```

**Solution:**
1. Check if category already exists (search by slug)
2. If duplicate, merge instead of creating new
3. If different category, use modified slug:
   - "kitchen-appliances-small"
   - "kitchen-appliances-commercial"

#### 3. "Icon not found"

**Error Message:**
```
Error: Icon "PlaystationController" not found in Lucide library.
```

**Solution:**
1. Visit [Lucide Icons](https://lucide.dev/icons)
2. Search for similar icon (e.g., "Gamepad2")
3. Use exact icon name (case-sensitive)
4. Common alternatives:
   - "PlaystationController" → "Gamepad2"
   - "Iphone" → "Smartphone"
   - "Shopping" → "ShoppingCart" or "ShoppingBag"

#### 4. Listings not updating after category change

**Symptoms:**
- Changed category name but listings show old name
- Category tree shows wrong counts

**Solutions:**
1. **Hard refresh browser** (Ctrl+Shift+R / Cmd+Shift+R)
2. **Clear cache**:
   ```bash
   # Admin panel
   Settings → Cache → Clear Category Cache
   ```
3. **Manual revalidation**:
   ```bash
   # Run on server
   npm run revalidate-categories
   ```
4. **Check database**:
   ```sql
   -- Verify category update
   SELECT * FROM Category WHERE id = 'category-id';

   -- Verify listings updated
   SELECT COUNT(*) FROM Listing WHERE categoryId = 'category-id';
   ```

#### 5. AI generating inappropriate categories

**Examples:**
- Brand-specific categories
- Overly granular categories
- Categories with offensive names

**Immediate Actions:**
1. **Delete the category** (if 0 items)
2. **Merge into appropriate parent** (if has items)
3. **Flag for AI team review** (report in admin panel)

**Long-term Prevention:**
1. Review and update AI prompt templates
2. Add category name validation rules
3. Implement profanity filter
4. Lower auto-creation confidence threshold

### Error Codes Reference

| Code | Error | Severity | Action |
|------|-------|----------|--------|
| CAT-001 | Slug conflict | Medium | Use different slug |
| CAT-002 | Circular reference | High | Check parent selection |
| CAT-003 | Max depth exceeded | Medium | Create under different parent |
| CAT-004 | Cannot delete with children | Low | Remove children first |
| CAT-005 | Icon not found | Low | Choose valid icon |
| CAT-006 | Merge operation failed | High | Contact support |
| CAT-007 | AI service unavailable | Medium | Retry later |
| CAT-008 | Validation failed | Medium | Check form inputs |

## Audit Logging

### What Gets Logged

Every category action creates an audit log:

```typescript
AdminAuditLog {
  action: AdminAction           // CREATE_CATEGORY, UPDATE_CATEGORY, etc.
  targetType: "CATEGORY"
  targetId: "category-uuid"
  userId: "admin-uuid"
  details: {
    before: {...},              // Previous state
    after: {...},               // New state
    changes: [...],             // List of changed fields
    reason: "Merged duplicate"  // Optional reason
  }
  ipAddress: "xxx.xxx.xxx.xxx"
  userAgent: "Mozilla/5.0..."
  createdAt: "2025-01-15T10:30:00Z"
}
```

### Viewing Audit Logs

**Location**: `/admin/audit-logs?type=CATEGORY`

**Filters:**
- Action type (create, update, merge, delete)
- Admin user
- Date range
- Category ID

**Use Cases:**
- **Compliance**: Track who changed what and when
- **Debugging**: Trace issues back to specific changes
- **Analytics**: Understand category evolution over time

## API Reference (For Developers)

### Admin Category Actions

```typescript
// Get all categories
getCategories(filters?: {
  isActive?: boolean
  aiGenerated?: boolean
  parentId?: string | null
  search?: string
}): Promise<CategoryWithStats[]>

// Create category
createCategory(data: {
  name: string
  slug: string
  parentId?: string
  icon: string
  description: string
  isActive: boolean
}): Promise<{ success: boolean; category?: Category; error?: string }>

// Update category
updateCategory(
  id: string,
  data: Partial<Category>
): Promise<{ success: boolean; error?: string }>

// Merge categories
mergeCategories(
  sourceIds: string[],
  targetId: string,
  options: {
    reassignListings: boolean
    deleteSource: boolean
    createRedirects: boolean
  }
): Promise<{ success: boolean; merged: number; error?: string }>

// Delete category
deleteCategory(id: string): Promise<{ success: boolean; error?: string }>

// Toggle status
toggleCategoryStatus(id: string): Promise<{ success: boolean; error?: string }>
```

### Category Analytics API

```typescript
// Get analytics
getCategoryAnalytics(): Promise<{
  totalCategories: number
  activeCategories: number
  aiGeneratedCategories: number
  distribution: Array<{ category: string; count: number }>
  performance: {
    acceptanceRate: number
    avgConfidence: number
    creationRate: number
  }
}>
```

## Need Help?

### Internal Resources

- **Engineering Team**: Slack #category-management
- **Product Team**: For feature requests
- **Support Team**: For user-facing issues

### External Resources

- **AI Prompts**: See `/lib/ai/prompts/category-suggestion.ts`
- **Database Schema**: See `/prisma/schema.prisma`
- **Components**: See `/components/admin/category-*.tsx`

### Support Contacts

- **Technical Issues**: dev@lotosale.com
- **Category Strategy**: product@lotosale.com
- **User Reports**: support@lotosale.com

---

**Document Version:** 1.0
**Last Updated:** 2025-01-15
**Next Review:** 2025-04-15
