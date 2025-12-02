import { toast } from 'react-toastify';
import { ToastOptions } from '../helpers/ToastOptions';
import { api } from './apiConfig';

export const adminService = {
    // Toggle user ban
    toggleUserBanByOwner: async (userId, token) => {
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

    // NOTE: The following APIs are NOT in the backend and need to be implemented:
    // - /auth/updateWithdrawalStatus/:withdrawalId (PATCH) - Approve/reject withdrawals
    // - /auth/getAllStorage (GET) - Get all user storage data
    // - /auth/getAllPayments (GET) - Get all payment records
    // - /auth/getAllDownloadsViews (GET) - Get all downloads and views data
    // These methods return empty data until the backend implements them.

    // Update withdrawal status (approve/reject) - NOT IMPLEMENTED IN BACKEND
    updateWithdrawalStatus: async () => {
        throw new Error("API not implemented: /auth/updateWithdrawalStatus/:withdrawalId");
    },

    // Get all storage (admin) - NOT IMPLEMENTED IN BACKEND
    getAllStorage: async () => {
        return { storage: [] };
    },

    // Get all payments (admin) - NOT IMPLEMENTED IN BACKEND
    getAllPayments: async () => {
        return { payments: [] };
    },

    // Get all downloads and views (admin) - NOT IMPLEMENTED IN BACKEND
    getAllDownloadsViews: async () => {
        return { downloadsViews: [] };
    },

    // Get all subscriptions (admin)
    getAllSubscriptions: async (token) => {
        try {
            const response = await api.get('/auth/getAllSubscriptions', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create subscription (admin)
    createSubscription: async (invoiceFile, phone, subscriberName, durationDays, planName, token) => {
        try {
            const formData = new FormData();
            if (invoiceFile) {
                formData.append('invoice', invoiceFile);
            }
            formData.append('phone', phone);
            formData.append('subscriberName', subscriberName);
            formData.append('durationDays', durationDays);
            formData.append('planName', planName);

            const response = await api.post('/auth/createSubscription', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Subscription created successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create subscription", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Get all subscription plans
    getPlans: async () => {
        try {
            const response = await api.get('/auth/getPlans');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create subscription plan (admin)
    createPlan: async (days, price, name, token) => {
        try {
            const response = await api.post('/auth/createPlan', {
                days,
                price,
                name
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Plan created successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create plan", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Update subscription plan (admin)
    updatePlan: async (planId, days, price, name, token) => {
        try {
            const response = await api.patch(`/auth/deletePlan/${planId}`, {
                days,
                price,
                name
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Plan updated successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update plan", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Delete subscription plan (admin)
    deletePlan: async (planId, token) => {
        try {
            const response = await api.delete(`/auth/deletePlan/${planId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Plan deleted successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete plan", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Toggle premium subscription for user (admin)
    toggleBrimumeByOwner: async (userId, activate, durationDays, token) => {
        try {
            const body = { activate };
            if (durationDays !== undefined) {
                body.durationDays = durationDays;
            }
            const response = await api.patch(`/auth/toggleBrimumeByOwner/${userId}`, body, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success(
                activate ? "Premium subscription activated successfully!" : "Premium subscription deactivated successfully!",
                ToastOptions("success")
            );
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to toggle premium subscription", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

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

