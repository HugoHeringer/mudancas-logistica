import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Truck, Wallet, FileText, CheckCircle, XCircle, Ban, AlertTriangle, Mail } from 'lucide-react';
import { mudancasApi, comunicacaoApi } from '../../lib/api';
import { formatDateTime } from '@movefy/shared';
import { usePermissao } from '../../hooks/use-permissao';
import { useToast } from '../../hooks/use-toast';
import { StatusBadge } from '../../components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { AprovarMudancaModal } from '../../components/aprovar-mudanca-modal';

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

export function MudancaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { podeVer } = usePermissao();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCancelar, setShowCancelar] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [showAprovar, setShowAprovar] = useState(false);
  const [showRecusar, setShowRecusar] = useState(false);
  const [motivoRecusa, setMotivoRecusa] = useState('');

  const { data: mudanca, isLoading } = useQuery({
    queryKey: ['mudancas', id],
    queryFn: () => mudancasApi.findOne(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: emailLogs } = useQuery({
    queryKey: ['emailLogs', id],
    queryFn: () => comunicacaoApi.getEmailLogs({ mudancaId: id }).then((r) => r.data),
    enabled: !!id,
  });

  const cancelarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      mudancasApi.cancel(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mudancas'] });
      toast({ title: 'Mudança cancelada', description: 'A mudança foi cancelada com sucesso.' });
      setShowCancelar(false);
      setMotivoCancelamento('');
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível cancelar a mudança.', variant: 'destructive' });
    },
  });

  const recusarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      mudancasApi.refuse(id, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mudancas'] });
      toast({ title: 'Mudança recusada', description: 'O cliente será notificado.' });
      setShowRecusar(false);
      setMotivoRecusa('');
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Não foi possível recusar a mudança.', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!mudanca) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Mudança não encontrada.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/mudancas')}>
          Voltar
        </Button>
      </div>
    );
  }

  const estado = mudanca.estado as string;

  // State-based actions
  const canApprove = estado === 'pendente' && podeVer('aprovar');
  const canRefuse = estado === 'pendente' && podeVer('recusar');
  const canCancel = estado === 'aprovada' && podeVer('cancelar');

  const renderMorada = (morada: any, label: string) => {
    if (!morada) return <p className="text-muted-foreground">—</p>;
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>{morada.rua} {morada.numero}{morada.andar ? `, ${morada.andar}` : ''}</p>
          <p>{morada.codigoPostal} {morada.localidade}</p>
          {morada.elevador !== undefined && <p>Elevador: {morada.elevador ? 'Sim' : 'Não'}</p>}
          {morada.pais && <p className="text-primary font-medium">País: {morada.pais}</p>}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/mudancas')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{mudanca.clienteNome}</h2>
            <StatusBadge status={mudanca.estado} />
            {mudanca.tipoServico === 'urgente' && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-destructive/10 text-destructive rounded-full">
                URGENTE
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            {mudanca.dataPretendida}{mudanca.horaPretendida ? ` às ${mudanca.horaPretendida}` : ''} — {EQUIPA_LABELS[mudanca.equipa] || mudanca.equipa}
          </p>
        </div>

        {/* Action buttons based on state */}
        <div className="flex items-center gap-2">
          {canApprove && (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowAprovar(true)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Aprovar
            </Button>
          )}
          {canRefuse && (
            <Button
              variant="destructive"
              onClick={() => setShowRecusar(true)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Recusar
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              className="border-orange-500/30 text-orange-600 hover:bg-orange-500/10"
              onClick={() => setShowCancelar(true)}
            >
              <Ban className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* State info banner for a_caminho / em_servico */}
      {(estado === 'a_caminho' || estado === 'em_servico') && (
        <Card className="border-primary/30 bg-primary/10">
          <CardContent className="py-3 flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <p className="text-sm text-primary">
              {estado === 'a_caminho'
                ? 'O motorista está a caminho do local de recolha.'
                : 'O serviço está em curso no local.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Concluida info */}
      {estado === 'concluida' && (
        <Card className="border-green-500/30 bg-green-500/10">
          <CardContent className="py-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-600">
              Mudança concluída. Consulte a ficha de conclusão no separador "Motorista".
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cancelada info */}
      {estado === 'cancelada' && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="py-3 flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Esta mudança foi cancelada.
              {mudanca.observacoesAdmin && (
                <span className="ml-1">Motivo: {mudanca.observacoesAdmin}</span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recusada info */}
      {estado === 'recusada' && (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardContent className="py-3 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Esta mudança foi recusada.
              {mudanca.observacoesAdmin && (
                <span className="ml-1">Motivo: {mudanca.observacoesAdmin}</span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="formulario">
        <TabsList>
          <TabsTrigger value="formulario" className="gap-2">
            <FileText className="h-4 w-4" />
            Formulário
          </TabsTrigger>
          <TabsTrigger value="motorista" className="gap-2">
            <User className="h-4 w-4" />
            Motorista
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <Wallet className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-4 w-4" />
            Emails
          </TabsTrigger>
        </TabsList>

        {/* Tab: Formulário */}
        <TabsContent value="formulario" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dados do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><span className="font-medium">Nome:</span> {mudanca.clienteNome}</p>
                <p><span className="font-medium">Email:</span> {mudanca.clienteEmail}</p>
                <p><span className="font-medium">Telefone:</span> {mudanca.clienteTelefone}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Serviço
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><span className="font-medium">Tipo:</span> {mudanca.tipoServico === 'urgente' ? 'Urgente' : 'Normal'}</p>
                <p><span className="font-medium">Equipa:</span> {EQUIPA_LABELS[mudanca.equipa] || mudanca.equipa}</p>
                {mudanca.veiculo && <p><span className="font-medium">Veículo:</span> {mudanca.veiculo.nome} ({mudanca.veiculo.metrosCubicos}m³)</p>}
                {mudanca.eInternacional && <p className="text-primary font-medium">Mudança Internacional</p>}
                {mudanca.tempoEstimadoHoras && <p><span className="font-medium">Tempo estimado:</span> {mudanca.tempoEstimadoHoras}h</p>}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {renderMorada(mudanca.moradaRecolha, 'Morada de Recolha')}
            {renderMorada(mudanca.moradaEntrega, 'Morada de Entrega')}
          </div>

          {mudanca.materiais && Object.values(mudanca.materiais).some((v: any) => v > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Materiais Solicitados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {mudanca.materiais.protecaoFilme > 0 && (
                    <div><span className="font-medium">Proteção Filme:</span> {mudanca.materiais.protecaoFilme}</div>
                  )}
                  {mudanca.materiais.protecaoCartao > 0 && (
                    <div><span className="font-medium">Proteção Cartão:</span> {mudanca.materiais.protecaoCartao}</div>
                  )}
                  {mudanca.materiais.caixas > 0 && (
                    <div><span className="font-medium">Caixas:</span> {mudanca.materiais.caixas}</div>
                  )}
                  {mudanca.materiais.fitaCola > 0 && (
                    <div><span className="font-medium">Fita Cola:</span> {mudanca.materiais.fitaCola}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {mudanca.observacoes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Observações do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{mudanca.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {mudanca.observacoesAdmin && estado !== 'cancelada' && estado !== 'recusada' && (
            <Card className="border-yellow-500/30 bg-yellow-500/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-yellow-600">Observações Internas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-yellow-600">
                <p>{mudanca.observacoesAdmin}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Motorista */}
        <TabsContent value="motorista" className="space-y-4">
          {mudanca.motorista ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {mudanca.motorista.nome}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><span className="font-medium">Telefone:</span> {mudanca.motorista.telefone || '—'}</p>
                {mudanca.valorHoraMotoristaSnapshot && (
                  <p><span className="font-medium">Valor/Hora:</span> €{Number(mudanca.valorHoraMotoristaSnapshot).toFixed(2)}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum motorista atribuído
              </CardContent>
            </Card>
          )}

          {(mudanca as any).ajudantes && (mudanca as any).ajudantes.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ajudantes Atribuídos</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {(mudanca as any).ajudantes.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between py-1 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{a.nome}</span>
                    </div>
                    <span className="text-muted-foreground">{a.telefone || '—'}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : mudanca.ajudantesIds && mudanca.ajudantesIds.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ajudantes Atribuídos</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">
                  {mudanca.ajudantesIds.length} ajudante(s) atribuído(s)
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* Custo da Equipa */}
          {mudanca.motorista && (estado === 'aprovada' || estado === 'a_caminho' || estado === 'em_servico' || estado === 'concluida') && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Custo da Equipa</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                {estado === 'concluida' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pago ao Motorista</span>
                      <span className="font-medium">€{(mudanca.totalPagoMotorista || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pago aos Ajudantes</span>
                      <span className="font-medium">€{(mudanca.totalPagoAjudantes || 0).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="font-medium">Custo Real Total</span>
                      <span className="font-bold text-destructive">
                        €{((mudanca.totalPagoMotorista || 0) + (mudanca.totalPagoAjudantes || 0)).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Motorista (€{(Number(mudanca.valorHoraMotoristaSnapshot) || 0).toFixed(2)}/h)</span>
                      <span className="font-medium">€{((Number(mudanca.valorHoraMotoristaSnapshot) || 0) * (mudanca.tempoEstimadoHoras || 0)).toFixed(2)}</span>
                    </div>
                    {mudanca.valorHoraAjudanteSnapshot && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Ajudantes ({((mudanca as any).ajudantes?.length || 0)}x €{Number(mudanca.valorHoraAjudanteSnapshot).toFixed(2)}/h)</span>
                        <span className="font-medium">€{(((mudanca as any).ajudantes?.length || 0) * Number(mudanca.valorHoraAjudanteSnapshot) * (mudanca.tempoEstimadoHoras || 0)).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="font-medium">Custo Estimado</span>
                      <span className="font-bold text-amber-600">
                        €{(
                          ((Number(mudanca.valorHoraMotoristaSnapshot) || 0) * (mudanca.tempoEstimadoHoras || 0)) +
                          (((mudanca as any).ajudantes?.length || 0) * Number(mudanca.valorHoraAjudanteSnapshot || 0) * (mudanca.tempoEstimadoHoras || 0))
                        ).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {mudanca.conclusao ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ficha de Conclusão</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Horas registadas</p>
                    <p className="font-medium">{mudanca.conclusao.horasRegistadas || '—'}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Horas cobradas</p>
                    <p className="font-medium">{mudanca.conclusao.horasCobradas || '—'}h</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {mudanca.conclusao.combustivel && (
                    <div>
                      <p className="text-muted-foreground">Combustível</p>
                      <p className="font-medium">€{mudanca.conclusao.combustivel.valor?.toFixed(2)} ({mudanca.conclusao.combustivel.litros}L)</p>
                    </div>
                  )}
                  {mudanca.conclusao.alimentacao && (
                    <div>
                      <p className="text-muted-foreground">Alimentação</p>
                      <p className="font-medium">{mudanca.conclusao.alimentacao.teve ? `€${mudanca.conclusao.alimentacao.valor?.toFixed(2)}` : 'Não'}</p>
                    </div>
                  )}
                </div>
                {mudanca.conclusao.observacoes && (
                  <div>
                    <p className="text-muted-foreground">Observações do motorista</p>
                    <p>{mudanca.conclusao.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : mudanca.estado === 'concluida' ? (
            <Card className="border-yellow-500/30 bg-yellow-500/10">
              <CardContent className="py-8 text-center text-yellow-600">
                Ficha de conclusão em falta — o motorista ainda não preencheu os dados.
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        {/* Tab: Financeiro */}
        <TabsContent value="financeiro" className="space-y-4">
          {mudanca.receitaPrevista || mudanca.receitaRealizada ? (
            <>
              {/* Receita Prevista vs Realizada — Barra comparativa */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Receita
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Prevista</span>
                      <span className="font-medium">€{(mudanca.receitaPrevista || 0).toFixed(2)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((mudanca.receitaPrevista || 0) / Math.max(mudanca.receitaPrevista || 1, mudanca.receitaRealizada || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Realizada</span>
                      <span className="font-medium text-green-600">€{(mudanca.receitaRealizada || 0).toFixed(2)}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((mudanca.receitaRealizada || 0) / Math.max(mudanca.receitaPrevista || 1, mudanca.receitaRealizada || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custos Operacionais — Breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Custos Operacionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Combustível</span>
                    <span className="font-medium text-sm">
                      €{mudanca.conclusao?.combustivel?.valor?.toFixed(2) || '0.00'}
                      {mudanca.conclusao?.combustivel?.litros && (
                        <span className="text-muted-foreground ml-1">({mudanca.conclusao.combustivel.litros}L)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Alimentação</span>
                    <span className="font-medium text-sm">
                      {mudanca.conclusao?.alimentacao?.teve
                        ? <>€{mudanca.conclusao.alimentacao.valor?.toFixed(2) || '0.00'}</>
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pagamento Motorista</span>
                    <span className="font-medium text-sm">
                      €{(mudanca.totalPagoMotorista || 0).toFixed(2)}
                      {mudanca.valorHoraMotoristaSnapshot ? (
                        <span className="text-muted-foreground ml-1">({mudanca.valorHoraMotoristaSnapshot}€/h)</span>
                      ) : null}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pagamento Ajudantes</span>
                    <span className="font-medium text-sm">
                      €{(mudanca.totalPagoAjudantes || 0).toFixed(2)}
                      {mudanca.valorHoraAjudanteSnapshot ? (
                        <span className="text-muted-foreground ml-1">({mudanca.valorHoraAjudanteSnapshot}€/h)</span>
                      ) : null}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-sm font-medium">Total Custos</span>
                    <span className="font-bold text-destructive">€{(mudanca.custosOperacionais || 0).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Margem */}
              <Card className={`border-2 ${(mudanca.margem || 0) >= 0 ? 'border-green-500/30 bg-green-500/10' : 'border-destructive/30 bg-destructive/10'}`}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Margem</p>
                    <p className="text-xs text-muted-foreground">
                      Receita Realizada — Custos Operacionais
                    </p>
                  </div>
                  <p className={`text-3xl font-bold ${(mudanca.margem || 0) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    €{(mudanca.margem || 0).toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              {/* Materiais Utilizados */}
              {mudanca.conclusao?.materiaisUtilizados && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Materiais Utilizados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {mudanca.conclusao.materiaisUtilizados.protecaoFilme > 0 && (
                        <div className="bg-blue-500/10 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-primary">{mudanca.conclusao.materiaisUtilizados.protecaoFilme}</p>
                          <p className="text-xs text-primary mt-1">Proteção Filme</p>
                        </div>
                      )}
                      {mudanca.conclusao.materiaisUtilizados.protecaoCartao > 0 && (
                        <div className="bg-amber-500/10 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-amber-600">{mudanca.conclusao.materiaisUtilizados.protecaoCartao}</p>
                          <p className="text-xs text-amber-600 mt-1">Proteção Cartão</p>
                        </div>
                      )}
                      {mudanca.conclusao.materiaisUtilizados.caixas > 0 && (
                        <div className="bg-purple-500/10 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-purple-600">{mudanca.conclusao.materiaisUtilizados.caixas}</p>
                          <p className="text-xs text-purple-600 mt-1">Caixas</p>
                        </div>
                      )}
                      {mudanca.conclusao.materiaisUtilizados.fitaCola > 0 && (
                        <div className="bg-teal-500/10 p-3 rounded-lg text-center">
                          <p className="text-2xl font-bold text-teal-600">{mudanca.conclusao.materiaisUtilizados.fitaCola}</p>
                          <p className="text-xs text-teal-600 mt-1">Fita Cola</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Os dados financeiros serão calculados após a conclusão da mudança.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Emails */}
        <TabsContent value="emails" className="space-y-4">
          {!emailLogs || emailLogs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Mail className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p>Nenhum email enviado para esta mudança.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {emailLogs.map((log: any) => (
                <Card key={log.id} className={log.status === 'falhou' ? 'border-red-200' : 'border-border'}>
                  <CardContent className="py-3 flex items-center gap-3">
                    {log.status === 'enviado' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {log.templateNome.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          log.status === 'enviado' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
                        }`}>
                          {log.status === 'enviado' ? 'Enviado' : 'Falhou'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Para: {log.destinatario}
                        {log.assunto && ` — ${log.assunto}`}
                      </p>
                      {log.erroMensagem && (
                        <p className="text-xs text-destructive mt-0.5">{log.erroMensagem}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDateTime(log.criadoEm)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Cancelamento */}
      <Dialog open={showCancelar} onOpenChange={setShowCancelar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Mudança</DialogTitle>
            <DialogDescription>
              A mudança será cancelada. O cliente e o motorista serão notificados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">
                Esta ação não pode ser desfeita. A mudança será marcada como cancelada.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Motivo do cancelamento (opcional)</Label>
              <Textarea
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Explique o motivo do cancelamento..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCancelar(false); setMotivoCancelamento(''); }}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              disabled={cancelarMutation.isPending}
              onClick={() => {
                if (!mudanca) return;
                cancelarMutation.mutate({
                  id: mudanca.id,
                  motivo: motivoCancelamento || undefined,
                });
              }}
            >
              {cancelarMutation.isPending ? 'A cancelar...' : 'Confirmar Cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Aprovação — shared component */}
      <AprovarMudancaModal
        open={showAprovar}
        onOpenChange={setShowAprovar}
        mudancaId={id!}
        initialVeiculoId={mudanca?.veiculoId}
      />

      {/* Recusar dialog */}
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
                if (!motivoRecusa.trim()) return;
                recusarMutation.mutate({ id: mudanca!.id, motivo: motivoRecusa });
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
