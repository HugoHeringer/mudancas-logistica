import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Phone, ArrowLeft, Navigation, Package, AlertCircle, CheckCircle2, Truck, Wrench } from 'lucide-react';
import { mudancasApi } from '../lib/api';
import { StatusBadge } from '../components/status-badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const ESTADO_STEPS = ['aprovada', 'a_caminho', 'em_servico', 'concluida'];

export function DetalheMudancaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);

  const { data: mudanca, isLoading } = useQuery({
    queryKey: ['mudanca', id],
    queryFn: () => mudancasApi.findOne(id!).then((r) => r.data),
    enabled: !!id,
  });

  const iniciarMutation = useMutation({
    mutationFn: () => mudancasApi.iniciarDeslocamento(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mudanca', id] });
      queryClient.invalidateQueries({ queryKey: ['mudancas'] });
    },
  });

  const emServicoMutation = useMutation({
    mutationFn: () => mudancasApi.emServico(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mudanca', id] });
      queryClient.invalidateQueries({ queryKey: ['mudancas'] });
    },
  });

  const handleAction = async (action: 'iniciar' | 'emServico') => {
    setActionLoading(true);
    try {
      if (action === 'iniciar') await iniciarMutation.mutateAsync();
      else await emServicoMutation.mutateAsync();
    } finally {
      setActionLoading(false);
    }
  };

  const renderMorada = (morada: any, label: string) => {
    if (!morada) return <p className="text-sm text-gray-400">{label} não disponível</p>;
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
        <p className="text-sm">{parts || '—'}</p>
        {morada.elevador !== undefined && (
          <p className="text-xs text-gray-500">Elevador: {morada.elevador ? 'Sim' : 'Não'}</p>
        )}
        {mapsQuery && (
          <a
            href={`https://maps.google.com/maps?q=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <Navigation className="h-3 w-3" /> Abrir no Maps
          </a>
        )}
      </div>
    );
  };

  // Timeline progress
  const currentStep = mudanca ? ESTADO_STEPS.indexOf(mudanca.estado) : -1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Carregando...</h1>
          </div>
        </header>
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg p-4 animate-pulse h-40" />
          <div className="bg-white rounded-lg p-4 animate-pulse h-24" />
        </div>
      </div>
    );
  }

  if (!mudanca) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Não encontrado</h1>
          </div>
        </header>
        <div className="p-4 text-center text-gray-500">Mudança não encontrada.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{mudanca.clienteNome}</h1>
            <p className="text-blue-100 text-sm">{mudanca.dataPretendida} {mudanca.horaPretendida && `às ${mudanca.horaPretendida}`}</p>
          </div>
          <StatusBadge status={mudanca.estado} />
        </div>
      </header>

      {/* Timeline */}
      {currentStep >= 0 && (
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            {ESTADO_STEPS.map((step, i) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                  i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < ESTADO_STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-0.5 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-500">Aprovada</span>
            <span className="text-[9px] text-gray-500">Caminho</span>
            <span className="text-[9px] text-gray-500">Serviço</span>
            <span className="text-[9px] text-gray-500">Concluída</span>
          </div>
        </div>
      )}

      <main className="p-4 space-y-3">
        {/* Cliente */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <h2 className="font-semibold text-lg">{mudanca.clienteNome}</h2>
            <a
              href={`tel:${mudanca.clienteTelefone}`}
              className="flex items-center gap-2 text-blue-600"
            >
              <Phone className="h-4 w-4" />
              <span className="text-sm">{mudanca.clienteTelefone}</span>
            </a>
          </CardContent>
        </Card>

        {/* Moradas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Recolha
            </CardTitle>
          </CardHeader>
          <CardContent>{renderMorada(mudanca.moradaRecolha, 'Morada')}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>{renderMorada(mudanca.moradaEntrega, 'Morada')}</CardContent>
        </Card>

        {/* Equipa + Veículo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-gray-500">Equipa:</span> {mudanca.equipa === 'motorista' ? 'Motorista' : mudanca.equipa === 'motorista_1_ajudante' ? 'Motorista + 1 Ajudante' : 'Motorista + 2 Ajudantes'}</p>
            {mudanca.veiculo && <p><span className="text-gray-500">Veículo:</span> {mudanca.veiculo.nome} ({mudanca.veiculo.metrosCubicos}m³)</p>}
            {mudanca.tempoEstimadoHoras && <p><span className="text-gray-500">Tempo est.:</span> {mudanca.tempoEstimadoHoras}h</p>}
            {mudanca.observacoesAdmin && <p><span className="text-gray-500">Notas admin:</span> {mudanca.observacoesAdmin}</p>}
          </CardContent>
        </Card>

        {/* Materiais */}
        {mudanca.materiais && Object.values(mudanca.materiais).some((v: any) => v > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-1">
                <Package className="h-3 w-3" /> Materiais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
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
              <CardTitle className="text-sm text-gray-500">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{mudanca.observacoes}</p>
            </CardContent>
          </Card>
        )}

        {/* Ficha de conclusão (se concluída) */}
        {mudanca.estado === 'concluida' && mudanca.conclusao && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" /> Ficha de Conclusão
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><span className="text-gray-500">Horas registadas:</span> {mudanca.conclusao.horasRegistadas}h</p>
              <p><span className="text-gray-500">Horas cobradas:</span> {mudanca.conclusao.horasCobradas}h</p>
              {mudanca.conclusao.combustivel && <p><span className="text-gray-500">Combustível:</span> €{mudanca.conclusao.combustivel.valor} ({mudanca.conclusao.combustivel.litros}L)</p>}
              {mudanca.conclusao.alimentacao?.teve && <p><span className="text-gray-500">Alimentação:</span> €{mudanca.conclusao.alimentacao.valor}</p>}
              {mudanca.conclusao.observacoes && <p><span className="text-gray-500">Obs:</span> {mudanca.conclusao.observacoes}</p>}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-2 z-50">
        {mudanca.estado === 'aprovada' && (
          <Button
            className="w-full h-12 text-base"
            onClick={() => handleAction('iniciar')}
            disabled={actionLoading}
          >
            <Truck className="h-5 w-5 mr-2" />
            {actionLoading ? 'A iniciar...' : 'Iniciar Deslocamento'}
          </Button>
        )}
        {mudanca.estado === 'a_caminho' && (
          <Button
            className="w-full h-12 text-base"
            onClick={() => handleAction('emServico')}
            disabled={actionLoading}
          >
            <Wrench className="h-5 w-5 mr-2" />
            {actionLoading ? 'A atualizar...' : 'Cheguei ao Local'}
          </Button>
        )}
        {mudanca.estado === 'em_servico' && (
          <Button
            className="w-full h-12 text-base"
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
          <Button variant="outline" className="w-full h-10">
            <Phone className="h-4 w-4 mr-2" /> Contactar Cliente
          </Button>
        </a>
      </div>
    </div>
  );
}
