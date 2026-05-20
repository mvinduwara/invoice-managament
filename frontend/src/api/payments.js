import axiosInstance from './axios'

export const paymentsApi = {
  getAll:    (params)   => axiosInstance.get('/api/payments', { params }),
  getById:   (id)       => axiosInstance.get(`/api/payments/${id}`),
  create:    (data)     => axiosInstance.post('/api/payments', data),
  update:    (id, data) => axiosInstance.put(`/api/payments/${id}`, data),
  delete:    (id)       => axiosInstance.delete(`/api/payments/${id}`),
  getStats:  ()         => axiosInstance.get('/api/payments/stats'),
}
