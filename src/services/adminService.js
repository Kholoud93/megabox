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
    }
};

export default adminService;

