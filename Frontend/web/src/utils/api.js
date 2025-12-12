import axios from 'axios';

/**
 * API Configuration
 * Base configuration for backend API requests
 */

// Base API URL - Must be set in .env file
if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL environment variable is not set. Please check your .env file.');
}

const API_BASE_URL = import.meta.env.VITE_API_URL.trim();

console.log('🔗 API Base URL:', API_BASE_URL); // Debug log

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
  withCredentials: false,
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method.toUpperCase(), config.url);
    console.log('📍 Full URL:', config.baseURL + config.url);
    console.log('📦 Request Data:', config.data);
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Setup Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    console.log('📦 Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ ========== API ERROR ==========');
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method?.toUpperCase());
    console.error('Full URL:', error.config?.baseURL + error.config?.url);
    console.error('Status Code:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Message:', error.message);
    console.error('Response Data:', error.response?.data);
    console.error('Request Data:', error.config?.data);
    
    if (error.response) {
      // Server responded with error status
      console.error('⚠️ Server Error Response');
      switch (error.response.status) {
        case 401:
          console.error('⚠️ Unauthorized - clearing token');
          localStorage.removeItem('auth_token');
          break;
        case 403:
          console.error('⚠️ Access forbidden');
          break;
        case 404:
          console.error('⚠️ Resource not found');
          break;
        case 500:
          console.error('⚠️ Server internal error');
          break;
        default:
          console.error('⚠️ HTTP Error:', error.response.status);
      }
    } else if (error.request) {
      console.error('⚠️ No Response from Server');
      console.error('Check: Is XAMPP Apache running?');
      console.error('Check: Is backend URL correct?');
      console.error('Request Object:', error.request);
    } else {
      console.error('⚠️ Request Configuration Error:', error.message);
    }
    console.error('====================================');
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Incidents
  incidents: {
    getAll: (filters = {}) => api.get('/incidents', { params: filters }),
    getById: (id) => api.get(`/incidents?id=${id}`),
    create: (data) => api.post('/incidents', data),
    update: (id, data) => api.put('/incidents', { id, ...data }),
    delete: (id) => api.delete('/incidents', { data: { id } }),
    getStatusCounts: () => api.get('/incidents/status-counts'),
  },

  // Catcher Teams
  catchers: {
    getAll: (filters = {}) => api.get('/catchers', { params: filters }),
    getById: (id) => api.get(`/catchers?id=${id}`),
    create: (data) => api.post('/catchers', data),
    update: (id, data) => api.put('/catchers', { id, ...data }),
    delete: (id) => api.delete('/catchers', { data: { id } }),
  },

  // Schedules
  schedules: {
    getAll: (filters = {}) => api.get('/schedules', { params: filters }),
    getById: (id) => api.get(`/schedules?id=${id}`),
    create: (data) => api.post('/schedules', data),
    update: (id, data) => api.put('/schedules', { id, ...data }),
    delete: (id) => api.delete('/schedules', { data: { id } }),
  },

  // Patrol Staff
  patrolStaff: {
    getAll: (filters = {}) => api.get('/patrol-staff', { params: filters }),
    getById: (id) => api.get(`/patrol-staff?id=${id}`),
    create: (data) => api.post('/patrol-staff', data),
    update: (id, data) => api.put('/patrol-staff', { id, ...data }),
    delete: (id) => api.delete('/patrol-staff', { data: { id } }),
  },

  // Patrol Schedules
  patrolSchedules: {
    getAll: (filters = {}) => api.get('/patrol-schedules', { params: filters }),
    getById: (id) => api.get(`/patrol-schedules?id=${id}`),
    create: (data) => api.post('/patrol-schedules', data),
    update: (id, data) => api.put('/patrol-schedules', { id, ...data }),
    delete: (id) => api.delete('/patrol-schedules', { data: { id } }),
  },

  // Dashboard
  dashboard: {
    getStats: () => api.get('/dashboard'),
  },

  // Authentication
  auth: {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    verify: () => api.get('/auth'),
  },
};

export default api;
