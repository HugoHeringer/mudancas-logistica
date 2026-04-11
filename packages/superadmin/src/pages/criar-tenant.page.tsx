import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function CriarTenantPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Em produção: chamar API para criar tenant
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold">Criar Novo Tenant</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome da Empresa</label>
          <input type="text" className="w-full rounded-md border p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subdomínio</label>
          <div className="flex">
            <input type="text" className="flex-1 rounded-l-md border p-2" placeholder="empresa" required />
            <span className="flex items-center px-3 bg-gray-100 border border-l-0 rounded-r-md text-gray-500">.plataforma.pt</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Admin</label>
            <input type="text" className="w-full rounded-md border p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email do Admin</label>
            <input type="email" className="w-full rounded-md border p-2" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password Inicial</label>
          <input type="password" className="w-full rounded-md border p-2" required />
        </div>

        <div className="flex gap-2 pt-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? 'A criar...' : 'Criar Tenant'}
          </button>
        </div>
      </form>
    </div>
  );
}
