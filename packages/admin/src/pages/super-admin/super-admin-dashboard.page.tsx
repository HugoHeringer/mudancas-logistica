import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Building2, Users, Truck, TrendingUp } from 'lucide-react';
import { CardSkeleton } from '../../components/ui/skeleton';

export function SuperAdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['super-admin', 'stats'],
    queryFn: () => superAdminApi.getStats().then(r => r.data),
  });

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ['super-admin', 'tenants'],
    queryFn: () => superAdminApi.getTenants().then(r => r.data),
  });

  if (statsLoading || tenantsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  const statCards = [
    { label: 'Empresas', value: stats?.totalTenants || 0, icon: Building2, color: 'text-gold' },
    { label: 'Ativas', value: stats?.activeTenants || 0, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Mudanças', value: stats?.totalMudancas || 0, icon: Truck, color: 'text-terracotta' },
    { label: 'Clientes', value: stats?.totalClientes || 0, icon: Users, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-[#141B2D] border-gold/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cream/50 text-sm">{s.label}</p>
                  <p className="text-3xl font-light text-cream mt-1">{s.value}</p>
                </div>
                <s.icon className={`w-8 h-8 ${s.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tenant List */}
      <Card className="bg-[#141B2D] border-gold/10">
        <CardHeader>
          <CardTitle className="text-cream">Empresas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(tenants || []).map((tenant: any) => (
              <div key={tenant.id} className="flex items-center justify-between p-4 rounded-lg bg-[#0A0F1E] border border-gold/10 hover:border-gold/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-cream font-medium">
                      {(tenant.configMarca as any)?.nome || tenant.subdomain}
                    </p>
                    <p className="text-cream/40 text-sm">{tenant.subdomain}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right text-sm">
                    <p className="text-cream/60">{tenant._count?.users || 0} utilizadores</p>
                    <p className="text-cream/60">{tenant._count?.mudancas || 0} mudanças</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    tenant.estado === 'ativa' ? 'bg-emerald-500/10 text-emerald-400' :
                    tenant.estado === 'em_setup' ? 'bg-gold/10 text-gold' :
                    tenant.estado === 'suspensa' ? 'bg-red-500/10 text-red-400' :
                    'bg-cream/10 text-cream/50'
                  }`}>
                    {tenant.estado}
                  </span>
                </div>
              </div>
            ))}
            {(!tenants || tenants.length === 0) && (
              <p className="text-cream/30 text-center py-8">Nenhuma empresa registada</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup incomplete alerts */}
      {(tenants || []).filter((t: any) => t.estado === 'em_setup').length > 0 && (
        <Card className="bg-gold/5 border-gold/20">
          <CardHeader>
            <CardTitle className="text-gold text-base">Alertas de Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(tenants || []).filter((t: any) => t.estado === 'em_setup').map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <span className="text-cream/70">{(t.configMarca as any)?.nome || t.subdomain}</span>
                  <span className="text-cream/30">— setup incompleto</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
