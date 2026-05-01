import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { mudancasApi } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { usePermissao } from '../../hooks/use-permissao';
import { useToast } from '../../hooks/use-toast';
import { StatusBadge } from '../../components/status-badge';
import { EmptyState } from '../../components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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

const EQUIPA_LABELS: Record<string, string> = {
  motorist: 'Motorista',
  motorist_1_ajudante: 'Motorista + 1 Ajudante',
  motorist_2_ajudantes: 'Motorista + 2 Ajudantes',
  motorista: 'Motorista',
  motorista_1_ajudante: 'Motorista + 1 Ajudante',
  motorista_2_ajudantes: 'Motorista + 2 Ajudantes',
};

export function AprovacoesPage() {
  const navigate = useNavigate();
  const { podeVer } = usePermissao();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedMudanca, setSelectedMudanca] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAprovar, setShowAprovar] = useState(false);
  const [showRecusar, setShowRecusar] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
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
                  <Button variant="outline" size="sm" className="flex-1 lg:flex-none" onClick={() => navigate(`/mudancas/${mudanca.id}`)}>
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

      {/* Shared AprovarMudancaModal — D3 */}
      <AprovarMudancaModal
        open={showAprovar}
        onOpenChange={setShowAprovar}
        mudancaId={selectedMudanca?.id || ''}
        initialVeiculoId={selectedMudanca?.veiculoId}
      />

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
