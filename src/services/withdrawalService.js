import { toast } from 'react-toastify';
import { ToastOptions } from '../helpers/ToastOptions';
import { api } from './apiConfig';

export const withdrawalService = {
    requestWithdrawal: async (amount, paymentMethod, whatsappNumber, details, token) => {
        try {
            const response = await api.post('/auth/requestWithdrawal', {
                amount,
                paymentMethod,
                whatsappNumber,
                details
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Withdrawal request submitted successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to request withdrawal", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    getWithdrawalHistory: async (token) => {
        try {
            const response = await api.get('/auth/getWithdrawalHistory', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

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

    // Update withdrawal status (approve/reject)
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
    }
};

export default withdrawalService;

