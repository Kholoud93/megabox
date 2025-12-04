import axios from 'axios';

export const API_URL = 'https://yalaa-production.up.railway.app';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 seconds timeout for all requests
});

// Add request interceptor for better error handling
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            error.message = 'Request timeout: Server took too long to respond';
        } else if (error.code === 'ERR_CONNECTION_TIMED_OUT' || error.code === 'ERR_NETWORK') {
            error.message = 'Connection timeout: Unable to reach server';
        }
        return Promise.reject(error);
    }
);

export default api;

