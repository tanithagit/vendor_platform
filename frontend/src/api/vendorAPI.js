import api from './axios';

export const vendorAPI = {
  submitQuotation: (data) =>
    api.post('/api/v1/vendor/quotations', data),

  getMyQuotations: () =>
    api.get('/api/v1/vendor/quotations'),

  uploadQuotationDoc: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(
      `/api/v1/vendor/quotations/${id}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  getPurchaseOrders: () =>
    api.get('/api/v1/vendor/purchase-orders'),

  createInvoice: (data) =>
    api.post('/api/v1/vendor/invoices', data),

  uploadInvoiceDoc: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(
      `/api/v1/vendor/invoices/${id}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  getDashboard: () =>
    api.get('/api/v1/vendor/dashboard'),
};