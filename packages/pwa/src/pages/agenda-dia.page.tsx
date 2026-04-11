import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Truck, MapPin, Clock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { mudancasApi } from '../lib/api';
import { StatusBadge } from '../components/status-badge';
import { Button } from '../components/ui/button';

export function AgendaDiaPage() {
  const { user } = useAuthStore();
  const [dataSelecionada, setDataSelecionada] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: mudancas, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['mudancas', 'minhas', dataSelecionada],
    queryFn: () => mudancasApi.getMinhas({ data: dataSelecionada }).then((r) => r.data),
    refetchInterval: 30000,
  });

  const mudancasDoDia = mudancas || [];
  const dataObj = new Date(dataSelecionada + 'T12:00:00');

  // Week days for horizontal scroll
  const weekDays: Date[] = [];
  const today = new Date();
  for (let i = -3; i <= 3; i++) {
    weekDays.push(addDays(today, i));
  }

  const temMudancaAtiva = mudancasDoDia.some(
    (m: any) => m.estado === 'a_caminho' || m.estado === 'em_servico'
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              {isToday(dataObj) ? 'Hoje' : format(dataObj, "d 'de' MMMM", { locale: ptBR })}
            </h1>
            <p className="text-blue-100 text-sm">{user?.nome}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="text-white"
            disabled={isFetching}
          >
            <RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Active indicator */}
        {temMudancaAtiva && (
          <div className="mt-2 bg-green-500 rounded-lg px-3 py-1.5 text-sm font-medium">
            Tem mudança em curso
          </div>
        )}
      </header>

      {/* Date selector */}
      <div className="bg-white border-b px-2 py-3">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {weekDays.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSelected = dateStr === dataSelecionada;
            const isTodayDate = isToday(date);
            return (
              <button
                key={dateStr}
                onClick={() => setDataSelecionada(dateStr)}
                className={`flex flex-col items-center min-w-[52px] px-2 py-1.5 rounded-lg transition-colors ${
                  isSelected ? 'bg-blue-600 text-white' : isTodayDate ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
              >
                <span className="text-[10px] uppercase font-medium">
                  {format(date, 'EEE', { locale: ptBR })}
                </span>
                <span className="text-lg font-bold">{format(date, 'd')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : mudancasDoDia.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Sem mudanças agendadas</p>
            <p className="text-sm mt-1">Para este dia não há mudanças atribuídas.</p>
          </div>
        ) : (
          mudancasDoDia.map((mudanca: any) => (
            <Link key={mudanca.id} to={`/mudanca/${mudanca.id}`}>
              <div className={`bg-white rounded-lg shadow-sm p-4 space-y-2 border-l-4 ${
                mudanca.estado === 'a_caminho' ? 'border-l-purple-500' :
                mudanca.estado === 'em_servico' ? 'border-l-blue-500' :
                mudanca.estado === 'concluida' ? 'border-l-green-500' :
                'border-l-yellow-400'
              }`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">{mudanca.clienteNome}</h2>
                  <StatusBadge status={mudanca.estado} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{mudanca.horaPretendida || 'Hora a definir'}</span>
                  {mudanca.tipoServico === 'urgente' && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">URGENTE</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {mudanca.moradaRecolha?.rua || mudanca.moradaRecolha?.localidade || 'Morada de recolha'}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}
