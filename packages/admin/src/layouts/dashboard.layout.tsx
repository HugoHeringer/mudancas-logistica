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
  ChevronLeft,
  UserCheck,
  BarChart3,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAppStore } from '../stores/app.store';
import { useAuthStore } from '../stores/auth.store';
import { useTenantTheme } from '../theme/TenantProvider';
import { usePermissao } from '../hooks/use-permissao';
import { cn } from '../lib/utils';
import { NotificationPopover } from '../components/notifications/NotificationPopover';
import { NoiseOverlay } from '../components/luxury/NoiseOverlay';

const allNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Aprovações', href: '/aprovacoes', icon: CheckSquare },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Mudanças', href: '/mudancas', icon: Truck },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Motoristas', href: '/motoristas', icon: Car },
  { name: 'Ajudantes', href: '/ajudantes', icon: UserCheck },
  { name: 'Veículos', href: '/veiculos', icon: Building },
  { name: 'Financeiro', href: '/financeiro', icon: Wallet },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Comunicação', href: '/comunicacao', icon: Mail },
  { name: 'Utilizadores', href: '/utilizadores', icon: UserCog },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { user, logout } = useAuthStore();
  const { brand, theme, themePreference, setTheme } = useTenantTheme();
  const { podeVerRota } = usePermissao();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = allNavigation.filter((item) => podeVerRota(item.href));

  return (
    <div className="min-h-screen bg-background relative">
      <NoiseOverlay />

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md hover:bg-muted transition-colors text-foreground"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <span
          className="text-base tracking-[0.1em] text-cream font-light"
          style={{ fontFamily: 'var(--tenant-font-display)' }}
        >
          {brand.nome || 'Mudanças'}
        </span>
        <div className="w-10" />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-night/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 bg-night h-full shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile sidebar header */}
            <div className="h-16 flex-shrink-0 flex items-center px-6 border-b border-gold/10">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.nome} className="h-8 object-contain" />
              ) : (
                <span
                  className="text-lg tracking-[0.15em] text-cream font-light"
                  style={{ fontFamily: 'var(--tenant-font-display)' }}
                >
                  {brand.nome?.toUpperCase() || 'MUDANCAS'}
                </span>
              )}
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300',
                    location.pathname === item.href
                      ? 'bg-gold/10 text-gold'
                      : 'text-cream/60 hover:text-cream hover:bg-white/[0.04]'
                  )}
                >
                  <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-gold/10">
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-terracotta/80 hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  <span className="text-sm">Terminar Sessão</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-night transition-all duration-500 ease-out z-20 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-center border-b border-gold/10 px-4 flex-shrink-0">
          {sidebarOpen ? (
            brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.nome} className="h-8 object-contain" />
            ) : (
              <span
                className="text-base tracking-[0.15em] text-cream font-light"
                style={{ fontFamily: 'var(--tenant-font-display)' }}
              >
                {brand.nome?.toUpperCase() || 'MUDANCAS'}
              </span>
            )
          ) : (
            <span
              className="text-lg text-gold font-light"
              style={{ fontFamily: 'var(--tenant-font-display)' }}
            >
              {brand.nome?.charAt(0)?.toUpperCase() || 'M'}
            </span>
          )}
        </div>

        {/* Navigation (scrollable) */}
        <nav className="flex-1 overflow-y-auto p-3 pb-1 space-y-1 mt-2 scrollbar-thin">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group',
                location.pathname === item.href
                  ? 'bg-gold/10 text-gold'
                  : 'text-cream/50 hover:text-cream hover:bg-white/[0.04]',
                !sidebarOpen && 'justify-center'
              )}
              title={!sidebarOpen ? item.name : undefined}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm tracking-wide">{item.name}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar footer (non-floating) */}
        <div className="flex-shrink-0 p-3 border-t border-gold/10">
          <button
            onClick={toggleSidebar}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-cream/40 hover:text-cream hover:bg-white/[0.04] transition-all duration-300',
              !sidebarOpen && 'justify-center'
            )}
          >
            <ChevronLeft className={cn(
              'h-[18px] w-[18px] transition-transform duration-300',
              !sidebarOpen && 'rotate-180'
            )} />
            {sidebarOpen && <span className="text-sm">Recolher</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-500',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        )}
      >
        {/* Top bar */}
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
          <h1
            className="text-xl font-light text-foreground"
            style={{ fontFamily: 'var(--tenant-font-display)' }}
          >
            {navigation.find((n) => n.href === location.pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            {/* Theme selector */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border">
              <button
                onClick={() => setTheme('light')}
                className={cn('p-1.5 rounded transition-colors', themePreference === 'light' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')}
                title="Tema claro"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn('p-1.5 rounded transition-colors', themePreference === 'system' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')}
                title="Tema do sistema"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn('p-1.5 rounded transition-colors', themePreference === 'dark' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')}
                title="Tema escuro"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
            <NotificationPopover />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user?.nome}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.perfil}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-terracotta transition-colors"
              title="Terminar Sessão"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
