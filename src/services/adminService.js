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

    // Search user by email or ID
    searchUser: async (searchTerm, token) => {
        try {
            const response = await api.get(`/auth/searchUser/${searchTerm}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to search user", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Toggle user premium status
    toggleUserPremium: async (userId, token) => {
        try {
            const response = await api.patch(`/auth/toggleUserPremium/${userId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("User premium status updated successfully", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update user premium status", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Set user premium with expiration date
    setUserPremium: async (userId, expirationDate, token) => {
        try {
            const response = await api.patch(`/auth/setUserPremium/${userId}`, {
                expirationDate
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("User premium status updated successfully", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update user premium status", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Delete complaint/report
    deleteComplaint: async (complaintId, token) => {
        try {
            const response = await api.delete(`/auth/deleteCopyrightReport/${complaintId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete promoter
    deletePromoter: async (promoterId, token) => {
        try {
            const response = await api.delete(`/auth/deletePromoter/${promoterId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

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

    updateWithdrawalStatus: async (withdrawalId, status, token) => {
        try {
            const response = await api.patch(`/auth/updateWithdrawalStatus/${withdrawalId}`, {
                status
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success(`Withdrawal ${status} successfully`, ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${status} withdrawal`, ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Get all downloads and views (admin)
    // Note: This endpoint may not exist on the backend yet
    getAllDownloadsViews: async (token) => {
        try {
            const response = await api.get('/auth/getAllDownloadsViews', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            // Endpoint may not exist (404) - return empty data instead of throwing
            if (error.response?.status === 404) {
                console.warn('getAllDownloadsViews endpoint not found - using mock data');
                return { downloadsViews: [] };
            }
            throw error.response?.data || error.message;
        }
    },

    // Get all payments (admin)
    // Note: This endpoint may not exist on the backend yet
    getAllPayments: async (token) => {
        try {
            const response = await api.get('/auth/getAllPayments', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            // Endpoint may not exist (404) - return empty data instead of throwing
            if (error.response?.status === 404) {
                console.warn('getAllPayments endpoint not found - using mock data');
                return { payments: [] };
            }
            throw error.response?.data || error.message;
        }
    },

    // Get all storage (admin)
    // Note: This endpoint may not exist on the backend yet
    getAllStorage: async (token) => {
        try {
            const response = await api.get('/auth/getAllStorage', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            // Endpoint may not exist (404) - return empty data instead of throwing
            if (error.response?.status === 404) {
                console.warn('getAllStorage endpoint not found - using mock data');
                return { storage: [] };
            }
            throw error.response?.data || error.message;
        }
    },

    // Get all subscriptions (admin)
    // Note: This endpoint may not exist on the backend yet
    getAllSubscriptions: async (token) => {
        try {
            const response = await api.get('/auth/getAllSubscriptions', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            // Endpoint may not exist (404) - return empty data instead of throwing
            if (error.response?.status === 404) {
                console.warn('getAllSubscriptions endpoint not found - using mock data');
                return { subscriptions: [] };
            }
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
            // Parse error message to provide better feedback
            const errorMessage = error.response?.data?.message || error.message || "Failed to send notification";
            
            // Check if error is about missing FCM token (in Arabic or English)
            const isMissingFCMToken = errorMessage.includes('FCM Token') || 
                                     errorMessage.includes('fcmToken') ||
                                     errorMessage.includes('FCM') ||
                                     errorMessage.includes('لا يحتوي على FCM Token');
            
            if (isMissingFCMToken) {
                // Provide a more helpful error message
                // The error message will be shown, but we can add context
                toast.error(errorMessage + " (User needs to log in to register FCM token)", ToastOptions("error"));
            } else {
                toast.error(errorMessage, ToastOptions("error"));
            }
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

