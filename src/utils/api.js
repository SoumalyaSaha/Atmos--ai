import axios from 'axios';

const API_BASE_URL = 'https://atmosbackend-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// [FIXED] Interceptor to add x-user-id header on EVERY request
api.interceptors.request.use(
  (config) => {
    const userId = localStorage.getItem('userId');
    
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
    
    // Also add Authorization Bearer if token exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.warn('[API] Rate limited:', error.response.data);
    }
    if (error.response?.status === 404) {
      console.warn('[API] Not found:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;
