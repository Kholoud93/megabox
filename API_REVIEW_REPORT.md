# API Review Report - Frontend vs Backend

## 📋 Summary

This report compares the APIs used in the frontend with the APIs available in the Postman collection to identify:
1. **Missing APIs** - APIs used in frontend but NOT in Postman collection
2. **Unimplemented APIs** - APIs in Postman collection but NOT used in frontend
3. **Status of each API**

---

## ❌ MISSING APIs (Used in Frontend but NOT in Postman Collection)

These APIs are **required by the frontend** but are **NOT present** in the Postman collection:

### 1. **GET /auth/getReferralData** ⚠️ **CRITICAL**
   - **Location in Frontend**: `src/pages/Referral/Referral.jsx`
   - **Usage**: Fetches referral statistics (todayRefers, totalRefers, todayReferralRevenue, totalReferralRevenue, referUsers)
   - **Status**: ❌ **NOT WORKING** - Endpoint missing from backend
   - **Expected Response**:
     ```json
     {
       "todayRefers": 0,
       "totalRefers": 0,
       "todayReferralRevenue": 0,
       "totalReferralRevenue": 0,
       "referUsers": [],
       "currency": "USD"
     }
     ```
   - **Action Required**: 🔴 **URGENT** - Backend team needs to implement this endpoint

### 2. **GET /auth/getUserRevenue** ⚠️ **CRITICAL**
   - **Location in Frontend**: `src/pages/RevenueData/RevenueData.jsx`
   - **Usage**: Fetches daily revenue data for promoters (revenue list, estimated revenue, settled revenue)
   - **Status**: ❌ **NOT WORKING** - Endpoint missing from backend
   - **Expected Response**:
     ```json
     {
       "revenue": [
         {
           "date": "2024-01-15",
           "total": 100.50,
           "installRevenue": 50.25
         }
       ],
       "estimatedRevenue": [],
       "settledRevenue": [],
       "currency": "USD"
     }
     ```
   - **Action Required**: 🔴 **URGENT** - Backend team needs to implement this endpoint

---

## ✅ APIs in Postman Collection (Status Check)

### Auth Endpoints

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|----------------|
| `/auth/signup` | POST | ✅ | Used in Signup page |
| `/auth/confirmOTP` | POST | ✅ | Used in ConfirmEmail page |
| `/auth/login` | POST | ✅ | Used in Login page |
| `/auth/forgetpassword` | POST | ✅ | Used in ForgotPassword page |
| `/auth/resetpassword` | POST | ✅ | Used in ResetPassword page |
| `/auth/loginWithGmail` | POST | ✅ | Used in GoogleLoginButton |
| `/auth/resendOTP` | POST | ✅ | Used in ConfirmEmail page |
| `/auth/createFile` | POST | ✅ | Used in UploadFile component |
| `/auth/getUserFiles` | GET | ✅ | Used in Files.jsx |
| `/auth/generateShareLink` | POST | ✅ | Used in Files.jsx, fileDetails.jsx |
| `/auth/getSharedFile/:id` | GET | ✅ | Used in VedioPreview.jsx |
| `/auth/getUserRoleById/:id` | GET | ⚠️ | Not used in frontend |
| `/auth/getUserStorageUsage` | GET | ✅ | Used in Profile.jsx |
| `/auth/getUserAnalytics` | GET | ✅ | Used in Earning.jsx |
| `/auth/getShareLinkAnalytics` | GET | ✅ | Used in Earning.jsx |
| `/auth/getUserEarnings` | GET | ✅ | Used in Earning.jsx, PromoterDashboard.jsx |
| `/auth/deleteFile/:id` | DELETE | ✅ | Used in Files.jsx |
| `/auth/withdrawEarnings` | GET | ⚠️ | Not used (replaced by requestWithdrawal) |
| `/auth/updateFileName/:id` | PATCH | ✅ | Used in ChangeName component |
| `/auth/getWithdrawalHistory` | GET | ✅ | Used in PromoterDashboard.jsx |
| `/auth/getSharedFilesByUser` | GET | ✅ | Used in SharedFiles.jsx |
| `/auth/report` (createCopyrightReport) | POST | ✅ | Used in Feedback.jsx |
| `/auth/getAllCopyrightReports` | GET | ✅ | Used in Reports.jsx (Admin) |
| `/auth/requestWithdrawal` | POST | ✅ | Used in PromoterDashboard.jsx |
| `/auth/saveFile` | POST | ✅ | Used in fileDetails.jsx |
| `/auth/updateProfile` | PATCH | ✅ | Used in Profile.jsx |
| `/auth/getAllPromoters` | GET | ✅ | Used in Promoters.jsx, Analasys.jsx (Admin) |
| `/auth/getUserAnalyticsadmin/:id` | GET | ✅ | Used in PromotersEarning.jsx (Admin) |
| `/auth/getUserEarningsadmin/:id` | GET | ✅ | Used in PromotersEarning.jsx (Admin) |
| `/auth/getShareLinkAnalyticsadmin/:id` | GET | ✅ | Used in PromotersEarning.jsx (Admin) |
| `/auth/toggleUserBanByOwner/:id` | PATCH | ⚠️ | Not used in frontend |
| `/auth/deleteUserById/:id` | DELETE | ⚠️ | Not used in frontend |
| `/auth/getAllWithdrawals` | GET | ✅ | Used in Analasys.jsx (Admin) |
| `/auth/getSharedFolderContent/:id` | GET | ⚠️ | Not used in frontend |

### User Endpoints

| Endpoint | Method | Status | Frontend Usage |
|----------|--------|--------|----------------|
| `/user/Getloginuseraccount` | GET | ✅ | Used in userService.getUserInfo |
| `/user/updateimage` | PATCH | ✅ | Used in Profile.jsx |
| `/user/updateUsername` | PATCH | ✅ | Used in Profile.jsx |
| `/user/subscribeToPremium` | PATCH | ⚠️ | Not used in frontend |
| `/user/savetoken` | POST | ✅ | Used in notificationService |
| `/user/deleteFcmToken` | DELETE | ✅ | Used in notificationService |
| `/user/getUserNotifications` | GET | ✅ | Used in Notifications page |
| `/user/markAllAsRead` | POST | ✅ | Used in Notifications page |
| `/user/createFolder` | POST | ✅ | Used in AddFolder component |
| `/user/getUserFolders` | GET | ✅ | Used in Files.jsx |
| `/user/createFile/:folderId` | POST | ✅ | Used in UploadFile component |
| `/user/getFolderFiles/:folderId` | GET | ✅ | Used in fileDetails.jsx |
| `/user/deleteFolder/:id` | DELETE | ✅ | Used in Files.jsx |
| `/user/generateFolderShareLink` | POST | ✅ | Used in Files.jsx, fileDetails.jsx |
| `/user/getSharedFoldersWithFiles` | GET | ⚠️ | Not used in frontend |
| `/user/disableFileShare/:id` | PATCH | ⚠️ | Not used in frontend |
| `/user/getAllUsers` | GET | ✅ | Used in Users.jsx, Analasys.jsx (Admin) |
| `/user/sendnotification` | POST | ✅ | Used in Users.jsx (Admin) |
| `/user/notifyall` | POST | ✅ | Used in Users.jsx (Admin) |

---

## 🔴 CRITICAL: Missing Backend Endpoints

### 1. GET /auth/getReferralData
**Priority**: 🔴 **HIGHEST**  
**Reason**: Currently used in Referral page and causing errors  
**Required Response Structure**:
```json
{
  "todayRefers": 0,
  "totalRefers": 0,
  "todayReferralRevenue": 0,
  "totalReferralRevenue": 0,
  "referUsers": [
    {
      "username": "user1",
      "email": "user1@example.com",
      "todayReferral": 10.50,
      "totalRef": 100.00
    }
  ],
  "currency": "USD"
}
```

**Request Headers**:
- `Authorization: Bearer <token>`

---

### 2. GET /auth/getUserRevenue
**Priority**: 🔴 **HIGHEST**  
**Reason**: Currently used in Revenue Data page and causing errors  
**Required Response Structure**:
```json
{
  "revenue": [
    {
      "date": "2024-01-15T00:00:00.000Z",
      "dateUTC": "2024-01-15T00:00:00.000Z",
      "total": 100.50,
      "installRevenue": 50.25
    }
  ],
  "estimatedRevenue": [
    {
      "date": "2024-01-16T00:00:00.000Z",
      "total": 75.00,
      "installRevenue": 30.00
    }
  ],
  "settledRevenue": [
    {
      "date": "2024-01-14T00:00:00.000Z",
      "total": 200.00,
      "installRevenue": 100.00
    }
  ],
  "currency": "USD"
}
```

**Request Headers**:
- `Authorization: Bearer <token>`

**Notes**:
- Should return daily revenue data
- Should support filtering by date range (optional query params)
- Should separate estimated vs settled revenue

---

## ⚠️ APIs in Postman but Not Used in Frontend

These APIs exist in the Postman collection but are not currently used in the frontend:

1. **GET /auth/getUserRoleById/:id** - Get user role by ID
2. **GET /auth/withdrawEarnings** - Old withdrawal endpoint (replaced by requestWithdrawal)
3. **PATCH /auth/toggleUserBanByOwner/:id** - Toggle user ban (Admin feature)
4. **DELETE /auth/deleteUserById/:id** - Delete user (Admin feature)
5. **GET /auth/getSharedFolderContent/:id** - Get shared folder content
6. **PATCH /user/subscribeToPremium** - Subscribe to premium plan
7. **GET /user/getSharedFoldersWithFiles** - Get shared folders with files
8. **PATCH /user/disableFileShare/:id** - Disable file sharing

**Note**: These may be planned for future implementation or may not be needed.

---

## 📊 Statistics

- **Total APIs in Postman**: ~53 endpoints
- **APIs Used in Frontend**: ~45 endpoints
- **APIs Missing from Postman**: 2 endpoints (getReferralData, getUserRevenue)
- **APIs in Postman but Not Used**: 8 endpoints

---

## 🎯 Action Items for Backend Team

### 🔴 URGENT (Blocking Frontend Features)

1. **Implement GET /auth/getReferralData**
   - Required for Referral page functionality
   - Should return referral statistics and referred users list
   - Must include today/total refers and revenue

2. **Implement GET /auth/getUserRevenue**
   - Required for Revenue Data page functionality
   - Should return daily revenue breakdown
   - Must separate estimated vs settled revenue

### ⚠️ OPTIONAL (Future Features)

3. Consider implementing:
   - Admin user management endpoints (ban/delete users)
   - Premium subscription flow
   - Enhanced shared content viewing

---

## 📝 Notes

1. **Error Handling**: Both missing endpoints have error handling implemented in the frontend, but they will fail until the backend endpoints are created.

2. **Authentication**: Both endpoints require Bearer token authentication.

3. **Response Format**: The frontend expects specific response structures. Please refer to the expected response examples above.

4. **Testing**: Once implemented, these endpoints should be tested with:
   - Valid authentication tokens
   - Different user roles (promoter vs regular user)
   - Empty data scenarios
   - Error scenarios (invalid token, etc.)

---

## 🔗 Related Files

- `src/pages/Referral/Referral.jsx` - Uses getReferralData
- `src/pages/RevenueData/RevenueData.jsx` - Uses getUserRevenue
- `c:\Users\DELL\Documents\megabox\megabox.postman_collection.json` - Postman collection

---

**Last Updated**: 2024-01-XX  
**Report Generated By**: AI Assistant  
**Status**: ⚠️ 2 Critical APIs Missing

