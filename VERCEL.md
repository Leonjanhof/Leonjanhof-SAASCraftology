# Vercel Deployment Guide

This guide will help you deploy your React application to Vercel and configure Supabase authentication correctly.

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

## Getting Your Vercel Deployment URLs

After deployment completes, you'll need your Vercel URLs for Supabase configuration:

1. **Production URL**: Find this in your Vercel dashboard after deployment completes
   - Go to your project in the Vercel dashboard
   - The production URL is displayed prominently (e.g., `https://your-project.vercel.app`)
   - You can also click on "Domains" in the project settings to see all associated domains

2. **Preview URLs**: For branch deployments and PRs
   - These are automatically generated when you create a PR or push to a non-production branch
   - Format: `https://your-project-git-branch-username.vercel.app`
   - Find these in the "Deployments" tab of your Vercel project

3. **Custom Domain**: If you've added a custom domain
   - This will be listed under "Domains" in your project settings
   - Example: `https://yourdomain.com`

## Configuring Supabase Authentication for Production

Once you have your Vercel URL, you need to update your Supabase authentication settings:

1. Go to your [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Go to Authentication → URL Configuration
4. Update the following settings:

   - **Site URL**: Set this to your Vercel production URL (e.g., `https://your-project.vercel.app`)
   - **Redirect URLs**: Add the following URLs (replace with your actual Vercel domain):
     ```
     https://your-project.vercel.app
     https://your-project.vercel.app/auth/callback
     https://your-project.vercel.app/login
     https://your-project.vercel.app/dashboard
     ```

5. Click "Save" to apply the changes

### OAuth Provider Configuration (Discord)

If you're using Discord OAuth:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to OAuth2 → General
4. Update the Redirects section:
   - Add `https://your-project.vercel.app/auth/callback` as a redirect URL
   - If you're using a custom domain, also add `https://yourdomain.com/auth/callback`

5. Save changes

### Testing Authentication Flow

After updating all URLs:

1. Open your deployed Vercel application
2. Try to sign in with Discord
3. Verify you're properly redirected back to your application after authentication
4. Check that you land on the dashboard page, not a Supabase error page

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

## Domain Changes

If you later add a custom domain to your Vercel project:

1. Update all Supabase URL configurations with the new domain
2. Update all OAuth provider redirect URLs
3. Update any hardcoded URLs in your application code
4. Update Stripe webhook endpoints

## Verification

After deployment:

1. Check if the application loads correctly
2. Verify Supabase connection works
3. Test authentication with all providers (especially Discord)
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

3. **OAuth Redirect Problems**
   - Verify all redirect URLs are correctly set in Supabase
   - Check that the Site URL matches your Vercel domain exactly
   - Ensure OAuth provider (Discord) has the correct callback URL
   - Check browser console for any CORS errors

4. **404 on Page Refresh**
   - Add a `vercel.json` file with rewrites configuration:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/" }]
   }
   ```

### Deployment Preview

Vercel automatically creates preview deployments for pull requests. If you need to test authentication in these previews:

1. Temporarily add the preview URL to your Supabase redirect URLs
2. Test the authentication flow
3. Remove the preview URL when done testing

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
- [Discord OAuth Documentation](https://discord.com/developers/docs/topics/oauth2)
