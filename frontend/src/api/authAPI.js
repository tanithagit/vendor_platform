import api from './axios';

export const authAPI = {
  register: (data) => api.post('/api/v1/auth/register', data),

  login: (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return api.post('/api/v1/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getMe: () => api.get('/api/v1/auth/me'),
};