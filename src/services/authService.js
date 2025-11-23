import { toast } from 'react-toastify';
import { ToastOptions } from '../helpers/ToastOptions';
import { api } from './apiConfig';

export const authService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });
            toast.success("Welcome back", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed. Please try again.", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    signup: async (username, email, password, confirmationPassword) => {
        try {
            const response = await api.post('/auth/signup', {
                username,
                email,
                password,
                confirmationpassword: confirmationPassword
            });
            toast.success("Account created successfully! Please check your email for verification.", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed. Please try again.", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    signupWithRef: async (username, email, password, confirmationPassword, ref) => {
        try {
            const response = await api.post('/auth/signup', {
                username,
                email,
                password,
                confirmationpassword: confirmationPassword,
                ref
            });
            toast.success("Account created successfully! Please check your email for verification.", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed. Please try again.", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    confirmOTP: async (code, email) => {
        try {
            const response = await api.post('/auth/confirmOTP', {
                code,
                email
            });
            toast.success("Email verified successfully!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed. Please try again.", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgetpassword', {
                email
            });
            toast.success("Reset code sent to your email!", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reset code. Please try again.", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    resetPassword: async (email, password, code) => {
        try {
            const response = await api.post('/auth/resetpassword', {
                email,
                password,
                code
            });
            toast.success("Password reset successful! You can now login with your new password.", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Password reset failed. Please try again.", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    resendotp: async (email) => {
        try {
            const response = await api.post('/auth/resendOTP', {
                email,
            });
            toast.success("Otp resend successful! You can now check your mail", ToastOptions("success"));
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Otp resend failed. Please try again.", ToastOptions("error"));
            throw error.response?.data || error.message;
        }
    },

    userRole: async (id) => {
        try {
            const { data } = await api.get(`/auth/getUserRoleById/${id}`);
            return data?.data;
        } catch (error) {
            console.log(error);
        }
    },

    // Promoter endpoints
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

    getUserAnalytics: async (token) => {
        try {
            const response = await api.get('/auth/getUserAnalytics', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Login with Gmail
    loginWithGmail: async (accessToken) => {
        try {
            const response = await api.post('/auth/loginWithGmail', {
                accessToken
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default authService;

