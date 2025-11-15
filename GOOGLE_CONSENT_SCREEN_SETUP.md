# Google OAuth Consent Screen Setup Guide

## Error: "To create an OAuth client ID, you must first configure your consent screen"

This means you need to set up the OAuth consent screen before you can configure OAuth credentials.

## Step-by-Step Setup

### Step 1: Go to OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **OAuth consent screen**

### Step 2: Choose User Type

**Choose one:**

- **External** (Recommended for most apps)
  - Anyone with a Google account can use your app
  - Users will see a warning that the app isn't verified
  - You can verify it later if needed

- **Internal** (Only for Google Workspace)
  - Only users in your Google Workspace organization
  - Requires Google Workspace account

**For most cases, choose "External"** → Click **Create**

### Step 3: Fill in App Information

Fill in the required fields:

#### App Information
- **App name**: `MegaBox` (or your app name)
- **User support email**: Your email address
- **App logo**: (Optional) Upload your app logo
- **App domain**: 
  - Home page: `https://mega-box.vercel.app` (or your domain)
  - Application home page: `https://mega-box.vercel.app`
  - Privacy policy link: `https://mega-box.vercel.app/Privacy` (if you have one)
  - Terms of service link: (Optional)

#### Developer contact information
- **Email addresses**: Your email address

Click **Save and Continue**

### Step 4: Scopes (Optional)

- You can skip this step for now
- Click **Save and Continue**

### Step 5: Test Users (If External)

If you chose "External":
- Add test users (your email, team emails)
- These users can test the app before it's verified
- Click **Save and Continue**

### Step 6: Summary

- Review your settings
- Click **Back to Dashboard**

## After Consent Screen Setup

Once the consent screen is configured, you can now:

1. Go to **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add Authorized JavaScript origins
4. Add Authorized redirect URIs

## Quick Setup (Minimal Required Fields)

If you want to get started quickly, you only need:

1. **App name**: `MegaBox`
2. **User support email**: Your email
3. **Developer contact email**: Your email
4. **App domain** (Home page): `https://mega-box.vercel.app`

Everything else can be left as default or optional.

## Important Notes

- **External apps** will show "This app isn't verified" warning to users
- This is normal and users can still proceed
- You can verify your app later (requires verification process)
- For testing, external apps work fine without verification

## Next Steps

After setting up the consent screen:

1. ✅ Go back to **Credentials**
2. ✅ Edit your OAuth Client ID
3. ✅ Add Authorized JavaScript origins
4. ✅ Add Authorized redirect URIs
5. ✅ Test your Google sign-in

See `NEXT_STEPS.md` for the complete configuration guide.

