import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
let authTokenOverride = null;

export const setApiAccessToken = (token) => {
    authTokenOverride = token || null;
};

export const clearApiAccessToken = () => {
    authTokenOverride = null;
};

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'x-app-name': 'CareCo',
        'x-app-platform': 'mobile',
    },
});

// Attach JWT to all requests
api.interceptors.request.use(async (config) => {
    try {
        if (authTokenOverride) {
            config.headers.Authorization = `Bearer ${authTokenOverride}`;
            config.metadata = { startTime: new Date() };
            return config;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        config.metadata = { startTime: new Date() };
        return config;
    } catch {
        return config;
    }
});

// Handle 401 with token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const req = error.config;
        const url = req?.url || '';
        const isAuth = url.includes('/auth/');

        if (error.response?.status === 401 && !req._retry && !isAuth) {
            req._retry = true;
            try {
                const { data: { session } } = await supabase.auth.refreshSession();
                if (session?.access_token) {
                    req.headers.Authorization = `Bearer ${session.access_token}`;
                    return api(req);
                }
            } catch {
                await supabase.auth.signOut();
            }
        }

        if (!error.response) {
            error.message = 'Network error. Please check your connection.';
        }
        return Promise.reject(error);
    }
);

// ─── Users App API Service ──────────────────────────
export const apiService = {
    auth: {
        login: (creds) => api.post('/auth/login', creds),
        register: (data) => api.post('/auth/register', data),
        getProfile: () => api.get('/auth/me'),
        updateProfile: (data) => api.put('/auth/me', data),
        changePassword: (data) => api.post('/auth/change-password', data),
        resetPassword: (email) => api.post('/auth/reset-password', { email }),
        forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
        verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
        resetPasswordOtp: (email, resetToken, newPassword) => api.post('/auth/reset-password-otp', { email, resetToken, newPassword }),
    },

    // Patient-specific endpoints
    patients: {
        getMe: () => api.get('/users/patients/me'),
        updateMe: (data) => api.put('/users/patients/me', data),
        subscribe: (data) => api.post('/users/patients/subscribe', data),
        updateEmergencyContact: (data) => api.put('/users/patients/me/emergency-contact', data),
        getMyCaller: () => api.get('/users/patients/me/caller'),
        getMyCalls: (params) => api.get('/users/patients/me/calls', { params }),
        getMyMedications: () => api.get('/users/patients/me/medications'),
        flagIssue: (data) => api.post('/users/patients/me/flag-issue', data),
    },

    // Caller-specific endpoints
    callers: {
        getMe: () => api.get('/users/callers/me'),
        getTodayPatients: () => api.get('/users/callers/me/patients/today'),
        logCall: (data) => api.post('/users/callers/me/calls', data),
        getPatientProfile: (id) => api.get(`/users/callers/me/patients/${id}`),
        getStats: () => api.get('/users/callers/me/stats'),
    },

    // Medicine tracking
    medicines: {
        getToday: () => api.get('/users/medicines/today'),
        markMedicine: (data) => api.put('/users/medicines/mark', data),
        getWeeklyAdherence: () => api.get('/users/medicines/adherence/weekly'),
        getMonthlyAdherence: () => api.get('/users/medicines/adherence/monthly'),
    },
};

export const handleApiError = (error) => {
    if (error.response) {
        return {
            message: error.response.data?.error || 'An error occurred',
            status: error.response.status,
        };
    }
    return {
        message: error.message || 'An unexpected error occurred',
        status: null,
    };
};

export default api;
