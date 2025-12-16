import { toast } from 'react-toastify';
import { ToastOptions } from '../helpers/ToastOptions';
import { api } from './apiConfig';

export const paymentService = {
    // Create payment service
    createPaymentService: async (paymentData, token) => {
        try {
            const response = await api.post('/auth/createPaymentService', paymentData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Payment service created successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create payment service", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Get all payment services
    getPaymentServices: async (token) => {
        try {
            const response = await api.get('/auth/getPaymentServices', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update payment service
    updatePaymentService: async (serviceId, paymentData, token) => {
        try {
            const response = await api.patch(`/auth/updatePaymentService/${serviceId}`, paymentData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Payment service updated successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update payment service", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    // Delete payment service
    deletePaymentService: async (serviceId, token) => {
        try {
            const response = await api.delete(`/auth/deletePaymentService/${serviceId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Payment service deleted successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete payment service", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    }
};

export default paymentService;
