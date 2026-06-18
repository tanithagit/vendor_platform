import api from './axios';

export const employeeAPI = {
  createRequest: (data) =>
    api.post('/api/v1/employee/requests', data),

  getMyRequests: () =>
    api.get('/api/v1/employee/requests'),

  getRequestById: (id) =>
    api.get(`/api/v1/employee/requests/${id}`),

  submitRequest: (id) =>
    api.patch(`/api/v1/employee/requests/${id}/submit`),

  uploadDocument: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(
      `/api/v1/employee/requests/${id}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};