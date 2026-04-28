import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { LoginPage } from './pages/login.page';
import { DashboardPage } from './pages/dashboard.page';
import { CriarTenantPage } from './pages/criar-tenant.page';
import { DetalheTenantPage } from './pages/detalhe-tenant.page';

function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));

  useEffect(() => {
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem('accessToken'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = (accessToken: string, refreshToken?: string) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
  };

  return { isLoggedIn, login, logout };
}

function AppLayout({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">MOVEFY CONSOLE</h1>
            <p className="text-gray-400 text-sm">Gestão da Plataforma SaaS</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/criar" element={<CriarTenantPage />} />
          <Route path="/tenant/:id" element={<DetalheTenantPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const { isLoggedIn, login, logout } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onLogin={login} />} />
      <Route path="/*" element={isLoggedIn ? <AppLayout onLogout={logout} /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
