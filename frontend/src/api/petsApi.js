import api from './axiosConfig'

export const petsApi = {
  getBreeds: () => api.get('/pets/breeds/'),
  listPets: (params) => api.get('/pets/', { params }),
  getPet: (id) => api.get(`/pets/${id}/`),
  createPet: (data) => api.post('/pets/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updatePet: (id, data) => api.patch(`/pets/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deletePet: (id) => api.delete(`/pets/${id}/`),

  // Medical history
  getMedicalHistory: (petId) => api.get(`/pets/${petId}/medical-history/`),
  addMedicalHistory: (petId, data) => api.post(`/pets/${petId}/medical-history/`, data),

  // Vaccinations
  getVaccinations: (petId) => api.get(`/pets/${petId}/vaccinations/`),
  addVaccination: (petId, data) => api.post(`/pets/${petId}/vaccinations/`, data),

  // Allergies
  getAllergies: (petId) => api.get(`/pets/${petId}/allergies/`),
  addAllergy: (petId, data) => api.post(`/pets/${petId}/allergies/`, data),
}
