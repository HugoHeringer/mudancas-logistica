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
  cancel: (id: string, motivo?: string) => api.post(`/mudancas/${id}/cancelar`, { motivo }),
  delete: (id: string) => api.delete(`/mudancas/${id}`),
  getDashboard: () => api.get('/mudancas/dashboard'),
  exportExcel: (filters?: any) =>
    api.get('/mudancas/export', { params: { ...filters, formato: 'xlsx' }, responseType: 'blob' }),
  exportCsv: (filters?: any) =>
    api.get('/mudancas/export', { params: { ...filters, formato: 'csv' }, responseType: 'blob' }),
  exportPdf: (filters?: any) =>
    api.get('/mudancas/export', { params: { ...filters, formato: 'pdf' }, responseType: 'blob' }),
};

export const clientesApi = {
  findAll: (filters?: any) => api.get('/clientes', { params: filters }),
  findOne: (id: string) => api.get(`/clientes/${id}`),
  findByEmail: (email: string) => api.get(`/clientes/email/${email}`),
  create: (data: any) => api.post('/clientes', data),
  update: (id: string, data: any) => api.patch(`/clientes/${id}`, data),
  merge: (sourceId: string, targetId: string) => api.post(`/clientes/${sourceId}/merge/${targetId}`),
  delete: (id: string) => api.delete(`/clientes/${id}`),
  exportExcel: (filters?: any) =>
    api.get('/clientes/export', { params: { ...filters, formato: 'xlsx' }, responseType: 'blob' }),
  exportCsv: (filters?: any) =>
    api.get('/clientes/export', { params: { ...filters, formato: 'csv' }, responseType: 'blob' }),
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
  getBloqueios: (dataInicio?: string, dataFim?: string) =>
    api.get('/agenda/bloqueios', { params: { dataInicio, dataFim } }),
  getDisponibilidade: (data: string) =>
    api.get(`/agenda/disponibilidade/${data}`),
  getSemanal: (dataInicio: string) => api.get(`/agenda/semanal/${dataInicio}`),
  getMensal: (ano: number, mes: number) => api.get(`/agenda/mensal/${ano}/${mes}`),
  getDiaria: (data: string) => api.get(`/agenda/diaria/${data}`),
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
  exportExcel: (dataInicio?: string, dataFim?: string) =>
    api.get('/financeiro/export', { params: { dataInicio, dataFim, formato: 'xlsx' }, responseType: 'blob' }),
  exportCsv: (dataInicio?: string, dataFim?: string) =>
    api.get('/financeiro/export', { params: { dataInicio, dataFim, formato: 'csv' }, responseType: 'blob' }),
  exportPdf: (dataInicio?: string, dataFim?: string) =>
    api.get('/financeiro/export', { params: { dataInicio, dataFim, formato: 'pdf' }, responseType: 'blob' }),
};

export const comunicacaoApi = {
  getConfig: () => api.get('/comunicacao/config'),
  updateConfig: (data: any) => api.patch('/comunicacao/config', data),
  testarEmail: (destinatario: string) => api.post('/comunicacao/testar-email', { destinatario }),
  getTemplates: () => api.get('/comunicacao/templates'),
  getTemplate: (nome: string) => api.get(`/comunicacao/templates/${nome}`),
  createTemplate: (data: any) => api.post('/comunicacao/templates', data),
  updateTemplate: (nome: string, data: any) =>
    api.patch(`/comunicacao/templates/${nome}`, data),
  deleteTemplate: (id: string) => api.delete(`/comunicacao/templates/${id}`),
  renderTemplate: (nome: string, variaveis: any) =>
    api.post(`/comunicacao/templates/${nome}/render`, { variaveis }),
  initializeTemplates: () => api.post('/comunicacao/templates/initialize'),
  getEmailLogs: (filters?: any) => api.get('/comunicacao/emails', { params: filters }),
};

export const notificacoesApi = {
  findAll: (naoLidas?: boolean) => api.get('/notificacoes', { params: { naoLidas } }),
  markAsRead: (id: string) => api.patch(`/notificacoes/${id}/lida`),
  markAllAsRead: () => api.patch('/notificacoes/marcar-todas-lidas'),
};

export const tenantsApi = {
  findAll: () => api.get('/tenants'),
  findOne: (id: string) => api.get(`/tenants/${id}`),
  findBySubdomain: (subdomain: string) => api.get(`/tenants/subdomain/${subdomain}`),
  update: (id: string, data: any) => api.patch(`/tenants/${id}`, data),
  updateBrand: (id: string, data: any) => api.patch(`/tenants/${id}/brand`, data),
  delete: (id: string) => api.delete(`/tenants/${id}`),
  getStats: (id: string) => api.get(`/tenants/${id}/stats`),
  getSetupProgress: (id: string) => api.get(`/tenants/${id}/setup-progress`),
};

export const utilizadoresApi = {
  findAll: (filters?: any) => api.get('/utilizadores', { params: filters }),
  findOne: (id: string) => api.get(`/utilizadores/${id}`),
  update: (id: string, data: { nome?: string; email?: string }) =>
    api.patch(`/utilizadores/${id}`, data),
  updateEstado: (id: string, eAtivo: boolean) =>
    api.patch(`/utilizadores/${id}/estado`, { eAtivo }),
  updatePerfil: (id: string, perfil: string) =>
    api.patch(`/utilizadores/${id}/perfil`, { perfil }),
  updatePermissoes: (id: string, permissoes: any) =>
    api.patch(`/utilizadores/${id}/permissoes`, { permissoes }),
};

export const ajudantesApi = {
  findAll: (filters?: any) => api.get('/ajudantes', { params: filters }),
  findDisponiveis: (data?: string) => api.get('/ajudantes/disponiveis', { params: { data } }),
  findOne: (id: string) => api.get(`/ajudantes/${id}`),
  create: (data: any) => api.post('/ajudantes', data),
  update: (id: string, data: any) => api.patch(`/ajudantes/${id}`, data),
  delete: (id: string) => api.delete(`/ajudantes/${id}`),
  getPerformance: (id: string, mes: number, ano: number) =>
    api.get(`/ajudantes/${id}/performance`, { params: { mes, ano } }),
};

export const publicApi = {
  getTenantBrand: (subdomain: string) => axios.get(`${API_BASE_URL}/public/tenant/${subdomain}`),
};

export const formularioApi = {
  getCampos: () => api.get('/formulario/campos'),
  getCamposAtivos: () => api.get('/formulario/campos/ativos'),
  createCampo: (data: any) => api.post('/formulario/campos', data),
  updateCampo: (id: string, data: any) => api.patch(`/formulario/campos/${id}`, data),
  toggleCampo: (id: string) => api.patch(`/formulario/campos/${id}/toggle`),
  deleteCampo: (id: string) => api.delete(`/formulario/campos/${id}`),
  reorderCampos: (items: { id: string; ordem: number }[]) =>
    api.patch('/formulario/campos/reorder', { items }),
  seedBaseFields: () => api.post('/formulario/campos/seed'),
};

export const uploadApi = {
  upload: (file: File, entidade?: string, entidadeId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/file', formData, {
      params: { entidade, entidadeId },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  gerarFavicon: () => api.post('/upload/favicon'),
  uploadVeiculoImagem: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/veiculo-imagem', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMaterialImagem: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/material-imagem', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadBanner: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getBanners: () => api.get('/upload/banners'),
  reorderBanners: (banners: { id: string; ordem: number }[]) =>
    api.patch('/upload/banners/reorder', { banners }),
  toggleBanner: (id: string) => api.patch(`/upload/banners/${id}/toggle`),
  removeBanner: (id: string) => api.delete(`/upload/banners/${id}`),
  listFiles: (tenantId: string, entidade?: string) =>
    api.get('/upload', { params: { tenantId, entidade } }),
  deleteFile: (id: string) => api.delete(`/upload/${id}`),
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export const superAdminApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password, tenantId: 'super-admin' }),
  getTenants: () => api.get('/super-admin/tenants'),
  getStats: () => api.get('/super-admin/stats'),
  createTenant: (data: any) => api.post('/super-admin/tenants', data),
  updateTenantEstado: (id: string, estado: string) =>
    api.patch(`/super-admin/tenants/${id}/estado`, { estado }),
  resetAdminPassword: (id: string, newPassword: string) =>
    api.post(`/super-admin/tenants/${id}/reset-password`, { newPassword }),
  deleteTenant: (id: string) => api.delete(`/super-admin/tenants/${id}`),
  getTenantDetail: (id: string) => api.get(`/tenants/${id}`),
};
