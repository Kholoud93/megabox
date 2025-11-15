# Quick Google OAuth Setup for megabox-lake.vercel.app

## ✅ Minimal Configuration (What You Actually Need)

### Step 1: Go to Google Cloud Console
- https://console.cloud.google.com/
- APIs & Services → Credentials
- Find/edit your OAuth Client: `778654516378-rd4nn17avbomcglf6cb4fjegs619jejs`

### Step 2: Add Authorized JavaScript Origins
Add these (no trailing slash):
```
https://megabox-lake.vercel.app
http://localhost:4200
```

### Step 3: Add Authorized Redirect URIs
Add these:
```
https://megabox-lake.vercel.app
https://megabox-lake.vercel.app/login
https://megabox-lake.vercel.app/signup
http://localhost:4200
http://localhost:4200/login
http://localhost:4200/signup
```

### Step 4: Save & Wait
- Click **Save**
- Wait 5-10 minutes

## ✅ That's It!

After 5-10 minutes, test it:
1. Go to https://megabox-lake.vercel.app/login
2. Click "Sign in with Google"
3. Should work! 🎉

## 📝 Why These URIs?

- **Root domain** (`/`) - For general redirects
- **`/login`** - Where users sign in
- **`/signup`** - Where users sign up
- **localhost** - For local development

You don't need to add every possible path, just the ones where users can click the Google button.

