import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { superAdminApi } from '../lib/api';

export function CriarTenantPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    subdomain: '',
    nomeEmpresa: '',
    adminNome: '',
    adminEmail: '',
    adminPassword: '',
    estado: 'em_setup',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await superAdminApi.createTenant({
        subdomain: form.subdomain,
        estado: form.estado,
        configMarca: { nome: form.nomeEmpresa },
        configPreco: {},
        configAgenda: {},
        adminNome: form.adminNome,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
      });
      queryClient.invalidateQueries({ queryKey: ['superadmin'] });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold">Criar Novo Tenant</h2>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome da Empresa</label>
          <input
            type="text"
            className="w-full rounded-md border p-2"
            value={form.nomeEmpresa}
            onChange={(e) => setForm({ ...form, nomeEmpresa: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subdomínio</label>
          <div className="flex">
            <input
              type="text"
              className="flex-1 rounded-l-md border p-2"
              placeholder="empresa"
              value={form.subdomain}
              onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
              required
            />
            <span className="flex items-center px-3 bg-gray-100 border border-l-0 rounded-r-md text-gray-500">.movefy.pt</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Admin</label>
            <input
              type="text"
              className="w-full rounded-md border p-2"
              value={form.adminNome}
              onChange={(e) => setForm({ ...form, adminNome: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email do Admin</label>
            <input
              type="email"
              className="w-full rounded-md border p-2"
              value={form.adminEmail}
              onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Password Inicial</label>
            <input
              type="password"
              className="w-full rounded-md border p-2"
              value={form.adminPassword}
              onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado Inicial</label>
            <select
              className="w-full rounded-md border p-2"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="em_setup">Em Setup</option>
              <option value="ativa">Ativa</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? <><Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" /> A criar...</> : 'Criar Tenant'}
          </button>
        </div>
      </form>
    </div>
  );
}
