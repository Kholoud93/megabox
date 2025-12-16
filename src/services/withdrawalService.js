import { toast } from 'react-toastify';
import { ToastOptions } from '../helpers/ToastOptions';
import { api } from './apiConfig';

export const withdrawalService = {
    requestWithdrawal: async (amount, paymentMethod, whatsappNumber, details, token, paymentServiceData = null) => {
        try {
            const requestData = {
                amount,
                paymentMethod,
                whatsappNumber,
                details
            };
            
            // Include payment service data if provided
            if (paymentServiceData) {
                requestData.paymentServiceId = paymentServiceData.paymentServiceId;
                if (paymentServiceData.paymentService) {
                    requestData.paymentServiceType = paymentServiceData.paymentService.paymentType;
                    requestData.paymentServiceAccount = paymentServiceData.paymentService.accountName;
                    if (paymentServiceData.paymentService.credentials) {
                        requestData.paymentServiceCredentials = paymentServiceData.paymentService.credentials;
                    }
                }
            }
            
            const response = await api.post('/auth/requestWithdrawal', requestData, {
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


    // Withdraw earnings (deprecated endpoint - automatic withdrawal)
    withdrawEarnings: async (token) => {
        try {
            const response = await api.get('/auth/withdrawEarnings', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success("Earnings withdrawn successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to withdraw earnings", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

};

export default withdrawalService;

