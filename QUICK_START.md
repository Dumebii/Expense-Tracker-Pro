# Ledger App - Quick Start Guide

## Prerequisites
- Node.js 18+
- Supabase account
- Clerk account
- Git (for cloning)

## 1. Database Setup (REQUIRED FIRST)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Wait for it to initialize

### Step 2: Run Database Migration
1. In Supabase, go to **SQL Editor**
2. Create a new query
3. Copy-paste the entire contents of `/scripts/01-create-schema.sql`
4. Run the query
5. Wait for completion (should see no errors)

## 2. Environment Setup

### Step 1: Get Your Credentials

**From Supabase:**
1. Project Settings → API
2. Copy:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key)

**From Clerk:**
1. Dashboard → API Keys
2. Copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. Dashboard → Webhooks
4. Create webhook for `user.created`, `user.updated`, `user.deleted`
5. Copy `CLERK_WEBHOOK_SECRET`

### Step 2: Create .env.local

Create file: `.env.local` in project root

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

## 3. Local Development

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Navigate to: http://localhost:3000

## 4. Test the App

### Sign Up
1. Click "Get Started" on landing page
2. Enter your email and password
3. Complete Clerk registration

### Add Income
1. Go to "Money In"
2. Click "Add Income"
3. Fill in details (title, amount, category, date, frequency)
4. Submit

### Add Expense
1. Go to "Money Out"
2. Click "Add Expense"
3. Fill in details
4. Submit

### View Dashboard
1. Go to "Overview"
2. See stats for Income, Expenses, Net P&L, Annualized
3. View recent transactions

### View Analytics
1. Go to "Loss / Profit"
2. See charts and breakdowns

### Account Statement
1. Go to "Account Statement"
2. Select date range
3. Click "Generate"

### Settings
1. Go to "Settings"
2. Update preferences (currency, receipt email)
3. Save changes

## 5. Production Deployment

### Deploy to Vercel

```bash
# Push to GitHub (if using git)
git add .
git commit -m "Ledger app ready for production"
git push origin main

# Or connect repo directly on Vercel
```

1. Go to https://vercel.com
2. Import your GitHub repository
3. Set environment variables (from .env.local)
4. Deploy

## Troubleshooting

### "Unauthorized" error
- Check `user-id` header in API calls
- Verify Clerk is properly authenticated
- Check Supabase RLS policies

### Data not persisting
- Verify Supabase credentials in .env.local
- Check database tables exist (run SQL again)
- Check browser console for API errors

### Clerk sign in not working
- Verify Clerk webhook is configured
- Check CLERK_WEBHOOK_SECRET is correct
- Ensure users table exists in Supabase

### "user_id does not exist"
- Run the SQL migration script again
- Check Supabase tables are created
- Verify RLS policies are enabled

## File Structure Reference

```
src/
├── app/
│   ├── dashboard/          # All dashboard pages
│   ├── api/               # API endpoints
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
├── lib/                   # Utilities (Supabase, etc)
└── middleware.ts          # Auth middleware
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm start                # Start production server

# Code quality
npm run lint             # Run ESLint
npm run typecheck        # Type check

# Database
# See /scripts/01-create-schema.sql
```

## Support

For issues:
1. Check console errors (F12 → Console)
2. Check Supabase logs
3. Check Clerk dashboard
4. Review the code comments in files

## Next Steps

1. ✅ Set up database
2. ✅ Configure environment variables
3. ✅ Install dependencies
4. ✅ Run dev server
5. ✅ Test features
6. ✅ Deploy to Vercel
