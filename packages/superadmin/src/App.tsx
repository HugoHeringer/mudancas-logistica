import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from './pages/dashboard.page';
import { CriarTenantPage } from './pages/criar-tenant.page';
import { DetalheTenantPage } from './pages/detalhe-tenant.page';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Super-Admin</h1>
          <p className="text-gray-400 text-sm">Gestão da Plataforma SaaS</p>
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

export default App;
