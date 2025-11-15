# Backend Team - API Verification & Creation Requests

## 📋 Overview
This document outlines API endpoints that need verification, creation, or clarification from the backend team.

---

## ✅ VERIFICATION NEEDED (Endpoints Used in Frontend - Please Confirm if They Exist)

### 1. Archive File Endpoint
- **Endpoint**: `PATCH /auth/archiveFile/:id`
- **Request Body**: `{ "archived": true }`
- **Status**: ✅ Frontend is using this endpoint
- **Action**: Please confirm if this endpoint exists and is working correctly
- **Location in Frontend**: `src/services/fileService.js` (line 243-256)

### 2. Update Folder Name Endpoint
- **Endpoint**: `PATCH /user/updateFolderName/:id`
- **Request Body**: `{ "newFolderName": "string" }`
- **Status**: ✅ Frontend is using this endpoint
- **Action**: Please confirm if this endpoint exists and is working correctly
- **Location in Frontend**: `src/components/ChangeName/ChangeName.jsx` (line 37-45)

---

## ❌ ENDPOINTS TO CREATE (Frontend Ready - Backend Missing)

### 1. Archive Folder Endpoint
- **Endpoint**: `PATCH /user/archiveFolder/:id`
- **Request Body**: `{ "archived": true }`
- **Status**: ❌ Frontend is ready but endpoint doesn't exist in Postman collection
- **Action**: **Please create this endpoint**
- **Expected Response**: Standard success response
- **Location in Frontend**: `src/services/userService.js` (line 96-110)

**Implementation Details:**
```javascript
// Frontend expects:
PATCH /user/archiveFolder/:folderId
Headers: { Authorization: "Bearer <token>" }
Body: { archived: true }
```

---

## ❓ CLARIFICATION NEEDED

### 1. Withdraw Earnings Endpoint
- **Endpoint in Postman**: `GET /auth/withdrawEarnings`
- **Method**: GET (but has request body with `{ "amount": 0.0003 }`)
- **Current Status**: Not implemented in frontend
- **Question**: 
  - Is this endpoint still in use?
  - What's the difference between `GET /auth/withdrawEarnings` and `POST /auth/requestWithdrawal`?
  - Should we implement `GET /auth/withdrawEarnings` in the frontend, or is `POST /auth/requestWithdrawal` the correct one to use?

**Note**: We currently have `POST /auth/requestWithdrawal` implemented and working. We need to know if `GET /auth/withdrawEarnings` is:
- A deprecated endpoint (can be removed from Postman)
- A different functionality (instant withdrawal vs request withdrawal)
- Still needed and should be implemented

---

## 📝 OPTIONAL IMPROVEMENTS (Nice to Have)

### 1. Get Archived Files Endpoint
- **Suggested Endpoint**: `GET /auth/getArchivedFiles`
- **Status**: Currently, frontend filters archived files client-side from `getUserFiles`
- **Benefit**: Better performance, especially when users have many files
- **Priority**: Low (current implementation works, but could be optimized)

### 2. Get Archived Folders Endpoint
- **Suggested Endpoint**: `GET /user/getArchivedFolders`
- **Status**: Not implemented yet
- **Benefit**: Would be useful if folder archiving is fully implemented
- **Priority**: Low (depends on archive folder endpoint being created first)

---

## 📊 Summary

### Immediate Actions Required:
1. ✅ **Verify** `PATCH /auth/archiveFile/:id` exists and works
2. ✅ **Verify** `PATCH /user/updateFolderName/:id` exists and works
3. ❌ **Create** `PATCH /user/archiveFolder/:id` endpoint
4. ❓ **Clarify** `GET /auth/withdrawEarnings` vs `POST /auth/requestWithdrawal`

### Optional (Can be done later):
- Consider adding `GET /auth/getArchivedFiles` for performance optimization
- Consider adding `GET /user/getArchivedFolders` if folder archiving is implemented

---

## 🔗 Reference

- **Postman Collection**: `megabox.postman_collection[1].json`
- **Frontend API Services**: `src/services/` directory
- **Full API Analysis**: See `API_COMPLETE_ANALYSIS.md` for complete details

---

## 📧 Response Format

Please respond with:
1. ✅ Confirmed working / ❌ Doesn't exist / ⚠️ Needs fix
2. For endpoints to create: Estimated timeline
3. For clarifications: Clear explanation of the difference/purpose

Thank you! 🙏

