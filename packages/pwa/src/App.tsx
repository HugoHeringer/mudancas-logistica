import { useLocation } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import { LoginPage } from './pages/auth/login.page';
import { AgendaDiaPage } from './pages/agenda-dia.page';
import { DetalheMudancaPage } from './pages/detalhe-mudanca.page';
import { FichaConclusaoPage } from './pages/ficha-conclusao.page';
import { HistoricoPage } from './pages/historico.page';
import { PerfilPage } from './pages/perfil.page';
import { BottomNav } from './components/bottom-nav';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppLayout() {
  const location = useLocation();
  // Hide bottom nav on detail/ficha pages (full-screen)
  const showBottomNav = !location.pathname.includes('/mudanca/');

  return (
    <>
      <Routes>
        <Route path="/" element={<ProtectedRoute><AgendaDiaPage /></ProtectedRoute>} />
        <Route path="/historico" element={<ProtectedRoute><HistoricoPage /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
        <Route path="/mudanca/:id" element={<ProtectedRoute><DetalheMudancaPage /></ProtectedRoute>} />
        <Route path="/mudanca/:id/ficha" element={<ProtectedRoute><FichaConclusaoPage /></ProtectedRoute>} />
      </Routes>
      {showBottomNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
}

export default App;
