import api from './axiosConfig'

export const analysisApi = {
  runAnalysis: (uploadId) => api.post('/analysis/run/', { upload_id: uploadId }),
  listAnalysis: (params) => api.get('/analysis/', { params }),
  getAnalysis: (id) => api.get(`/analysis/${id}/`),
  downloadPDF: (id) => api.get(`/analysis/${id}/download-pdf/`, { responseType: 'blob' }),
}
