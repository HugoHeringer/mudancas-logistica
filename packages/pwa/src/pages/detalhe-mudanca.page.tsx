import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Phone, ArrowLeft, Navigation, Package, AlertCircle, CheckCircle2, Truck, Wrench } from 'lucide-react';
import { mudancasApi } from '../lib/api';
import { formatarDataHora } from '@mudancas/shared';
import { StatusBadge } from '../components/status-badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useTimer } from '../hooks/use-timer';

const ESTADO_STEPS = ['aprovada', 'a_caminho', 'em_servico', 'concluida'];

export function DetalheMudancaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);
  const [showPrevisao, setShowPrevisao] = useState(false);
  const [previsaoMin, setPrevisaoMin] = useState(15);

  const { data: mudanca, isLoading } = useQuery({
    queryKey: ['mudanca', id],
    queryFn: () => mudancasApi.findOne(id!).then((r) => r.data),
    enabled: !!id,
  });

  const iniciarMutation = useMutation({
    mutationFn: (previsaoChegadaMinutos?: number) => mudancasApi.iniciarDeslocamento(id!, previsaoChegadaMinutos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mudanca', id] });
      queryClient.invalidateQueries({ queryKey: ['mudancas'] });
      setShowPrevisao(false);
    },
  });

  const emServicoMutation = useMutation({
    mutationFn: () => mudancasApi.emServico(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mudanca', id] });
      queryClient.invalidateQueries({ queryKey: ['mudancas'] });
    },
  });

  const handleAction = async (action: 'emServico') => {
    setActionLoading(true);
    try {
      if (action === 'emServico') await emServicoMutation.mutateAsync();
    } finally {
      setActionLoading(false);
    }
  };

  const handleIniciar = () => {
    iniciarMutation.mutate(previsaoMin);
  };

  // Previsao options: 5-30 (5min), 30-120 (15min), 120-480 (30min)
  const previsaoOptions = [
    ...Array.from({ length: 6 }, (_, i) => (i + 1) * 5),   // 5,10,15,20,25,30
    ...Array.from({ length: 6 }, (_, i) => 30 + (i + 1) * 15), // 45,60,75,90,105,120
    ...Array.from({ length: 7 }, (_, i) => 120 + (i + 1) * 60), // 180,240,300,360,420,480,540
  ];

  const formatPrevisao = (min: number) => {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  const renderMorada = (morada: any, label: string) => {
    if (!morada) return <p className="text-sm text-muted-foreground/50">{label} não disponível</p>;
    const parts = [
      morada.rua,
      morada.numero,
      morada.andar,
      morada.codigoPostal,
      morada.localidade,
    ].filter(Boolean).join(', ');

    const mapsQuery = encodeURIComponent(parts || '');
    return (
      <div className="space-y-1">
        <p className="text-sm text-foreground">{parts || '—'}</p>
        {morada.elevador !== undefined && (
          <p className="text-xs text-muted-foreground/60">Elevador: {morada.elevador ? 'Sim' : 'Não'}</p>
        )}
        {mapsQuery && (
          <a
            href={`https://maps.google.com/maps?q=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-terracotta transition-colors"
          >
            <Navigation className="h-3 w-3" /> Abrir no Maps
          </a>
        )}
      </div>
    );
  };

  const currentStep = mudanca ? ESTADO_STEPS.indexOf(mudanca.estado) : -1;

  const timer = useTimer(mudanca?.iniciadoEm || undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-night text-cream p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-cream/60 hover:text-cream">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--tenant-font-display)' }}>Carregando...</h1>
          </div>
        </header>
        <div className="p-4 space-y-4">
          <div className="bg-card/60 rounded-lg p-4 animate-pulse h-40" />
          <div className="bg-card/60 rounded-lg p-4 animate-pulse h-24" />
        </div>
      </div>
    );
  }

  if (!mudanca) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-night text-cream p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-cream/60 hover:text-cream">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--tenant-font-display)' }}>Não encontrado</h1>
          </div>
        </header>
        <div className="p-4 text-center text-muted-foreground/60">Mudança não encontrada.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-night text-cream p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-cream/60 hover:text-cream">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--tenant-font-display)' }}>{mudanca.clienteNome}</h1>
            <p className="text-cream-muted text-sm">{formatarDataHora(mudanca.dataPretendida, mudanca.horaPretendida)}</p>
          </div>
          <StatusBadge status={mudanca.estado} />
        </div>
      </header>

      {/* Active timer */}
      {(mudanca.estado === 'a_caminho' || mudanca.estado === 'em_servico') && mudanca.iniciadoEm && (
        <div className={`px-4 py-3 border-b flex items-center justify-between ${
          mudanca.estado === 'em_servico' ? 'bg-terracotta/10 border-terracotta/20' : 'bg-primary/10 border-primary/20'
        }`}>
          <div>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60">
              {mudanca.estado === 'em_servico' ? 'Em serviço desde' : 'A caminho desde'}
            </p>
            <p className="text-sm text-foreground">
              {new Date(mudanca.iniciadoEm).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60">Tempo em curso</p>
            <p className={`text-2xl font-bold tabular-nums ${
              mudanca.estado === 'em_servico' ? 'text-terracotta' : 'text-primary'
            }`} style={{ fontFamily: 'var(--tenant-font-body)' }}>
              {timer.formatted}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      {currentStep >= 0 && (
        <div className="bg-card/80 border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            {ESTADO_STEPS.map((step, i) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                  i <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground/40'
                }`}>
                  {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < ESTADO_STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-0.5 ${i < currentStep ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-muted-foreground/50">Aprovada</span>
            <span className="text-[9px] text-muted-foreground/50">Caminho</span>
            <span className="text-[9px] text-muted-foreground/50">Serviço</span>
            <span className="text-[9px] text-muted-foreground/50">Concluída</span>
          </div>
        </div>
      )}

      <main className="p-4 space-y-3">
        {/* Cliente */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <h2 className="font-semibold text-lg text-foreground" style={{ fontFamily: 'var(--tenant-font-display)' }}>{mudanca.clienteNome}</h2>
            <a
              href={`tel:${mudanca.clienteTelefone}`}
              className="flex items-center gap-2 text-primary hover:text-terracotta transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="text-sm">{mudanca.clienteTelefone}</span>
            </a>
          </CardContent>
        </Card>

        {/* Moradas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Recolha
            </CardTitle>
          </CardHeader>
          <CardContent>{renderMorada(mudanca.moradaRecolha, 'Morada')}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>{renderMorada(mudanca.moradaEntrega, 'Morada')}</CardContent>
        </Card>

        {/* Equipa + Veículo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60">Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-foreground">
            <p><span className="text-muted-foreground/60">Equipa:</span> {mudanca.equipa === 'motorista' ? 'Motorista' : mudanca.equipa === 'motorista_1_ajudante' ? 'Motorista + 1 Ajudante' : 'Motorista + 2 Ajudantes'}</p>
            {mudanca.veiculo && <p><span className="text-muted-foreground/60">Veículo:</span> {mudanca.veiculo.nome} ({mudanca.veiculo.metrosCubicos}m³)</p>}
            {mudanca.tempoEstimadoHoras && <p><span className="text-muted-foreground/60">Tempo est.:</span> {mudanca.tempoEstimadoHoras}h</p>}
            {mudanca.observacoesAdmin && <p><span className="text-muted-foreground/60">Notas admin:</span> {mudanca.observacoesAdmin}</p>}
          </CardContent>
        </Card>

        {/* Materiais */}
        {mudanca.materiais && Object.values(mudanca.materiais).some((v: any) => v > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 flex items-center gap-1">
                <Package className="h-3 w-3" /> Materiais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm text-foreground">
                {mudanca.materiais.protecaoFilme > 0 && <p>Proteção Filme: {mudanca.materiais.protecaoFilme}</p>}
                {mudanca.materiais.protecaoCartao > 0 && <p>Proteção Cartão: {mudanca.materiais.protecaoCartao}</p>}
                {mudanca.materiais.caixas > 0 && <p>Caixas: {mudanca.materiais.caixas}</p>}
                {mudanca.materiais.fitaCola > 0 && <p>Fita Cola: {mudanca.materiais.fitaCola}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        {mudanca.observacoes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{mudanca.observacoes}</p>
            </CardContent>
          </Card>
        )}

        {/* Ficha de conclusão (se concluída) */}
        {mudanca.estado === 'concluida' && mudanca.conclusao && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-terracotta" /> Ficha de Conclusão
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-foreground">
              <p><span className="text-muted-foreground/60">Horas registadas:</span> {mudanca.conclusao.horasRegistadas}h</p>
              <p><span className="text-muted-foreground/60">Horas cobradas:</span> {mudanca.conclusao.horasCobradas}h</p>
              {mudanca.conclusao.combustivel && <p><span className="text-muted-foreground/60">Combustível:</span> €{mudanca.conclusao.combustivel.valor} ({mudanca.conclusao.combustivel.litros}L)</p>}
              {mudanca.conclusao.alimentacao?.teve && <p><span className="text-muted-foreground/60">Alimentação:</span> €{mudanca.conclusao.alimentacao.valor}</p>}
              {mudanca.conclusao.observacoes && <p><span className="text-muted-foreground/60">Obs:</span> {mudanca.conclusao.observacoes}</p>}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 space-y-2 z-50">
        {mudanca.estado === 'aprovada' && !showPrevisao && (
          <Button
            className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setShowPrevisao(true)}
          >
            <Truck className="h-5 w-5 mr-2" />
            Iniciar Deslocamento
          </Button>
        )}
        {mudanca.estado === 'aprovada' && showPrevisao && (
          <div className="space-y-3">
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 text-center">Previsão de chegada</p>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              {previsaoOptions.map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setPrevisaoMin(min)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    previsaoMin === min
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {formatPrevisao(min)}
                </button>
              ))}
            </div>
            <div className="bg-card/80 rounded-lg p-3 text-center">
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground/60">Destino:</span> {mudanca.moradaRecolha?.localidade || 'Morada de recolha'}
              </p>
              <p className="text-sm text-foreground">
                <span className="text-muted-foreground/60">Previsão:</span> <strong>{formatPrevisao(previsaoMin)}</strong>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-10 border-primary/30 text-foreground hover:bg-primary/10"
                onClick={() => setShowPrevisao(false)}
              >
                Voltar
              </Button>
              <Button
                className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleIniciar}
                disabled={iniciarMutation.isPending}
              >
                {iniciarMutation.isPending ? 'A iniciar...' : 'Confirmar e Notificar'}
              </Button>
            </div>
          </div>
        )}
        {mudanca.estado === 'a_caminho' && (
          <Button
            className="w-full h-12 text-base bg-night hover:bg-night-light text-cream"
            onClick={() => handleAction('emServico')}
            disabled={actionLoading}
          >
            <Wrench className="h-5 w-5 mr-2" />
            {actionLoading ? 'A atualizar...' : 'Cheguei ao Local'}
          </Button>
        )}
        {mudanca.estado === 'em_servico' && (
          <Button
            className="w-full h-12 text-base bg-terracotta hover:bg-terracotta/90 text-cream"
            onClick={() => navigate(`/mudanca/${id}/ficha`)}
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Concluir Mudança
          </Button>
        )}
        <a
          href={`tel:${mudanca.clienteTelefone}`}
          className="block"
        >
          <Button variant="outline" className="w-full h-10 border-primary/30 text-foreground hover:bg-primary/10">
            <Phone className="h-4 w-4 mr-2" /> Contactar Cliente
          </Button>
        </a>
      </div>
    </div>
  );
}
