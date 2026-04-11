import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Users, Truck, Settings } from 'lucide-react';

export function DetalheTenantPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Placeholder
  const tenant = {
    id,
    nome: 'Empresa Exemplo',
    subdomain: 'empresa-exemplo',
    estado: 'ativa',
    dataCriacao: '2026-01-01',
    adminEmail: 'admin@empresa.pt',
    mudancas: 45,
    clientes: 32,
    motoristas: 8,
    veiculos: 5,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold">{tenant.nome}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mudanças</p>
              <p className="text-2xl font-bold">{tenant.mudancas}</p>
            </div>
            <Truck className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clientes</p>
              <p className="text-2xl font-bold">{tenant.clientes}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Motoristas</p>
              <p className="text-2xl font-bold">{tenant.motoristas}</p>
            </div>
            <Building className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Veículos</p>
              <p className="text-2xl font-bold">{tenant.veiculos}</p>
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
            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">{tenant.estado}</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data de Criação</p>
            <p className="font-medium">{new Date(tenant.dataCriacao).toLocaleDateString('pt-PT')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Admin Email</p>
            <p className="font-medium">{tenant.adminEmail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
