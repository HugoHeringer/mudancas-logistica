import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const publicApi = {
  criarMudanca: (data: any) => api.post('/public/mudancas', data),
  getVeiculos: (tenantId: string) => api.get(`/public/veiculos?tenantId=${tenantId}`),
  getDisponibilidade: (tenantId: string, data: string) =>
    api.get(`/public/disponibilidade?tenantId=${tenantId}&data=${data}`),
  getTenantInfo: (subdomain: string) => api.get(`/public/tenant/${subdomain}`),
  getTenantBrand: (subdomain: string) => api.get(`/public/tenant/${subdomain}/brand`),
};
