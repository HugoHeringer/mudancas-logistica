import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const superAdminApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password, tenantId: 'superadmin' }),
  getStats: () => api.get('/super-admin/stats'),
  getTenants: () => api.get('/super-admin/tenants'),
  createTenant: (data: any) => api.post('/super-admin/tenants', data),
  updateTenantEstado: (id: string, estado: string) =>
    api.patch(`/super-admin/tenants/${id}/estado`, { estado }),
  resetAdminPassword: (id: string, newPassword: string) =>
    api.post(`/super-admin/tenants/${id}/reset-password`, { newPassword }),
  deleteTenant: (id: string) => api.delete(`/super-admin/tenants/${id}`),
};
