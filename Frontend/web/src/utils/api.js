import axios from 'axios';

/**
 * API Configuration
 * Base configuration for backend API requests
 */

// Base API URL - update this based on your backend location
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/';
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      console.error('No response from server');
    } else {
      console.error('Request error:', error.message);
    }
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
