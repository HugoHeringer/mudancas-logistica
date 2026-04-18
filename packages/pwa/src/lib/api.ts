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

// Response interceptor — handle 401 + refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = res.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          sessionStorage.removeItem('refreshToken');
          window.location.href = '/login?expired=true';
          return Promise.reject(error);
        }
      }

      // No refresh token — clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('refreshToken');
      window.location.href = '/login?expired=true';
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string, tenantId: string) =>
    api.post('/auth/login', { email, password, tenantId }),
};

export const motoristasApi = {
  getMe: () => api.get('/motoristas/me'),
  updateEstado: (id: string, estado: string) => api.patch(`/motoristas/${id}/estado`, { estado }),
};

export const mudancasApi = {
  getMinhas: (filters?: { data?: string; estado?: string; dataInicio?: string; dataFim?: string }) => {
    const params = new URLSearchParams();
    if (filters?.data) params.set('data', filters.data);
    if (filters?.estado) params.set('estado', filters.estado);
    if (filters?.dataInicio) params.set('dataInicio', filters.dataInicio);
    if (filters?.dataFim) params.set('dataFim', filters.dataFim);
    return api.get(`/mudancas/minhas?${params.toString()}`);
  },
  findOne: (id: string) => api.get(`/mudancas/${id}`),
  iniciarDeslocamento: (id: string, previsaoChegadaMinutos?: number) => api.post(`/mudancas/${id}/iniciar`, { previsaoChegadaMinutos }),
  emServico: (id: string) => api.post(`/mudancas/${id}/em-servico`),
  concluir: (id: string, data: any) => api.post(`/mudancas/${id}/concluir`, data),
};

export const publicApi = {
  getTenantBrand: (subdomain: string) => api.get(`/public/tenant/${subdomain}`),
};
