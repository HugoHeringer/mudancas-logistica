import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Truck, Wallet, FileText } from 'lucide-react';
import { mudancasApi } from '../../lib/api';
import { StatusBadge } from '../../components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const EQUIPA_LABELS: Record<string, string> = {
  motorista: 'Motorista',
  motorista_1_ajudante: 'Motorista + 1 Ajudante',
  motorista_2_ajudantes: 'Motorista + 2 Ajudantes',
};

export function MudancaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: mudanca, isLoading } = useQuery({
    queryKey: ['mudancas', id],
    queryFn: () => mudancasApi.findOne(id!).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
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
          {morada.pais && <p className="text-blue-600 font-medium">País: {morada.pais}</p>}
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
              <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                URGENTE
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            {mudanca.dataPretendida}{mudanca.horaPretendida ? ` às ${mudanca.horaPretendida}` : ''} — {EQUIPA_LABELS[mudanca.equipa] || mudanca.equipa}
          </p>
        </div>
      </div>

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
                {mudanca.eInternacional && <p className="text-blue-600 font-medium">Mudança Internacional</p>}
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

          {mudanca.observacoesAdmin && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-yellow-800">Observações Internas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-yellow-700">
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
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum motorista atribuído
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
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="py-8 text-center text-orange-700">
                Ficha de conclusão em falta — o motorista ainda não preencheu os dados.
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        {/* Tab: Financeiro */}
        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Receita Prevista</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  €{(mudanca.receitaPrevista || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Receita Realizada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  €{(mudanca.receitaRealizada || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Custos Operacionais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  €{(mudanca.custosOperacionais || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Margem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${(mudanca.margem || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{(mudanca.margem || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>

          {!mudanca.receitaPrevista && !mudanca.receitaRealizada && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Os dados financeiros serão calculados após a conclusão da mudança.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
