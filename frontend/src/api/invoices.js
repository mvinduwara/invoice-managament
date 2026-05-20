import axiosInstance from './axios'

export const invoicesApi = {
  getAll:    (params)   => axiosInstance.get('/api/invoices', { params }),
  getById:   (id)       => axiosInstance.get(`/api/invoices/${id}`),
  create:    (data)     => axiosInstance.post('/api/invoices', data),
  update:    (id, data) => axiosInstance.put(`/api/invoices/${id}`, data),
  delete:    (id)       => axiosInstance.delete(`/api/invoices/${id}`),
  send:      (id)       => axiosInstance.post(`/api/invoices/${id}/send`),
  markPaid:  (id, data) => axiosInstance.post(`/api/invoices/${id}/mark-paid`, data),
  download:  (id)       => axiosInstance.get(`/api/invoices/${id}/pdf`, { responseType: 'blob' }),
  getStats:  ()         => axiosInstance.get('/api/invoices/stats'),
}
