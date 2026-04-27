import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { useAuthStore } from './stores/auth.store';
import { usePermissao } from './hooks/use-permissao';
import { TenantProvider } from './theme/TenantProvider';

// Layouts (not lazy — needed immediately)
import { DashboardLayout } from './layouts/dashboard.layout';
import { AuthLayout } from './layouts/auth.layout';
import { SuperAdminLayout } from './layouts/super-admin.layout';

// Pages — lazy loaded for performance
const LoginPage = lazy(() => import('./pages/auth/login.page').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/dashboard/dashboard.page').then(m => ({ default: m.DashboardPage })));
const AprovacoesPage = lazy(() => import('./pages/aprovacoes/aprovacoes.page').then(m => ({ default: m.AprovacoesPage })));
const AgendaPage = lazy(() => import('./pages/agenda/agenda.page').then(m => ({ default: m.AgendaPage })));
const MudancasPage = lazy(() => import('./pages/mudancas/mudancas.page').then(m => ({ default: m.MudancasPage })));
const NovaMudancaPage = lazy(() => import('./pages/mudancas/nova-mudanca.page').then(m => ({ default: m.NovaMudancaPage })));
const MudancaDetalhePage = lazy(() => import('./pages/mudancas/mudanca-detalhe.page').then(m => ({ default: m.MudancaDetalhePage })));
const ClientesPage = lazy(() => import('./pages/clientes/clientes.page').then(m => ({ default: m.ClientesPage })));
const MotoristasPage = lazy(() => import('./pages/motoristas/motoristas.page').then(m => ({ default: m.MotoristasPage })));
const VeiculosPage = lazy(() => import('./pages/veiculos/veiculos.page').then(m => ({ default: m.VeiculosPage })));
const FinanceiroPage = lazy(() => import('./pages/financeiro/financeiro.page').then(m => ({ default: m.FinanceiroPage })));
const ComunicacaoPage = lazy(() => import('./pages/comunicacao/comunicacao.page').then(m => ({ default: m.ComunicacaoPage })));
const UtilizadoresPage = lazy(() => import('./pages/utilizadores/utilizadores.page').then(m => ({ default: m.UtilizadoresPage })));
const AjudantesPage = lazy(() => import('./pages/ajudantes/ajudantes.page').then(m => ({ default: m.AjudantesPage })));
const ConfiguracoesPage = lazy(() => import('./pages/configuracoes/configuracoes.page').then(m => ({ default: m.ConfiguracoesPage })));
const RelatoriosPage = lazy(() => import('./pages/relatorios/relatorios.page').then(m => ({ default: m.RelatoriosPage })));
const SuperAdminLoginPage = lazy(() => import('./pages/super-admin/super-admin-login.page').then(m => ({ default: m.SuperAdminLoginPage })));
const SuperAdminDashboardPage = lazy(() => import('./pages/super-admin/super-admin-dashboard.page').then(m => ({ default: m.SuperAdminDashboardPage })));
const SuperAdminEmpresasPage = lazy(() => import('./pages/super-admin/super-admin-empresas.page').then(m => ({ default: m.SuperAdminEmpresasPage })));
const SuperAdminEmpresaDetalhePage = lazy(() => import('./pages/super-admin/super-admin-empresa-detalhe.page').then(m => ({ default: m.SuperAdminEmpresaDetalhePage })));
const OnboardingWizardPage = lazy(() => import('./pages/configuracoes/onboarding-wizard.page').then(m => ({ default: m.OnboardingWizardPage })));
import { useSuperAdminStore } from './stores/super-admin.store';

// Page loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-sm tracking-wide">A carregar...</span>
      </div>
    </div>
  );
}

// Protected Route with role gating
function ProtectedRoute({ children, path }: { children: React.ReactNode; path?: string }) {
  const { isAuthenticated } = useAuthStore();
  const { podeVerRota, rotasPermitidas } = usePermissao();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (path && !podeVerRota(path)) {
    return <Navigate to={rotasPermitidas[0] || '/'} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

// Super-Admin Protected Route
function SuperAdminRoute() {
  const { isAuthenticated } = useSuperAdminStore();
  if (!isAuthenticated) return <Navigate to="/super-admin/login" replace />;
  return <SuperAdminLayout />;
}

function App() {
  return (
    <TenantProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />

          {/* Super-Admin Routes */}
          <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
          <Route path="/super-admin" element={<SuperAdminRoute />}>
            <Route index element={<SuperAdminDashboardPage />} />
            <Route path="empresas" element={<SuperAdminEmpresasPage />} />
            <Route path="empresas/:id" element={<SuperAdminEmpresaDetalhePage />} />
          </Route>

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/aprovacoes" element={<ProtectedRoute path="/aprovacoes"><AprovacoesPage /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute path="/agenda"><AgendaPage /></ProtectedRoute>} />
          <Route path="/mudancas" element={<ProtectedRoute path="/mudancas"><MudancasPage /></ProtectedRoute>} />
          <Route path="/mudancas/nova" element={<ProtectedRoute path="/mudancas"><NovaMudancaPage /></ProtectedRoute>} />
          <Route path="/mudancas/:id" element={<ProtectedRoute path="/mudancas"><MudancaDetalhePage /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute path="/clientes"><ClientesPage /></ProtectedRoute>} />
          <Route path="/motoristas" element={<ProtectedRoute path="/motoristas"><MotoristasPage /></ProtectedRoute>} />
          <Route path="/veiculos" element={<ProtectedRoute path="/veiculos"><VeiculosPage /></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute path="/financeiro"><FinanceiroPage /></ProtectedRoute>} />
          <Route path="/comunicacao" element={<ProtectedRoute path="/comunicacao"><ComunicacaoPage /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute path="/relatorios"><RelatoriosPage /></ProtectedRoute>} />
          <Route path="/utilizadores" element={<ProtectedRoute path="/utilizadores"><UtilizadoresPage /></ProtectedRoute>} />
          <Route path="/ajudantes" element={<ProtectedRoute path="/ajudantes"><AjudantesPage /></ProtectedRoute>} />
          <Route path="/configuracoes" element={<ProtectedRoute path="/configuracoes"><ConfiguracoesPage /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute path="/configuracoes"><OnboardingWizardPage /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </TenantProvider>
  );
}

export default App;
