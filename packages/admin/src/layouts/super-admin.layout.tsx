import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Plus, LogOut, Menu, X, Shield, ChevronLeft,
} from 'lucide-react';
import { useSuperAdminStore } from '../stores/super-admin.store';
import { useTenantTheme } from '../theme/TenantProvider';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { name: 'Empresas', href: '/super-admin/empresas', icon: Building2 },
  { name: 'Nova Empresa', href: '/super-admin/nova-empresa', icon: Plus },
];

export function SuperAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, logout } = useSuperAdminStore();
  const { brand } = useTenantTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/super-admin/login');
  };

  return (
    <div className="min-h-screen bg-night">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-night-light/90 backdrop-blur-md border-b border-gold/10 z-40 flex items-center justify-between px-4">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-md text-cream/70 hover:text-cream">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold" />
          <span className="text-sm text-cream/70 tracking-wider">Central {brand.nome || 'Movefy'}</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setMobileOpen(false)}>
          <div className="w-72 bg-night h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 flex items-center px-6 border-b border-gold/10">
              <Shield className="w-5 h-5 text-gold mr-2" />
              <span className="text-sm tracking-[0.15em] text-cream font-light">{brand.nome || 'Movefy'}</span>
            </div>
            <nav className="p-4 space-y-1">
              {navigation.map((item) => (
                <Link key={item.name} to={item.href} onClick={() => setMobileOpen(false)}
                  className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    location.pathname === item.href ? 'bg-gold/10 text-gold' : 'text-cream/50 hover:text-cream hover:bg-white/[0.04]'
                  )}>
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-terracotta/80 hover:text-terracotta hover:bg-terracotta/10 mt-4">
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Terminar Sessão</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={cn('hidden lg:flex flex-col fixed top-0 left-0 h-full bg-night transition-all duration-500 z-20',
        sidebarOpen ? 'w-64' : 'w-20')}>
        <div className="h-16 flex items-center justify-center border-b border-gold/10 px-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gold" />
              <span className="text-sm tracking-[0.15em] text-cream font-light">{brand.nome || 'Movefy'}</span>
            </div>
          ) : (
            <Shield className="w-5 h-5 text-gold" />
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1 mt-2">
          {navigation.map((item) => (
            <Link key={item.name} to={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                location.pathname === item.href ? 'bg-gold/10 text-gold' : 'text-cream/50 hover:text-cream hover:bg-white/[0.04]',
                !sidebarOpen && 'justify-center'
              )}
              title={!sidebarOpen ? item.name : undefined}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {sidebarOpen && <span className="text-sm tracking-wide">{item.name}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gold/10">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs text-cream/40 truncate">{email}</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-cream/40 hover:text-cream hover:bg-white/[0.04] transition-all',
              !sidebarOpen && 'justify-center'
            )}>
            <ChevronLeft className={cn('h-[18px] w-[18px] transition-transform', !sidebarOpen && 'rotate-180')} />
            {sidebarOpen && <span className="text-sm">Recolher</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('transition-all duration-500', sidebarOpen ? 'lg:ml-64' : 'lg:ml-20')}>
        <header className="h-16 bg-night-light/80 backdrop-blur-md border-b border-gold/10 flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-xl font-light text-cream tracking-wide">
            {navigation.find((n) => n.href === location.pathname)?.name || 'Dashboard'}
          </h1>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/[0.04] text-cream/50 hover:text-terracotta transition-colors" title="Terminar Sessão">
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
