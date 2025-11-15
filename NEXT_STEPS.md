# Next Steps - Google OAuth Setup

## ✅ What's Already Done

- ✅ Simplified Google OAuth code (no library needed)
- ✅ Removed `GoogleOAuthProvider` from main.jsx
- ✅ Direct redirect implementation
- ✅ Mobile-friendly redirect handling

## 📋 What You Need to Do Now

### Step 1: Configure OAuth Consent Screen (Required First)

**⚠️ IMPORTANT: You must set up the OAuth consent screen FIRST before configuring credentials!**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project

2. **Set up OAuth Consent Screen**
   - Go to **APIs & Services** → **OAuth consent screen**
   - Choose **External** (recommended) or **Internal** (only for Google Workspace)
   - Fill in required fields:
     - **App name**: `MegaBox`
     - **User support email**: Your email
     - **Developer contact email**: Your email
     - **App domain**: `https://mega-box.vercel.app`
   - Click **Save and Continue** through all steps
   - See `GOOGLE_CONSENT_SCREEN_SETUP.md` for detailed instructions

### Step 2: Configure OAuth Credentials

After the consent screen is set up:

1. **Navigate to OAuth Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Find your OAuth 2.0 Client ID: `902607791526-lb6qtfclisk5puajdrbfve5ge45lfon9`
   - Click **Edit**

3. **Add Authorized JavaScript Origins**
   Add these (without trailing slash):
   ```
   https://megabox-lake.vercel.app
   https://mega-box.vercel.app
   http://localhost:4200
   ```

4. **Add Authorized Redirect URIs**
   Add ALL of these:
   ```
   https://megabox-lake.vercel.app
   https://megabox-lake.vercel.app/
   https://megabox-lake.vercel.app/login
   https://megabox-lake.vercel.app/signup
   https://mega-box.vercel.app
   https://mega-box.vercel.app/
   https://mega-box.vercel.app/login
   https://mega-box.vercel.app/signup
   http://localhost:4200
   http://localhost:4200/
   http://localhost:4200/login
   http://localhost:4200/signup
   ```

5. **Save Changes**
   - Click **Save**
   - Wait 5-10 minutes for changes to propagate

### Step 3: Test Locally (Optional but Recommended)

1. **Start your dev server**
   ```bash
   npm run dev
   ```

2. **Test Google Sign-in**
   - Go to http://localhost:4200/login or http://localhost:4200/signup
   - Click "Sign in with Google" or "Sign up with Google"
   - Should redirect to Google, then back to your app

3. **Check for errors**
   - Open browser console (F12)
   - Look for any OAuth errors
   - If you see `redirect_uri_mismatch`, make sure you added the redirect URIs correctly

### Step 4: Deploy to Vercel

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Simplify Google OAuth - remove library dependency"
   git push
   ```

2. **Vercel will auto-deploy** (if you have auto-deploy enabled)

3. **Or deploy manually**
   ```bash
   vercel --prod
   ```

### Step 5: Test on Production

1. **Test on your Vercel URL**
   - Go to your production URL (e.g., `https://mega-box.vercel.app`)
   - Try Google sign-in on desktop
   - Try Google sign-in on mobile device

2. **Verify it works**
   - Should redirect to Google
   - After authentication, should redirect back
   - Should log you in successfully

### Step 6: Optional Cleanup

If you want to remove the unused package:

```bash
npm uninstall @react-oauth/google
```

Then commit:
```bash
git add package.json package-lock.json
git commit -m "Remove unused @react-oauth/google package"
git push
```

## 🐛 Troubleshooting

### Issue: "redirect_uri_mismatch" error

**Solution:**
- Make sure you added ALL redirect URIs in Google Cloud Console
- Include both with and without trailing slash
- Include specific paths like `/login` and `/signup`
- Wait 5-10 minutes after saving

### Issue: Not redirecting on mobile

**Solution:**
- Make sure redirect URIs are configured correctly
- Clear browser cache on mobile
- Try in incognito/private mode

### Issue: Works on desktop but not mobile

**Solution:**
- This is usually a redirect URI configuration issue
- Double-check all redirect URIs are added
- Make sure you're using the correct Vercel domain

## ✅ Checklist

- [ ] **Set up OAuth Consent Screen** (Required first!)
- [ ] Configured Google Cloud Console (Authorized JavaScript Origins)
- [ ] Configured Google Cloud Console (Authorized Redirect URIs)
- [ ] Waited 5-10 minutes for changes to propagate
- [ ] Tested locally (optional)
- [ ] Deployed to Vercel
- [ ] Tested on production (desktop)
- [ ] Tested on production (mobile)
- [ ] Removed unused package (optional)

## 📝 Notes

- **Google Cloud Console setup is REQUIRED** - You cannot skip this step
- Changes in Google Cloud Console can take 5-10 minutes to propagate
- Make sure to add ALL your Vercel deployment URLs (production + preview)
- The code is now simpler and doesn't require the library

## 🆘 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify Google Cloud Console settings
3. Make sure redirect URIs match exactly
4. Wait a few minutes after making changes

