import { toast } from 'react-toastify';
import { ToastOptions } from '../helpers/ToastOptions';
import { api } from './apiConfig';

export const promoterService = {
    // Get user earnings
    getUserEarnings: async (token) => {
        try {
            const response = await api.get('/auth/getUserEarnings', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get share link analytics
    getShareLinkAnalytics: async (token) => {
        try {
            const response = await api.get('/auth/getShareLinkAnalytics', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all promoters
    getAllPromoters: async (token) => {
        try {
            const response = await api.get('/auth/getAllPromoters', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get all subscription plans (for promoters)
    getPlans: async () => {
        try {
            const response = await api.get('/auth/getPlans');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create subscription (for promoters)
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

    // Get user withdrawals (for promoters) - GET method
    // Changed from POST to GET as this is a read operation
    getUserWithdrawals: async (token) => {
        try {
            const response = await api.get('/auth/getUserWithdrawals', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Log to verify if reason field is included in backend response
            // TODO: Remove this console.log after confirming backend response structure
            const withdrawals = response.data?.withdrawals || response.data?.data || response.data || [];
            const rejectedWithdrawals = Array.isArray(withdrawals) ? withdrawals.filter(w => w.status === 'rejected') : [];
            if (rejectedWithdrawals.length > 0) {
                console.log('Sample rejected withdrawal from getUserWithdrawals:', rejectedWithdrawals[0]);
                console.log('Reason field exists:', 'reason' in rejectedWithdrawals[0]);
            }
            
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

};

export default promoterService;

