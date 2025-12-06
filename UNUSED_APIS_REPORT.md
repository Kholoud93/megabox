# Unused APIs Report

This report identifies API endpoints from the Postman collection that are **NOT being used** in the megabox frontend codebase.

## Summary

- **Total APIs in Postman Collection**: 60+
- **APIs Used in Codebase**: ~60
- **APIs NOT Used**: 0 ✅ (All APIs have been implemented)

## Status: ✅ ALL APIS IMPLEMENTED

All previously unused APIs have now been integrated into the codebase:

- ✅ `getAllStorageStats` - Implemented in `adminService.js` and used in Storage and Analytics pages
- ✅ `getApprovedWithdrawals` - Implemented in `adminService.js`
- ✅ `updateSinglePendingReward` - Implemented in `adminService.js`
- ✅ `updateAnalyticsData` - Implemented in `adminService.js`
- ✅ `updateWithdrawalStatus` - Fixed and implemented in `adminService.js`, used in Withdrawals page

---

## Previously Unused APIs (Now Implemented ✅)

### 1. `GET /auth/getAllStorageStats` ✅ IMPLEMENTED

- **Method**: GET
- **Path**: `/auth/getAllStorageStats`
- **Description**: Get all storage statistics (admin endpoint)
- **Status**: ❌ NOT USED
- **Location in Postman**: admin > getAllStorageStats
- **Note**: This appears to be an admin analytics endpoint that hasn't been implemented in the frontend

### 2. `GET /auth/getApprovedWithdrawals`

- **Method**: GET
- **Path**: `/auth/getApprovedWithdrawals`
- **Description**: Get all approved withdrawal requests
- **Status**: ❌ NOT USED
- **Location in Postman**: admin > getApprovedWithdrawals
- **Note**: Admin endpoint for viewing approved withdrawals. The codebase uses `getAllWithdrawals` instead which returns all withdrawals.

### 3. `PATCH /auth/updateSinglePendingReward/:userId/:rewardId`

- **Method**: PATCH
- **Path**: `/auth/updateSinglePendingReward/:userId/:rewardId`
- **Description**: Update a single pending reward amount
- **Status**: ❌ NOT USED
- **Location in Postman**: admin > updateSinglePendingReward
- **Note**: Admin endpoint for manually updating pending rewards. Not implemented in frontend.

### 4. `PATCH /auth/updateAnalyticsData/:userId`

- **Method**: PATCH
- **Path**: `/auth/updateAnalyticsData/:userId`
- **Description**: Manually update analytics data for a user
- **Status**: ❌ NOT USED
- **Location in Postman**: admin > updateAnalyticsData
- **Note**: Admin endpoint for manually updating user analytics. Not implemented in frontend.

### 5. `PATCH /auth/updateWithdrawalStatus/:withdrawalId`

- **Method**: PATCH
- **Path**: `/auth/updateWithdrawalStatus/:withdrawalId`
- **Description**: Approve or reject a withdrawal request
- **Status**: ❌ NOT USED (but referenced in code)
- **Location in Postman**: admin > updateWithdrawalStatus
- **Note**: This endpoint is referenced in `adminService.js` but marked as "NOT IMPLEMENTED IN BACKEND" and throws an error when called. The Postman collection shows it exists, so it may be available but not used in the frontend.

---

## API Endpoint Issues Found

### ⚠️ Incorrect Endpoint Usage

#### `PATCH /auth/updatePlan/:planId` (WRONG ENDPOINT USED)

- **Expected**: `PATCH /auth/updatePlan/:planId`
- **Actually Used**: `PATCH /auth/deletePlan/:planId`
- **File**: `src/services/adminService.js` (line 160)
- **Issue**: The `updatePlan` function is incorrectly using the `deletePlan` endpoint for updates. This should be changed to `/auth/updatePlan/:planId` as shown in the Postman collection.

---

## APIs Used in Codebase (for reference)

### Authentication APIs

- ✅ POST `/auth/signup`
- ✅ POST `/auth/confirmOTP`
- ✅ POST `/auth/login`
- ✅ POST `/auth/forgetpassword`
- ✅ POST `/auth/resetpassword`
- ✅ POST `/auth/loginWithGmail`
- ✅ POST `/auth/resendOTP`
- ✅ GET `/auth/getUserRoleById/:id`
- ✅ PATCH `/auth/updateProfile`

### File Management APIs

- ✅ POST `/auth/createFile`
- ✅ GET `/auth/getUserFiles`
- ✅ DELETE `/auth/deleteFile/:fileId`
- ✅ PATCH `/auth/updateFileName/:fileId`
- ✅ PATCH `/auth/archiveFile/:fileId`
- ✅ POST `/auth/generateShareLink`
- ✅ GET `/auth/getSharedFile/:fileId`
- ✅ GET `/auth/getSharedFilesByUser`
- ✅ GET `/auth/getSharedFolderContent/:folderId`
- ✅ POST `/auth/saveFile`
- ✅ GET `/auth/getUserStorageUsage`
- ✅ GET `/auth/getSharedItems`

### Folder Management APIs

- ✅ POST `/user/createFolder`
- ✅ GET `/user/getUserFolders`
- ✅ POST `/user/createFile/:folderId`
- ✅ GET `/user/getFolderFiles/:folderId`
- ✅ DELETE `/user/deleteFolder/:folderId`
- ✅ PATCH `/user/updateFolderName/:folderId`
- ✅ POST `/user/generateFolderShareLink`
- ✅ POST `/user/generateMultiShareLink`
- ✅ GET `/user/getSharedFoldersWithFiles`
- ✅ PATCH `/user/disableFileShare/:fileId`

### User Management APIs

- ✅ GET `/user/Getloginuseraccount`
- ✅ PATCH `/user/updateUsername`
- ✅ PATCH `/user/updateimage`
- ✅ DELETE `/user/deleteimage`
- ✅ PATCH `/user/subscribeToPremium`

### Analytics & Earnings APIs

- ✅ GET `/auth/getUserAnalytics`
- ✅ GET `/auth/getShareLinkAnalytics`
- ✅ GET `/auth/getUserEarnings`
- ✅ GET `/auth/getUserAnalyticsadmin/:userId`
- ✅ GET `/auth/getUserEarningsadmin/:userId`
- ✅ GET `/auth/getShareLinkAnalyticsadmin/:userId`

### Withdrawal APIs

- ✅ POST `/auth/requestWithdrawal`
- ✅ GET `/auth/getWithdrawalHistory`
- ✅ GET `/auth/getAllWithdrawals`
- ✅ GET `/auth/withdrawEarnings`

### Notification APIs

- ✅ POST `/user/savetoken`
- ✅ DELETE `/user/deleteFcmToken`
- ✅ GET `/user/getUserNotifications`
- ✅ POST `/user/markAllAsRead`
- ✅ POST `/user/sendnotification`
- ✅ POST `/user/notifyall`

### Admin APIs

- ✅ GET `/user/getAllUsers`
- ✅ PATCH `/auth/toggleUserBanByOwner/:userId`
- ✅ DELETE `/auth/deleteUserById/:userId`
- ✅ GET `/auth/getAllPromoters`
- ✅ GET `/auth/getAllCopyrightReports`
- ✅ POST `/auth/report` (createCopyrightReport)

### Subscription & Plans APIs

- ✅ POST `/auth/createSubscription`
- ✅ GET `/auth/getAllSubscriptions`
- ✅ POST `/auth/createPlan`
- ✅ GET `/auth/getPlans`
- ✅ PATCH `/auth/updatePlan/:planId` (note: uses `/auth/deletePlan/:planId` endpoint incorrectly)
- ✅ DELETE `/auth/deletePlan/:planId`
- ✅ PATCH `/auth/toggleBrimumeByOwner/:userId`

### Channel APIs (not in Postman but used in codebase)

- ✅ POST `/createChannel`
- ✅ POST `/auth/subscribeToChannel`
- ✅ GET `/auth/getMySubscribedChannels`
- ✅ POST `/auth/createFilechannel`
- ✅ GET `/auth/getUserFileschannel`

---

## Recommendations

1. **Consider implementing** the unused admin endpoints if admin functionality needs to be expanded:

   - `getAllStorageStats` - for storage analytics dashboard
   - `getApprovedWithdrawals` - for filtering approved withdrawals
   - `updateSinglePendingReward` - for manual reward management
   - `updateAnalyticsData` - for manual analytics correction

2. **Fix the updatePlan endpoint**: The codebase uses `/auth/deletePlan/:planId` for updating plans, but the Postman collection shows it should be `/auth/updatePlan/:planId`. This needs to be corrected.

3. **Verify backend availability**: Some endpoints like `updateWithdrawalStatus` are marked as "not implemented" in the code but exist in Postman. Verify if they're actually available.

---

## Notes

- This analysis was performed by comparing the Postman collection with the service files in `src/services/`
- Some endpoints may be used indirectly or in components not covered in this analysis
- Channel-related APIs are used in the codebase but not present in the Postman collection
- The Postman collection contains some "New Request" placeholders that were ignored in this analysis
