import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Attach userId to EVERY request
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId');
  if (userId && userId !== 'undefined' && userId !== 'null') {
    config.headers['x-user-id'] = userId;
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
