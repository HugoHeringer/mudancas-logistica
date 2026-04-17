import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building, Plus, Users, Truck, Loader2, AlertCircle } from 'lucide-react';
import { superAdminApi } from '../lib/api';

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['superadmin', 'stats'],
    queryFn: () => superAdminApi.getStats().then((r) => r.data),
  });

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ['superadmin', 'tenants'],
    queryFn: () => superAdminApi.getTenants().then((r) => r.data),
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
        <h2 className="text-2xl font-bold">Tenants</h2>
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
              <p className="text-sm text-gray-500">Total Mudanças</p>
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
              <th className="text-left p-4 font-medium text-gray-500">Subdomínio</th>
              <th className="text-left p-4 font-medium text-gray-500">Estado</th>
              <th className="text-left p-4 font-medium text-gray-500">Mudanças</th>
              <th className="text-left p-4 font-medium text-gray-500">Clientes</th>
              <th className="text-right p-4 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tenants?.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">Nenhum tenant encontrado</td>
              </tr>
            ) : (
              tenants?.map((t: any) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{(t.configMarca as any)?.nome || t.subdomain}</td>
                  <td className="p-4 text-gray-600">{t.subdomain}.plataforma.pt</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      t.estado === 'ativa' ? 'bg-green-100 text-green-800' :
                      t.estado === 'em_setup' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {t.estado}
                    </span>
                  </td>
                  <td className="p-4">{t._count?.mudancas || 0}</td>
                  <td className="p-4">{t._count?.clientes || 0}</td>
                  <td className="text-right p-4">
                    <Link to={`/tenant/${t.id}`} className="text-blue-600 hover:underline">Ver detalhes</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
