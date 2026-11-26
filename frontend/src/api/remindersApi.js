import api from './axiosConfig'

export const remindersApi = {
  listReminders: (params) => api.get('/reminders/', { params }),
  getReminder: (id) => api.get(`/reminders/${id}/`),
  createReminder: (data) => api.post('/reminders/', data),
  updateReminder: (id, data) => api.patch(`/reminders/${id}/`, data),
  deleteReminder: (id) => api.delete(`/reminders/${id}/`),
}
