# Discord Authentication Setup Guide

## Overview
Your Next.js application now has Discord OAuth authentication integrated! This guide will help you complete the setup.

## Prerequisites
- Discord account
- Discord Developer account

## Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Give it a name (e.g., "MLE Fantasy")
4. Click **"Create"**

## Step 2: Configure OAuth2

1. In your Discord application, click **"OAuth2"** in the left sidebar
2. Click **"Add Redirect"** under "Redirects"
3. Add the following redirect URLs:
   - For local development: `http://localhost:3000/api/auth/callback/discord`
   - For production: `https://yourdomain.com/api/auth/callback/discord`
4. Click **"Save Changes"**

## Step 3: Get Your Credentials

1. In the **"OAuth2"** section, you'll find:
   - **CLIENT ID** - Copy this
   - **CLIENT SECRET** - Click "Reset Secret" if needed, then copy it
2. Keep these credentials safe and don't share them!

## Step 4: Get Discord User IDs for Admins

To get Discord User IDs:
1. Open Discord
2. Go to **User Settings** → **Advanced**
3. Enable **"Developer Mode"**
4. Right-click on a user's profile → **"Copy User ID"**
5. Do this for both admin users

## Step 5: Create Environment File

1. In your project root, create a file named `.env.local`
2. Copy the contents of `.env.example` into `.env.local`
3. Fill in the values:

```env
# Generate a random secret using: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-here

# Your application URL
NEXTAUTH_URL=http://localhost:3000

# From Discord Developer Portal
DISCORD_CLIENT_ID=your-discord-client-id-here
DISCORD_CLIENT_SECRET=your-discord-client-secret-here

# Discord User IDs for the 2 admins (comma-separated)
ADMIN_DISCORD_IDS=123456789012345678,987654321098765432
```

### Generating NEXTAUTH_SECRET

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Or use an online random string generator.

## Step 6: Test the Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. You should be redirected to the login page

4. Click **"Sign in with Discord"**

5. Authorize the application

6. You should be logged in!

## How It Works

### For Regular Users:
- Anyone with a Discord account can sign in
- They will have "user" role
- They can access all pages except `/admin` routes

### For Admins:
- Only Discord users whose IDs are in `ADMIN_DISCORD_IDS`
- They will have "admin" role
- They can access all pages including `/admin` routes

## Protected Routes

- **All routes** - Require authentication (except `/login`)
- **/admin/*** - Require admin role

## Testing Admin Access

1. Sign in with a Discord account whose ID is in `ADMIN_DISCORD_IDS`
2. Navigate to `/admin`
3. You should see the Admin Panel

## Testing Regular User Access

1. Sign in with a Discord account whose ID is NOT in `ADMIN_DISCORD_IDS`
2. Try to navigate to `/admin`
3. You should be redirected to the home page

## Troubleshooting

### "Invalid client_id" error
- Make sure `DISCORD_CLIENT_ID` in `.env.local` matches your Discord application's Client ID

### "Invalid redirect_uri" error
- Make sure you added the redirect URI in Discord Developer Portal
- Make sure it matches exactly: `http://localhost:3000/api/auth/callback/discord`

### "Not signed in" or redirects to login repeatedly
- Clear your browser cookies
- Make sure `NEXTAUTH_SECRET` is set
- Check the browser console for errors

### Admin panel shows "Access Denied"
- Make sure your Discord User ID is in `ADMIN_DISCORD_IDS`
- Make sure the IDs are comma-separated with no spaces
- Sign out and sign back in to refresh your session

## Production Deployment

When deploying to production:

1. Update `NEXTAUTH_URL` to your production domain
2. Add production redirect URI to Discord application
3. Make sure all environment variables are set in your hosting platform
4. Never commit `.env.local` to git (it's already in `.gitignore`)

## Security Notes

- Never share your `DISCORD_CLIENT_SECRET` or `NEXTAUTH_SECRET`
- Never commit `.env.local` to version control
- Use different Discord applications for development and production
- Rotate secrets periodically

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal/server logs
3. Verify all environment variables are set correctly
4. Make sure you're using the correct Discord User IDs
