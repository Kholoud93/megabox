# Backend OAuth Troubleshooting

## Error: "Invalid account. Please login using your email/password"

This error is coming from your **backend**, not the frontend. The frontend is correctly sending the Google access token, but the backend is rejecting it.

## What's Happening

1. ✅ Frontend gets Google access token
2. ✅ Frontend sends token to `/auth/loginWithGmail`
3. ❌ Backend rejects the token with error

## Possible Backend Issues

### Issue 1: Backend Can't Verify Google Token

The backend needs to verify the Google access token with Google's API. Check if:

- Backend has Google OAuth Client ID configured
- Backend can make requests to Google's token info endpoint
- Backend is using the correct Google Client ID

**Backend should verify token like this:**
```javascript
// Backend needs to verify token with Google
const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
const tokenInfo = await response.json();
```

### Issue 2: User Doesn't Exist in Database

The backend might be checking if a user exists with that Google account. If the user hasn't signed up with Google before, it might reject them.

**Solution**: The backend should:
- Check if user exists with that Google email
- If not, create a new user account
- Then log them in

### Issue 3: Backend Using Wrong Google Client ID

If your backend has a hardcoded Google Client ID that's different from the frontend, it won't be able to verify tokens.

**Check**: Make sure backend uses the same Google Client ID:
- Frontend: `778654516378-r2qfdvpph3qnhe618e5dj4mju8i9ip49`
- Backend should use the same one

### Issue 4: Token Format Issue

The backend might be expecting a different format. Check what the backend expects vs what it's receiving.

## What to Check in Backend

### 1. Check Backend Logs

Look at your backend logs (Railway/wherever it's hosted) to see:
- What error is being thrown
- What data is being received
- What the backend is trying to do

### 2. Check Backend Code

Look at: `src/modules/auth/service/authontecation.service.js:251`

This is where the error is being thrown. Check:
- How it's verifying the Google token
- What conditions cause it to throw "Invalid account"
- If it's checking for user existence

### 3. Test with Postman

Try the same request from Postman to see if it works:
- Use the same access token format
- Check if Postman request works but frontend doesn't

### 4. Check Backend Environment Variables

Make sure backend has:
- Google OAuth Client ID configured
- Any required Google API keys
- Correct API endpoints

## Quick Fixes to Try

### Option 1: Check if User Needs to Sign Up First

Maybe users need to sign up with Google first before they can log in. Try:
1. Create a test account with email/password
2. Then try Google login with the same email

### Option 2: Update Backend Google Client ID

If backend has old client ID, update it to:
```
778654516378-r2qfdvpph3qnhe618e5dj4mju8i9ip49.apps.googleusercontent.com
```

### Option 3: Check Backend Token Verification

Make sure backend is correctly verifying the token with Google's API.

## What to Tell Your Backend Developer

Share this information:

1. **Error**: "Invalid account. Please login using your email/password"
2. **Location**: `authontecation.service.js:251`
3. **Request**: POST `/auth/loginWithGmail` with `{ "accessToken": "..." }`
4. **Expected**: Backend should verify token and create/login user
5. **Current**: Backend is rejecting valid Google tokens

## Frontend is Working Correctly ✅

The frontend is:
- ✅ Getting Google access token
- ✅ Sending it to backend correctly
- ✅ Format matches Postman collection

The issue is in the **backend logic**.

