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
    createSubscription: async (invoiceFile, phone, subscriberName, durationDays, planName, token, paymentMethod = null) => {
        try {
            // Validate required fields
            if (!phone || !phone.trim()) {
                throw new Error('Phone number is required');
            }
            if (!planName || !planName.trim()) {
                throw new Error('Plan name is required');
            }
            if (!durationDays || isNaN(durationDays)) {
                throw new Error('Duration days is required and must be a number');
            }
            if (!invoiceFile) {
                throw new Error('Invoice file is required');
            }

            const formData = new FormData();
            formData.append('invoice', invoiceFile);
            formData.append('phone', phone.trim());
            formData.append('subscriberName', subscriberName && subscriberName.trim() ? subscriberName.trim() : '');
            formData.append('durationDays', String(durationDays));
            formData.append('planName', planName.trim());
            
            // Add payment method if provided
            if (paymentMethod && paymentMethod.trim()) {
                formData.append('paymentMethod', paymentMethod.trim());
            }

            // Log form data for debugging (remove in production)
            console.log('Creating subscription with:', {
                phone: phone.trim(),
                subscriberName: subscriberName && subscriberName.trim() ? subscriberName.trim() : '',
                durationDays: String(durationDays),
                planName: planName.trim(),
                paymentMethod: paymentMethod || 'not provided',
                hasInvoice: !!invoiceFile
            });

            // Log FormData contents
            console.log('FormData entries:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
            }

            const response = await api.post('/auth/createSubscription', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Subscription created successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to create subscription";
            toast.error(errorMessage, ToastOptions("error"));
            throw error.response?.data || error;
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

