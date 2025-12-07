# 🚀 Quick Start - Supabase Setup

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: rms_gay (or your choice)
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
4. Click "Create new project" and wait ~2 minutes

## Step 2: Get Your Credentials

1. In your project, go to **Settings** (⚙️) → **API**
2. Copy these values:
   - **Project URL** → This is your `SUPABASE_URL`
   - **anon public** key → This is your `SUPABASE_ANON_KEY`

## Step 3: Set Up Environment Variables

### For `back/.env`:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
```

### For `qrback/.env`:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=development
APP_DOMAIN=localhost:3000
```

## Step 4: Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Run your migration files **in order**:

### For `back`:

```sql
-- Copy and paste content from back/migrations/001_init.sql
-- Click Run

-- Then copy and paste content from back/migrations/002_add_room_type_text.sql
-- Click Run
```

### For `qrback`:

```sql
-- Copy and paste content from qrback/migrations/001_init.sql
-- Click Run

-- Then run 002, 003, 004 in order
```

## Step 5: Enable Raw SQL (Important!)

Run the SQL from `supabase-rpc-setup.sql` in Supabase SQL Editor:

```sql
-- This enables the pool.query() compatibility wrapper
-- Copy entire content from supabase-rpc-setup.sql and run it
```

## Step 6: Run Your Apps

```bash
# Terminal 1 - Main Backend
cd back
bun run dev

# Terminal 2 - QR Backend
cd qrback
bun run dev
```

## ✅ That's it! Your apps should now connect to Supabase.

## Troubleshooting

### Error: "Missing Supabase credentials"

- Check that `.env` files exist in `back/` and `qrback/`
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly

### Error: "function exec_sql does not exist"

- Run the `supabase-rpc-setup.sql` in Supabase SQL Editor
- Make sure to grant permissions as shown in the SQL file

### Connection issues

- Verify your Supabase project is active (not paused)
- Check the URL format: `https://xxxxx.supabase.co` (no trailing slash)
- Ensure you're using the **anon/public** key, not the service_role key

## Next Steps

- ✅ Test your API endpoints
- 📚 Read `SUPABASE_MIGRATION.md` for detailed migration info
- 🔄 Consider migrating to Supabase's query builder for better performance
- 🔐 Set up Row Level Security policies in Supabase

Need help? Check the [Supabase Discord](https://discord.supabase.com)
