import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { useAuthStore } from './stores/auth.store';

// Layouts
import { DashboardLayout } from './layouts/dashboard.layout';
import { AuthLayout } from './layouts/auth.layout';

// Pages
import { LoginPage } from './pages/auth/login.page';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { AprovacoesPage } from './pages/aprovacoes/aprovacoes.page';
import { AgendaPage } from './pages/agenda/agenda.page';
import { MudancasPage } from './pages/mudancas/mudancas.page';
import { MudancaDetalhePage } from './pages/mudancas/mudanca-detalhe.page';
import { ClientesPage } from './pages/clientes/clientes.page';
import { MotoristasPage } from './pages/motoristas/motoristas.page';
import { VeiculosPage } from './pages/veiculos/veiculos.page';
import { FinanceiroPage } from './pages/financeiro/financeiro.page';
import { ComunicacaoPage } from './pages/comunicacao/comunicacao.page';
import { UtilizadoresPage } from './pages/utilizadores/utilizadores.page';
import { ConfiguracoesPage } from './pages/configuracoes/configuracoes.page';

// Protected Route
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/aprovacoes" element={<ProtectedRoute><AprovacoesPage /></ProtectedRoute>} />
        <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
        <Route path="/mudancas" element={<ProtectedRoute><MudancasPage /></ProtectedRoute>} />
        <Route path="/mudancas/:id" element={<ProtectedRoute><MudancaDetalhePage /></ProtectedRoute>} />
        <Route path="/clientes" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
        <Route path="/motoristas" element={<ProtectedRoute><MotoristasPage /></ProtectedRoute>} />
        <Route path="/veiculos" element={<ProtectedRoute><VeiculosPage /></ProtectedRoute>} />
        <Route path="/financeiro" element={<ProtectedRoute><FinanceiroPage /></ProtectedRoute>} />
        <Route path="/comunicacao" element={<ProtectedRoute><ComunicacaoPage /></ProtectedRoute>} />
        <Route path="/utilizadores" element={<ProtectedRoute><UtilizadoresPage /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
