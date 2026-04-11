import { Link } from 'react-router-dom';
import { Building, Plus, Users, Truck } from 'lucide-react';

export function DashboardPage() {
  // Placeholder - em produção viria da API
  const tenants = [
    { id: '1', nome: 'Empresa A', subdomain: 'empresa-a', estado: 'ativa', mudancas: 45 },
    { id: '2', nome: 'Empresa B', subdomain: 'empresa-b', estado: 'ativa', mudancas: 23 },
    { id: '3', nome: 'Empresa C', subdomain: 'empresa-c', estado: 'em_setup', mudancas: 0 },
  ];

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
              <p className="text-2xl font-bold">{tenants.length}</p>
            </div>
            <Building className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ativos</p>
              <p className="text-2xl font-bold">{tenants.filter(t => t.estado === 'ativa').length}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mudanças (Mês)</p>
              <p className="text-2xl font-bold">{tenants.reduce((acc, t) => acc + t.mudancas, 0)}</p>
            </div>
            <Truck className="h-8 w-8 text-purple-600" />
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
              <th className="text-right p-4 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{t.nome}</td>
                <td className="p-4 text-gray-600">{t.subdomain}.plataforma.pt</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${t.estado === 'ativa' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {t.estado}
                  </span>
                </td>
                <td className="p-4">{t.mudancas}</td>
                <td className="text-right p-4">
                  <Link to={`/tenant/${t.id}`} className="text-blue-600 hover:underline">Ver detalhes</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
