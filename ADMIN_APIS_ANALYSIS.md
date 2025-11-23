# Admin APIs Analysis

## ✅ APIs Currently in Backend (Used in UI)

### User Management
1. ✅ **GET** `/user/getAllUsers` - Used in `Users.jsx` and `Analasys.jsx`
2. ✅ **PATCH** `/auth/toggleUserBanByOwner/:userId` - Used in `Users.jsx`
3. ✅ **DELETE** `/auth/deleteUserById/:userId` - Used in `Users.jsx`

### Notifications
4. ✅ **POST** `/user/sendnotification` - Used in `Users.jsx`
5. ✅ **POST** `/user/notifyall` - Used in `Users.jsx`

### Analytics (Admin)
6. ✅ **GET** `/auth/getUserAnalyticsadmin/:userId` - Used in `PromotersEarning.jsx`
7. ✅ **GET** `/auth/getUserEarningsadmin/:userId` - Used in `PromotersEarning.jsx`
8. ✅ **GET** `/auth/getShareLinkAnalyticsadmin/:userId` - Used in `PromotersEarning.jsx`

### Withdrawals
9. ✅ **GET** `/auth/getAllWithdrawals` - Used in `Analasys.jsx` and `Withdrawals.jsx`

### Reports
10. ✅ **GET** `/auth/getAllCopyrightReports` - Used in `Reports.jsx`

### Promoters
11. ✅ **GET** `/auth/getAllPromoters` - Used in `Analasys.jsx` and `Promoters.jsx` (via `promoterService`)

---

## ❌ APIs Removed (NOT in Backend Documentation)

The following APIs have been **removed** from `adminService.js` because they are **NOT documented** in the backend API documentation:

### User Management (Missing)
1. ❌ **GET** `/auth/searchUser/:searchTerm` 
   - **Used in**: `Users.jsx` (search user functionality)
   - **Status**: REMOVED - Needs backend implementation

2. ❌ **PATCH** `/auth/toggleUserPremium/:userId`
   - **Used in**: `Users.jsx` (toggle premium status)
   - **Status**: REMOVED - Needs backend implementation

3. ❌ **PATCH** `/auth/setUserPremium/:userId`
   - **Used in**: `Users.jsx` (set premium with expiration date)
   - **Status**: REMOVED - Needs backend implementation

### Promoters (Missing)
4. ❌ **DELETE** `/auth/deletePromoter/:promoterId`
   - **Used in**: `Promoters.jsx` (delete promoter functionality)
   - **Status**: REMOVED - Needs backend implementation

### Reports (Missing)
5. ❌ **DELETE** `/auth/deleteCopyrightReport/:complaintId`
   - **Used in**: `Reports.jsx` / `ReportCard.jsx` (delete complaint functionality)
   - **Status**: REMOVED - Needs backend implementation

### Withdrawals (Missing)
6. ❌ **PATCH** `/auth/updateWithdrawalStatus/:withdrawalId`
   - **Used in**: `Withdrawals.jsx` (approve/reject withdrawal functionality)
   - **Status**: REMOVED - Needs backend implementation

### Admin Dashboard Pages (Missing - Using Mock Data)
7. ❌ **GET** `/auth/getAllDownloadsViews`
   - **Used in**: `DownloadsViews.jsx`
   - **Status**: REMOVED - UI has mock data fallback

8. ❌ **GET** `/auth/getAllPayments`
   - **Used in**: `Payments.jsx`
   - **Status**: REMOVED - UI has mock data fallback

9. ❌ **GET** `/auth/getAllStorage`
   - **Used in**: `Storage.jsx`
   - **Status**: REMOVED - UI has mock data fallback

10. ❌ **GET** `/auth/getAllSubscriptions`
    - **Used in**: `Subscriptions.jsx`
    - **Status**: REMOVED - UI has mock data fallback

---

## 📋 APIs You Still Need from Backend

### High Priority (UI Functionality Broken Without These)

1. **PATCH** `/auth/updateWithdrawalStatus/:withdrawalId`
   - **Purpose**: Approve or reject withdrawal requests
   - **Body**: `{ status: 'approved' | 'rejected' }`
   - **Used in**: `/Owner/Withdrawals` page
   - **Impact**: ⚠️ **CRITICAL** - Withdrawals page cannot approve/reject requests

2. **DELETE** `/auth/deletePromoter/:promoterId`
   - **Purpose**: Delete a promoter
   - **Used in**: `/Owner/AllPromoters` page
   - **Impact**: ⚠️ **HIGH** - Cannot delete promoters from UI

3. **DELETE** `/auth/deleteCopyrightReport/:complaintId`
   - **Purpose**: Delete a copyright complaint/report
   - **Used in**: `/Owner/Reports` page
   - **Impact**: ⚠️ **HIGH** - Cannot delete complaints from UI

### Medium Priority (User Management Features)

4. **GET** `/auth/searchUser/:searchTerm`
   - **Purpose**: Search for a user by email or user ID
   - **Used in**: `/Owner/Users` page (search user modal)
   - **Impact**: ⚠️ **MEDIUM** - Search user feature disabled

5. **PATCH** `/auth/toggleUserPremium/:userId`
   - **Purpose**: Toggle user premium status on/off
   - **Used in**: `/Owner/Users` page
   - **Impact**: ⚠️ **MEDIUM** - Cannot toggle premium status

6. **PATCH** `/auth/setUserPremium/:userId`
   - **Purpose**: Set user premium status with expiration date
   - **Body**: `{ expirationDate: Date }`
   - **Used in**: `/Owner/Users` page
   - **Impact**: ⚠️ **MEDIUM** - Cannot set premium with expiration date

### Low Priority (Dashboard Pages - Currently Using Mock Data)

7. **GET** `/auth/getAllDownloadsViews`
   - **Purpose**: Get all downloads and views statistics
   - **Used in**: `/Owner/DownloadsViews` page
   - **Impact**: ℹ️ **LOW** - Currently using mock data

8. **GET** `/auth/getAllPayments`
   - **Purpose**: Get all payment records
   - **Used in**: `/Owner/Payments` page
   - **Impact**: ℹ️ **LOW** - Currently using mock data

9. **GET** `/auth/getAllStorage`
   - **Purpose**: Get all storage usage data
   - **Used in**: `/Owner/Storage` page
   - **Impact**: ℹ️ **LOW** - Currently using mock data

10. **GET** `/auth/getAllSubscriptions`
    - **Purpose**: Get all subscription records
    - **Used in**: `/Owner/Subscriptions` page
    - **Impact**: ℹ️ **LOW** - Currently using mock data

---

## 📊 Summary

- **APIs in Backend**: 11 ✅
- **APIs Removed**: 10 ❌
- **APIs Still Needed**: 10 (3 High Priority, 3 Medium Priority, 4 Low Priority)

### Next Steps

1. **Immediate Action Required**: Implement the 3 high-priority APIs to restore critical functionality
2. **Short-term**: Implement the 3 medium-priority APIs for complete user management
3. **Long-term**: Implement the 4 low-priority APIs to replace mock data with real data

---

## 🔧 Files Modified

- ✅ `src/services/adminService.js` - Removed 10 APIs not in backend documentation
- ⚠️ UI components still reference removed methods (will need updates when backend implements them)

