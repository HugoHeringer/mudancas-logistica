import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Truck, MapPin, Clock, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { mudancasApi } from '../lib/api';
import { cacheSet, cacheGet } from '../lib/offline-cache';
import { StatusBadge } from '../components/status-badge';
import { Button } from '../components/ui/button';

export function AgendaDiaPage() {
  const { user } = useAuthStore();
  const [dataSelecionada, setDataSelecionada] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: mudancas, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['mudancas', 'minhas', dataSelecionada],
    queryFn: async () => {
      try {
        const res = await mudancasApi.getMinhas({ data: dataSelecionada }).then((r) => r.data);
        await cacheSet(`mudancas-${dataSelecionada}`, res);
        return res;
      } catch {
        const cached = await cacheGet(`mudancas-${dataSelecionada}`);
        return cached || [];
      }
    },
    refetchInterval: 30000,
  });

  const mudancasDoDia = mudancas || [];
  const dataObj = new Date(dataSelecionada + 'T12:00:00');

  // Week days for horizontal scroll - show 14 days (2 weeks)
  const weekDays: Date[] = [];
  const today = new Date();
  for (let i = -3; i <= 10; i++) {
    weekDays.push(addDays(today, i));
  }

  const temMudancaAtiva = mudancasDoDia.some(
    (m: any) => m.estado === 'a_caminho' || m.estado === 'em_servico'
  );

  // Find the next upcoming mudanca (first one that's approved but not yet started)
  const proximaMudanca = mudancasDoDia.find(
    (m: any) => m.estado === 'aprovada'
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-night text-cream p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--tenant-font-display)' }}>
              {isToday(dataObj) ? 'Hoje' : format(dataObj, "d 'de' MMMM", { locale: ptBR })}
            </h1>
            <p className="text-cream-muted text-sm">{user?.nome}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="text-cream/60 hover:text-cream"
            disabled={isFetching}
          >
            <RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Active indicator */}
        {temMudancaAtiva && (
          <div className="mt-2 bg-primary/20 border border-primary/30 rounded-lg px-3 py-1.5 text-sm font-medium text-primary">
            Tem mudança em curso
          </div>
        )}
      </header>

      {/* Date selector */}
      <div className="bg-muted border-b border-border px-2 py-3">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {weekDays.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSelected = dateStr === dataSelecionada;
            const isTodayDate = isToday(date);
            return (
              <button
                key={dateStr}
                onClick={() => setDataSelecionada(dateStr)}
                className={`flex flex-col items-center min-w-[52px] px-2 py-1.5 rounded-lg transition-all duration-200 ${
                  isSelected
                    ? 'bg-night text-cream shadow-md'
                    : isTodayDate
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <span className="text-[10px] uppercase font-medium tracking-wider">
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
              <div key={i} className="bg-card/60 rounded-lg p-4 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/2 mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : mudancasDoDia.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground/60">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium text-foreground">Sem mudanças agendadas</p>
            <p className="text-sm mt-1">Para este dia não há mudanças atribuídas.</p>
          </div>
        ) : (
          mudancasDoDia.map((mudanca: any) => (
            <Link key={mudanca.id} to={`/mudanca/${mudanca.id}`}>
              <div className={`bg-card/80 rounded-lg shadow-sm p-4 space-y-2 border-l-4 transition-shadow hover:shadow-md ${
                mudanca.estado === 'a_caminho' ? 'border-l-primary' :
                mudanca.estado === 'em_servico' ? 'border-l-night' :
                mudanca.estado === 'concluida' ? 'border-l-terracotta' :
                'border-l-primary-light'
              } ${mudanca.id === proximaMudanca?.id ? 'ring-2 ring-primary/40 shadow-primary/10' : ''}`}>
                {mudanca.id === proximaMudanca?.id && (
                  <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold tracking-wider uppercase mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    Proxima
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg text-foreground">{mudanca.clienteNome}</h2>
                  <StatusBadge status={mudanca.estado} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{mudanca.horaPretendida || 'Hora a definir'}</span>
                  {mudanca.tipoServico === 'urgente' && (
                    <span className="text-[10px] font-bold bg-terracotta/10 text-terracotta px-1.5 py-0.5 rounded-full">URGENTE</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
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
