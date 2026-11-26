import api from './axiosConfig'

export const uploadsApi = {
  listUploads: (params) => api.get('/uploads/', { params }),
  getUpload: (id) => api.get(`/uploads/${id}/`),
  createUpload: (data) => api.post('/uploads/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteUpload: (id) => api.delete(`/uploads/${id}/`),
}
