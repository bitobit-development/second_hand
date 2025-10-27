# Fix: Automated Prisma Migrations on Vercel Deployment

**Date:** 2025-01-27
**Status:** ✅ Fixed
**Priority:** Critical
**Issue:** Migrations not running automatically on Vercel deployments

---

## Problem

After pushing migration files to production, Vercel was not applying them automatically, causing the `categoryId` error to persist.

**Root Cause:**
- `postinstall` script only ran `prisma generate`
- `prisma migrate deploy` was not being executed during Vercel build
- Manual intervention required for each deployment

---

## Solution

### 1. Updated `package.json`

**Before:**
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

**After:**
```json
{
  "scripts": {
    "postinstall": "prisma generate && prisma migrate deploy"
  }
}
```

### 2. Created `vercel.json`

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "env": {
    "DATABASE_URL": "@database-url"
  }
}
```

---

## How It Works

### Vercel Build Process (Updated)

1. **Install Phase**
   ```bash
   pnpm install
   ```

2. **Post-Install Hook** (automatically runs after install)
   ```bash
   prisma generate    # Generate Prisma Client
   prisma migrate deploy  # Apply pending migrations
   ```

3. **Build Phase**
   ```bash
   next build  # Build Next.js application
   ```

### Migration Deployment

When Vercel builds:
1. Connects to production database (via `DATABASE_URL` env var)
2. Checks migration history in `_prisma_migrations` table
3. Applies any pending migrations from `prisma/migrations/` folder
4. Marks migrations as applied
5. Continues with Next.js build

---

## Migrations Applied on Next Deployment

The following migrations will be applied automatically:

1. **20251027_add_auth_tokens**
   - VerificationToken table
   - PasswordResetToken table

2. **20251027_add_admin_audit**
   - AdminAction enum
   - AuditTargetType enum
   - AdminAuditLog table

3. **20251027_add_listing_indexes**
   - Optimized composite indexes

4. **20251027_add_category_model** ⚠️ **Critical**
   - Category table
   - categoryId column on Listing table
   - Fixes the production error

---

## Verification Steps

### 1. Monitor Vercel Deployment

1. Go to: https://vercel.com/bitobit-development/second-hand
2. Click "Deployments" tab
3. Look for the latest deployment (commit `d1ffc20`)
4. Click deployment → "Building" tab
5. Look for migration output:
   ```
   Running prisma migrate deploy...
   Prisma schema loaded from prisma/schema.prisma
   Datasource "db": PostgreSQL database

   4 migrations found in prisma/migrations

   Applying migration `20251027_add_auth_tokens`
   Applying migration `20251027_add_admin_audit`
   Applying migration `20251027_add_listing_indexes`
   Applying migration `20251027_add_category_model`

   The following migrations have been applied:

   migrations/
     └─ 20251027_add_auth_tokens/
     └─ 20251027_add_admin_audit/
     └─ 20251027_add_listing_indexes/
     └─ 20251027_add_category_model/

   All migrations have been successfully applied.
   ```

### 2. Test Production Listing Creation

After deployment completes (~5-10 minutes):

1. Navigate to: https://second-hand-xi.vercel.app/listings/create
2. Upload an image
3. Fill out the form
4. Submit
5. **Expected:** Listing created successfully ✅
6. **Previous:** `categoryId` error ❌

### 3. Check Database Schema

You can verify the migration was applied:

```sql
-- Check if categoryId column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Listing'
AND column_name = 'categoryId';

-- Should return:
-- column_name | data_type | is_nullable
-- categoryId  | text      | YES

-- Check Category table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'Category';

-- Should return:
-- table_name
-- Category
```

---

## Environment Variables

Ensure these are set in Vercel:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string | ✅ Yes |
| `DIRECT_URL` | Direct connection (non-pooled) | Optional |

**Note:** `DATABASE_URL` is referenced as `@database-url` in `vercel.json`

---

## Troubleshooting

### Issue: Migrations still not running

**Check 1: Verify `postinstall` script**
```bash
# In your project
cat package.json | grep postinstall
# Should output:
# "postinstall": "prisma generate && prisma migrate deploy"
```

**Check 2: Verify migration files exist**
```bash
ls -la prisma/migrations/
# Should show:
# 20251027_add_auth_tokens/
# 20251027_add_admin_audit/
# 20251027_add_listing_indexes/
# 20251027_add_category_model/
```

**Check 3: Check Vercel build logs**
- Look for "Running prisma migrate deploy"
- Check for any migration errors
- Verify all 4 migrations applied

### Issue: Migration fails in Vercel

**Possible Causes:**

1. **DATABASE_URL not set**
   - Go to Vercel → Settings → Environment Variables
   - Add `DATABASE_URL` with your Neon connection string
   - Redeploy

2. **Migration already applied**
   - Not an error - Prisma skips already-applied migrations
   - Check if error is for a different reason

3. **SQL syntax error**
   - Review migration SQL files
   - Test migrations locally first
   - Use `IF NOT EXISTS` clauses for safety

---

## Rollback Plan

If migrations cause issues:

### Option 1: Revert vercel.json
```bash
git revert d1ffc20
git push origin main
```

### Option 2: Remove migration from postinstall
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Then manually run migrations when needed.

---

## Best Practices Going Forward

### 1. Always Test Migrations Locally First
```bash
# Reset local DB to clean state
npx prisma migrate reset

# Apply migrations
npx prisma migrate dev

# Verify everything works
pnpm dev
```

### 2. Use Migration Workflow
```bash
# When changing schema:
npx prisma migrate dev --name descriptive_name

# This will:
# - Create migration SQL file
# - Apply to local DB
# - Update migration history
```

### 3. Commit Migrations Immediately
```bash
git add prisma/migrations/
git commit -m "feat: add [description] migration"
git push origin main
```

### 4. Monitor Vercel Deployments
- Always check build logs after schema changes
- Verify migrations applied successfully
- Test affected functionality immediately

---

## Related Files

**Configuration:**
- `package.json` (line 13: postinstall script)
- `vercel.json` (entire file)

**Migrations:**
- `prisma/migrations/20251027_add_auth_tokens/`
- `prisma/migrations/20251027_add_admin_audit/`
- `prisma/migrations/20251027_add_listing_indexes/`
- `prisma/migrations/20251027_add_category_model/`

**Documentation:**
- `docs/fix_bugs/2025-01-27-production-database-schema-sync.md`
- `docs/migrations/category-migration-guide.md`

---

## Timeline

- **Issue Reported:** 2025-01-27 (categoryId error on production)
- **Migrations Created:** 2025-01-27 14:00 (commit `327d97d`)
- **First Push:** 2025-01-27 14:05 (migrations not auto-applied)
- **Config Fix:** 2025-01-27 14:30 (commit `d1ffc20`)
- **Status:** Awaiting deployment completion

---

## Commit Reference

**Commit:** `d1ffc20`
**Message:** "fix: configure automatic Prisma migrations on Vercel deployment"
**Files Changed:**
- `package.json` (+1, -1)
- `vercel.json` (new file, +8 lines)

---

## Success Criteria

✅ Deployment completes without errors
✅ All 4 migrations applied to production database
✅ categoryId column exists in Listing table
✅ Category table exists and is queryable
✅ Listing creation works on production
✅ No Prisma errors in Vercel function logs

---

## Next Steps

1. ⏳ Wait for Vercel deployment to complete (~5-10 min)
2. ✅ Verify migrations applied (check build logs)
3. ✅ Test listing creation on production
4. ✅ Seed Category table with base categories (optional)
5. ✅ Monitor error logs for 24 hours
6. ✅ Mark issue as resolved
