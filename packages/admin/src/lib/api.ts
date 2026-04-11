import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// API Services
export const authApi = {
  login: (email: string, password: string, tenantId: string) =>
    api.post('/auth/login', { email, password, tenantId }),
  register: (data: any) => api.post('/auth/register', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  updatePassword: (userId: string, currentPassword: string, newPassword: string) =>
    api.post('/auth/update-password', { userId, currentPassword, newPassword }),
};

export const mudancasApi = {
  findAll: (filters?: any) => api.get('/mudancas', { params: filters }),
  findOne: (id: string) => api.get(`/mudancas/${id}`),
  create: (data: any) => api.post('/mudancas', data),
  update: (id: string, data: any) => api.patch(`/mudancas/${id}`, data),
  approve: (id: string, data: any) => api.post(`/mudancas/${id}/aprovar`, data),
  startTrip: (id: string) => api.post(`/mudancas/${id}/iniciar`),
  startService: (id: string) => api.post(`/mudancas/${id}/em-servico`),
  conclude: (id: string, data: any) => api.post(`/mudancas/${id}/concluir`, data),
  refuse: (id: string, motivo: string) => api.post(`/mudancas/${id}/recusar`, { motivo }),
  cancel: (id: string) => api.post(`/mudancas/${id}/cancelar`),
  delete: (id: string) => api.delete(`/mudancas/${id}`),
  getDashboard: () => api.get('/mudancas/dashboard'),
};

export const clientesApi = {
  findAll: (filters?: any) => api.get('/clientes', { params: filters }),
  findOne: (id: string) => api.get(`/clientes/${id}`),
  findByEmail: (email: string) => api.get(`/clientes/email/${email}`),
  create: (data: any) => api.post('/clientes', data),
  update: (id: string, data: any) => api.patch(`/clientes/${id}`, data),
  merge: (sourceId: string, targetId: string) => api.post(`/clientes/${sourceId}/merge/${targetId}`),
  delete: (id: string) => api.delete(`/clientes/${id}`),
};

export const motoristasApi = {
  findAll: (filters?: any) => api.get('/motoristas', { params: filters }),
  findDisponiveis: (data?: string) => api.get('/motoristas/disponiveis', { params: { data } }),
  findOne: (id: string) => api.get(`/motoristas/${id}`),
  getPerformance: (id: string, mes: number, ano: number) =>
    api.get(`/motoristas/${id}/performance`, { params: { mes, ano } }),
  create: (data: any) => api.post('/motoristas', data),
  update: (id: string, data: any) => api.patch(`/motoristas/${id}`, data),
  updateEstado: (id: string, estado: string) =>
    api.patch(`/motoristas/${id}/estado`, { estado }),
  delete: (id: string) => api.delete(`/motoristas/${id}`),
};

export const veiculosApi = {
  findAll: (filters?: any) => api.get('/veiculos', { params: filters }),
  findDisponiveis: (paraUrgencias?: boolean) =>
    api.get('/veiculos/disponiveis', { params: { paraUrgencias } }),
  findOne: (id: string) => api.get(`/veiculos/${id}`),
  create: (data: any) => api.post('/veiculos', data),
  update: (id: string, data: any) => api.patch(`/veiculos/${id}`, data),
  updateEstado: (id: string, estado: string) =>
    api.patch(`/veiculos/${id}/estado`, { estado }),
  delete: (id: string) => api.delete(`/veiculos/${id}`),
};

export const agendaApi = {
  getSlots: (data: string) => api.get(`/agenda/slots/${data}`),
  getSlotsRange: (dataInicio: string, dataFim: string) =>
    api.get('/agenda/slots', { params: { dataInicio, dataFim } }),
  getDisponibilidade: (data: string, horaInicio?: string) =>
    api.get(`/agenda/disponibilidade/${data}`, { params: { horaInicio } }),
  getSemanal: (dataInicio: string) => api.get(`/agenda/semanal/${dataInicio}`),
  getMensal: (ano: number, mes: number) => api.get(`/agenda/mensal/${ano}/${mes}`),
  criarSlots: (data: string, slots: any[]) => api.post(`/agenda/slots/${data}`, slots),
  criarBloqueio: (data: any) => api.post('/agenda/bloqueios', data),
  removerBloqueio: (id: string) => api.delete(`/agenda/bloqueios/${id}`),
  getConfig: () => api.get('/agenda/config'),
  updateConfig: (data: any) => api.patch('/agenda/config', data),
};

export const financeiroApi = {
  getResumo: (dataInicio: string, dataFim: string) =>
    api.get('/financeiro/resumo', { params: { dataInicio, dataFim } }),
  getMovimentos: (filters?: any) => api.get('/financeiro/movimentos', { params: filters }),
  getBreakdownMotoristas: (dataInicio: string, dataFim: string) =>
    api.get('/financeiro/breakdown/motoristas', { params: { dataInicio, dataFim } }),
  getBreakdownTipoServico: (dataInicio: string, dataFim: string) =>
    api.get('/financeiro/breakdown/tipo-servico', { params: { dataInicio, dataFim } }),
  getGastosDetalhados: (dataInicio: string, dataFim: string) =>
    api.get('/financeiro/gastos-detalhados', { params: { dataInicio, dataFim } }),
  createMovimento: (data: any) => api.post('/financeiro/movimentos', data),
  deleteMovimento: (id: string) => api.delete(`/financeiro/movimentos/${id}`),
};

export const comunicacaoApi = {
  getTemplates: () => api.get('/comunicacao/templates'),
  getTemplate: (nome: string) => api.get(`/comunicacao/templates/${nome}`),
  createTemplate: (data: any) => api.post('/comunicacao/templates', data),
  updateTemplate: (nome: string, data: any) =>
    api.patch(`/comunicacao/templates/${nome}`, data),
  deleteTemplate: (id: string) => api.delete(`/comunicacao/templates/${id}`),
  renderTemplate: (nome: string, variaveis: any) =>
    api.post(`/comunicacao/templates/${nome}/render`, { variaveis }),
  initializeTemplates: () => api.post('/comunicacao/templates/initialize'),
};

export const tenantsApi = {
  findAll: () => api.get('/tenants'),
  findOne: (id: string) => api.get(`/tenants/${id}`),
  findBySubdomain: (subdomain: string) => api.get(`/tenants/subdomain/${subdomain}`),
  update: (id: string, data: any) => api.patch(`/tenants/${id}`, data),
  delete: (id: string) => api.delete(`/tenants/${id}`),
  getStats: (id: string) => api.get(`/tenants/${id}/stats`),
};
