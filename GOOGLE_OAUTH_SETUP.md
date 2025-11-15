# Google OAuth Configuration Guide

## ✅ Simplified Implementation

The app now uses **direct Google OAuth redirect** (no library needed). You still need to configure Google Cloud Console **once**, but the frontend code is much simpler.

## Why You Still Need Google Cloud Console

Unfortunately, **you cannot avoid Google Cloud Console** because:
- Google requires OAuth credentials to authenticate users
- This is a security requirement by Google
- However, you only need to configure it **once** and it works for all deployments

## Steps to Configure (One-Time Setup):

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID: `902607791526-lb6qtfclisk5puajdrbfve5ge45lfon9`
5. Click **Edit**

## Required Configuration:

### Authorized JavaScript origins:

Add these origins (without trailing slash):

- `https://megabox-lake.vercel.app`
- `https://mega-box.vercel.app`
- `http://localhost:4200` (for local development)

**Important**: Make sure to add ALL your Vercel deployment URLs (production, preview, etc.)

### Authorized redirect URIs:

Add these redirect URIs (for mobile redirect flow):

- `https://megabox-lake.vercel.app`
- `https://megabox-lake.vercel.app/`
- `https://megabox-lake.vercel.app/login`
- `https://megabox-lake.vercel.app/signup`
- `https://mega-box.vercel.app`
- `https://mega-box.vercel.app/`
- `https://mega-box.vercel.app/login`
- `https://mega-box.vercel.app/signup`
- `http://localhost:4200` (for local development)
- `http://localhost:4200/` (for local development)
- `http://localhost:4200/login` (for local development)
- `http://localhost:4200/signup` (for local development)

## Mobile-Specific Configuration:

For mobile devices, Google OAuth uses redirect flow. Make sure:

1. **All redirect URIs are added** - including paths like `/login` and `/signup`
2. **Cookie settings** - The app now uses `sameSite: 'Lax'` for better mobile compatibility
3. **Hash fragment handling** - The app now handles tokens in both query params and hash fragments

## Important Notes:

- **JavaScript origins** must NOT have a trailing slash
- **Redirect URIs** should include both with and without trailing slash, and specific paths
- Changes may take a few minutes to propagate (sometimes up to 10 minutes)
- Make sure you're editing the correct OAuth client ID
- For mobile, the redirect URI must match exactly what's configured in Google Cloud Console

## Troubleshooting Mobile Issues:

If Google signup/login doesn't work on mobile:

1. **Check redirect URIs**: Ensure your Vercel domain is added to redirect URIs
2. **Check JavaScript origins**: Ensure your Vercel domain is added to JavaScript origins
3. **Clear browser cache**: Mobile browsers cache OAuth settings aggressively
4. **Check console errors**: Look for `redirect_uri_mismatch` errors
5. **Verify domain**: Make sure you're using the correct Vercel deployment URL

## Current Error:

The error shows: `origin=https://megabox-lake.vercel.app`

This means you need to add `https://megabox-lake.vercel.app` to the **Authorized JavaScript origins** section.
