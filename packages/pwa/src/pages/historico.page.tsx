import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { mudancasApi } from '../lib/api';
import { StatusBadge } from '../components/status-badge';
import { Card, CardContent } from '../components/ui/card';

export function HistoricoPage() {
  const [filtro, setFiltro] = useState<'todas' | 'concluida' | 'cancelada'>('todas');

  const dataFim = format(new Date(), 'yyyy-MM-dd');
  const dataInicio = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  const { data: mudancas, isLoading } = useQuery({
    queryKey: ['mudancas', 'historico', dataInicio, dataFim],
    queryFn: () =>
      mudancasApi.getMinhas({ dataInicio, dataFim }).then((r) => r.data),
  });

  const todasMudancas = mudancas || [];
  const mudancasFiltradas =
    filtro === 'todas'
      ? todasMudancas.filter((m: any) => m.estado === 'concluida' || m.estado === 'cancelada')
      : todasMudancas.filter((m: any) => m.estado === filtro);

  const totalConcluidas = todasMudancas.filter((m: any) => m.estado === 'concluida').length;
  const totalHoras = todasMudancas
    .filter((m: any) => m.estado === 'concluida' && m.conclusao?.horasCobradas)
    .reduce((acc: number, m: any) => acc + (m.conclusao?.horasCobradas || 0), 0);

  return (
    <div className="min-h-screen bg-sand pb-20">
      <header className="bg-night text-cream p-4">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--tenant-font-display)' }}>Histórico</h1>
        <p className="text-cream-muted text-sm">Últimos 30 dias</p>
      </header>

      {/* Summary cards */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-6 w-6 text-terracotta mx-auto mb-1" />
            <p className="text-2xl font-bold text-brown">{totalConcluidas}</p>
            <p className="text-xs text-brown-medium/60">Concluídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="h-6 w-6 text-gold mx-auto mb-1" />
            <p className="text-2xl font-bold text-brown">{totalHoras}h</p>
            <p className="text-xs text-brown-medium/60">Horas cobradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="px-4 flex gap-2">
        {(['todas', 'concluida', 'cancelada'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              filtro === f ? 'bg-night text-cream' : 'bg-sand-dark text-brown-medium hover:bg-sand-medium/50'
            }`}
          >
            {f === 'todas' ? 'Todas' : f === 'concluida' ? 'Concluídas' : 'Canceladas'}
          </button>
        ))}
      </div>

      {/* List */}
      <main className="p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-cream/60 rounded-lg p-4 animate-pulse">
                <div className="h-5 bg-sand-medium rounded w-1/2 mb-3" />
                <div className="h-4 bg-sand-medium rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : mudancasFiltradas.length === 0 ? (
          <div className="text-center py-12 text-brown-medium/60">
            <XCircle className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium text-brown">Sem histórico</p>
            <p className="text-sm mt-1">Não há mudanças neste período.</p>
          </div>
        ) : (
          mudancasFiltradas.map((mudanca: any) => (
            <Link key={mudanca.id} to={`/mudanca/${mudanca.id}`}>
              <div className="bg-cream/80 rounded-lg shadow-sm p-4 space-y-2 border-l-4 border-l-sand-medium transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-brown">{mudanca.clienteNome}</h2>
                  <StatusBadge status={mudanca.estado} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-brown-medium text-sm">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{mudanca.dataPretendida ? format(new Date(mudanca.dataPretendida + 'T12:00:00'), "d MMM", { locale: ptBR }) : '—'}</span>
                  {mudanca.conclusao?.horasCobradas && (
                    <span className="text-brown-medium/40">• {mudanca.conclusao.horasCobradas}h</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-brown-medium text-sm">
                  <MapPin className="h-3 w-3 shrink-0" />
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
