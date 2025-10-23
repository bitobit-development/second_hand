# Database Schema Documentation

## Overview

This document describes the database schema for the Second-Hand Marketplace platform. The database is built with PostgreSQL and managed via Prisma ORM.

## Technology Stack

- **Database**: PostgreSQL 16
- **ORM**: Prisma 6.17.1
- **Client Location**: `lib/generated/prisma`
- **Connection**: Docker container (development)

## Schema Overview

The database consists of 5 core models:

1. **User** - User accounts (buyers, sellers, admins)
2. **Listing** - Marketplace listings
3. **Transaction** - Completed purchases
4. **Offer** - Price negotiation offers
5. **Review** - Post-transaction reviews

## Entity Relationship Diagram (ERD)

```
User (1) ----< (N) Listing
User (1) ----< (N) Transaction (as buyer)
User (1) ----< (N) Transaction (as seller)
User (1) ----< (N) Offer (sent)
User (1) ----< (N) Review (as reviewer)
User (1) ----< (N) Review (as reviewee)

Listing (1) ----< (N) Offer
Listing (1) ----o (0..1) Transaction

Transaction (1) ----o (0..1) Review
```

## Models

### User

Represents all platform users (buyers, sellers, admins).

**Fields:**
- `id` (UUID) - Primary key
- `email` (String) - Unique email address
- `name` (String) - Display name
- `phone` (String?) - Optional phone number
- `city` / `province` (String?) - Location
- `role` (UserRole) - BUYER | SELLER | ADMIN
- `profileImage` (String?) - Avatar URL
- `rating` (Float) - Average rating (0.0-5.0)
- `reviewCount` (Int) - Total reviews received
- `emailVerified` (DateTime?) - Email verification timestamp
- `password` (String) - Bcrypt hashed password
- `failedLoginAttempts` (Int) - Security counter
- `lockoutUntil` (DateTime?) - Account lockout timestamp
- `createdAt` / `updatedAt` (DateTime) - Timestamps

**Indexes:**
- `email` (unique)
- `role`

**Relations:**
- `listings[]` - Listings created by user
- `purchases[]` - Transactions as buyer
- `sales[]` - Transactions as seller
- `sentOffers[]` - Offers made by user
- `receivedReviews[]` - Reviews received
- `givenReviews[]` - Reviews given

---

### Listing

Marketplace listings for items being sold.

**Fields:**
- `id` (UUID) - Primary key
- `sellerId` (UUID) - Foreign key to User
- `title` (String) - Listing title (max 100 chars)
- `description` (String) - Detailed description (max 2000 chars)
- `category` (ListingCategory) - Product category
- `condition` (ListingCondition) - Item condition
- `images` (String[]) - Array of image URLs (1-10)
- `primaryImage` (String) - Main display image
- `pricingType` (PricingType) - FIXED | OFFERS
- `price` (Decimal?) - Fixed price (if FIXED)
- `minOffer` (Decimal?) - Minimum acceptable offer (if OFFERS)
- `status` (ListingStatus) - PENDING | APPROVED | REJECTED | SOLD | PAUSED
- `rejectionReason` (String?) - Admin rejection reason
- `city` / `province` (String) - Item location
- `views` (Int) - View count
- `createdAt` / `updatedAt` (DateTime) - Timestamps
- `approvedAt` / `soldAt` (DateTime?) - Status timestamps

**Indexes:**
- `sellerId`
- `status`
- `category`
- `createdAt`
- `(status, category)` - Compound
- `(status, createdAt)` - Compound

**Relations:**
- `seller` - User who created the listing
- `transaction?` - Associated transaction (if sold)
- `offers[]` - Offers received

---

### Transaction

Completed purchases with commission tracking.

**Fields:**
- `id` (UUID) - Primary key
- `listingId` (UUID) - Foreign key to Listing (unique)
- `buyerId` (UUID) - Foreign key to User
- `sellerId` (UUID) - Foreign key to User
- `amount` (Decimal) - Gross sale amount
- `commission` (Decimal) - Platform commission (20%)
- `netAmount` (Decimal) - Seller receives (amount - commission)
- `status` (TransactionStatus) - PENDING | COMPLETED | CANCELLED | REFUNDED
- `paymentMethod` (String?) - Payment method used
- `createdAt` (DateTime) - Transaction created
- `completedAt` (DateTime?) - Transaction completed

**Indexes:**
- `buyerId`
- `sellerId`
- `status`
- `createdAt`

**Relations:**
- `listing` - The listing being purchased
- `buyer` - User making the purchase
- `seller` - User selling the item
- `review?` - Optional review

**Business Logic:**
- Commission is always 20% of the sale amount
- `netAmount = amount - commission`
- One transaction per listing (1:1 relationship)

---

### Offer

Price negotiation offers on OFFERS-type listings.

**Fields:**
- `id` (UUID) - Primary key
- `listingId` (UUID) - Foreign key to Listing
- `buyerId` (UUID) - Foreign key to User
- `amount` (Decimal) - Offer amount
- `message` (String?) - Optional message (max 500 chars)
- `status` (OfferStatus) - PENDING | ACCEPTED | REJECTED | EXPIRED | COUNTERED
- `counterAmount` (Decimal?) - Seller's counter-offer
- `expiresAt` (DateTime) - Offer expiration (48 hours default)
- `createdAt` (DateTime) - Offer created
- `respondedAt` (DateTime?) - Seller response timestamp

**Indexes:**
- `listingId`
- `buyerId`
- `status`
- `expiresAt`
- `(listingId, buyerId, status)` - Compound

**Relations:**
- `listing` - The listing being offered on
- `buyer` - User making the offer

**Business Logic:**
- Offers expire 48 hours after creation
- Only valid on OFFERS-type listings
- When listing is sold, all pending offers become EXPIRED

---

### Review

Post-transaction reviews between buyers and sellers.

**Fields:**
- `id` (UUID) - Primary key
- `transactionId` (UUID) - Foreign key to Transaction (unique)
- `reviewerId` (UUID) - Foreign key to User (reviewer)
- `revieweeId` (UUID) - Foreign key to User (reviewee)
- `rating` (Int) - Rating (1-5)
- `comment` (String?) - Optional comment (max 1000 chars)
- `createdAt` (DateTime) - Review created

**Relations:**
- `transaction` - The completed transaction
- `reviewer` - User giving the review
- `reviewee` - User receiving the review

**Business Logic:**
- One review per transaction (1:1 relationship)
- Buyers review sellers (typically)
- Ratings contribute to user's overall rating and reviewCount

---

## Enums

### UserRole
- `BUYER` - Can browse and purchase
- `SELLER` - Can create listings
- `ADMIN` - Platform administrator

### ListingCategory
- `ELECTRONICS`
- `CLOTHING`
- `HOME_GARDEN`
- `SPORTS`
- `BOOKS`
- `TOYS`
- `VEHICLES`
- `COLLECTIBLES`
- `BABY_KIDS`
- `PET_SUPPLIES`

### ListingCondition
- `NEW` - Brand new, unused
- `LIKE_NEW` - Minimal use, no visible wear
- `GOOD` - Normal wear, fully functional
- `FAIR` - Visible wear, fully functional
- `POOR` - Heavy wear or defects

### PricingType
- `FIXED` - Fixed price, no negotiation
- `OFFERS` - Accept offers with optional minimum

### ListingStatus
- `PENDING` - Awaiting admin approval
- `APPROVED` - Live on marketplace
- `REJECTED` - Admin rejected
- `SOLD` - Successfully sold
- `PAUSED` - Temporarily hidden by seller

### TransactionStatus
- `PENDING` - Payment processing
- `COMPLETED` - Successfully completed
- `CANCELLED` - Cancelled by buyer/seller
- `REFUNDED` - Refund issued

### OfferStatus
- `PENDING` - Awaiting seller response
- `ACCEPTED` - Seller accepted
- `REJECTED` - Seller rejected
- `EXPIRED` - Offer expired
- `COUNTERED` - Seller counter-offered

---

## Index Strategy

### Strategic Indexing

Indexes are carefully chosen to optimize common query patterns while avoiding over-indexing:

**Single Column Indexes:**
- Foreign keys (sellerId, buyerId, listingId, etc.)
- Status fields (frequently filtered)
- Email (unique constraint + lookup)
- createdAt (for sorting and range queries)

**Compound Indexes:**
- `(status, category)` on Listing - For filtered category browsing
- `(status, createdAt)` on Listing - For sorted listing feeds
- `(listingId, buyerId, status)` on Offer - For offer management queries

**Why These Indexes?**
- Seller dashboard: `sellerId` + `status` filters
- Buyer browsing: `status='APPROVED'` + `category` + `createdAt` sorting
- Offer management: `listingId` + `buyerId` + `status` combinations
- Admin moderation: `status='PENDING'` + `createdAt` sorting

**Avoided Over-indexing:**
- No indexes on rarely queried fields (description, message, comment)
- No indexes on low-cardinality fields (condition has only 5 values)
- Compound indexes cover single-column queries too (status + category covers status alone)

---

## Migration Workflow

### Creating Migrations

**Recommended (when Prisma migrate works):**
```bash
npx prisma migrate dev --name <descriptive_name>
```

**Manual (current approach due to connection issues):**
1. Edit `prisma/schema.prisma`
2. Create migration directory: `prisma/migrations/YYYYMMDD_<name>/`
3. Write migration SQL manually
4. Apply via Docker: `docker exec -i second_hand_postgres psql -U postgres -d second_hand < migration.sql`
5. Register in `_prisma_migrations` table

### Applying Migrations

**Development:**
```bash
npx prisma migrate dev
```

**Production:**
```bash
npx prisma migrate deploy
```

### Migration Verification

Check migration status:
```bash
npx prisma migrate status
```

View applied migrations:
```sql
SELECT * FROM "_prisma_migrations" ORDER BY "started_at" DESC;
```

---

## Seed Data

### Running the Seed

**SQL Method (current):**
```bash
docker exec -i second_hand_postgres psql -U postgres -d second_hand < prisma/seed.sql
```

**TypeScript Method (when Prisma connection works):**
```bash
npx prisma db seed
```

### Seed Data Includes

- **3 Users:**
  - Admin: `admin@secondhand.co.za` / `password123`
  - Seller: `john.seller@example.com` / `password123`
  - Buyer: `sarah.buyer@example.com` / `password123`

- **10 Listings** across various categories and statuses
- **1 Completed Transaction** with 20% commission
- **2 Offers** (pending and accepted)
- **1 Review** (5-star rating)

---

## Common Queries

### Get Approved Listings (Paginated)

```typescript
import { getApprovedListings } from '@/lib/prisma-queries';

const listings = await getApprovedListings({
  limit: 20,
  category: 'ELECTRONICS',
  province: 'Gauteng',
});
```

### Get Seller Dashboard

```typescript
import { getSellerDashboard } from '@/lib/prisma-queries';

const dashboard = await getSellerDashboard(sellerId);
// Returns: user, listings, stats (by status)
```

### Create Transaction (Atomic)

```typescript
import { createTransaction } from '@/lib/prisma-queries';

const transaction = await createTransaction({
  listingId: '...',
  buyerId: '...',
  sellerId: '...',
  amount: 9500.00,
  paymentMethod: 'Credit Card',
});
// Automatically: calculates commission, marks listing as SOLD, expires all offers
```

### Create Offer

```typescript
import { createOffer } from '@/lib/prisma-queries';

const offer = await createOffer({
  listingId: '...',
  buyerId: '...',
  amount: 12000.00,
  message: 'Can you do R12,000?',
});
// Automatically: sets expiresAt to 48 hours from now
```

---

## Connection Configuration

### Environment Variables

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/second_hand?schema=public&sslmode=disable"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/second_hand_shadow?schema=public&sslmode=disable"
```

### Docker Container

**Start PostgreSQL:**
```bash
docker run -d --name second_hand_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=second_hand \
  -p 5432:5432 \
  postgres:16-alpine
```

**Stop Container:**
```bash
docker stop second_hand_postgres
```

**Remove Container:**
```bash
docker rm second_hand_postgres
```

---

## Prisma Client Usage

### Import Prisma

```typescript
import prisma from '@/lib/prisma';
```

### Basic CRUD Operations

**Create:**
```typescript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: hashedPassword,
  },
});
```

**Read:**
```typescript
const users = await prisma.user.findMany({
  where: { role: 'SELLER' },
  select: { id: true, name: true, email: true },
});
```

**Update:**
```typescript
await prisma.listing.update({
  where: { id: listingId },
  data: { status: 'APPROVED' },
});
```

**Delete:**
```typescript
await prisma.listing.delete({
  where: { id: listingId },
});
```

---

## Performance Considerations

### Query Optimization

1. **Select only needed fields:**
   ```typescript
   // Good
   const users = await prisma.user.findMany({
     select: { id: true, name: true, email: true },
   });

   // Avoid (fetches all fields)
   const users = await prisma.user.findMany();
   ```

2. **Use cursor-based pagination:**
   ```typescript
   const listings = await prisma.listing.findMany({
     take: 20,
     skip: 1,
     cursor: { id: lastSeenId },
   });
   ```

3. **Leverage compound indexes:**
   ```typescript
   // Efficient (uses status + category index)
   await prisma.listing.findMany({
     where: {
       status: 'APPROVED',
       category: 'ELECTRONICS',
     },
   });
   ```

4. **Use transactions for atomic operations:**
   ```typescript
   await prisma.$transaction(async (tx) => {
     await tx.listing.update({ where: { id }, data: { status: 'SOLD' } });
     await tx.transaction.create({ data: transactionData });
   });
   ```

---

## Troubleshooting

### Prisma Connection Issues

If you encounter `P1010: User was denied access on the database` errors:

1. Verify Docker container is running:
   ```bash
   docker ps | grep second_hand_postgres
   ```

2. Test direct PostgreSQL connection:
   ```bash
   docker exec second_hand_postgres psql -U postgres -d second_hand -c "SELECT 1;"
   ```

3. Check .env file has correct credentials:
   ```bash
   cat .env | grep DATABASE_URL
   ```

4. Regenerate Prisma Client:
   ```bash
   npx prisma generate
   ```

### Schema Validation

```bash
npx prisma validate
```

### View Database in Prisma Studio

```bash
npx prisma studio
```

---

## Next Steps for Other Agents

### For oren-backend (Backend Developer)

You can now:
- Import Prisma client: `import prisma from '@/lib/prisma'`
- Use optimized queries: `import { getApprovedListings } from '@/lib/prisma-queries'`
- Build API routes with type-safe database access
- Implement authentication with User model
- Create CRUD operations for listings

### For adi-fullstack (Fullstack Developer)

You can now:
- Use Prisma in Server Actions
- Implement form submissions that save to database
- Build data-driven pages with RSC
- Use optimized query patterns for dashboard pages

### For uri-testing (QA Engineer)

You can now:
- Seed test data via `prisma/seed.sql`
- Write integration tests against the database
- Create test fixtures using Prisma Client
- Validate data integrity constraints

---

## Schema Version

**Current Version:** Initial Schema (Migration: 20251022_init)
**Last Updated:** October 22, 2025
**Maintained By:** gal-database agent
