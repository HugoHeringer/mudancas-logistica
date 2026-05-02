import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { mudancasApi } from '../../lib/api';
import { formatarDataHora } from '@mudancas/shared';
import { useAuthStore } from '../../stores/auth.store';
import { usePermissao } from '../../hooks/use-permissao';
import { useToast } from '../../hooks/use-toast';
import { StatusBadge } from '../../components/status-badge';
import { EmptyState } from '../../components/empty-state';
import { GlassCard } from '../../components/luxury/GlassCard';
import { PageHeader } from '../../components/ui/page-header';
import { Button } from '../../components/ui/button';
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
import { AprovarMudancaModal } from '../../components/aprovar-mudanca-modal';
import { cn } from '../../lib/utils';

const EQUIPA_LABELS: Record<string, string> = {
  motorist: 'Motorista',
  motorist_1_ajudante: 'Motorista + 1 Ajudante',
  motorist_2_ajudantes: 'Motorista + 2 Ajudantes',
  motorista: 'Motorista',
  motorista_1_ajudante: 'Motorista + 1 Ajudante',
  motorista_2_ajudantes: 'Motorista + 2 Ajudantes',
};

const ESTADO_OPTIONS = [
  { value: 'pendente', label: 'Pendentes' },
  { value: 'aprovada', label: 'Aprovadas' },
  { value: 'recusada', label: 'Recusadas' },
] as const;

export function AprovacoesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { podeVer } = usePermissao();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedMudanca, setSelectedMudanca] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAprovar, setShowAprovar] = useState(false);
  const [showRecusar, setShowRecusar] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState('');

  // K1: URL-driven filters with defaults
  const filtroEstado = searchParams.get('estado') || 'pendente';
  const filtroTipo = searchParams.get('tipo') || 'todos';

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'todos') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const { data: mudancasData, isLoading } = useQuery({
    queryKey: ['mudancas', 'aprovacoes', filtroEstado, filtroTipo],
    queryFn: async () => {
      const filters: any = { estado: [filtroEstado] };
      if (filtroTipo !== 'todos') filters.tipoServico = filtroTipo;
      const res = await mudancasApi.findAll(filters);
      return res.data?.items || res.data || [];
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
      setMotivoRecusa('');
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível recusar a mudança.', variant: 'destructive' });
    },
  });

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

  const renderMorada = (morada: any) => {
    if (!morada) return '-';
    return `${morada.rua || ''} ${morada.numero || ''}${morada.andar ? `, ${morada.andar}` : ''}, ${morada.codigoPostal || ''} ${morada.localidade || ''}${morada.elevador !== undefined ? ` | Elevador: ${morada.elevador ? 'Sim' : 'Não'}` : ''}`;
  };

  const mudancas = mudancasData || [];
  // K3: sort urgentes first
  const sortedMudancas = [...mudancas].sort((a, b) => {
    if (a.tipoServico === 'urgente' && b.tipoServico !== 'urgente') return -1;
    if (a.tipoServico !== 'urgente' && b.tipoServico === 'urgente') return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aprovações"
        subtitle={`${mudancas.length} solicitação(ões)`}
        actions={
          <div className="flex items-center gap-3">
            {/* K1: Estado filter */}
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
              {ESTADO_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter('estado', opt.value)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium transition-colors',
                    filtroEstado === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {/* K1: Tipo filter */}
            <Select value={filtroTipo} onValueChange={(v) => setFilter('tipo', v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: 'var(--surface-container-low)' }} />
          ))}
        </div>
      ) : sortedMudancas.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="Sem solicitações"
          description="Nenhuma solicitação encontrada para este filtro."
        />
      ) : (
        <div className="space-y-3">
          {sortedMudancas.map((mudanca: any) => (
            <GlassCard
              key={mudanca.id}
              hover
              className={cn(
                'p-5',
                // K3: Urgent highlight
                mudanca.tipoServico === 'urgente' && 'border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={mudanca.estado} />
                    {mudanca.tipoServico === 'urgente' && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                        URGENTE
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
                      { label: 'Data', value: formatarDataHora(mudanca.dataPretendida, mudanca.horaPretendida) },
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

                <div className="hidden lg:block w-px self-stretch" style={{ background: 'hsl(var(--border))' }} />

                {/* K4: Hide approve/refuse for already processed */}
                <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[120px]">
                  <Button variant="outline" size="sm" className="flex-1 lg:flex-none" onClick={() => navigate(`/mudancas/${mudanca.id}`)}>
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> Ver
                  </Button>
                  {mudanca.estado === 'pendente' && podeVer('aprovar') && (
                    <Button size="sm" className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                      onClick={() => handleOpenAprovar(mudanca)}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Aprovar
                    </Button>
                  )}
                  {mudanca.estado === 'pendente' && podeVer('recusar') && (
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

      <AprovarMudancaModal
        open={showAprovar}
        onOpenChange={setShowAprovar}
        mudancaId={selectedMudanca?.id || ''}
        initialVeiculoId={selectedMudanca?.veiculoId}
      />

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
            <Button variant="outline" onClick={() => { setShowRecusar(false); setMotivoRecusa(''); }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={!motivoRecusa.trim() || recusarMutation.isPending}
              onClick={() => {
                if (!selectedMudanca || !motivoRecusa.trim()) return;
                recusarMutation.mutate({ id: selectedMudanca.id, motivo: motivoRecusa });
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
