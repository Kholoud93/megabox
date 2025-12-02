# Unused APIs Analysis

Based on the Postman collection comparison with the frontend codebase, here are the APIs that are **NOT being used** in the frontend:

## Auth Endpoints (Not Used)

1. **POST `/auth/createSubscription`** - Create subscription (admin)

   - Postman: Line 2082-2135
   - Method: POST
   - Body: FormData (invoice file, phone, subscriberName, durationDays, planName)
   - Status: ❌ Not used in frontend

2. **GET `/auth/getAllSubscriptions`** - Get all subscriptions (admin)

   - Postman: Line 2138-2167
   - Method: GET
   - Status: ❌ Not used in frontend

3. **POST `/auth/createPlan`** - Create subscription plan (admin)

   - Postman: Line 2170-2202
   - Method: POST
   - Body: JSON { days, price, name }
   - Status: ❌ Not used in frontend

4. **GET `/auth/getPlans`** - Get all subscription plans

   - Postman: Line 2205-2234
   - Method: GET
   - Status: ❌ Not used in frontend

5. **DELETE `/auth/deletePlan/:planId`** - Delete subscription plan (admin)

   - Postman: Line 2237-2270
   - Method: DELETE
   - Status: ❌ Not used in frontend

6. **PATCH `/auth/deletePlan/:planId`** - Update subscription plan (admin)

   - Postman: Line 2273-2306
   - Method: PATCH
   - Body: JSON { days, price, name }
   - Note: ⚠️ URL says "deletePlan" but method is PATCH (likely should be `/auth/updatePlan/:planId`)
   - Status: ❌ Not used in frontend

7. **PATCH `/auth/toggleBrimumeByOwner/:userId`** - Toggle premium subscription for user (admin)
   - Postman: Line 2046-2079
   - Method: PATCH
   - Body: JSON { activate: boolean, durationDays?: number }
   - Status: ❌ Not used in frontend

## Additional Notes

### APIs Used in Frontend but with Different Paths:

- **POST `/createChannel`** - Used in frontend (channelService.js) but Postman doesn't have this exact endpoint
- **POST `/user/generateMultiShareLink`** - Used in frontend (userService.js) but NOT in Postman collection
- **GET `/auth/getSharedItems`** - Used in frontend (userService.js) but NOT in Postman collection
- **PATCH `/user/archiveFolder/:folderId`** - Used in frontend (userService.js) but NOT in Postman collection
- **PATCH `/user/updateFolderName/:folderId`** - Used in frontend (userService.js) but NOT in Postman collection
- **PATCH `/auth/archiveFile/:fileId`** - Used in frontend (fileService.js) but NOT in Postman collection
- **DELETE `/user/deleteimage`** - Used in frontend (userService.js) but NOT in Postman collection

### APIs in Postman but Implementation Status Unknown:

- **POST `/auth/report`** (createCopyrightReport) - Present in Postman (line 788-887) and used in Feedback.jsx, so ✅ USED

## Summary

**Total unused APIs from Postman collection: 7**

All unused APIs are related to **subscription/plan management** and **premium user management**, which suggests these features may be:

1. Admin-only features not yet implemented in the frontend
2. Planned features for future implementation
3. Features that are managed through a different interface (e.g., direct database/admin panel)

## Recommendation

Consider implementing these endpoints in the frontend if subscription management is a required feature, or remove them from the Postman collection if they're no longer needed.
