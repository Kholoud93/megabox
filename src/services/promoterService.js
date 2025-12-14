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
    }
};

export default promoterService;

