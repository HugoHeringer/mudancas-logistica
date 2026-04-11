'use client';

import { useState } from 'react';
import { ArrowLeft, Upload, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function AgendarPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </Link>
          <h1 className="text-xl font-semibold">Agendar Mudança</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {s}
              </div>
              <span className="text-sm">{s === 1 ? 'Data' : s === 2 ? 'Detalhes' : 'Contacto'}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Selecione Data e Hora</h2>
              <div className="flex items-center gap-2 p-4 border rounded-lg hover:border-blue-500 cursor-pointer">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium">15 Janeiro 2026</p>
                  <p className="text-sm text-gray-500">09:00 - 12:00</p>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Detalhes da Mudança</h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Morada de Recolha</label>
                  <input type="text" className="w-full rounded-md border p-2" placeholder="Rua, número, localidade" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Morada de Entrega</label>
                  <input type="text" className="w-full rounded-md border p-2" placeholder="Rua, número, localidade" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Veículo</label>
                  <select className="w-full rounded-md border p-2">
                    <option>Furgão Pequeno (15m³)</option>
                    <option>Furgão Médio (25m³)</option>
                    <option>Furgão Grande (35m³)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Equipa</label>
                  <select className="w-full rounded-md border p-2">
                    <option>Apenas Motorista</option>
                    <option>Motorista + 1 Ajudante</option>
                    <option>Motorista + 2 Ajudantes</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">Voltar</button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Continuar</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Os Seus Dados</h2>
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
                  <label className="block text-sm font-medium mb-1">Upload de Imagens</label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-500">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Arraste fotos ou clique para selecionar</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">Voltar</button>
                <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submeter Solicitação</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
