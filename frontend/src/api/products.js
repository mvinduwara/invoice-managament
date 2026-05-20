import axiosInstance from './axios'

export const productsApi = {
  getAll:  (params)     => axiosInstance.get('/api/products', { params }),
  getById: (id)         => axiosInstance.get(`/api/products/${id}`),
  create:  (data)       => axiosInstance.post('/api/products', data),
  update:  (id, data)   => axiosInstance.put(`/api/products/${id}`, data),
  delete:  (id)         => axiosInstance.delete(`/api/products/${id}`),
}
