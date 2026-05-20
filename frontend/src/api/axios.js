import axios from 'axios'

const axiosInstance = axios.create({
  // FIX: Explicitly set the backend URL
  baseURL: 'http://localhost:8080', 
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Request interceptor to attach JWT token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is invalid or expired
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance