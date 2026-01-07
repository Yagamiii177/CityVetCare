import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  changePassword: (passwords) => apiClient.put('/auth/change-password', passwords),
};

// Incident APIs
export const incidentAPI = {
  getAll: (params) => apiClient.get('/incidents', { params }),
  getById: (id) => apiClient.get(`/incidents/${id}`),
  create: (data) => apiClient.post('/incidents', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => apiClient.put(`/incidents/${id}`, data),
  delete: (id) => apiClient.delete(`/incidents/${id}`),
  getStatusCounts: () => apiClient.get('/incidents/status-counts'),
};

// Verification APIs
export const verificationAPI = {
  getPending: (params) => apiClient.get('/verifications/pending', { params }),
  approve: (id, data) => apiClient.post(`/verifications/${id}/approve`, data),
  reject: (id, data) => apiClient.post(`/verifications/${id}/reject`, data),
  getStats: () => apiClient.get('/verifications/stats'),
};

// Patrol Schedule APIs
export const patrolAPI = {
  getAll: (params) => apiClient.get('/schedules', { params }),
  getById: (id) => apiClient.get(`/schedules/${id}`),
  create: (data) => apiClient.post('/schedules', data),
  updateStatus: (id, data) => apiClient.put(`/schedules/${id}/status`, data),
  getAssigned: (staffId) => apiClient.get(`/schedules/staff/${staffId}/assigned`),
};

// Patrol Staff APIs
export const staffAPI = {
  getAll: (params) => apiClient.get('/patrol-staff', { params }),
  getById: (id) => apiClient.get(`/patrol-staff/${id}`),
  create: (data) => apiClient.post('/patrol-staff', data),
  update: (id, data) => apiClient.put(`/patrol-staff/${id}`, data),
  delete: (id) => apiClient.delete(`/patrol-staff/${id}`),
};

// Notification APIs
export const notificationAPI = {
  getAll: (params) => apiClient.get('/notifications', { params }),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard'),
  getMapData: (params) => apiClient.get('/dashboard/map-data', { params }),
};

// Audit APIs
export const auditAPI = {
  getAll: (params) => apiClient.get('/audit', { params }),
  getIncidentAudit: (id) => apiClient.get(`/audit/incident/${id}`),
};

// Health check
export const healthAPI = {
  check: () => apiClient.get('/health'),
};

export default apiClient;
