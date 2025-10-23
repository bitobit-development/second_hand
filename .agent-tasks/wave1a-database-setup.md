# Wave 1A: Database Schema Setup - gal-database

**Agent**: gal-database
**Priority**: P0 - Critical Path
**Estimated Effort**: Medium (3-5 days)
**Dependencies**: None
**Blocks**: All backend development

---

## Mission

Set up the complete database infrastructure for the Second-Hand Marketplace platform using Prisma ORM with PostgreSQL. You will design and implement all core data models, relationships, migrations, and performance optimizations needed for Phase 1 MVP.

---

## Context

- **Project**: South African Second-Hand Marketplace
- **Stack**: Next.js 16.0.0, React 19.2.0, TypeScript, Prisma ORM, PostgreSQL
- **Location**: `/Users/haim/Projects/second_hand`
- **Phase**: MVP Phase 1
- **Commission Model**: 20% platform fee on all transactions

---

## Your Tasks

### Task 1: Install and Configure Prisma

**Install Dependencies:**
```bash
npm install prisma @prisma/client
npm install -D prisma
```

**Initialize Prisma:**
```bash
npx prisma init
```

**Configure `.env` file:**
Create a `.env` file in the project root with:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/second_hand?schema=public"
```

**Note**: Use a local PostgreSQL instance for development. The connection string should be updated for production.

---

### Task 2: Design Complete Prisma Schema

Create the full schema in `prisma/schema.prisma` with the following models:

#### **User Model**
Fields:
- `id` (String, UUID, primary key)
- `email` (String, unique, indexed)
- `name` (String)
- `phone` (String, optional)
- `city` (String, optional)
- `province` (String, optional)
- `role` (Enum: BUYER, SELLER, ADMIN, default: BUYER)
- `profileImage` (String, optional, URL)
- `rating` (Float, default: 0.0)
- `reviewCount` (Int, default: 0)
- `emailVerified` (DateTime, optional)
- `password` (String, hashed)
- `failedLoginAttempts` (Int, default: 0)
- `lockoutUntil` (DateTime, optional)
- `createdAt` (DateTime, auto-generated)
- `updatedAt` (DateTime, auto-updated)

Relationships:
- `listings` (one-to-many → Listing)
- `purchases` (one-to-many → Transaction as buyer)
- `sales` (one-to-many → Transaction as seller)
- `sentOffers` (one-to-many → Offer)
- `receivedReviews` (one-to-many → Review as reviewee)
- `givenReviews` (one-to-many → Review as reviewer)

---

#### **Listing Model**
Fields:
- `id` (String, UUID, primary key)
- `sellerId` (String, foreign key → User)
- `title` (String, max 100 chars, indexed)
- `description` (String, max 2000 chars)
- `category` (Enum: ELECTRONICS, CLOTHING, HOME_GARDEN, SPORTS, BOOKS, TOYS, VEHICLES, COLLECTIBLES, BABY_KIDS, PET_SUPPLIES)
- `condition` (Enum: NEW, LIKE_NEW, GOOD, FAIR, POOR)
- `images` (String[], array of URLs, min 1, max 10)
- `primaryImage` (String, URL)
- `pricingType` (Enum: FIXED, OFFERS)
- `price` (Decimal, optional)
- `minOffer` (Decimal, optional)
- `status` (Enum: PENDING, APPROVED, REJECTED, SOLD, PAUSED, default: PENDING, indexed)
- `rejectionReason` (String, optional)
- `city` (String)
- `province` (String)
- `views` (Int, default: 0)
- `createdAt` (DateTime, auto-generated, indexed)
- `updatedAt` (DateTime, auto-updated)
- `approvedAt` (DateTime, optional)
- `soldAt` (DateTime, optional)

Relationships:
- `seller` (many-to-one → User)
- `transaction` (one-to-one → Transaction, optional)
- `offers` (one-to-many → Offer)

---

#### **Transaction Model**
Fields:
- `id` (String, UUID, primary key)
- `listingId` (String, foreign key → Listing, unique)
- `buyerId` (String, foreign key → User)
- `sellerId` (String, foreign key → User)
- `amount` (Decimal, gross amount)
- `commission` (Decimal, calculated as 20%)
- `netAmount` (Decimal, amount - commission)
- `status` (Enum: PENDING, COMPLETED, CANCELLED, REFUNDED, default: PENDING)
- `paymentMethod` (String, optional)
- `createdAt` (DateTime, auto-generated)
- `completedAt` (DateTime, optional)

Relationships:
- `listing` (one-to-one → Listing)
- `buyer` (many-to-one → User)
- `seller` (many-to-one → User)
- `review` (one-to-one → Review, optional)

---

#### **Offer Model**
Fields:
- `id` (String, UUID, primary key)
- `listingId` (String, foreign key → Listing)
- `buyerId` (String, foreign key → User)
- `amount` (Decimal)
- `message` (String, optional, max 500 chars)
- `status` (Enum: PENDING, ACCEPTED, REJECTED, EXPIRED, COUNTERED, default: PENDING)
- `counterAmount` (Decimal, optional)
- `expiresAt` (DateTime, default: 48 hours from creation)
- `createdAt` (DateTime, auto-generated)
- `respondedAt` (DateTime, optional)

Relationships:
- `listing` (many-to-one → Listing)
- `buyer` (many-to-one → User)

Indexes:
- Compound index on (`listingId`, `buyerId`, `status`)

---

#### **Review Model** (Phase 2, but include schema now)
Fields:
- `id` (String, UUID, primary key)
- `transactionId` (String, foreign key → Transaction, unique)
- `reviewerId` (String, foreign key → User)
- `revieweeId` (String, foreign key → User)
- `rating` (Int, min: 1, max: 5)
- `comment` (String, optional, max 1000 chars)
- `createdAt` (DateTime, auto-generated)

Relationships:
- `transaction` (one-to-one → Transaction)
- `reviewer` (many-to-one → User)
- `reviewee` (many-to-one → User)

---

### Task 3: Define Enums

Create the following enums in the schema:

```prisma
enum UserRole {
  BUYER
  SELLER
  ADMIN
}

enum ListingCategory {
  ELECTRONICS
  CLOTHING
  HOME_GARDEN
  SPORTS
  BOOKS
  TOYS
  VEHICLES
  COLLECTIBLES
  BABY_KIDS
  PET_SUPPLIES
}

enum ListingCondition {
  NEW
  LIKE_NEW
  GOOD
  FAIR
  POOR
}

enum PricingType {
  FIXED
  OFFERS
}

enum ListingStatus {
  PENDING
  APPROVED
  REJECTED
  SOLD
  PAUSED
}

enum TransactionStatus {
  PENDING
  COMPLETED
  CANCELLED
  REFUNDED
}

enum OfferStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
  COUNTERED
}
```

---

### Task 4: Add Performance Indexes

Create indexes for optimal query performance:

**User Model:**
- `@@index([email])`
- `@@index([role])`

**Listing Model:**
- `@@index([sellerId])`
- `@@index([status])`
- `@@index([category])`
- `@@index([createdAt])`
- `@@index([status, category])` (compound)
- `@@index([status, createdAt])` (compound)
- Full-text search preparation: `@@index([title, description])` (PostgreSQL native)

**Transaction Model:**
- `@@index([buyerId])`
- `@@index([sellerId])`
- `@@index([status])`
- `@@index([createdAt])`

**Offer Model:**
- `@@index([listingId])`
- `@@index([buyerId])`
- `@@index([status])`
- `@@index([expiresAt])`
- `@@index([listingId, buyerId, status])` (compound)

---

### Task 5: Generate and Run Migrations

**Create Initial Migration:**
```bash
npx prisma migrate dev --name init
```

This will:
- Generate SQL migration files in `prisma/migrations/`
- Apply migrations to the database
- Generate Prisma Client

**Verify Migration Success:**
```bash
npx prisma migrate status
```

---

### Task 6: Generate Prisma Client

```bash
npx prisma generate
```

This generates the type-safe Prisma Client at `node_modules/@prisma/client`.

---

### Task 7: Create Database Seed Script

Create `prisma/seed.ts` with development data:

**Seed Data Requirements:**
- 3 users (1 admin, 1 seller, 1 buyer)
- 10 sample listings (mix of categories, conditions, statuses)
- 3 transactions (completed)
- 5 offers (various statuses)

**Script Structure:**
```typescript
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.create({...});

  // Create seller user
  const seller = await prisma.user.create({...});

  // Create buyer user
  const buyer = await prisma.user.create({...});

  // Create sample listings
  // Create sample transactions
  // Create sample offers
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Add to `package.json`:**
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

**Run Seed:**
```bash
npx prisma db seed
```

---

### Task 8: Create Prisma Singleton Instance

Create `lib/prisma.ts` for Next.js:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Why?** Prevents multiple Prisma Client instances in development due to Next.js hot reloading.

---

### Task 9: Optimize Query Performance

**Create Custom Queries for Common Patterns:**

In `lib/prisma-queries.ts`:
- `getApprovedListings()` - Paginated listings with seller info
- `getListingById()` - Single listing with all relations
- `getUserDashboard()` - Seller/buyer dashboard data
- `getPendingListingsForAdmin()` - Admin moderation queue

**Use Prisma Best Practices:**
- Select only needed fields
- Use `include` for relations sparingly
- Implement cursor-based pagination for large datasets
- Use transactions for atomic operations

---

### Task 10: Database Documentation

Create `prisma/README.md` documenting:
- Schema overview
- Model relationships (ERD description)
- Index strategy
- Seed data usage
- Common queries
- Migration workflow

---

## Acceptance Criteria

✅ **Schema Complete:**
- All 5 models defined (User, Listing, Transaction, Offer, Review)
- All enums created
- All relationships properly defined
- UUID primary keys for all models

✅ **Indexes Optimized:**
- All required indexes created
- Compound indexes for common query patterns
- Full-text search preparation for listings

✅ **Migrations Applied:**
- Initial migration generated and applied successfully
- Database schema matches Prisma schema
- No migration errors

✅ **Prisma Client Generated:**
- Type-safe client available
- Singleton pattern implemented for Next.js
- No TypeScript errors

✅ **Seed Data Created:**
- Seed script runs successfully
- Development data available for testing
- All relationships properly seeded

✅ **Documentation Complete:**
- Schema documented
- Query patterns documented
- Migration workflow documented

---

## Technology References

### Prisma Documentation
You have access to comprehensive Prisma documentation via context7. Key topics:
- Schema design with relationships
- PostgreSQL native types
- Migrations with `prisma migrate`
- Indexes and performance optimization
- Next.js integration patterns

### Key Prisma Commands
- `npx prisma init` - Initialize Prisma
- `npx prisma migrate dev --name <name>` - Create and apply migration
- `npx prisma generate` - Generate Prisma Client
- `npx prisma studio` - Open Prisma Studio GUI
- `npx prisma db seed` - Run seed script
- `npx prisma migrate status` - Check migration status

---

## Important Notes

1. **Use UUIDs**, not auto-increment integers, for primary keys (better for distributed systems)
2. **Index strategically** - Too many indexes slow writes, too few slow reads
3. **Commission calculation** - 20% is hardcoded now, but make it configurable for future
4. **Soft deletes** - Not implemented in MVP, but consider for future
5. **PostgreSQL features** - Use native full-text search, JSONB if needed
6. **Prisma Client location** - Use singleton pattern to avoid connection issues
7. **Seed data passwords** - Use bcryptjs to hash: `await hash('password123', 10)`

---

## Deliverables

When complete, provide a summary report with:

1. **Schema Overview**: Brief description of each model and relationships
2. **Migration Files**: List of generated migration files with paths
3. **Index Strategy**: Explanation of index choices
4. **Seed Data**: Summary of seeded data
5. **Prisma Client**: Confirmation of successful generation
6. **File Paths**: Absolute paths to all created files:
   - `prisma/schema.prisma`
   - `prisma/migrations/*`
   - `prisma/seed.ts`
   - `lib/prisma.ts`
   - `lib/prisma-queries.ts`
   - `prisma/README.md`

7. **Next Steps**: What agents can now proceed (e.g., oren-backend can start building APIs)

---

## Success Validation

Before marking complete, run these commands and confirm success:
```bash
npx prisma migrate status  # Should show all migrations applied
npx prisma generate        # Should complete without errors
npx prisma db seed         # Should seed data successfully
npx prisma studio          # Should open GUI and show data
```

---

**Ready to begin!** Focus on quality over speed. This database schema is the foundation for the entire platform.
