import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Building, Users, Truck, Settings, Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { superAdminApi } from '../lib/api';

export function DetalheTenantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [estadoLoading, setEstadoLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [message, setMessage] = useState('');

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['superadmin', 'tenants'],
    queryFn: () => superAdminApi.getTenants().then((r) => r.data),
  });

  const tenant = tenants?.find((t: any) => t.id === id);

  const updateEstadoMutation = useMutation({
    mutationFn: (estado: string) => superAdminApi.updateTenantEstado(id!, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin'] });
      setMessage('Estado atualizado!');
      setTimeout(() => setMessage(''), 3000);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (pw: string) => superAdminApi.resetAdminPassword(id!, pw),
    onSuccess: () => {
      setMessage('Password redefinida!');
      setShowReset(false);
      setNewPassword('');
      setTimeout(() => setMessage(''), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Tenant não encontrado</p>
        <button onClick={() => navigate('/')} className="text-blue-600 mt-2 hover:underline">Voltar</button>
      </div>
    );
  }

  const marca = (tenant.configMarca as any) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold">{marca.nome || tenant.subdomain}</h2>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-700">{message}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mudanças</p>
              <p className="text-2xl font-bold">{tenant._count?.mudancas || 0}</p>
            </div>
            <Truck className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clientes</p>
              <p className="text-2xl font-bold">{tenant._count?.clientes || 0}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Motoristas</p>
              <p className="text-2xl font-bold">{tenant._count?.motoristas || 0}</p>
            </div>
            <Building className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Veículos</p>
              <p className="text-2xl font-bold">{tenant._count?.veiculos || 0}</p>
            </div>
            <Settings className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-semibold text-lg">Informações</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Subdomínio</p>
            <p className="font-medium">{tenant.subdomain}.plataforma.pt</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <span className={`px-2 py-1 rounded-full text-xs ${
              tenant.estado === 'ativa' ? 'bg-green-100 text-green-800' :
              tenant.estado === 'em_setup' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {tenant.estado}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data de Criação</p>
            <p className="font-medium">{tenant.dataCriacao ? new Date(tenant.dataCriacao).toLocaleDateString('pt-PT') : '—'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Último Acesso</p>
            <p className="font-medium">{tenant.dataUltimoAcesso ? new Date(tenant.dataUltimoAcesso).toLocaleDateString('pt-PT') : '—'}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          {tenant.estado !== 'ativa' && (
            <button
              onClick={() => updateEstadoMutation.mutate('ativa')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={updateEstadoMutation.isPending}
            >
              Ativar
            </button>
          )}
          {tenant.estado === 'ativa' && (
            <button
              onClick={() => updateEstadoMutation.mutate('suspensa')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              disabled={updateEstadoMutation.isPending}
            >
              Suspender
            </button>
          )}
          <button
            onClick={() => setShowReset(!showReset)}
            className="flex items-center gap-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <KeyRound className="h-4 w-4" />
            Redefinir Password
          </button>
        </div>

        {showReset && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <p className="text-sm text-gray-600">Redefinir password do admin deste tenant:</p>
            <div className="flex gap-2">
              <input
                type="password"
                className="flex-1 rounded-md border p-2"
                placeholder="Nova password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                onClick={() => resetPasswordMutation.mutate(newPassword)}
                disabled={!newPassword || resetPasswordMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {resetPasswordMutation.isPending ? 'A redefinir...' : 'Redefinir'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
