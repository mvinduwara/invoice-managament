import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
