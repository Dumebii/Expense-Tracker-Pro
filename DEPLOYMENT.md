# Vercel Deployment Guide for Expense Tracker Pro

## Step 1: Push to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Initial commit: Expense Tracker Pro with Next.js, Supabase, and Clerk"
git push origin main
```

## Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Select "Import Git Repository"
4. Choose your GitHub repository containing this app
5. Click "Import"

## Step 3: Configure Environment Variables

In the Vercel dashboard, go to your project settings and add the following environment variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Configure Clerk Webhook

1. In your Clerk dashboard, go to **Webhooks**
2. Add a new endpoint with:
   - URL: `https://your-domain.vercel.app/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
3. Copy the webhook signing secret and add it to Vercel as `CLERK_WEBHOOK_SECRET`

## Step 5: Deploy

Once environment variables are set, Vercel will automatically deploy your app. You can monitor the deployment in the Vercel dashboard.

## Step 6: Configure Allowed Redirect URLs in Clerk

1. Go to your Clerk application settings
2. Under **Redirect URLs**, add:
   - `https://your-domain.vercel.app/sign-in/callback`
   - `https://your-domain.vercel.app/sign-up/callback`
   - `https://localhost:3000/sign-in/callback` (for local development)
   - `https://localhost:3000/sign-up/callback` (for local development)

## Verification

After deployment:

1. Visit your deployed URL (e.g., `https://your-domain.vercel.app`)
2. Click "Get Started" to create an account
3. Verify that:
   - Sign-up works smoothly
   - You're redirected to the dashboard
   - You can add, edit, and delete expenses
   - Data persists and syncs properly

## Troubleshooting

### "Missing environment variables" error
- Verify all env vars are added to Vercel project settings
- Redeploy after adding env vars
- Check that you're using the correct var names

### Clerk webhook not firing
- Verify the webhook URL is correct in Clerk dashboard
- Check Clerk webhook logs in the dashboard
- Ensure `CLERK_WEBHOOK_SECRET` is correctly set

### Supabase connection issues
- Verify RLS policies are enabled in Supabase
- Check that the user was created in the database via Clerk webhook
- Review Supabase logs for query errors

### "Row-level security violation"
- Ensure RLS policies were created correctly
- Verify user exists in the `users` table
- Check that the clerk_id matches between Clerk and Supabase

## Local Development

For local development with your deployed services:

1. Copy `.env.local.example` to `.env.local`
2. Add your Clerk and Supabase credentials
3. Run `npm run dev`
4. Visit `http://localhost:3000`

## Database Backups

To backup your Supabase database:

1. Go to your Supabase project
2. Click **Backups** in the sidebar
3. Set up automated backups or perform manual exports

## Monitoring

- **Vercel**: Monitor performance, build times, and deployment logs
- **Clerk**: Track authentication events and webhooks
- **Supabase**: Monitor database queries, storage, and user activity

## Next Steps

- Configure a custom domain in Vercel
- Set up Analytics in Clerk
- Implement automated backups
- Consider enabling Supabase database encryption
- Add error tracking with Sentry or similar service

For more details, refer to the main [README.md](./README.md).
