import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building, Plus, Users, Truck, Loader2, Ban, CheckCircle, Eye, Clock, AlertTriangle } from 'lucide-react';
import { superAdminApi } from '../lib/api';

const planoColors: Record<string, string> = {
  trial: 'bg-gray-100 text-gray-700',
  starter: 'bg-blue-100 text-blue-800',
  pro: 'bg-purple-100 text-purple-800',
  enterprise: 'bg-amber-100 text-amber-800',
};

const planoLabels: Record<string, string> = {
  trial: 'Trial',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

function getTrialInfo(tenant: any) {
  const now = new Date();
  const trialFim = tenant.trialFim ? new Date(tenant.trialFim) : null;
  const trialInicio = tenant.trialInicio ? new Date(tenant.trialInicio) : null;

  if (tenant.estado === 'ativa') {
    return { label: 'Activo', color: 'bg-green-100 text-green-800', daysLeft: null };
  }
  if (tenant.estado === 'suspensa') {
    if (trialFim && trialFim < now) {
      return { label: 'Trial expirado', color: 'bg-red-100 text-red-800', daysLeft: 0 };
    }
    return { label: 'Suspenso', color: 'bg-red-200 text-red-900', daysLeft: null };
  }
  if (tenant.estado === 'cancelada') {
    return { label: 'Cancelado', color: 'bg-gray-200 text-gray-600', daysLeft: null };
  }
  if (tenant.estado === 'em_setup') {
    if (trialFim && trialFim > now) {
      const daysLeft = Math.ceil((trialFim.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { label: `Trial activo (${daysLeft}d)`, color: 'bg-blue-100 text-blue-800', daysLeft };
    }
    if (trialFim && trialFim < now) {
      return { label: 'Trial expirado', color: 'bg-red-100 text-red-800', daysLeft: 0 };
    }
    // Sem trialFim — setup manual
    return { label: 'Em Setup', color: 'bg-yellow-100 text-yellow-800', daysLeft: null };
  }
  return { label: tenant.estado, color: 'bg-gray-100 text-gray-600', daysLeft: null };
}

export function DashboardPage() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['superadmin', 'stats'],
    queryFn: () => superAdminApi.getStats().then((r) => r.data),
  });

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ['superadmin', 'tenants'],
    queryFn: () => superAdminApi.getTenants().then((r) => r.data),
  });

  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      superAdminApi.updateTenantEstado(id, estado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['superadmin', 'tenants'] }),
  });

  if (statsLoading || tenantsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Empresas</h2>
        <Link to="/criar" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-5 w-5" />
          Novo Tenant
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Tenants</p>
              <p className="text-2xl font-bold">{stats?.totalTenants || 0}</p>
            </div>
            <Building className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ativos</p>
              <p className="text-2xl font-bold">{stats?.activeTenants || 0}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Mudan&ccedil;as</p>
              <p className="text-2xl font-bold">{stats?.totalMudancas || 0}</p>
            </div>
            <Truck className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Clientes</p>
              <p className="text-2xl font-bold">{stats?.totalClientes || 0}</p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-500">Empresa</th>
              <th className="text-left p-4 font-medium text-gray-500">Dom&iacute;nio</th>
              <th className="text-left p-4 font-medium text-gray-500">Plano</th>
              <th className="text-left p-4 font-medium text-gray-500">Estado</th>
              <th className="text-left p-4 font-medium text-gray-500">Mudan&ccedil;as</th>
              <th className="text-left p-4 font-medium text-gray-500">Utilizadores</th>
              <th className="text-right p-4 font-medium text-gray-500">A&ccedil;&otilde;es</th>
            </tr>
          </thead>
          <tbody>
            {tenants?.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">Nenhum tenant encontrado</td>
              </tr>
            ) : (
              tenants?.map((t: any) => {
                const trialInfo = getTrialInfo(t);
                return (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{(t.configMarca as any)?.nome || t.subdomain}</td>
                    <td className="p-4 text-gray-600">{t.subdomain}.movefy.pt</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${planoColors[t.plano] || planoColors.trial}`}>
                        {planoLabels[t.plano] || t.plano}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${trialInfo.color}`}>
                        {trialInfo.label}
                      </span>
                      {trialInfo.daysLeft !== null && trialInfo.daysLeft > 0 && trialInfo.daysLeft <= 7 && (
                        <AlertTriangle className="inline-block h-3.5 w-3.5 ml-1 text-amber-500" />
                      )}
                    </td>
                    <td className="p-4">{t._count?.mudancas || 0}</td>
                    <td className="p-4">{t._count?.users || 0}</td>
                    <td className="text-right p-4">
                      <div className="flex items-center justify-end gap-2">
                        {t.estado === 'suspensa' && (
                          <button
                            onClick={() => estadoMutation.mutate({ id: t.id, estado: 'ativa' })}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100"
                            title="Activar manualmente"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Activar
                          </button>
                        )}
                        {t.estado === 'ativa' && (
                          <button
                            onClick={() => estadoMutation.mutate({ id: t.id, estado: 'suspensa' })}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100"
                            title="Suspender"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Suspender
                          </button>
                        )}
                        <Link
                          to={`/tenant/${t.id}`}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                          title="Ver detalhes"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detalhes
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
