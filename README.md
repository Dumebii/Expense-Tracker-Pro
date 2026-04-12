# Expense Tracker Pro

A modern, full-stack expense tracking application built with Next.js 15, Supabase, and Clerk authentication.

## Features

- 🔐 **Secure Authentication** - Clerk-powered sign-up and sign-in with webhook sync
- 💰 **Expense Tracking** - Add, edit, and delete expenses with categories and dates
- 📊 **Analytics Dashboard** - Visualize spending patterns with interactive charts
- 🏷️ **Category Management** - Organize expenses by category with visual breakdowns
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Real-time Sync** - Instant updates across all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Supabase account
- Clerk account

### Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd expense-tracker-pro
   npm install
   # or
   pnpm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Run the following SQL in the Supabase SQL Editor to create tables:

   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     clerk_id TEXT UNIQUE NOT NULL,
     email TEXT UNIQUE NOT NULL,
     name TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE expenses (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     amount DECIMAL(10, 2) NOT NULL,
     category TEXT NOT NULL,
     date DATE NOT NULL,
     description TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE categories (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     color TEXT,
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(user_id, name)
   );

   -- Enable RLS
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

   -- RLS Policies
   CREATE POLICY "Users can read their own data" ON users
     FOR SELECT USING (auth.uid()::text = clerk_id);

   CREATE POLICY "Users can read their own expenses" ON expenses
     FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

   CREATE POLICY "Users can insert their own expenses" ON expenses
     FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

   CREATE POLICY "Users can update their own expenses" ON expenses
     FOR UPDATE USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

   CREATE POLICY "Users can delete their own expenses" ON expenses
     FOR DELETE USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

   CREATE POLICY "Users can read their own categories" ON categories
     FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

   CREATE POLICY "Users can manage their own categories" ON categories
     FOR ALL USING (user_id = (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
   ```

3. **Set up Clerk**
   - Create a new application at https://clerk.com
   - Get your API keys from the Clerk dashboard
   - Configure the webhook endpoint to point to `https://yourdomain.com/api/webhooks/clerk`

4. **Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase and Clerk credentials:

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
   CLERK_SECRET_KEY=your_secret
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with Clerk provider
│   ├── page.tsx             # Landing page
│   ├── dashboard/
│   │   └── page.tsx         # Dashboard with expense tracking
│   ├── api/
│   │   ├── expenses/
│   │   │   ├── route.ts     # GET/POST expenses
│   │   │   └── [id]/route.ts # GET/PUT/DELETE single expense
│   │   └── webhooks/
│   │       └── clerk/route.ts # Clerk webhook for user sync
│   └── globals.css          # Global styles with design tokens
├── components/
│   ├── AddExpenseModal.tsx   # Modal for adding expenses
│   ├── ExpensesList.tsx      # List of expenses with edit/delete
│   └── ExpenseStats.tsx      # Analytics dashboard with charts
├── hooks/
│   └── useExpenses.ts        # Custom hook for expense management
├── lib/
│   └── supabase.ts           # Supabase client setup
└── middleware.ts            # Clerk authentication middleware
```

## Deployment on Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" and import your GitHub repository
   - Add environment variables in the Vercel project settings
   - Click "Deploy"

3. **Configure Clerk Webhook**
   - In Clerk dashboard, go to Webhooks
   - Add endpoint: `https://yourdomain.vercel.app/api/webhooks/clerk`
   - Subscribe to `user.created`, `user.updated`, `user.deleted` events

## Usage

1. **Sign Up** - Create a new account or sign in
2. **Add Expense** - Click "Add Expense" button to record a transaction
3. **View Dashboard** - See all expenses, totals, and spending breakdown
4. **Edit/Delete** - Manage your existing expenses
5. **Analytics** - View spending patterns by category

## API Endpoints

- `GET /api/expenses` - Get all expenses for the user
- `POST /api/expenses` - Create a new expense
- `GET /api/expenses/[id]` - Get a specific expense
- `PUT /api/expenses/[id]` - Update an expense
- `DELETE /api/expenses/[id]` - Delete an expense
- `POST /api/webhooks/clerk` - Clerk webhook endpoint

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Yes | Clerk webhook secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for personal or commercial purposes.
