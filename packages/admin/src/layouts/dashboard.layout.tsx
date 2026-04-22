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
  Bell,
} from 'lucide-react';
import { useAppStore } from '../stores/app.store';
import { useAuthStore } from '../stores/auth.store';
import { useTenantTheme } from '../theme/TenantProvider';
import { usePermissao } from '../hooks/use-permissao';
import { cn } from '../lib/utils';
import { NotificationPopover } from '../components/notifications/NotificationPopover';

const allNavigation = [
  { name: 'Dashboard',    href: '/',              icon: LayoutDashboard },
  { name: 'Aprovações',   href: '/aprovacoes',    icon: CheckSquare },
  { name: 'Agenda',       href: '/agenda',        icon: Calendar },
  { name: 'Mudanças',     href: '/mudancas',      icon: Truck },
  { name: 'Clientes',     href: '/clientes',      icon: Users },
  { name: 'Motoristas',   href: '/motoristas',    icon: Car },
  { name: 'Ajudantes',    href: '/ajudantes',     icon: UserCheck },
  { name: 'Veículos',     href: '/veiculos',      icon: Building },
  { name: 'Financeiro',   href: '/financeiro',    icon: Wallet },
  { name: 'Relatórios',   href: '/relatorios',    icon: BarChart3 },
  { name: 'Comunicação',  href: '/comunicacao',   icon: Mail },
  { name: 'Utilizadores', href: '/utilizadores',  icon: UserCog },
  { name: 'Configurações',href: '/configuracoes', icon: Settings },
];

// Sidebar link component — keeps JSX clean
function NavLink({
  item,
  collapsed,
  active,
  onClick,
}: {
  item: typeof allNavigation[0];
  collapsed: boolean;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={item.href}
      onClick={onClick}
      title={collapsed ? item.name : undefined}
      className={cn(
        'ct-sidebar-link flex items-center gap-3 px-3 py-2.5 text-sm',
        collapsed && 'justify-center',
        active && 'active',
      )}
    >
      <item.icon className={cn('ct-icon flex-shrink-0', collapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]')} />
      {!collapsed && <span className="tracking-wide truncate">{item.name}</span>}
    </Link>
  );
}

// Brand logo / name for sidebar header
function SidebarBrand({ brand, expanded }: { brand: any; expanded: boolean }) {
  if (expanded) {
    return brand.logoUrl ? (
      <img src={brand.logoUrl} alt={brand.nome} className="h-8 object-contain max-w-[160px]" />
    ) : (
      <span
        className="text-base tracking-[0.15em] font-light truncate"
        style={{
          color: 'var(--sidebar-text)',
          fontFamily: 'var(--tenant-font-display)',
        }}
      >
        {brand.nome?.toUpperCase() || 'MOVEFY'}
      </span>
    );
  }

  return (
    <span
      className="text-xl font-light"
      style={{
        color: 'var(--sidebar-accent)',
        fontFamily: 'var(--tenant-font-display)',
      }}
    >
      {brand.nome?.charAt(0)?.toUpperCase() || 'M'}
    </span>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { user, logout } = useAuthStore();
  const { brand, themePreference, setTheme } = useTenantTheme();
  const { podeVerRota } = usePermissao();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = allNavigation.filter((item) => podeVerRota(item.href));
  const currentPage = navigation.find((n) => n.href === location.pathname)?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-background relative">

      {/* ── MOBILE TOPBAR ────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 z-50 flex items-center justify-between px-4 ct-topbar">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'hsl(var(--foreground))' }}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <span
          className="text-sm font-light tracking-[0.12em]"
          style={{
            fontFamily: 'var(--tenant-font-display)',
            color: 'hsl(var(--foreground))',
          }}
        >
          {brand.nome || 'Movefy'}
        </span>

        <div className="w-10" />
      </div>

      {/* ── MOBILE SIDEBAR OVERLAY ───────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(10, 15, 30, 0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="ct-sidebar w-72 h-full flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="ct-sidebar-header h-14 flex-shrink-0 flex items-center px-5">
              <SidebarBrand brand={brand} expanded={true} />
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-thin">
              {navigation.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={false}
                  active={location.pathname === item.href}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>

            {/* Footer */}
            <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{ color: 'var(--ct-terracotta, #C4572A)' }}
              >
                <LogOut className="h-[18px] w-[18px]" />
                <span>Terminar Sessão</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ──────────────────────────────── */}
      <aside
        className={cn(
          'ct-sidebar hidden lg:flex fixed top-0 left-0 h-full z-20 flex-col transition-all duration-500 ease-out',
          sidebarOpen ? 'w-64' : 'w-[72px]',
        )}
      >
        {/* Header — brand / logo */}
        <div
          className={cn(
            'ct-sidebar-header h-16 flex-shrink-0 flex items-center px-4 transition-all duration-300',
            sidebarOpen ? 'justify-start' : 'justify-center',
          )}
        >
          <SidebarBrand brand={brand} expanded={sidebarOpen} />
        </div>

        {/* Navigation (scrollable) */}
        <nav className="flex-1 overflow-y-auto p-3 pb-2 space-y-0.5 mt-1 scrollbar-thin">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={!sidebarOpen}
              active={location.pathname === item.href}
            />
          ))}
        </nav>

        {/* Footer — collapse toggle */}
        <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            onClick={toggleSidebar}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300',
              !sidebarOpen && 'justify-center',
            )}
            style={{ color: 'var(--sidebar-text-muted)' }}
            title={sidebarOpen ? 'Recolher' : 'Expandir'}
          >
            <ChevronLeft
              className={cn(
                'h-[18px] w-[18px] transition-transform duration-300 flex-shrink-0',
                !sidebarOpen && 'rotate-180',
              )}
            />
            {sidebarOpen && <span>Recolher</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div
        className={cn(
          'transition-all duration-500',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-[72px]',
        )}
      >
        {/* ── DESKTOP TOPBAR ──────────────────────────────── */}
        <header className="ct-topbar hidden lg:flex h-16 items-center justify-between px-6 sticky top-0 z-10">
          {/* Page title */}
          <h1
            className="text-xl font-light tracking-tight"
            style={{
              fontFamily: 'var(--tenant-font-display)',
              color: 'hsl(var(--foreground))',
            }}
          >
            {currentPage}
          </h1>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Theme selector */}
            <div
              className="flex items-center gap-0.5 p-1 rounded-lg"
              style={{
                background: 'hsl(var(--muted) / 0.4)',
                border: '1px solid hsl(var(--border))',
              }}
            >
              {(
                [
                  { pref: 'light' as const,  Icon: Sun,     title: 'Tema claro' },
                  { pref: 'system' as const, Icon: Monitor, title: 'Sistema' },
                  { pref: 'dark' as const,   Icon: Moon,    title: 'Tema escuro' },
                ] as const
              ).map(({ pref, Icon, title }) => (
                <button
                  key={pref}
                  onClick={() => setTheme(pref)}
                  title={title}
                  className="p-1.5 rounded transition-colors"
                  style={{
                    color: themePreference === pref ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                    background: themePreference === pref ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {/* Notifications */}
            <NotificationPopover />

            {/* User info */}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                {user?.nome}
              </p>
              <p className="text-xs capitalize" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {user?.perfil}
              </p>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              title="Terminar Sessão"
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'hsl(var(--muted-foreground))' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ct-terracotta, #C4572A)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--muted-foreground))')}
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ────────────────────────────────── */}
        <main className="p-6 pt-[calc(3.5rem+1.5rem)] lg:pt-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
