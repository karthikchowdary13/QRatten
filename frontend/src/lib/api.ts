import axios, { AxiosRequestConfig } from 'axios';
import { clearAuthSession } from './auth';
import Cookies from 'js-cookie';

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'https://qratten-backend.onrender.com';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Allow browser to set Content-Type for FormData (includes boundary)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    sectionId?: string | null;
    mobileNumber?: string | null;
    createdAt: string;
    updatedAt?: string;
    passwordUpdatedAt?: string;
}

interface SuccessResponse<T> {
    data: T;
    error: null;
}

interface ErrorResponse {
    data: null;
    error: string;
}

export type ApiResponse<T = any> = Promise<SuccessResponse<T> | ErrorResponse>;

api.interceptors.response.use(
    (response) => {
        return { data: response.data, error: null } as any;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
            originalRequest._retry = true;
            try {
                const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

                const refreshRes = await axios.post(
                    `${API_BASE}/auth/refresh`,
                    { refreshToken }
                );

                const data = refreshRes.data;

                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', data.accessToken);
                    Cookies.set('accessToken', data.accessToken, { expires: 1, path: '/', sameSite: 'lax' });

                    if (data.refreshToken) {
                        localStorage.setItem('refreshToken', data.refreshToken);
                        Cookies.set('refreshToken', data.refreshToken, { expires: 7, path: '/', sameSite: 'lax' });
                    }
                }

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                const result = await api(originalRequest);
                return result;
            } catch (refreshError) {
                if (typeof window !== 'undefined') {
                    clearAuthSession();
                    window.location.href = '/login';
                }
                return { data: null, error: 'Session expired' } as any;
            }
        }

        const errorMessage =
            error.response?.data?.detail?.message ||
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.response?.data?.detail ||
            error.message ||
            'An error occurred';

        return {
            data: null,
            error: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
        } as any;
    }
);

export interface LoginCredentials {
    email: string;
    password?: string;
    mobile?: string;
    otp?: string;
}

export const authApi = {
    login: (credentials: LoginCredentials): ApiResponse => api.post('/auth/login', credentials),
    register: (data: any): ApiResponse => api.post('/auth/register', data),
    getProfile: (): ApiResponse<AuthUser> => api.get('/auth/me'),
    resendVerification: (email: string): ApiResponse<{ message: string }> => 
        api.post('/auth/resend-verification', { email }),
    verifyPassword: (password: string): ApiResponse<{ valid: boolean }> =>
        api.post('/auth/verify-password', { password }),
    changePassword: (data: any): ApiResponse => api.post('/auth/change-password', data),
    sendOtp: (identifier: string, type: 'EMAIL' | 'MOBILE'): ApiResponse<{ success: boolean }> =>
        api.post('/auth/send-auth-otp', { identifier, type }),
    verifyOtp: (identifier: string, code: string, type: 'EMAIL' | 'MOBILE'): ApiResponse<{ success: boolean }> =>
        api.post('/auth/verify-auth-otp', { identifier, code, type }),
};

export const institutionsApi = {
    findAll: (): ApiResponse<any[]> => api.get('/institutions'),
    getAll: (): ApiResponse<any[]> => api.get('/institutions'),
    getOne: (id: string): ApiResponse<any> => api.get(`/institutions/${id}`),
    create: (data: any): ApiResponse<any> => api.post('/institutions', data),
    deactivate: (id: string): ApiResponse<any> => api.delete(`/institutions/${id}`),
};

export const sectionsApi = {
    getAll: (): ApiResponse<any[]> =>
        api.get(`/sections`),
    create: (name: string): ApiResponse<any> =>
        api.post('/sections', { name }),
    delete: (id: string): ApiResponse<any> => api.delete(`/sections/${id}`),
};

export const usersApi = {
    findAll: (sectionId?: string): ApiResponse<AuthUser[]> => {
        const params = new URLSearchParams();
        if (sectionId) params.append('sectionId', sectionId);
        return api.get(`/users?${params.toString()}`);
    },
    update: (id: string, data: any): ApiResponse<AuthUser> =>
        api.patch(`/users/${id}`, data),
    uploadAvatar: (id: string | number, file: File): ApiResponse<{ avatarUrl: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        return api.patch(`/users/${id}/avatar`, formData);
    },
    deleteAvatar: (id: string | number): ApiResponse<{ avatarUrl: null }> =>
        api.delete(`/users/${id}/avatar`),
    delete: (id: string | number, password?: string): ApiResponse<any> =>
        api.delete(`/users/${id}`, password ? { data: { password } } : undefined),
};

export const attendanceApi = {
    markByQR: (token: string): ApiResponse<any> =>
        api.post('/attendance/mark-qr', { token }),
    markAttendance: (data: { token: string; deviceFingerprint: string }): ApiResponse<any> =>
        api.post('/attendance/mark-qr', data),
    getSessionAttendance: (sessionId: string): ApiResponse<any[]> =>
        api.get(`/attendance/session/${sessionId}`),
    getStudentStats: (): ApiResponse<any> => api.get('/attendance/stats'),
    getHistory: (): ApiResponse<any> =>
        api.get('/attendance/history'),
    getRecent: (): ApiResponse<any[]> =>
        api.get('/attendance/recent'),
    getAnalytics: (
        sectionId?: string,
        startDate?: string,
        endDate?: string
    ): ApiResponse<any> => {
        const params = new URLSearchParams();
        if (sectionId) params.append('sectionId', sectionId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return api.get(`/attendance/analytics?${params.toString()}`);
    },
    getUserDetails: (id: string): ApiResponse<any> =>
        api.get(`/attendance/user/${id}`),
};

export const qrApi = {
    createSession: (duration: number, sectionId?: string): ApiResponse<any> =>
        api.post('/qr/', {
            expiresInMinutes: duration,
            sectionId: sectionId || undefined,
        }),
    getActiveSessions: (): ApiResponse<any[]> =>
        api.get(`/qr/`),
    getHistory: (): ApiResponse<any[]> =>
        api.get('/qr/history'),
    rotateToken: (sessionId: string): ApiResponse<any> =>
        api.patch(`/qr/${sessionId}/rotate/`),
    endSession: (sessionId: string): ApiResponse<any> =>
        api.patch(`/qr/${sessionId}/end/`),
};

export const reportsApi = {
    downloadInstitutionPDF: (
        startDate?: string,
        endDate?: string,
        sectionId?: string
    ) => {
        const baseUrl = API_BASE;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (sectionId) params.append('sectionId', sectionId);
        return `${baseUrl}/reports/pdf?${params.toString()}`;
    },
    downloadStudentPDF: (studentId: string) => {
        const baseUrl = API_BASE;
        return `${baseUrl}/reports/student/${studentId}/pdf`;
    },
};

export const notificationsApi = {
    notifyParent: (studentId: string): ApiResponse =>
        api.post(`/notifications/notify-parent/${studentId}`),
};

export const adminApi = {
    getStats: (): ApiResponse => api.get('/admin/stats'),
    getUsers: (status?: string, role?: string): ApiResponse<AuthUser[]> => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (role) params.append('role', role);
        return api.get(`/admin/users?${params.toString()}`);
    },
    updateUser: (id: string, data: any): ApiResponse<AuthUser> => api.patch(`/admin/users/${id}`, data),
    deleteUser: (id: string): ApiResponse => api.delete(`/admin/users/${id}`),
    
    getInstitutions: (): ApiResponse<any[]> => api.get('/admin/institutions'),
    createInstitution: (data: any): ApiResponse => api.post('/admin/institutions', data),
    updateInstitution: (id: number | string, data: any): ApiResponse => api.patch(`/admin/institutions/${id}`, data),
    deleteInstitution: (id: number | string): ApiResponse => api.delete(`/admin/institutions/${id}`),
    
    getAuditLogs: (): ApiResponse<any[]> => api.get('/admin/audit-logs'),
    
    getSettings: (): ApiResponse => api.get('/admin/settings'),
    updateSettings: (data: any): ApiResponse => api.patch('/admin/settings', data),
    
    overrideAttendance: (data: { userId: number, sessionId: number, status: string }): ApiResponse =>
        api.post('/admin/attendance/override', data),
    generateManualQR: (data: { sectionId: number }): ApiResponse =>
        api.post('/admin/sessions/manual-qr', data),
        
    getExportUrl: () => {
        const baseUrl = API_BASE;
        return `${baseUrl}/admin/reports/export-csv`;
    }
};

export const downloadFile = async (url: string, filename: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const tempUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = tempUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(tempUrl);
    document.body.removeChild(a);
};

export default api;