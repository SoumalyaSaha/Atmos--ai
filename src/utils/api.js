import axios from 'axios'

const API_URL = 'https://atmosbackend-production.up.railway.app/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Google OAuth: userId is the googleId (decoded.sub)
    const userId = localStorage.getItem('userId')
    if (userId) {
      config.headers['x-user-id'] = userId
      // Also send as Bearer token for backward compatibility
      config.headers.Authorization = `Bearer ${userId}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
