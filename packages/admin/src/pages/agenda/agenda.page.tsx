import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { agendaApi, motoristasApi } from '../../lib/api';
import { StatusBadge } from '../../components/status-badge';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

type Vista = 'mensal' | 'semanal' | 'diaria';

export function AgendaPage() {
  const navigate = useNavigate();
  const [vista, setVista] = useState<Vista>('mensal');
  const [dataAtual, setDataAtual] = useState(new Date());
  const [filtroMotorista, setFiltroMotorista] = useState<string>('todos');

  const ano = dataAtual.getFullYear();
  const mes = dataAtual.getMonth() + 1;

  const { data: motoristas } = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => motoristasApi.findAll().then((r) => r.data),
  });

  const { data: agendaMensal } = useQuery({
    queryKey: ['agenda', 'mensal', ano, mes, filtroMotorista],
    queryFn: async () => {
      const res = await agendaApi.getMensal(ano, mes);
      return res.data;
    },
    enabled: vista === 'mensal',
  });

  const { data: agendaSemanal } = useQuery({
    queryKey: ['agenda', 'semanal', format(startOfWeek(dataAtual, { weekStartsOn: 1 }), 'yyyy-MM-dd'), filtroMotorista],
    queryFn: async () => {
      const dataInicio = format(startOfWeek(dataAtual, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const res = await agendaApi.getSemanal(dataInicio);
      return res.data;
    },
    enabled: vista === 'semanal',
  });

  const { data: slotsDia } = useQuery({
    queryKey: ['agenda', 'slots', format(dataAtual, 'yyyy-MM-dd'), filtroMotorista],
    queryFn: async () => {
      const res = await agendaApi.getSlots(format(dataAtual, 'yyyy-MM-dd'));
      return res.data;
    },
    enabled: vista === 'diaria',
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    setDataAtual((prev) => {
      if (vista === 'mensal') return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);
      if (vista === 'semanal') return new Date(prev.getTime() + (direction === 'next' ? 7 : -7) * 86400000);
      return new Date(prev.getTime() + (direction === 'next' ? 1 : -1) * 86400000);
    });
  };

  const goToToday = () => setDataAtual(new Date());

  const mudancas = agendaMensal?.mudancas || agendaSemanal?.mudancas || [];
  const filteredMudancas = filtroMotorista === 'todos'
    ? mudancas
    : mudancas.filter((m: any) => m.motoristaId === filtroMotorista);

  // Calendar grid for monthly view
  const monthStart = startOfMonth(dataAtual);
  const monthEnd = endOfMonth(dataAtual);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarDays: Date[] = [];
  let d = calendarStart;
  while (d <= monthEnd || calendarDays.length < 35) {
    calendarDays.push(d);
    d = addDays(d, 1);
    if (calendarDays.length >= 42) break;
  }

  const getMudancasForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredMudancas.filter((m: any) => m.dataPretendida === dateStr);
  };

  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Agenda</h2>
          <p className="text-muted-foreground">Visão calendarizada de todas as mudanças confirmadas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>Hoje</Button>
          <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[160px] text-center">
            {vista === 'diaria'
              ? format(dataAtual, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
              : format(dataAtual, "MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filtros e vista */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={vista} onValueChange={(v) => setVista(v as Vista)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mensal">Mensal</SelectItem>
            <SelectItem value="semanal">Semanal</SelectItem>
            <SelectItem value="diaria">Diária</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroMotorista} onValueChange={setFiltroMotorista}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Motorista" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os motoristas</SelectItem>
            {(motoristas || []).map((m: any) => (
              <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vista Mensal */}
      {vista === 'mensal' && (
        <div className="border rounded-lg bg-white">
          <div className="grid grid-cols-7 border-b">
            {diasSemana.map((dia) => (
              <div key={dia} className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">{dia}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((date, i) => {
              const dayMudancas = getMudancasForDay(date);
              const isCurrentMonth = isSameMonth(date, dataAtual);
              const isToday = isSameDay(date, new Date());
              return (
                <div key={i} className={`min-h-[100px] p-1 border-r border-b last:border-r-0 ${!isCurrentMonth ? 'bg-gray-50' : ''} ${isToday ? 'bg-blue-50' : ''}`}>
                  <div className={`text-sm p-1 ${!isCurrentMonth ? 'text-gray-400' : ''} ${isToday ? 'font-bold text-blue-600' : ''}`}>
                    {format(date, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayMudancas.slice(0, 3).map((m: any) => (
                      <div
                        key={m.id}
                        className="text-xs p-0.5 rounded cursor-pointer hover:opacity-80 truncate"
                        style={{ backgroundColor: m.estado === 'aprovada' ? '#dbeafe' : m.estado === 'em_servico' ? '#cffafe' : m.estado === 'a_caminho' ? '#ede9fe' : '#f3f4f6' }}
                        onClick={() => navigate(`/mudancas/${m.id}`)}
                      >
                        <span className="font-medium">{m.horaPretendida || ''}</span> {m.clienteNome}
                      </div>
                    ))}
                    {dayMudancas.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">+{dayMudancas.length - 3} mais</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista Semanal */}
      {vista === 'semanal' && (
        <div className="border rounded-lg bg-white">
          <div className="grid grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => {
              const weekDay = addDays(startOfWeek(dataAtual, { weekStartsOn: 1 }), i);
              const dayMudancas = getMudancasForDay(weekDay);
              const isToday = isSameDay(weekDay, new Date());
              return (
                <div key={i} className={`border-r last:border-r-0 ${isToday ? 'bg-blue-50' : ''}`}>
                  <div className={`p-2 text-center border-b ${isToday ? 'font-bold text-blue-600' : ''}`}>
                    <p className="text-xs text-muted-foreground">{format(weekDay, 'EEE', { locale: ptBR })}</p>
                    <p className="text-lg">{format(weekDay, 'd')}</p>
                  </div>
                  <div className="p-1 space-y-1 min-h-[300px]">
                    {dayMudancas.map((m: any) => (
                      <div key={m.id} className="text-xs p-2 rounded border cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/mudancas/${m.id}`)}>
                        <p className="font-medium">{m.horaPretendida || '—'}</p>
                        <p className="truncate">{m.clienteNome}</p>
                        <StatusBadge status={m.estado} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista Diária */}
      {vista === 'diaria' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{format(dataAtual, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}</h3>
          {getMudancasForDay(dataAtual).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma mudança agendada para este dia.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {getMudancasForDay(dataAtual).map((m: any) => (
                <Card key={m.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/mudancas/${m.id}`)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-bold">{m.horaPretendida || '—'}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{m.clienteNome}</p>
                      <p className="text-sm text-muted-foreground">{m.motorista?.nome || 'Sem motorista'} | {m.tipoServico === 'urgente' ? 'Urgente' : 'Normal'}</p>
                    </div>
                    <StatusBadge status={m.estado} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
