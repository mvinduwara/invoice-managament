import axiosInstance from './axios'

export const authApi = {
  login:    (data)  => axiosInstance.post('/api/auth/login', data),
  register: (data)  => axiosInstance.post('/api/auth/register', data),
  me:       ()      => axiosInstance.get('/api/auth/me'),
  logout:   ()      => axiosInstance.post('/api/auth/logout'),
}
