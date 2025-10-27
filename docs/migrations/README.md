# Category Migration Documentation

This directory contains comprehensive documentation and scripts for migrating from the fixed `ListingCategory` enum to a flexible, hierarchical `Category` model.

## Quick Start

### For Development Environment

```bash
# 1. Review the design
cat docs/migrations/category-migration-report.md

# 2. Review the step-by-step guide
cat docs/migrations/category-migration-guide.md

# 3. Execute TypeScript migration scripts
npx tsx scripts/seed-categories.ts
npx tsx scripts/migrate-listing-categories.ts

# 4. Verify in Prisma Studio
npx prisma studio
```

### For Production Environment

```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Execute SQL migration phases
psql $DATABASE_URL < docs/migrations/sql/phase1-add-schema.sql
psql $DATABASE_URL < docs/migrations/sql/phase2-seed-categories.sql
psql $DATABASE_URL < docs/migrations/sql/phase3-migrate-data.sql
psql $DATABASE_URL < docs/migrations/sql/phase4-update-counts.sql

# 3. Monitor and verify for 1-2 weeks

# 4. (Optional) Make categoryId required
psql $DATABASE_URL < docs/migrations/sql/phase5-make-required.sql

# 5. (Optional, after 4+ weeks) Remove legacy field
psql $DATABASE_URL < docs/migrations/sql/phase6-remove-legacy.sql
```

## Documentation Files

### 📋 Main Documents

1. **[category-migration-report.md](./category-migration-report.md)** (23 pages)
   - Executive summary and design overview
   - Complete schema design with rationale
   - Three-phase migration strategy
   - Performance analysis and benchmarks
   - Risk assessment and mitigation
   - Future enhancement roadmap
   - **START HERE** for comprehensive understanding

2. **[category-migration-guide.md](./category-migration-guide.md)** (18 pages)
   - Step-by-step migration procedures
   - Schema changes with before/after
   - Verification queries for each phase
   - Rollback procedures
   - Common issues and solutions
   - SQL quick reference guide
   - **USE THIS** for execution guidance

3. **[category-migration-sql.md](./category-migration-sql.md)** (12 pages)
   - Complete SQL migration scripts
   - Phase-by-phase SQL with explanations
   - Rollback SQL procedures
   - Post-migration validation queries
   - Performance considerations
   - **USE THIS** for manual SQL execution

### 🛠 Script Files

#### TypeScript Scripts (in `/scripts` directory)

1. **`seed-categories.ts`**
   - Creates 10 base categories from enum values
   - Idempotent (safe to re-run)
   - Reports listing distribution
   - Run: `npx tsx scripts/seed-categories.ts`

2. **`migrate-listing-categories.ts`**
   - Migrates listings from enum to FK
   - Batch processing (100 listings/batch)
   - Updates category item counts
   - Comprehensive error handling
   - Run: `npx tsx scripts/migrate-listing-categories.ts`

3. **`rollback-category-migration.ts`**
   - Reverts migration if issues found
   - Restores legacyCategory from categoryId
   - Requires user confirmation
   - Run: `npx tsx scripts/rollback-category-migration.ts`

#### SQL Scripts (in `/docs/migrations/sql` directory)

1. **`phase1-add-schema.sql`**
   - Creates Category table
   - Adds categoryId FK column
   - Creates all indexes
   - Non-breaking, zero downtime
   - Runtime: ~1 second

2. **`phase2-seed-categories.sql`**
   - Inserts 10 base categories
   - Maps to enum values
   - Verification reporting
   - Runtime: <1 second

3. **`phase3-migrate-data.sql`**
   - Copies enum to FK
   - Batch updates by category
   - Comprehensive verification
   - Runtime: ~1-5 seconds per 1000 listings

4. **`phase4-update-counts.sql`**
   - Populates itemCount field
   - Validates counts match
   - Reports category statistics
   - Runtime: <1 second

5. **`phase5-make-required.sql`** (Optional)
   - Makes categoryId NOT NULL
   - Pre-flight safety checks
   - Breaking change warning
   - Runtime: <1 second

6. **`phase6-remove-legacy.sql`** (Optional)
   - Drops legacyCategory column
   - Removes legacy indexes
   - Final cleanup
   - Runtime: <1 second

7. **`rollback.sql`**
   - Complete rollback procedure
   - Restores enum system
   - Safety checks included
   - Runtime: ~2-3 seconds

## Migration Phases Overview

### Phase 1: Schema Addition ✅ Non-Breaking
- **Goal**: Add new Category table and FK column
- **Downtime**: ZERO
- **Rollback**: Easy (drop new tables/columns)
- **Risk**: Very Low

### Phase 2: Data Seeding ✅ Non-Breaking
- **Goal**: Populate Category table with 10 base categories
- **Downtime**: ZERO
- **Rollback**: Easy (delete category rows)
- **Risk**: Very Low

### Phase 3: Data Migration ✅ Non-Breaking
- **Goal**: Copy enum values to FK references
- **Downtime**: ZERO (app still uses enum)
- **Rollback**: Easy (clear categoryId values)
- **Risk**: Low

### Phase 4: Count Updates ✅ Non-Breaking
- **Goal**: Populate denormalized itemCount
- **Downtime**: ZERO
- **Rollback**: Easy (reset counts)
- **Risk**: Very Low

### Phase 5: Make Required ⚠️ Breaking (Optional)
- **Goal**: Enforce categoryId NOT NULL
- **Downtime**: ZERO (if all migrated)
- **Rollback**: Medium difficulty
- **Risk**: Medium
- **Timing**: After 1-2 weeks of validation

### Phase 6: Remove Legacy ⚠️ Destructive (Optional)
- **Goal**: Drop legacyCategory column
- **Downtime**: ZERO
- **Rollback**: Difficult (requires backup restore)
- **Risk**: High if done too early
- **Timing**: After 4+ weeks of stable operation

## Schema Design

### Category Model

```
Category
├── id (uuid, PK)
├── name (text) - "Electronics"
├── slug (text, unique) - "electronics"
├── parentId (uuid, FK to Category, nullable) - for hierarchy
├── icon (text) - "Smartphone"
├── description (text)
├── isActive (boolean, default true) - soft delete
├── itemCount (int, default 0) - denormalized for performance
├── aiGenerated (boolean, default false) - AI-created flag
├── createdAt (timestamp)
└── updatedAt (timestamp)

Relations:
├── parent -> Category (self-referential)
├── children -> Category[] (reverse)
└── listings -> Listing[]

Indexes:
├── slug (unique)
├── parentId
├── isActive
├── itemCount
└── [parentId, isActive, itemCount] (composite)
```

### Listing Model Changes

```
Before:
├── category (ListingCategory enum)

During Migration:
├── legacyCategory (ListingCategory enum, renamed from category)
├── categoryId (uuid, FK to Category, nullable)

After Migration:
├── categoryId (uuid, FK to Category, required)
```

## Safety Features

### Idempotent Scripts
- All TypeScript scripts can be re-run safely
- SQL scripts use IF EXISTS/IF NOT EXISTS
- No duplicate data creation

### Dual-Write Period
- Both legacyCategory and categoryId exist during migration
- Application can use either field
- Gradual cutover reduces risk

### Comprehensive Validation
- Pre-flight checks before destructive operations
- Post-migration verification queries
- Automated count validation

### Easy Rollback
- legacyCategory field retained for rollback
- Rollback script provided
- Multiple rollback points

## Performance Considerations

### Query Performance
- **Before**: Direct enum comparison (~0.5ms)
- **After**: FK JOIN (~1ms)
- **Impact**: Negligible (<0.5ms difference)

### Index Sizes
- **Before**: 8 indexes on enum (4 bytes)
- **After**: 8 indexes on UUID (36 bytes text, or 16 bytes native)
- **Impact**: ~10-15% size increase

### Optimization Tips
1. Use `select` to limit joined fields
2. Cache category list in memory (10 categories)
3. Use denormalized `itemCount` for sorting
4. Run VACUUM ANALYZE after dropping legacy fields

## Common Issues & Solutions

### Issue: "violates foreign key constraint"
**Solution**: Ensure all Category rows exist before Phase 3. Re-run Phase 2.

### Issue: "Listings with NULL categoryId"
**Solution**: Check legacyCategory values for unmapped enums. Add mapping if needed.

### Issue: "itemCount mismatch"
**Solution**: Re-run Phase 4 script to recalculate counts.

### Issue: Migration hangs
**Solution**: Increase batch size in TypeScript script, or run during off-peak hours.

## Testing Checklist

- [ ] Backup database created
- [ ] Phase 1 executed successfully
- [ ] Phase 2 executed successfully
- [ ] Category table has 10 rows
- [ ] Phase 3 executed successfully
- [ ] All listings have categoryId
- [ ] Phase 4 executed successfully
- [ ] itemCounts match actual counts
- [ ] Application displays categories correctly
- [ ] Category filtering works
- [ ] Listing creation uses new categories
- [ ] Admin dashboard shows category stats
- [ ] Performance benchmarks acceptable
- [ ] Rollback procedure tested in dev

## Support & Contact

For issues or questions:
1. Review this README thoroughly
2. Check specific documentation files above
3. Review migration logs for errors
4. Test in development environment first
5. Consult Prisma schema for data model

## Version History

- **v1.0** (2025-10-26): Initial migration design and implementation
  - Complete schema design
  - TypeScript migration scripts
  - SQL migration phases
  - Comprehensive documentation
  - Rollback procedures

## License & Usage

These migration scripts are part of the Second-Hand Marketplace project and are provided as-is. Always test in a development environment before applying to production.

---

**Last Updated**: 2025-10-26
**Status**: Ready for implementation ✅
**Estimated Migration Time**: 15-30 minutes (development), 1-2 hours (production with validation)
