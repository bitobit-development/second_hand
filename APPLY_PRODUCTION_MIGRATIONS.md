# Apply Production Migrations to Neon Database

## Quick Instructions

### Step 1: Open Neon SQL Editor
1. Go to https://console.neon.tech/
2. Select your production project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Migration Script
1. Open the file: `prisma/migrations/combined_production_migration.sql`
2. Copy ALL the contents (it's a long file - make sure you get everything!)
3. Paste into the Neon SQL Editor
4. Click "Run" button

### Step 3: Verify Success
The script will:
- Create `Category` table
- Add `categoryId` column to `Listing` table ✅ (This fixes your error!)
- Create `AdminAuditLog` table
- Create `VerificationToken` and `PasswordResetToken` tables
- Add all necessary indexes and foreign keys

You should see: **"Query executed successfully"**

### Step 4: Test Production
1. Go to: https://second-hand-xi.vercel.app/listings/create
2. Try creating a listing
3. Should work without the `categoryId` error! ✅

## What This Script Does

The script is **safe to run multiple times** because:
- Uses `IF NOT EXISTS` clauses everywhere
- Checks for existing constraints before adding
- Won't duplicate data or cause errors

It applies 4 migrations:
1. ✅ Auth token tables
2. ✅ Admin audit system
3. ✅ Optimized indexes
4. ✅ **Category model + categoryId column** (fixes the error)

## If You Get Any Errors

Most common error:
- **"relation already exists"** - This is OK! It means that part already exists. The script will continue.

Any other errors, let me know and I'll help troubleshoot.

## Alternative: Command Line Method

If you prefer using command line:

```bash
# Get your production DATABASE_URL from Vercel
# Then run:
DATABASE_URL="your-production-url-here" npx prisma migrate deploy
```

This will apply the same migrations.

---

**Need help?** Let me know if you encounter any issues!
