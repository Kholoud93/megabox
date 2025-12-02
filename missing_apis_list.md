# Missing APIs - Backend Implementation Required

## Summary

The following APIs are **NOT implemented in the backend** but are **used in the frontend**. These need to be implemented in the backend for full functionality.

---

## 🔴 Critical Missing APIs (Used in Active Features)

### 1. **PATCH `/auth/updateWithdrawalStatus/:withdrawalId`**

- **Purpose**: Approve or reject withdrawal requests
- **Method**: PATCH
- **Body**: `{ status: 'approved' | 'rejected' }`
- **Headers**: Authorization Bearer token required
- **Used in**:
  - `src/pages/OwnerPages/Withdrawals/Withdrawals.jsx`
  - Line 131: `handleApprove()` function
  - Line 161: `handleReject()` function
- **Current Status**: ⚠️ Frontend calls this API but it doesn't exist - will throw error
- **Impact**: Admin cannot approve/reject withdrawal requests

### 2. **GET `/auth/getAllStorage`**

- **Purpose**: Get all user storage data (used storage, total storage, etc.)
- **Method**: GET
- **Headers**: Authorization Bearer token required
- **Used in**:
  - `src/pages/OwnerPages/Storage/Storage.jsx`
  - Line 39: Fetches storage data for admin dashboard
- **Current Status**: ✅ Returns empty array (gracefully handled)
- **Impact**: Storage page shows empty state

### 3. **GET `/auth/getAllPayments`**

- **Purpose**: Get all payment records (when withdrawals are approved)
- **Method**: GET
- **Headers**: Authorization Bearer token required
- **Used in**:
  - `src/pages/OwnerPages/Payments/Payments.jsx`
  - Line 30: Fetches payment history
- **Current Status**: ✅ Returns empty array (gracefully handled)
- **Impact**: Payments page shows empty state

### 4. **GET `/auth/getAllDownloadsViews`**

- **Purpose**: Get all file downloads and views statistics
- **Method**: GET
- **Headers**: Authorization Bearer token required
- **Used in**:
  - `src/pages/OwnerPages/DownloadsViews/DownloadsViews.jsx`
  - Line 30: Fetches download/view analytics
- **Current Status**: ✅ Returns empty array (gracefully handled)
- **Impact**: Downloads/Views page shows empty state

---

## ✅ APIs That Are Implemented and Working

All these APIs exist in the backend and are fully functional:

1. ✅ `toggleBrimumeByOwner` - Toggle premium subscription
2. ✅ `createSubscription` - Create subscription
3. ✅ `getAllSubscriptions` - Get all subscriptions
4. ✅ `createPlan` - Create subscription plan
5. ✅ `getPlans` - Get all plans
6. ✅ `deletePlan` - Delete plan
7. ✅ `updatePlan` - Update plan
8. ✅ `getAllWithdrawals` - Get all withdrawals (read-only)

---

## 📋 Implementation Priority

### High Priority (Blocks Core Functionality)

1. **updateWithdrawalStatus** - Admin cannot approve/reject withdrawals without this

### Medium Priority (Affects Analytics/Reporting)

2. **getAllStorage** - Storage analytics page
3. **getAllPayments** - Payment history page
4. **getAllDownloadsViews** - Downloads/views analytics page

---

## 🔧 Frontend Status

- **Withdrawals Page**: ⚠️ Will show error when trying to approve/reject (API doesn't exist)
- **Storage Page**: ✅ Shows empty state gracefully
- **Payments Page**: ✅ Shows empty state gracefully
- **DownloadsViews Page**: ✅ Shows empty state gracefully

---

## 📝 Notes

- All missing APIs are admin-only endpoints
- All require Authorization Bearer token
- Frontend is ready and waiting for backend implementation
- Error handling is in place for graceful degradation
