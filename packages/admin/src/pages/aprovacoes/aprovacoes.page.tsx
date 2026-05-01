import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Eye, AlertTriangle, Clock } from 'lucide-react';
import { mudancasApi, motoristasApi, ajudantesApi, veiculosApi } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { usePermissao } from '../../hooks/use-permissao';
import { useToast } from '../../hooks/use-toast';
import { StatusBadge } from '../../components/status-badge';
import { EmptyState } from '../../components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { GlassCard } from '../../components/luxury/GlassCard';
import { PageHeader } from '../../components/ui/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const EQUIPA_LABELS: Record<string, string> = {
  motorist: 'Motorista',
  motorist_1_ajudante: 'Motorista + 1 Ajudante',
  motorist_2_ajudantes: 'Motorista + 2 Ajudantes',
  motorista: 'Motorista',
  motorista_1_ajudante: 'Motorista + 1 Ajudante',
  motorista_2_ajudantes: 'Motorista + 2 Ajudantes',
};

const EQUIPA_AJUDANTES: Record<string, number> = {
  motorist: 0,
  motorist_1_ajudante: 1,
  motorist_2_ajudantes: 2,
};

function getEquipaAjudantesCount(equipa: string): number {
  // Normalize: "motorista_*" -> "motorist_*"
  const normalized = equipa.replace('motorista_', 'motorist_');
  return EQUIPA_AJUDANTES[normalized] ?? 0;
}

export function AprovacoesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { podeVer } = usePermissao();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMudanca, setSelectedMudanca] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAprovar, setShowAprovar] = useState(false);
  const [showRecusar, setShowRecusar] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  // Reset form when approve dialog closes
  useEffect(() => {
    if (!showAprovar) {
      setSelectedMudanca(null);
      setMotoristaId('');
      setVeiculoId('');
      setAjudantesSelecionados([]);
      setTempoEstimado('2');
      setObservacoesAdmin('');
    }
  }, [showAprovar]);

  // Form state
  const [motoristaId, setMotoristaId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [ajudantesSelecionados, setAjudantesSelecionados] = useState<string[]>([]);
  const [tempoEstimado, setTempoEstimado] = useState('2');
  const [observacoesAdmin, setObservacoesAdmin] = useState('');
  const [motivoRecusa, setMotivoRecusa] = useState('');

  const { data: pendentes, isLoading } = useQuery({
    queryKey: ['mudancas', 'pendentes', filtroTipo],
    queryFn: async () => {
      const filters: any = { estado: ['pendente'] };
      if (filtroTipo !== 'todos') filters.tipoServico = filtroTipo;
      const res = await mudancasApi.findAll(filters);
      return res.data?.items || res.data || [];
    },
  });

const { data: todosMotoristas } = useQuery({
    queryKey: ['motoristas', 'todos'],
    queryFn: () =>motoristasApi.findAll().then((r) => r.data),
  });

  const { data: veiculos } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => veiculosApi.findAll().then((r) => r.data),
  });

  const { data: todosAjudantes } = useQuery({
    queryKey: ['ajudantes', 'todos'],
    queryFn: () =>ajudantesApi.findAll().then((r) => r.data),
});

  const approveMutation = useMutation({
    mutationFn: (data: { id: string; aprovadoPor: string; motoristaId: string; veiculoId?: string | null; ajudantesIds?: string[]; tempoEstimadoHoras: number; observacoesAdmin?: string }) =>
      mudancasApi.approve(data.id, {
        aprovadoPor: data.aprovadoPor,
        motoristaId: data.motoristaId,
        veiculoId: data.veiculoId,
        ajudantesIds: data.ajudantesIds,
        tempoEstimadoHoras: data.tempoEstimadoHoras,
        observacoesAdmin: data.observacoesAdmin,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mudancas'] });
      toast({ title: 'Mudança aprovada', description: 'A agenda foi atualizada e o motorista notificado.' });
      setShowAprovar(false);
      setSelectedMudanca(null);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível aprovar a mudança.', variant: 'destructive' });
    },
  });

  const recusarMutation = useMutation({
    mutationFn: (data: { id: string; motivo: string }) =>
      mudancasApi.refuse(data.id, data.motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mudancas'] });
      toast({ title: 'Mudança recusada', description: 'O cliente será notificado.' });
      setShowRecusar(false);
      setSelectedMudanca(null);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível recusar a mudança.', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setMotoristaId('');
    setVeiculoId('');
    setAjudantesSelecionados([]);
    setTempoEstimado('2');
    setObservacoesAdmin('');
    setMotivoRecusa('');
  };

  const handleOpenAprovar = (mudanca: any) => {
    setSelectedMudanca(mudanca);
    if (mudanca.veiculoId) {
      setVeiculoId(mudanca.veiculoId);
    } else {
      setVeiculoId('');
    }
    setMotoristaId('');
    setAjudantesSelecionados([]);
    setTempoEstimado('2');
    setObservacoesAdmin('');
    setShowDetail(false);
    setShowAprovar(true);
  };

  const handleMotoristaChange = (mid: string) => {
    setMotoristaId(mid);
    if (mid) {
      const selected = (todosMotoristas as any[])?.find((m: any) => m.id === mid);
      if (selected?.veiculoId) {
        setVeiculoId(selected.veiculoId);
      } else {
        setVeiculoId('');
      }
    }
  };

  const handleVeiculoChange = (vid: string) => {
    setVeiculoId(vid === '_none' ? '' : vid);
  };

  const handleOpenRecusar = (mudanca: any) => {
    setSelectedMudanca(mudanca);
    setShowDetail(false);
    setShowRecusar(true);
  };

  const handleOpenDetail = (mudanca: any) => {
    navigate(`/mudancas/${mudanca.id}`);
  };

  const renderMorada = (morada: any) => {
    if (!morada) return '-';
    return `${morada.rua || ''} ${morada.numero || ''}${morada.andar ? `, ${morada.andar}` : ''}, ${morada.codigoPostal || ''} ${morada.localidade || ''}${morada.elevador !== undefined ? ` | Elevador: ${morada.elevador ? 'Sim' : 'Não'}` : ''}`;
  };

  const mudancas = pendentes || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aprovações"
        subtitle={`${mudancas.length} solicitação(ões) pendente(s)`}
        actions={
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Lista de solicitações */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: 'var(--surface-container-low)' }} />
          ))}
        </div>
      ) : mudancas.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Sem solicitações pendentes"
          description="Todas as solicitações foram processadas. Novas solicitações aparecerão aqui."
        />
      ) : (
        <div className="space-y-3">
          {mudancas.map((mudanca: any) => (
            <GlassCard key={mudanca.id} hover className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={mudanca.estado} />
                    {mudanca.tipoServico === 'urgente' && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full"
                        style={{ background: 'hsl(var(--destructive)/0.1)', color: 'hsl(var(--destructive))' }}>
                        Urgente
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-lg font-light mb-1"
                    style={{ fontFamily: 'var(--tenant-font-display)', color: 'hsl(var(--foreground))' }}
                  >
                    {mudanca.clienteNome}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2">
                    {[
                      { label: 'Data', value: `${mudanca.dataPretendida}${mudanca.horaPretendida ? ` às ${mudanca.horaPretendida}` : ''}` },
                      { label: 'Equipa', value: EQUIPA_LABELS[mudanca.equipa] || mudanca.equipa },
                      { label: 'Recolha', value: renderMorada(mudanca.moradaRecolha) },
                      { label: 'Entrega', value: renderMorada(mudanca.moradaEntrega) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <span className="ct-ledger-label">{label}</span>
                        <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--foreground))' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Separador vertical */}
                <div className="hidden lg:block w-px self-stretch" style={{ background: 'hsl(var(--border))' }} />

                {/* Ações */}
                <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[120px]">
                  <Button variant="outline" size="sm" className="flex-1 lg:flex-none" onClick={() => handleOpenDetail(mudanca)}>
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> Ver
                  </Button>
                  {podeVer('aprovar') && (
                    <Button size="sm" className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                      onClick={() => handleOpenAprovar(mudanca)}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Aprovar
                    </Button>
                  )}
                  {podeVer('recusar') && (
                    <Button variant="destructive" size="sm" className="flex-1 lg:flex-none"
                      onClick={() => handleOpenRecusar(mudanca)}>
                      <XCircle className="h-3.5 w-3.5 mr-1.5" /> Recusar
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Dialog de Detalhe */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>
              Informações completas enviadas pelo cliente
            </DialogDescription>
          </DialogHeader>
          {selectedMudanca && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedMudanca.estado} />
                {selectedMudanca.tipoServico === 'urgente' && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-destructive/10 text-destructive rounded-full">
                    URGENTE
                  </span>
                )}
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">Dados do Cliente</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><span className="font-medium">Nome:</span> {selectedMudanca.clienteNome}</p>
                  <p><span className="font-medium">Email:</span> {selectedMudanca.clienteEmail}</p>
                  <p><span className="font-medium">Telefone:</span> {selectedMudanca.clienteTelefone}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Morada de Recolha</CardTitle></CardHeader>
                <CardContent className="text-sm">
                  <p>{renderMorada(selectedMudanca.moradaRecolha)}</p>
                  {selectedMudanca.eInternacional && selectedMudanca.moradaRecolha?.pais && (
                    <p className="text-primary mt-1">Pais: {selectedMudanca.moradaRecolha.pais}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Morada de Entrega</CardTitle></CardHeader>
                <CardContent className="text-sm">
                  <p>{renderMorada(selectedMudanca.moradaEntrega)}</p>
                  {selectedMudanca.eInternacional && selectedMudanca.moradaEntrega?.pais && (
                    <p className="text-primary mt-1">Pais: {selectedMudanca.moradaEntrega.pais}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Serviço</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><span className="font-medium">Data pretendida:</span> {selectedMudanca.dataPretendida}</p>
                  {selectedMudanca.horaPretendida && <p><span className="font-medium">Hora:</span> {selectedMudanca.horaPretendida}</p>}
                  <p><span className="font-medium">Equipa:</span> {EQUIPA_LABELS[selectedMudanca.equipa] || selectedMudanca.equipa}</p>
                  {selectedMudanca.veiculo && <p><span className="font-medium">Veículo:</span> {selectedMudanca.veiculo.nome} ({selectedMudanca.veiculo.metrosCubicos}m³)</p>}
                  {selectedMudanca.eInternacional && <p><span className="font-medium text-primary">Internacional</span></p>}
                </CardContent>
              </Card>

              {selectedMudanca.materiais && Object.keys(selectedMudanca.materiais).length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Materiais</CardTitle></CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc list-inside">
                      {selectedMudanca.materiais.protecaoFilme > 0 && <li>Proteção Filme: {selectedMudanca.materiais.protecaoFilme}</li>}
                      {selectedMudanca.materiais.protecaoCartao > 0 && <li>Proteção Cartão: {selectedMudanca.materiais.protecaoCartao}</li>}
                      {selectedMudanca.materiais.caixas > 0 && <li>Caixas: {selectedMudanca.materiais.caixas}</li>}
                      {selectedMudanca.materiais.fitaCola > 0 && <li>Fita Cola: {selectedMudanca.materiais.fitaCola}</li>}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {selectedMudanca.observacoes && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Observações</CardTitle></CardHeader>
                  <CardContent className="text-sm">
                    <p>{selectedMudanca.observacoes}</p>
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                {podeVer('recusar') && (
                <Button
                  variant="destructive"
                  onClick={() => { setShowDetail(false); handleOpenRecusar(selectedMudanca); }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Recusar
                </Button>
                )}
                {podeVer('aprovar') && (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => { setShowDetail(false); handleOpenAprovar(selectedMudanca); }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aprovar
                </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Aprovação */}
      <Dialog open={showAprovar} onOpenChange={setShowAprovar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Solicitação</DialogTitle>
            <DialogDescription>
              Atribua um motorista e defina o tempo estimado para bloquear na agenda.
            </DialogDescription>
          </DialogHeader>
          {selectedMudanca && (
            <div className="space-y-4">
              <div className="bg-primary/10 p-3 rounded-lg text-sm">
                <p className="font-medium text-foreground">{selectedMudanca.clienteNome}</p>
                <p className="text-primary">{selectedMudanca.dataPretendida} {selectedMudanca.horaPretendida && `às ${selectedMudanca.horaPretendida}`}</p>
                {selectedMudanca.veiculo && (
                  <p className="text-muted-foreground mt-1">Veículo: {selectedMudanca.veiculo.nome || selectedMudanca.veiculo.matricula}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Motorista</Label>
                <Select value={motoristaId} onValueChange={handleMotoristaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar motorista disponível" />
                  </SelectTrigger>
                  <SelectContent>
                    {(todosMotoristas || []).filter((m: any) => m.estado !== 'inativo').map((m: any) => (
                      <SelectItem key={m.id} value={m.id} disabled={m.estado !== 'disponivel'}>
                        {m.nome} {m.veiculo ? `— ${m.veiculo.nome}` : ''}
                        {m.estado !== 'disponivel' && ` (${m.estado})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Veículo</Label>
                <Select value={veiculoId} onValueChange={handleVeiculoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sem veículo</SelectItem>
                    {(veiculos || []).map((v: any) => (
                      <SelectItem key={v.id} value={v.id} disabled={v.estado === 'em_manutencao'}>
                        {v.nome} - {v.matricula}{v.estado === 'em_manutencao' ? ' (Em manutenção)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  O veículo é pré-selecionado conforme escolha do cliente. Selecione outro se necessário.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Ajudantes (opcional)</Label>
                {selectedMudanca && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Cliente escolheu: {EQUIPA_LABELS[selectedMudanca.equipa] || selectedMudanca.equipa} ({getEquipaAjudantesCount(selectedMudanca.equipa)} ajudante(s))
                  </p>
                )}
                {(todosAjudantes || []).length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                    {(todosAjudantes as any[]).map((a: any) => (
                      <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ajudantesSelecionados.includes(a.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAjudantesSelecionados([...ajudantesSelecionados, a.id]);
                            } else {
                              setAjudantesSelecionados(ajudantesSelecionados.filter((id) => id !== a.id));
                            }
                          }}
                          className="rounded border-border"
                        />
                        <span className="text-sm">{a.nome}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem ajudantes disponíveis</p>
                )}
                {selectedMudanca && (
                  <p className="text-xs text-muted-foreground mb-1">
                    Equipa escolhida: {EQUIPA_LABELS[selectedMudanca.equipa] || selectedMudanca.equipa} → {getEquipaAjudantesCount(selectedMudanca.equipa)} ajudante(s)
                  </p>
                )}
                {selectedMudanca && ajudantesSelecionados.length > getEquipaAjudantesCount(selectedMudanca.equipa) && (
                  <p className="text-xs text-amber-600">
                    ⚠️ Admin selecionou {ajudantesSelecionados.length} ajudante(s), mais do que a escolha do cliente
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tempo estimado (horas)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={tempoEstimado}
                  onChange={(e) => setTempoEstimado(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Este tempo será bloqueado na agenda do motorista.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Observações internas (opcional)</Label>
                <Textarea
                  value={observacoesAdmin}
                  onChange={(e) => setObservacoesAdmin(e.target.value)}
                  placeholder="Notas para o motorista ou registo interno..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAprovar(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!motoristaId || approveMutation.isPending}
onClick={() => {
                if (!selectedMudanca || !motoristaId) return;
                // [3.1] Use admin's dropdown selections, NOT the mudanca's original (null) values
                approveMutation.mutate({
                  id: selectedMudanca.id,
                  aprovadoPor: user?.id || '',
                  motoristaId: motoristaId,
                  veiculoId: veiculoId || null,
                  ajudantesIds: ajudantesSelecionados.length > 0 ? ajudantesSelecionados : undefined,
                  tempoEstimadoHoras: parseFloat(tempoEstimado),
                  observacoesAdmin: observacoesAdmin || undefined,
                });
              }}
            >
              {approveMutation.isPending ? 'A aprovar...' : 'Confirmar Aprovação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Recusa */}
      <Dialog open={showRecusar} onOpenChange={setShowRecusar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar Solicitação</DialogTitle>
            <DialogDescription>
              O cliente será notificado por email com o motivo da recusa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">
                Esta ação não pode ser desfeita. O cliente será notificado imediatamente.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Motivo da recusa</Label>
              <Textarea
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
                placeholder="Explique o motivo da recusa ao cliente..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRecusar(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={!motivoRecusa.trim() || recusarMutation.isPending}
              onClick={() => {
                if (!selectedMudanca || !motivoRecusa.trim()) return;
                recusarMutation.mutate({
                  id: selectedMudanca.id,
                  motivo: motivoRecusa,
                });
              }}
            >
              {recusarMutation.isPending ? 'A recusar...' : 'Confirmar Recusa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
