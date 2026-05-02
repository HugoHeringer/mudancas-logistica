import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Ban, Trash2, AlertTriangle, X, Clock, User, Truck } from 'lucide-react';
import { agendaApi, motoristasApi } from '../../lib/api';
import { usePermissao } from '../../hooks/use-permissao';
import { useToast } from '../../hooks/use-toast';
import { StatusBadge } from '../../components/status-badge';
import { Card, CardContent } from '../../components/ui/card';
import { GlassCard } from '../../components/luxury/GlassCard';
import { PageHeader } from '../../components/ui/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';

type Vista = 'mensal' | 'semanal' | 'diaria';

// Estado badge colors
const estadoColors: Record<string, string> = {
  pendente: 'bg-amber-400',
  aprovada: 'bg-blue-400',
  a_caminho: 'bg-orange-400',
  em_servico: 'bg-green-500',
  concluida: 'bg-green-300',
  recusada: 'bg-red-400',
  cancelada: 'bg-muted-foreground',
};

export function AgendaPage() {
  const navigate = useNavigate();
  const { podeVer } = usePermissao();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [vista, setVista] = useState<Vista>('mensal');
  const [dataAtual, setDataAtual] = useState(new Date());
  const [filtroMotorista, setFiltroMotorista] = useState<string>('todos');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Bloqueio creation dialog
  const [showCriarBloqueio, setShowCriarBloqueio] = useState(false);
  const [bloqueioInicio, setBloqueioInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bloqueioFim, setBloqueioFim] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [bloqueioMotivo, setBloqueioMotivo] = useState('');

  // Remove bloqueio dialog
  const [showRemoverBloqueio, setShowRemoverBloqueio] = useState(false);
  const [bloqueioParaRemover, setBloqueioParaRemover] = useState<any>(null);

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

  const { data: agendaDiaria } = useQuery({
    queryKey: ['agenda', 'diaria', format(dataAtual, 'yyyy-MM-dd'), filtroMotorista],
    queryFn: async () => {
      const res = await agendaApi.getDiaria(format(dataAtual, 'yyyy-MM-dd'));
      return res.data;
    },
    enabled: vista === 'diaria',
  });

  // Bloqueios for the current month
  const { data: bloqueios } = useQuery({
    queryKey: ['agenda', 'bloqueios', ano, mes],
    queryFn: async () => {
      const res = await agendaApi.getBloqueios(
        format(startOfMonth(dataAtual), 'yyyy-MM-dd'),
        format(endOfMonth(dataAtual), 'yyyy-MM-dd'),
      );
      return res.data;
    },
  });

  // Side panel: fetch day detail when a day is clicked
  const { data: selectedDayData } = useQuery({
    queryKey: ['agenda', 'diaria-panel', selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null],
    queryFn: async () => {
      const res = await agendaApi.getDiaria(format(selectedDay!, 'yyyy-MM-dd'));
      return res.data;
    },
    enabled: !!selectedDay,
  });

  // Mutations
  const criarBloqueioMutation = useMutation({
    mutationFn: () =>
      agendaApi.criarBloqueio({
        dataInicio: bloqueioInicio,
        dataFim: bloqueioFim,
        motivo: bloqueioMotivo,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
      toast({ title: 'Bloqueio criado', description: 'O período foi bloqueado na agenda.' });
      setShowCriarBloqueio(false);
      resetBloqueioForm();
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível criar o bloqueio.', variant: 'destructive' });
    },
  });

  const removerBloqueioMutation = useMutation({
    mutationFn: (id: string) => agendaApi.removerBloqueio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
      toast({ title: 'Bloqueio removido', description: 'O bloqueio foi removido da agenda.' });
      setShowRemoverBloqueio(false);
      setBloqueioParaRemover(null);
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível remover o bloqueio.', variant: 'destructive' });
    },
  });

  const resetBloqueioForm = () => {
    setBloqueioInicio(format(new Date(), 'yyyy-MM-dd'));
    setBloqueioFim(format(new Date(), 'yyyy-MM-dd'));
    setBloqueioMotivo('');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setDataAtual((prev) => {
      if (vista === 'mensal') return direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1);
      if (vista === 'semanal') return new Date(prev.getTime() + (direction === 'next' ? 7 : -7) * 86400000);
      return new Date(prev.getTime() + (direction === 'next' ? 1 : -1) * 86400000);
    });
  };

  const goToToday = () => setDataAtual(new Date());

  // Get mudancas and dias from the appropriate agenda data
  const agendaData = vista === 'mensal' ? agendaMensal : vista === 'semanal' ? agendaSemanal : null;
  const mudancas = agendaData?.mudancas || [];
  const filteredMudancas = filtroMotorista === 'todos'
    ? mudancas
    : mudancas.filter((m: any) => m.motoristaId === filtroMotorista);

  // Get day info from agenda data (capacity model)
  const agendaDias = agendaData?.dias || [];

  // For daily view, use agendaDiaria
  const diaMudancas = agendaDiaria?.mudancas || [];
  const diaCapacidadeOcupada = agendaDiaria?.capacidadeOcupada || 0;
  const diaCapacidadeTotal = agendaDiaria?.capacidadeTotal || 3;

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
    return filteredMudancas.filter((m: any) => {
      const mData = m.dataPretendida ? new Date(m.dataPretendida).toISOString().split('T')[0] : '';
      return mData === dateStr;
    });
  };

  // Get capacity info for a day from the new model
  const getCapacidadeForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayInfo = agendaDias.find((d: any) => d.data === dateStr);
    if (dayInfo) {
      if (dayInfo.bloqueada) return { status: 'bloqueada' as const, total: dayInfo.capacidadeTotal, ocupada: dayInfo.capacidadeOcupada };
      if (dayInfo.capacidadeOcupada >= dayInfo.capacidadeTotal) return { status: 'completo' as const, total: dayInfo.capacidadeTotal, ocupada: dayInfo.capacidadeOcupada };
      if (dayInfo.capacidadeOcupada > 0) return { status: 'parcial' as const, total: dayInfo.capacidadeTotal, ocupada: dayInfo.capacidadeOcupada };
      return { status: 'livre' as const, total: dayInfo.capacidadeTotal, ocupada: 0 };
    }
    return { status: 'livre' as const, total: 3, ocupada: 0 };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'livre': return 'bg-green-400';
      case 'parcial': return 'bg-yellow-400';
      case 'completo': return 'bg-red-400';
      case 'bloqueada': return 'bg-muted-foreground';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'livre': return 'Livre';
      case 'parcial': return 'Parcial';
      case 'completo': return 'Completo';
      case 'bloqueada': return 'Bloqueado';
      default: return '';
    }
  };

  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        subtitle="Visão calendarizada de todas as mudanças"
        actions={
          <div className="flex items-center gap-2">
            {podeVer('criar') && (
              <Button variant="outline" size="sm" onClick={() => setShowCriarBloqueio(true)}>
                <Ban className="h-4 w-4 mr-1" /> Bloqueio
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={goToToday}>Hoje</Button>
            <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[160px] text-center" style={{ color: 'hsl(var(--foreground))' }}>
              {vista === 'diaria'
                ? format(dataAtual, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                : format(dataAtual, "MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

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

      {/* Availability Legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="font-medium">Capacidade:</span>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400" /> Livre</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Parcial</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400" /> Completo</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-muted-foreground" /> Bloqueado</div>
        <span className="ml-4 font-medium">Estados:</span>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400" /> Pendente</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400" /> Aprovada</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400" /> A caminho</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Em serviço</div>
      </div>

      {/* Vista Mensal */}
      {vista === 'mensal' && (
        <GlassCard className="overflow-hidden p-0">
          <div className="grid grid-cols-7" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
            {diasSemana.map((dia) => (
              <div key={dia} className="p-2 text-center text-xs font-medium tracking-wider uppercase" style={{ color: 'hsl(var(--muted-foreground))', borderRight: '1px solid hsl(var(--border))' }}>{dia}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarDays.map((date, i) => {
              const dayMudancas = getMudancasForDay(date);
              const isCurrentMonth = isSameMonth(date, dataAtual);
              const isToday = isSameDay(date, new Date());
              const isSelected = selectedDay && isSameDay(date, selectedDay);
              const capInfo = getCapacidadeForDay(date);
              return (
                <div
                  key={i}
                  className="min-h-[90px] p-1.5 cursor-pointer"
                  style={{
                    background: !isCurrentMonth
                      ? 'var(--surface-container-low)'
                      : isSelected
                      ? 'hsl(var(--primary) / 0.10)'
                      : isToday
                      ? 'hsl(var(--primary) / 0.06)'
                      : capInfo.status === 'bloqueada'
                      ? 'hsl(var(--muted) / 0.5)'
                      : 'transparent',
                    borderRight: '1px solid hsl(var(--border))',
                    borderBottom: '1px solid hsl(var(--border))',
                    outline: isSelected ? '2px solid hsl(var(--primary))' : undefined,
                    outlineOffset: '-2px',
                  }}
                  onClick={() => { setSelectedDay(date); }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span
                      className="text-sm leading-none p-0.5"
                      style={{ color: isToday ? 'hsl(var(--primary))' : !isCurrentMonth ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))', fontWeight: isToday ? 600 : 400 }}
                    >
                      {format(date, 'd')}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(capInfo.status)}`} title={getStatusLabel(capInfo.status)} />
                    <span className="text-[9px] text-muted-foreground ml-auto">{capInfo.ocupada}/{capInfo.total}</span>
                  </div>
                  <div className="space-y-0.5">
                    {dayMudancas.slice(0, 3).map((m: any) => (
                      <div
                        key={m.id}
                        className="text-[10px] px-1 py-0.5 rounded cursor-pointer truncate transition-opacity hover:opacity-70"
                        style={{
                          background: m.estado === 'aprovada' ? 'hsl(var(--primary) / 0.12)' : m.estado === 'em_servico' ? 'hsl(var(--accent) / 0.12)' : m.estado === 'a_caminho' ? 'rgba(251,146,60,0.12)' : 'hsl(var(--muted))',
                          color: 'hsl(var(--foreground))',
                        }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/mudancas/${m.id}`); }}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 ${estadoColors[m.estado] || 'bg-gray-400'}`} />
                        <span style={{ color: 'hsl(var(--primary))', fontWeight: 500 }}>{m.horaPretendida || ''}</span> {m.clienteNome || m.cliente}
                      </div>
                    ))}
                    {dayMudancas.length > 3 && (
                      <p className="text-[10px] text-center" style={{ color: 'hsl(var(--muted-foreground))' }}>+{dayMudancas.length - 3}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Vista Semanal */}
      {vista === 'semanal' && (
        <div className="border rounded-lg bg-card">
          <div className="grid grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => {
              const weekDay = addDays(startOfWeek(dataAtual, { weekStartsOn: 1 }), i);
              const dayMudancas = getMudancasForDay(weekDay);
              const isToday = isSameDay(weekDay, new Date());
              const capInfo = getCapacidadeForDay(weekDay);
              return (
                <div key={i} className={`border-r last:border-r-0 ${isToday ? 'bg-primary/10' : ''} ${capInfo.status === 'bloqueada' ? 'bg-muted' : ''}`}>
                  <div className={`p-2 text-center border-b ${isToday ? 'font-bold text-primary' : ''}`}>
                    <p className="text-xs text-muted-foreground">{format(weekDay, 'EEE', { locale: ptBR })}</p>
                    <p className="text-lg">{format(weekDay, 'd')}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(capInfo.status)}`} />
                      <span className="text-[10px] text-muted-foreground">{capInfo.ocupada}/{capInfo.total}</span>
                    </div>
                  </div>
                  <div className="p-1 space-y-1 min-h-[300px]">
                    {dayMudancas.map((m: any) => (
                      <div key={m.id} className="text-xs p-2 rounded border cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/mudancas/${m.id}`)}>
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${estadoColors[m.estado] || 'bg-gray-400'}`} />
                          <p className="font-medium">{m.horaPretendida || '—'}</p>
                        </div>
                        <p className="truncate">{m.clienteNome || m.cliente}</p>
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{format(dataAtual, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Capacidade:</span>
              <span className="text-sm font-medium">{diaCapacidadeOcupada}/{diaCapacidadeTotal}</span>
              <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(diaCapacidadeOcupada >= diaCapacidadeTotal ? 'completo' : diaCapacidadeOcupada > 0 ? 'parcial' : 'livre')}`} />
            </div>
          </div>

          {/* Bloqueios do mês */}
          {bloqueios && (bloqueios as any[]).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Bloqueios ativos este mês</h4>
              {(bloqueios as any[]).map((b: any) => (
                <Card key={b.id} className="border-border bg-muted/50">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ban className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{format(new Date(b.dataInicio), 'dd/MM/yyyy')} — {format(new Date(b.dataFim), 'dd/MM/yyyy')}</p>
                        <p className="text-xs text-muted-foreground">{b.motivo}</p>
                      </div>
                    </div>
                    {podeVer('editar') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => { setBloqueioParaRemover(b); setShowRemoverBloqueio(true); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {diaMudancas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>Nenhuma mudança agendada para este dia.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {diaMudancas.map((m: any) => (
                <Card key={m.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/mudancas/${m.id}`)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-bold">{m.horaPretendida || '—'}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{m.clienteNome || m.clienteNome}</p>
                      <p className="text-sm text-muted-foreground">{m.motorista?.nome || 'Sem motorista'} | {m.tipoServico === 'urgente' ? 'Urgente' : 'Normal'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${estadoColors[m.estado] || 'bg-gray-400'}`} />
                      <StatusBadge status={m.estado} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dialog: Criar Bloqueio */}
      <Dialog open={showCriarBloqueio} onOpenChange={setShowCriarBloqueio}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear Período</DialogTitle>
            <DialogDescription>
              Bloqueie um período na agenda. Nenhuma mudança poderá ser agendada neste intervalo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data início</Label>
                <Input
                  type="date"
                  value={bloqueioInicio}
                  onChange={(e) => setBloqueioInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data fim</Label>
                <Input
                  type="date"
                  value={bloqueioFim}
                  onChange={(e) => setBloqueioFim(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Textarea
                value={bloqueioMotivo}
                onChange={(e) => setBloqueioMotivo(e.target.value)}
                placeholder="Ex: Feriado, manutenção, folga..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCriarBloqueio(false); resetBloqueioForm(); }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={!bloqueioInicio || !bloqueioFim || !bloqueioMotivo.trim() || criarBloqueioMutation.isPending}
              onClick={() => criarBloqueioMutation.mutate()}
            >
              {criarBloqueioMutation.isPending ? 'A bloquear...' : 'Bloquear Período'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Remover Bloqueio */}
      <Dialog open={showRemoverBloqueio} onOpenChange={setShowRemoverBloqueio}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Bloqueio</DialogTitle>
            <DialogDescription>
              O período voltará a ficar disponível para agendamento.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <p className="text-sm text-destructive">
              Tem a certeza que deseja remover este bloqueio? O período ficará disponível novamente.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRemoverBloqueio(false); setBloqueioParaRemover(null); }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={removerBloqueioMutation.isPending}
              onClick={() => {
                if (bloqueioParaRemover) {
                  removerBloqueioMutation.mutate(bloqueioParaRemover.id);
                }
              }}
            >
              {removerBloqueioMutation.isPending ? 'A remover...' : 'Remover Bloqueio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Side Panel: Day Detail */}
      {selectedDay && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setSelectedDay(null)}
          />
          {/* Panel */}
          <div className="fixed right-0 top-0 bottom-0 z-50 w-[420px] max-w-full bg-card border-l border-border shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold">
                  {format(selectedDay, "d 'de' MMMM", { locale: ptBR })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDay, 'EEEE', { locale: ptBR })}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDay(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Capacity indicator */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-3">
              {(() => {
                const capInfo = getCapacidadeForDay(selectedDay);
                const pct = capInfo.total > 0 ? Math.round((capInfo.ocupada / capInfo.total) * 100) : 0;
                return (
                  <>
                    <span className={`w-3 h-3 rounded-full ${getStatusColor(capInfo.status)}`} />
                    <span className="text-sm font-medium">
                      {capInfo.ocupada}/{capInfo.total} mudanças
                    </span>
                    <span className="text-xs text-muted-foreground">({pct}%)</span>
                    <div className="flex-1" />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      capInfo.status === 'livre' ? 'bg-green-100 text-green-800' :
                      capInfo.status === 'parcial' ? 'bg-yellow-100 text-yellow-800' :
                      capInfo.status === 'completo' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusLabel(capInfo.status)}
                    </span>
                  </>
                );
              })()}
            </div>

            {/* Mudancas list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(() => {
                const panelMudancas = selectedDayData?.mudancas || getMudancasForDay(selectedDay);
                if (panelMudancas.length === 0) {
                  return (
                    <div className="py-12 text-center text-muted-foreground">
                      <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">Nenhuma mudança agendada para este dia.</p>
                    </div>
                  );
                }
                return panelMudancas.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/mudancas/${m.id}`)}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold" style={{ color: 'hsl(var(--primary))' }}>
                        {m.horaPretendida || '—'}
                      </span>
                      {m.tempoEstimadoHoras && (
                        <span className="text-xs text-muted-foreground">
                          ({Number(m.tempoEstimadoHoras)}h)
                        </span>
                      )}
                      <div className="flex-1" />
                      <StatusBadge status={m.estado} size="sm" />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{m.clienteNome || m.cliente || '—'}</span>
                    </div>
                    {(m.motorista?.nome || m.motoristaNome) && (
                      <div className="flex items-center gap-2 text-sm mt-1 text-muted-foreground">
                        <Truck className="h-3.5 w-3.5" />
                        <span>{m.motorista?.nome || m.motoristaNome}</span>
                      </div>
                    )}
                    {m.tipoServico === 'urgente' && (
                      <span className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-medium">
                        URGENTE
                      </span>
                    )}
                  </div>
                ));
              })()}
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setDataAtual(selectedDay);
                  setVista('diaria');
                  setSelectedDay(null);
                }}
              >
                Ver vista diária completa
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
