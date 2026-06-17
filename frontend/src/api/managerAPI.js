import api from './axios';

export const managerAPI = {
  getAllRequests: (status) =>
    api.get('/api/v1/manager/requests', {
      params: status ? { status_filter: status } : {}
    }),

  getRequestById: (id) =>
    api.get(`/api/v1/manager/requests/${id}`),

  approveRequest: (id) =>
    api.patch(`/api/v1/manager/requests/${id}/approve`),

  rejectRequest: (id) =>
    api.patch(`/api/v1/manager/requests/${id}/reject`),

  getHistory: () =>
    api.get('/api/v1/manager/history'),

  getDashboard: () =>
    api.get('/api/v1/manager/dashboard'),
};