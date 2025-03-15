# Vercel Deployment Guide

This guide will help you deploy your React application to Vercel.

## Prerequisites

- A Vercel account
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Supabase project set up

## Environment Variables

Add the following environment variables in your Vercel project settings:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Note: These values can be found in your Supabase project settings under Project Settings > API

## Build Configuration

Vercel should automatically detect your Vite configuration, but ensure these settings are correct:

- **Framework Preset**: Vite
- **Build Command**: `npm run build` or `yarn build`
- **Output Directory**: `dist`
- **Install Command**: `npm install` or `yarn install`

## Deployment Steps

1. Connect your Git repository to Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. Configure project:
   - Select the repository
   - Vercel should automatically detect it as a Vite project
   - Add your environment variables
   - Click "Deploy"

3. Wait for the build to complete

## Stripe Webhook Configuration

After deploying to Vercel, you need to update your Stripe webhook endpoint:

1. Get your Vercel deployment URL (e.g., https://your-app.vercel.app)
2. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
3. Update the webhook endpoint URL to:
   ```
   https://[your-vercel-domain]/api/supabase-functions/payments-webhook
   ```
4. Keep the same webhook secret
5. Test the webhook using Stripe's test feature

## Verification

After deployment:

1. Check if the application loads correctly
2. Verify Supabase connection works
3. Test authentication if implemented
4. Check all API endpoints
5. Test Stripe webhook with a test event

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Supabase Connection Issues**
   - Verify environment variables are set correctly
   - Check if Supabase project is active
   - Ensure CORS settings in Supabase allow your Vercel domain

3. **404 on Page Refresh**
   - Add a `vercel.json` file with rewrites configuration:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/" }]
   }
   ```

### Deployment Preview

Vercel automatically creates preview deployments for pull requests. Use these to test changes before deploying to production.

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
