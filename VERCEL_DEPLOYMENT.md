# Vercel Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository with your code pushed
- Discord application credentials

## Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin SkyGuyDev
```

## Step 2: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Select the branch: `SkyGuyDev` (or `main` if you've merged)

## Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

### Required Environment Variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=<your-production-secret>
NEXTAUTH_URL=https://your-app-name.vercel.app

# Discord OAuth
AUTH_DISCORD_ID=<your-discord-client-id>
AUTH_DISCORD_SECRET=<your-discord-client-secret>

# Admin Discord IDs
ADMIN_DISCORD_IDS=281233291343036418,458513869384450070
```

### How to Set in Vercel:
1. Go to your project dashboard
2. Click "Settings"
3. Click "Environment Variables"
4. Add each variable with its value
5. Select all environments (Production, Preview, Development)

## Step 4: Update Discord OAuth Redirect URLs

1. Go to https://discord.com/developers/applications
2. Select your application
3. Go to OAuth2 settings
4. Add your Vercel URL to redirects:
   - `https://your-app-name.vercel.app/api/auth/callback/discord`
5. Save changes

## Step 5: Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Visit your deployment URL
4. Test Discord login

## Important Notes

### NEXTAUTH_SECRET
Generate a new secure secret for production:
```bash
openssl rand -base64 32
```
**Never use the same secret for development and production!**

### NEXTAUTH_URL
This MUST match your Vercel deployment URL exactly:
- Production: `https://your-app-name.vercel.app`
- Custom domain: `https://yourdomain.com`

### Discord Redirect URI
Make sure the redirect URI in Discord matches EXACTLY:
```
https://your-app-name.vercel.app/api/auth/callback/discord
```

## Troubleshooting

### "Callback URL mismatch" error
- Check NEXTAUTH_URL in Vercel environment variables
- Check Discord redirect URI matches exactly
- Redeploy after changing environment variables

### "Invalid client" error
- Verify AUTH_DISCORD_ID and AUTH_DISCORD_SECRET are correct
- Make sure no extra spaces in environment variables

### Admin access not working
- Verify ADMIN_DISCORD_IDS are correct
- Make sure IDs are comma-separated with no spaces
- Check that you're signing in with the correct Discord account

### Changes not reflecting
- Vercel caches builds
- After changing environment variables, trigger a new deployment
- Go to Deployments tab → Click "..." → "Redeploy"

## Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions
4. Update NEXTAUTH_URL to your custom domain
5. Update Discord redirect URI to use custom domain
6. Redeploy

## Database Integration (When Ready)

When you're ready to connect your database:

1. Add database connection string to Vercel environment variables
2. Update the codebase to use database instead of mock data
3. Run database migrations (if needed)
4. Test thoroughly in preview deployment first
5. Deploy to production

## Monitoring

- Check deployment logs in Vercel dashboard
- Monitor function execution and errors
- Set up error tracking (Sentry, etc.) for production

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Test locally with production environment variables first
