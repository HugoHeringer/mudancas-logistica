import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, AlertTriangle, Search, X, UserPlus } from 'lucide-react';
import { mudancasApi, motoristasApi, ajudantesApi, veiculosApi } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';
import { useToast } from '../hooks/use-toast';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

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
  motorista: 0,
  motorista_1_ajudante: 1,
  motorista_2_ajudantes: 2,
};

function getEquipaAjudantesCount(equipa: string): number {
  const normalized = equipa.replace('motorista_', 'motorist_');
  return EQUIPA_AJUDANTES[normalized] ?? 0;
}

interface AprovarMudancaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mudancaId: string;
  initialVeiculoId?: string;
}

export function AprovarMudancaModal({ open, onOpenChange, mudancaId, initialVeiculoId }: AprovarMudancaModalProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [motoristaId, setMotoristaId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [ajudantesSelecionados, setAjudantesSelecionados] = useState<string[]>([]);
  const [tempoEstimado, setTempoEstimado] = useState('2');
  const [observacoesAdmin, setObservacoesAdmin] = useState('');
  const [conflictError, setConflictError] = useState('');
  const [showAjudanteSearch, setShowAjudanteSearch] = useState(false);
  const [ajudanteSearch, setAjudanteSearch] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setMotoristaId('');
      setVeiculoId('');
      setAjudantesSelecionados([]);
      setTempoEstimado('2');
      setObservacoesAdmin('');
      setConflictError('');
      setAjudanteSearch('');
    }
  }, [open]);

  // Set initial veiculoId
  useEffect(() => {
    if (open && initialVeiculoId) {
      setVeiculoId(initialVeiculoId);
    }
  }, [open, initialVeiculoId]);

  const { data: mudanca } = useQuery({
    queryKey: ['mudancas', mudancaId],
    queryFn: () => mudancasApi.findOne(mudancaId).then((r) => r.data),
    enabled: open && !!mudancaId,
  });

  const { data: todosMotoristas } = useQuery({
    queryKey: ['motoristas', 'todos'],
    queryFn: () => motoristasApi.findAll().then((r) => r.data),
    enabled: open,
  });

  const { data: veiculos } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => veiculosApi.findAll().then((r) => r.data),
    enabled: open,
  });

  const { data: todosAjudantes } = useQuery({
    queryKey: ['ajudantes', 'todos'],
    queryFn: () => ajudantesApi.findAll().then((r) => r.data),
    enabled: open,
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
      onOpenChange(false);
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message || '';

      if (status === 409) {
        setConflictError(message);
      } else {
        toast({ title: 'Erro', description: message || 'Não foi possível aprovar a mudança.', variant: 'destructive' });
      }
    },
  });

  const handleMotoristaChange = (mid: string) => {
    setMotoristaId(mid);
    setConflictError('');
    if (mid) {
      const selected = (todosMotoristas as any[])?.find((m: any) => m.id === mid);
      if (selected?.veiculoId) {
        setVeiculoId(selected.veiculoId);
      }
    }
  };

  const handleVeiculoChange = (vid: string) => {
    setVeiculoId(vid === '_none' ? '' : vid);
    setConflictError('');
  };

  const handleAddAjudante = (id: string) => {
    if (!ajudantesSelecionados.includes(id)) {
      setAjudantesSelecionados([...ajudantesSelecionados, id]);
    }
    setConflictError('');
  };

  const handleRemoveAjudante = (id: string) => {
    setAjudantesSelecionados(ajudantesSelecionados.filter((a) => a !== id));
    setConflictError('');
  };

  const handleSubmit = () => {
    if (!mudanca || !motoristaId) return;
    setConflictError('');
    approveMutation.mutate({
      id: mudancaId,
      aprovadoPor: user?.id || '',
      motoristaId,
      veiculoId: veiculoId || null,
      ajudantesIds: ajudantesSelecionados.length > 0 ? ajudantesSelecionados : undefined,
      tempoEstimadoHoras: parseFloat(tempoEstimado),
      observacoesAdmin: observacoesAdmin || undefined,
    });
  };

  const ajudanteList = (todosAjudantes as any[]) || [];
  const filteredAjudantes = ajudanteSearch
    ? ajudanteList.filter((a: any) =>
        a.eAtivo !== false &&
        a.nome.toLowerCase().includes(ajudanteSearch.toLowerCase())
      )
    : ajudanteList.filter((a: any) => a.eAtivo !== false);

  const selectedAjudanteNames = ajudantesSelecionados.map((id) => {
    const a = ajudanteList.find((a: any) => a.id === id);
    return { id, nome: a?.nome || 'Ajudante' };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprovar Solicitação</DialogTitle>
          <DialogDescription>
            Atribua um motorista e defina o tempo estimado para bloquear na agenda.
          </DialogDescription>
        </DialogHeader>
        {mudanca && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-primary/10 p-3 rounded-lg text-sm">
              <p className="font-medium text-foreground">{mudanca.clienteNome}</p>
              <p className="text-primary">
                {mudanca.dataPretendida}{mudanca.horaPretendida ? ` às ${mudanca.horaPretendida}` : ''}
              </p>
              {mudanca.veiculo && (
                <p className="text-muted-foreground mt-1">Veículo: {mudanca.veiculo.nome || mudanca.veiculo.matricula}</p>
              )}
            </div>

            {/* Conflict error banner */}
            {conflictError && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-600">Conflito de horário</p>
                  <p className="text-sm text-amber-700">{conflictError}</p>
                </div>
              </div>
            )}

            {/* Motorista */}
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

            {/* Veículo */}
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

            {/* Ajudantes — D4: search-based selection */}
            <div className="space-y-2">
              <Label>Ajudantes</Label>
              {mudanca && (
                <p className="text-xs text-muted-foreground">
                  Cliente escolheu: {EQUIPA_LABELS[mudanca.equipa] || mudanca.equipa} ({getEquipaAjudantesCount(mudanca.equipa)} ajudante(s))
                </p>
              )}

              {/* Selected ajudantes as tags */}
              {selectedAjudanteNames.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedAjudanteNames.map((a) => (
                    <span key={a.id} className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary/10 text-primary rounded-md">
                      {a.nome}
                      <button onClick={() => handleRemoveAjudante(a.id)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add ajudante button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAjudanteSearch(!showAjudanteSearch)}
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                {showAjudanteSearch ? 'Fechar pesquisa' : 'Adicionar Ajudante'}
              </Button>

              {/* Search panel */}
              {showAjudanteSearch && (
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar ajudante por nome..."
                      value={ajudanteSearch}
                      onChange={(e) => setAjudanteSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredAjudantes.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2 text-center">Nenhum ajudante encontrado</p>
                    ) : (
                      filteredAjudantes.map((a: any) => (
                        <button
                          key={a.id}
                          type="button"
                          disabled={ajudantesSelecionados.includes(a.id)}
                          onClick={() => handleAddAjudante(a.id)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            ajudantesSelecionados.includes(a.id)
                              ? 'bg-primary/10 text-primary cursor-default'
                              : 'hover:bg-accent cursor-pointer'
                          }`}
                        >
                          {a.nome}
                          {ajudantesSelecionados.includes(a.id) && ' (seleccionado)'}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {mudanca && ajudantesSelecionados.length > getEquipaAjudantesCount(mudanca.equipa) && (
                <p className="text-xs text-amber-600">
                  Admin seleccionou {ajudantesSelecionados.length} ajudante(s), mais do que a escolha do cliente
                </p>
              )}
            </div>

            {/* Tempo estimado */}
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

            {/* Observações */}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={!motoristaId || approveMutation.isPending}
            onClick={handleSubmit}
          >
            {approveMutation.isPending ? 'A aprovar...' : 'Confirmar Aprovação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
