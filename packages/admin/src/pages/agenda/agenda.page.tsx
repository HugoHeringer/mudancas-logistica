import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Ban, Trash2, AlertTriangle } from 'lucide-react';
import { agendaApi, motoristasApi } from '../../lib/api';
import { usePermissao } from '../../hooks/use-permissao';
import { useToast } from '../../hooks/use-toast';
import { StatusBadge } from '../../components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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

export function AgendaPage() {
  const navigate = useNavigate();
  const { podeVer } = usePermissao();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [vista, setVista] = useState<Vista>('mensal');
  const [dataAtual, setDataAtual] = useState(new Date());
  const [filtroMotorista, setFiltroMotorista] = useState<string>('todos');

  // Slot creation dialog
  const [showCriarSlot, setShowCriarSlot] = useState(false);
  const [slotData, setSlotData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slotHoraInicio, setSlotHoraInicio] = useState('08:00');
  const [slotHoraFim, setSlotHoraFim] = useState('10:00');
  const [slotCapacidade, setSlotCapacidade] = useState('1');

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

  const { data: slotsDia } = useQuery({
    queryKey: ['agenda', 'slots', format(dataAtual, 'yyyy-MM-dd'), filtroMotorista],
    queryFn: async () => {
      const res = await agendaApi.getSlots(format(dataAtual, 'yyyy-MM-dd'));
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

  // Mutations
  const criarSlotMutation = useMutation({
    mutationFn: () =>
      agendaApi.criarSlots(slotData, [{
        horaInicio: slotHoraInicio,
        horaFim: slotHoraFim,
        capacidadeTotal: parseInt(slotCapacidade),
      }]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda'] });
      toast({ title: 'Slot criado', description: 'O novo slot foi adicionado à agenda.' });
      setShowCriarSlot(false);
      resetSlotForm();
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível criar o slot.', variant: 'destructive' });
    },
  });

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

  const resetSlotForm = () => {
    setSlotData(format(new Date(), 'yyyy-MM-dd'));
    setSlotHoraInicio('08:00');
    setSlotHoraFim('10:00');
    setSlotCapacidade('1');
  };

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

  const mudancas = agendaMensal?.mudancas || agendaSemanal?.mudancas || [];
  const filteredMudancas = filtroMotorista === 'todos'
    ? mudancas
    : mudancas.filter((m: any) => m.motoristaId === filtroMotorista);

  // Get day info from agenda data
  const agendaDias = agendaMensal?.dias || agendaSemanal?.dias || [];

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

  // Get slot availability info for a day
  const getSlotInfoForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayInfo = agendaDias.find((d: any) => d.data === dateStr);
    if (dayInfo) {
      if (dayInfo.bloqueada) return { status: 'bloqueada' as const, total: dayInfo.total, ocupada: dayInfo.ocupada };
      if (dayInfo.ocupada >= dayInfo.total && dayInfo.total > 0) return { status: 'completo' as const, total: dayInfo.total, ocupada: dayInfo.ocupada };
      if (dayInfo.ocupada > 0) return { status: 'parcial' as const, total: dayInfo.total, ocupada: dayInfo.ocupada };
      if (dayInfo.total > 0) return { status: 'livre' as const, total: dayInfo.total, ocupada: dayInfo.ocupada };
    }
    return { status: 'sem_slots' as const, total: 0, ocupada: 0 };
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Agenda</h2>
          <p className="text-muted-foreground">Visão calendarizada de todas as mudanças confirmadas</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Action buttons */}
          {podeVer('criar') && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowCriarSlot(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Slot
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCriarBloqueio(true)}>
                <Ban className="h-4 w-4 mr-1" />
                Bloqueio
              </Button>
            </>
          )}

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

      {/* Availability Legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="font-medium">Disponibilidade:</span>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400" /> Livre</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Parcial</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400" /> Completo</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-muted-foreground" /> Bloqueado</div>
      </div>

      {/* Vista Mensal */}
      {vista === 'mensal' && (
        <div className="border rounded-lg bg-card">
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
              const slotInfo = getSlotInfoForDay(date);
              return (
                <div key={i} className={`min-h-[100px] p-1 border-r border-b last:border-r-0 ${!isCurrentMonth ? 'bg-muted/50' : ''} ${isToday ? 'bg-primary/10' : ''} ${slotInfo.status === 'bloqueada' ? 'bg-muted' : ''}`}>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm p-1 ${!isCurrentMonth ? 'text-muted-foreground' : ''} ${isToday ? 'font-bold text-primary' : ''}`}>
                      {format(date, 'd')}
                    </span>
                    {slotInfo.status !== 'sem_slots' && (
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(slotInfo.status)}`} title={getStatusLabel(slotInfo.status)} />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {dayMudancas.slice(0, 3).map((m: any) => (
                      <div
                        key={m.id}
                        className={`text-xs p-0.5 rounded cursor-pointer hover:opacity-80 truncate ${m.estado === 'aprovada' ? 'bg-blue-500/10' : m.estado === 'em_servico' ? 'bg-cyan-500/10' : m.estado === 'a_caminho' ? 'bg-purple-500/10' : 'bg-muted'}`}
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
        <div className="border rounded-lg bg-card">
          <div className="grid grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => {
              const weekDay = addDays(startOfWeek(dataAtual, { weekStartsOn: 1 }), i);
              const dayMudancas = getMudancasForDay(weekDay);
              const isToday = isSameDay(weekDay, new Date());
              const slotInfo = getSlotInfoForDay(weekDay);
              return (
                <div key={i} className={`border-r last:border-r-0 ${isToday ? 'bg-primary/10' : ''} ${slotInfo.status === 'bloqueada' ? 'bg-muted' : ''}`}>
                  <div className={`p-2 text-center border-b ${isToday ? 'font-bold text-primary' : ''}`}>
                    <p className="text-xs text-muted-foreground">{format(weekDay, 'EEE', { locale: ptBR })}</p>
                    <p className="text-lg">{format(weekDay, 'd')}</p>
                    {slotInfo.status !== 'sem_slots' && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(slotInfo.status)}`} />
                        <span className="text-[10px] text-muted-foreground">{slotInfo.ocupada}/{slotInfo.total}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-1 space-y-1 min-h-[300px]">
                    {dayMudancas.map((m: any) => (
                      <div key={m.id} className="text-xs p-2 rounded border cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/mudancas/${m.id}`)}>
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

          {/* Slots com indicadores de disponibilidade */}
          {slotsDia && slotsDia.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Slots do dia</h4>
              <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                {(slotsDia as any[]).map((slot: any) => {
                  const isAvailable = !slot.eBloqueado && slot.capacidadeOcupada < slot.capacidadeTotal;
                  const isFull = slot.capacidadeOcupada >= slot.capacidadeTotal && !slot.eBloqueado;
                  const isPartial = slot.capacidadeOcupada > 0 && !isFull && !slot.eBloqueado;
                  return (
                    <Card
                      key={slot.id}
                      className={`${
                        slot.eBloqueado ? 'border-border bg-muted/50' :
                        isFull ? 'border-destructive/30 bg-destructive/10' :
                        isPartial ? 'border-yellow-500/30 bg-yellow-500/10' :
                        'border-green-500/30 bg-green-500/10'
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{slot.horaInicio} — {slot.horaFim}</p>
                            <p className="text-xs text-muted-foreground">
                              {slot.eBloqueado ? 'Bloqueado' : `${slot.capacidadeOcupada}/${slot.capacidadeTotal} ocupados`}
                            </p>
                          </div>
                          <span className={`w-3 h-3 rounded-full ${
                            slot.eBloqueado ? 'bg-muted-foreground' :
                            isFull ? 'bg-red-400' :
                            isPartial ? 'bg-yellow-400' :
                            'bg-green-400'
                          }`} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

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
                        <p className="text-sm font-medium">{b.dataInicio} — {b.dataFim}</p>
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

          {getMudancasForDay(dataAtual).length === 0 && (!slotsDia || (slotsDia as any[]).length === 0) ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>Nenhuma mudança agendada nem slots para este dia.</p>
                {podeVer('criar') && (
                  <Button variant="outline" className="mt-4" onClick={() => setShowCriarSlot(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Criar Slot
                  </Button>
                )}
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

      {/* Dialog: Criar Slot */}
      <Dialog open={showCriarSlot} onOpenChange={setShowCriarSlot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Slot de Agenda</DialogTitle>
            <DialogDescription>
              Adicione um novo slot de disponibilidade à agenda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={slotData}
                onChange={(e) => setSlotData(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora início</Label>
                <Input
                  type="time"
                  value={slotHoraInicio}
                  onChange={(e) => setSlotHoraInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora fim</Label>
                <Input
                  type="time"
                  value={slotHoraFim}
                  onChange={(e) => setSlotHoraFim(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Capacidade</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={slotCapacidade}
                onChange={(e) => setSlotCapacidade(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Número de mudanças que este slot pode acomodar em simultâneo.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCriarSlot(false); resetSlotForm(); }}>
              Cancelar
            </Button>
            <Button
              disabled={!slotData || !slotHoraInicio || !slotHoraFim || criarSlotMutation.isPending}
              onClick={() => criarSlotMutation.mutate()}
            >
              {criarSlotMutation.isPending ? 'A criar...' : 'Criar Slot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
