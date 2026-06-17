import api from './axios';

export const adminAPI = {
  // Users
  getAllUsers: () =>
    api.get('/api/v1/admin/users'),

  deleteUser: (id) =>
    api.delete(`/api/v1/admin/users/${id}`),

  // Vendors
  createVendor: (data) =>
    api.post('/api/v1/admin/vendors', data),

  getAllVendors: () =>
    api.get('/api/v1/admin/vendors'),

  deleteVendor: (id) =>
    api.delete(`/api/v1/admin/vendors/${id}`),

  // Purchase Orders
  createPurchaseOrder: (data) =>
    api.post('/api/v1/admin/purchase-orders', data),

  getAllPurchaseOrders: () =>
    api.get('/api/v1/admin/purchase-orders'),

  // Invoices
  getAllInvoices: () =>
    api.get('/api/v1/admin/invoices'),

  // Payments
  initiatePayment: (data) =>
    api.post('/api/v1/admin/payments/initiate', data),

  completePayment: (id) =>
    api.patch(`/api/v1/admin/payments/${id}/complete`),

  getAllPayments: () =>
    api.get('/api/v1/admin/payments'),

  // Dashboard
  getDashboard: () =>
    api.get('/api/v1/admin/dashboard'),
};