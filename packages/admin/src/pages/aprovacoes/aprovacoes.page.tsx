import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { mudancasApi, motoristasApi } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../hooks/use-toast';
import { StatusBadge } from '../../components/status-badge';
import { EmptyState } from '../../components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
  motorista: 'Motorista',
  motorista_1_ajudante: 'Motorista + 1 Ajudante',
  motorista_2_ajudantes: 'Motorista + 2 Ajudantes',
};

export function AprovacoesPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMudanca, setSelectedMudanca] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAprovar, setShowAprovar] = useState(false);
  const [showRecusar, setShowRecusar] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  // Form state
  const [motoristaId, setMotoristaId] = useState('');
  const [tempoEstimado, setTempoEstimado] = useState('2');
  const [observacoesAdmin, setObservacoesAdmin] = useState('');
  const [motivoRecusa, setMotivoRecusa] = useState('');

  const { data: pendentes, isLoading } = useQuery({
    queryKey: ['mudancas', 'pendentes', filtroTipo],
    queryFn: async () => {
      const filters: any = { estado: 'pendente' };
      if (filtroTipo !== 'todos') filters.tipoServico = filtroTipo;
      const res = await mudancasApi.findAll(filters);
      return res.data;
    },
  });

  const { data: motoristasDisponiveis } = useQuery({
    queryKey: ['motoristas', 'disponiveis'],
    queryFn: () => motoristasApi.findDisponiveis().then((r) => r.data),
  });

  const aprovarMutation = useMutation({
    mutationFn: (data: { id: string; aprovadoPor: string; motoristaId: string; tempoEstimadoHoras: number; observacoesAdmin?: string }) =>
      mudancasApi.approve(data.id, {
        aprovadoPor: data.aprovadoPor,
        motoristaId: data.motoristaId,
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
    setTempoEstimado('2');
    setObservacoesAdmin('');
    setMotivoRecusa('');
  };

  const handleOpenAprovar = (mudanca: any) => {
    setSelectedMudanca(mudanca);
    setShowDetail(false);
    setShowAprovar(true);
  };

  const handleOpenRecusar = (mudanca: any) => {
    setSelectedMudanca(mudanca);
    setShowDetail(false);
    setShowRecusar(true);
  };

  const handleOpenDetail = (mudanca: any) => {
    setSelectedMudanca(mudanca);
    setShowDetail(true);
  };

  const renderMorada = (morada: any) => {
    if (!morada) return '-';
    return `${morada.rua || ''} ${morada.numero || ''}${morada.andar ? `, ${morada.andar}` : ''}, ${morada.codigoPostal || ''} ${morada.localidade || ''}${morada.elevador !== undefined ? ` | Elevador: ${morada.elevador ? 'Sim' : 'Não'}` : ''}`;
  };

  const mudancas = pendentes || [];

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Aprovações</h2>
          <p className="text-muted-foreground">
            {mudancas.length} solicitação(ões) pendente(s)
          </p>
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Lista de solicitações */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : mudancas.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Sem solicitações pendentes"
          description="Todas as solicitações foram processadas. Novas solicitações aparecerão aqui."
        />
      ) : (
        <div className="space-y-4">
          {mudancas.map((mudanca: any) => (
            <Card key={mudanca.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={mudanca.estado} />
                      {mudanca.tipoServico === 'urgente' && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                          URGENTE
                        </span>
                      )}
                      <StatusBadge status={mudanca.equipa} />
                    </div>
                    <h3 className="font-semibold text-lg">{mudanca.clienteNome}</h3>
                    <p className="text-sm text-muted-foreground">
                      {mudanca.clienteEmail} | {mudanca.clienteTelefone}
                    </p>
                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium">Data:</span>{' '}
                        {mudanca.dataPretendida}
                        {mudanca.horaPretendida && ` às ${mudanca.horaPretendida}`}
                      </p>
                      <p>
                        <span className="font-medium">Recolha:</span>{' '}
                        {renderMorada(mudanca.moradaRecolha)}
                      </p>
                      <p>
                        <span className="font-medium">Entrega:</span>{' '}
                        {renderMorada(mudanca.moradaEntrega)}
                      </p>
                      <p>
                        <span className="font-medium">Equipa:</span>{' '}
                        {EQUIPA_LABELS[mudanca.equipa] || mudanca.equipa}
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-row lg:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetail(mudanca)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenAprovar(mudanca)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenRecusar(mudanca)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Recusar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
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
                    <p className="text-blue-600 mt-1">Pais: {selectedMudanca.moradaRecolha.pais}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Morada de Entrega</CardTitle></CardHeader>
                <CardContent className="text-sm">
                  <p>{renderMorada(selectedMudanca.moradaEntrega)}</p>
                  {selectedMudanca.eInternacional && selectedMudanca.moradaEntrega?.pais && (
                    <p className="text-blue-600 mt-1">Pais: {selectedMudanca.moradaEntrega.pais}</p>
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
                  {selectedMudanca.eInternacional && <p><span className="font-medium text-blue-600">Internacional</span></p>}
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
                <Button
                  variant="destructive"
                  onClick={() => { setShowDetail(false); handleOpenRecusar(selectedMudanca); }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Recusar
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => { setShowDetail(false); handleOpenAprovar(selectedMudanca); }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aprovar
                </Button>
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
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-blue-900">{selectedMudanca.clienteNome}</p>
                <p className="text-blue-700">{selectedMudanca.dataPretendida} {selectedMudanca.horaPretendida && `às ${selectedMudanca.horaPretendida}`}</p>
              </div>

              <div className="space-y-2">
                <Label>Motorista</Label>
                <Select value={motoristaId} onValueChange={setMotoristaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar motorista disponível" />
                  </SelectTrigger>
                  <SelectContent>
                    {(motoristasDisponiveis || []).map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nome} {m.veiculo ? `— ${m.veiculo.nome}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              className="bg-green-600 hover:bg-green-700"
              disabled={!motoristaId || aprovarMutation.isPending}
              onClick={() => {
                if (!selectedMudanca || !motoristaId) return;
                aprovarMutation.mutate({
                  id: selectedMudanca.id,
                  aprovadoPor: user?.id || '',
                  motoristaId,
                  tempoEstimadoHoras: parseFloat(tempoEstimado),
                  observacoesAdmin: observacoesAdmin || undefined,
                });
              }}
            >
              {aprovarMutation.isPending ? 'A aprovar...' : 'Confirmar Aprovação'}
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
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">
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
