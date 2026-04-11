import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Truck,
  Users,
  Car,
  Building,
  Wallet,
  Mail,
  UserCog,
  Settings,
  Menu,
  LogOut,
  X,
} from 'lucide-react';
import { useAppStore } from '../stores/app.store';
import { useAuthStore } from '../stores/auth.store';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Aprovações', href: '/aprovacoes', icon: CheckSquare },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Mudanças', href: '/mudancas', icon: Truck },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Motoristas', href: '/motoristas', icon: Car },
  { name: 'Veículos', href: '/veiculos', icon: Building },
  { name: 'Financeiro', href: '/financeiro', icon: Wallet },
  { name: 'Comunicação', href: '/comunicacao', icon: Mail },
  { name: 'Utilizadores', href: '/utilizadores', icon: UserCog },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <span className="font-semibold text-lg">Mudanças & Logística</span>
        <div className="w-10" />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="w-64 bg-white h-full" onClick={(e) => e.stopPropagation()}>
            <nav className="p-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    location.pathname === item.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Terminar Sessão
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white border-r transition-all duration-300 z-20',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="h-16 flex items-center justify-center border-b">
          {sidebarOpen ? (
            <span className="font-semibold text-lg">Mudanças</span>
          ) : (
            <span className="font-semibold text-lg">M</span>
          )}
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                location.pathname === item.href
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100',
                !sidebarOpen && 'justify-center'
              )}
              title={!sidebarOpen ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        )}
      >
        {/* Top bar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-gray-900">
            {navigation.find((n) => n.href === location.pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.nome}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.perfil}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              title="Terminar Sessão"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
