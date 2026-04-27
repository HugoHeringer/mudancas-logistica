import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar as CalendarIcon,
  Wallet,
  ArrowRight,
  Settings,
  Circle,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { mudancasApi, tenantsApi } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { GlassCard } from '../../components/luxury/GlassCard';
import { GradientButton } from '../../components/luxury/GradientButton';
import { Badge } from '../../components/ui/badge';
import { ESTADOS_MUDANCA_CORES } from '../../constants/estados';
import { CardSkeleton } from '../../components/ui/skeleton';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => mudancasApi.getDashboard().then((r) => r.data),
  });

  const { data: setupProgress } = useQuery({
    queryKey: ['setup-progress'],
    queryFn: () => tenantsApi.getSetupProgress(user?.tenantId!).then((r) => r.data),
    enabled: !!user?.tenantId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Mudanças Hoje",
      value: dashboard?.hoje.total || 0,
      detail: `${dashboard?.hoje.mudancas?.filter((m: any) => m.estado === 'em_servico').length || 0} em curso`,
      icon: Truck,
      onClick: () => navigate('/agenda?data=hoje'),
    },
    {
      label: "Pendentes",
      value: dashboard?.pendentes || 0,
      detail: "Aguardando aprovação",
      icon: Clock,
      onClick: () => navigate('/aprovacoes'),
    },
    {
      label: "Em Curso",
      value: dashboard?.emCurso || 0,
      detail: "Motoristas em serviço",
      icon: AlertCircle,
      onClick: () => navigate('/mudancas?estado=a_caminho,em_servico'),
    },
    {
      label: "Receita (Mês)",
      value: `€${(dashboard?.mes.receita || 0).toFixed(2)}`,
      detail: `${dashboard?.mes.total || 0} mudanças`,
      icon: Wallet,
      onClick: () => navigate('/financeiro'),
    },
    {
      label: "Margem (Mês)",
      value: `${dashboard?.mes.margemPercentual >= 0 ? '+' : ''}${dashboard?.mes.margemPercentual || 0}%`,
      detail: `€${(dashboard?.mes.margem || 0).toFixed(2)}`,
      icon: BarChart3,
      onClick: () => navigate('/financeiro'),
      highlight: (dashboard?.mes.margemPercentual || 0) >= 0 ? 'positive' : 'negative',
    },
  ];

  const quickActions = [
    {
      label: "Ver aprovações pendentes",
      detail: `${dashboard?.pendentes || 0} pendente(s)`,
      href: "/aprovacoes",
      icon: CheckCircle,
    },
    {
      label: "Ver agenda",
      detail: "Calendário de mudanças",
      href: "/agenda",
      icon: CalendarIcon,
    },
    {
      label: "Ver todas as mudanças",
      detail: "Gestão completa",
      href: "/mudancas",
      icon: Truck,
    },
    {
      label: "Ver financeiro",
      detail: "Receitas e despesas",
      href: "/financeiro",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="stagger-up grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <GlassCard
            key={stat.label}
            hover
            className="p-5 stagger-child cursor-pointer"
            style={{ animationDelay: `${i * 80}ms` } as React.CSSProperties}
            onClick={stat.onClick}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                  {stat.label}
                </span>
                <p
                  className={`text-3xl font-light ${
                    stat.highlight === 'positive' ? 'text-green-600' :
                    stat.highlight === 'negative' ? 'text-destructive' :
                    'text-foreground'
                  }`}
                  style={{ fontFamily: 'var(--tenant-font-display)' }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground/60">{stat.detail}</p>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-border">
                <stat.icon className="h-[18px] w-[18px] text-primary" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Setup Progress (only shown if incomplete) */}
      {setupProgress && !setupProgress.isComplete && (
        <GlassCard className="p-5 border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Settings className="h-[18px] w-[18px] text-primary" />
              <h3
                className="text-lg font-light text-foreground"
                style={{ fontFamily: 'var(--tenant-font-display)' }}
              >
                Configuração da Empresa
              </h3>
            </div>
            <span className="text-sm text-muted-foreground">
              {setupProgress.percentage}% completo
            </span>
          </div>
          <div className="w-full bg-muted/50 rounded-full h-2 mb-4">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-500"
              style={{ width: `${setupProgress.percentage}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {setupProgress.steps.map((step: any) => (
              <Link
                key={step.id}
                to="/configuracoes"
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 ${
                  step.completed
                    ? 'border-green-500/20 bg-green-500/5'
                    : 'border-border bg-primary/[0.03] hover:border-primary/30'
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                )}
                <span className={`text-xs ${step.completed ? 'text-green-700' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </Link>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Mudancas */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-lg font-light text-foreground flex items-center gap-2"
              style={{ fontFamily: 'var(--tenant-font-display)' }}
            >
              <CalendarIcon className="h-[18px] w-[18px] text-primary" />
              Mudanças de Hoje
            </h3>
          </div>

          {dashboard?.hoje.mudancas?.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground/60">
                Nenhuma mudança agendada para hoje
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard?.hoje.mudancas?.map((mudanca: any) => (
                <Link
                  key={mudanca.id}
                  to={`/mudancas/${mudanca.id}`}
                  className="block p-4 rounded-lg border border-border hover:border-border hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {mudanca.clienteNome}
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {mudanca.motorista?.nome || 'Sem motorista'}
                      </p>
                    </div>
                    <Badge
                      className={`text-[10px] tracking-wider uppercase text-white border-none ${ESTADOS_MUDANCA_CORES[mudanca.estado] || 'bg-muted-foreground'}`}
                    >
                      {mudanca.estado}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard className="p-6">
          <h3
            className="text-lg font-light text-foreground mb-4"
            style={{ fontFamily: 'var(--tenant-font-display)' }}
          >
            Ações Rápidas
          </h3>

          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-border hover:bg-primary/[0.03] transition-all duration-300 group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/8 border border-primary/12">
                  <action.icon className="h-[16px] w-[16px] text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground/50">{action.detail}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Alert */}
      {(dashboard?.concluidasSemFicha || 0) > 0 && (
        <GlassCard className="p-5 border-destructive/25 bg-destructive/[0.04]">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/10 border border-destructive/15 flex-shrink-0">
              <AlertCircle className="h-[16px] w-[16px] text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Fichas Pendentes
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {dashboard?.concluidasSemFicha} mudança(s) concluída(s) sem ficha de conclusão preenchida.
              </p>
              <Link
                to="/mudancas?filtro=sem-ficha"
                className="text-xs text-destructive hover:text-destructive/80 underline mt-2 inline-block transition-colors"
              >
                Ver fichas pendentes
              </Link>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
