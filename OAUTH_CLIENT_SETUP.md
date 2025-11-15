# OAuth Client Setup - Important!

## ⚠️ What Happened

You downloaded a client secret file, but it's for an **"Installed app"** type. For a web application, you need a **"Web application"** type OAuth client.

## ✅ What You Need to Do

### Option 1: Use the New Client ID (Recommended)

I've updated the code to use your new client ID: `778654516378-rd4nn17avbomcglf6cb4fjegs619jejs`

**But you need to configure it properly:**

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/
   - APIs & Services → Credentials

2. **Find your OAuth Client**
   - Look for: `778654516378-rd4nn17avbomcglf6cb4fjegs619jejs`
   - Click **Edit**

3. **Change Application Type (if needed)**
   - Make sure it's set to **"Web application"** (not "Desktop app" or "Installed app")
   - If it's not, you may need to create a new one

4. **Add Authorized JavaScript Origins**
   Add these (without trailing slash):
   ```
   https://megabox-lake.vercel.app
   http://localhost:4200
   ```

5. **Add Authorized Redirect URIs**
   Add these (minimum required):
   ```
   https://megabox-lake.vercel.app
   https://megabox-lake.vercel.app/login
   https://megabox-lake.vercel.app/signup
   http://localhost:4200
   http://localhost:4200/login
   http://localhost:4200/signup
   ```
   
   **Note**: You can add more if needed, but these are the essential ones.

6. **Save Changes**

### Option 2: Create a New Web Application Client

If the current client is the wrong type, create a new one:

1. **Go to Credentials**
   - APIs & Services → Credentials
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**

2. **Select Application Type**
   - Choose **"Web application"** (NOT "Desktop app")

3. **Configure**
   - Name: `MegaBox Web Client`
   - Add Authorized JavaScript origins (see above)
   - Add Authorized redirect URIs (see above)

4. **Copy the Client ID**
   - Copy the new Client ID
   - Update it in the code or use environment variable

## 📝 Important Notes

- **Client Secret**: You DON'T need the client secret for web apps using implicit flow
- **Application Type**: Must be "Web application" for browser-based OAuth
- **Redirect URIs**: Must match exactly what you use in your code
- **Client ID**: I've updated the code to use your new client ID

## 🔄 After Configuration

1. Wait 5-10 minutes for changes to propagate
2. Test locally: `npm run dev`
3. Test on production after deploying

## 🆘 If It Still Doesn't Work

1. Make sure the OAuth client type is "Web application"
2. Verify all redirect URIs are added correctly
3. Check browser console for specific error messages
4. Make sure you waited 5-10 minutes after saving

