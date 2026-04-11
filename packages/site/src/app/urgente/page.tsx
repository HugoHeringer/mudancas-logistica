'use client';

import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UrgentePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-orange-600 text-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Link>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Mudança Urgente</h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <p className="text-orange-800">
            <strong>Atenção:</strong> Para mudanças urgentes, as tarifas são acrescidas de 25%.
            Entraremos em contacto dentro de 1 hora para confirmar os detalhes.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Solicitação Urgente</h2>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input type="text" className="w-full rounded-md border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Apelido</label>
                <input type="text" className="w-full rounded-md border p-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full rounded-md border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input type="tel" className="w-full rounded-md border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Morada de Recolha</label>
              <input type="text" className="w-full rounded-md border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Morada de Entrega</label>
              <input type="text" className="w-full rounded-md border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              <textarea className="w-full rounded-md border p-2" rows={4} />
            </div>
          </div>

          <button className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold">
            Submeter Solicitação Urgente
          </button>

          <p className="text-center text-sm text-gray-500">
            Ao submeter, concorda com as tarifas de urgência e será contactado em breve.
          </p>
        </div>
      </main>
    </div>
  );
}
