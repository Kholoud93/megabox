import { toast } from 'react-toastify';
import { ToastOptions } from '../helpers/ToastOptions';
import { api } from './apiConfig';

export const adminService = {
    // Toggle user ban
    toggleUserBanByOwner: async (userId, token, isBanned = null) => {
        try {
            const response = await api.patch(`/auth/toggleUserBanByOwner/${userId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Don't show toast here, let the component handle it with translation
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update user ban status", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Delete user by ID
    deleteUserById: async (userId, token) => {
        try {
            const response = await api.delete(`/auth/deleteUserById/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("User deleted successfully", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete user", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // NOTE: The following APIs are NOT in the backend documentation and need to be implemented:
    // - /auth/searchUser/:searchTerm
    // - /auth/toggleUserPremium/:userId
    // - /auth/setUserPremium/:userId
    // - /auth/deleteCopyrightReport/:complaintId
    // - /auth/deletePromoter/:promoterId
    // These methods have been removed until the backend implements them.

    // Withdrawal management endpoints (Admin)
    getAllWithdrawals: async (token) => {
        try {
            const response = await api.get('/auth/getAllWithdrawals', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // NOTE: /auth/updateWithdrawalStatus/:withdrawalId is NOT in the backend documentation
    // This method has been removed until the backend implements it.
    // updateWithdrawalStatus: async (withdrawalId, status, token) => { ... }

    // NOTE: The following APIs are NOT in the backend documentation:
    // - /auth/getAllDownloadsViews
    // - /auth/getAllPayments
    // - /auth/getAllStorage
    // - /auth/getAllSubscriptions
    // These methods have been removed. The UI components already have mock data fallbacks.
    // getAllDownloadsViews, getAllPayments, getAllStorage, getAllSubscriptions methods removed

    // Get all users (admin)
    getAllUsers: async (token) => {
        try {
            const response = await api.get('/user/getAllUsers', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all copyright reports (admin)
    getAllCopyrightReports: async (token) => {
        try {
            const response = await api.get('/auth/getAllCopyrightReports', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get user analytics (admin view)
    getUserAnalyticsadmin: async (userId, token) => {
        try {
            const response = await api.get(`/auth/getUserAnalyticsadmin/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get user earnings (admin view)
    getUserEarningsadmin: async (userId, token) => {
        try {
            const response = await api.get(`/auth/getUserEarningsadmin/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get share link analytics (admin view)
    getShareLinkAnalyticsadmin: async (userId, token) => {
        try {
            const response = await api.get(`/auth/getShareLinkAnalyticsadmin/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Send notification to specific user (admin)
    sendNotification: async (userId, title, body, token) => {
        try {
            const response = await api.post('/user/sendnotification', {
                _id: userId,
                title,
                body
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('sendNotification Response:', response.data);
            toast.success("Notification sent successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            console.error('sendNotification Error:', error.response?.data || error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to send notification";
            toast.error(errorMessage, ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Send notification to all users (admin)
    notifyAll: async (title, body, token) => {
        try {
            const response = await api.post('/user/notifyall', {
                title,
                body
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success(response?.data?.message || "Notification sent to all users successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            // Show the actual error message from backend
            const errorMessage = error.response?.data?.message || error.message || "Failed to send notification to all users";
            toast.error(errorMessage, ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    }
};

export default adminService;

