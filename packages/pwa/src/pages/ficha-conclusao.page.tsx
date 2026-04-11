import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Fuel, UtensilsCrossed, Package } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { mudancasApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';

const fichaSchema = z.object({
  horasRegistadas: z.coerce.number().min(0, 'Mínimo 0'),
  horasCobradas: z.coerce.number().min(0, 'Mínimo 0'),
  combustivelValor: z.coerce.number().min(0).optional(),
  combustivelLitros: z.coerce.number().min(0).optional(),
  alimentacaoTeve: z.boolean(),
  alimentacaoValor: z.coerce.number().min(0).optional(),
  protecaoFilme: z.coerce.number().min(0).optional(),
  protecaoCartao: z.coerce.number().min(0).optional(),
  caixas: z.coerce.number().min(0).optional(),
  fitaCola: z.coerce.number().min(0).optional(),
  observacoes: z.string().optional(),
});

type FichaForm = z.infer<typeof fichaSchema>;

export function FichaConclusaoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { data: mudanca, isLoading } = useQuery({
    queryKey: ['mudanca', id],
    queryFn: () => mudancasApi.findOne(id!).then((r) => r.data),
    enabled: !!id,
  });

  const concluirMutation = useMutation({
    mutationFn: (data: any) => mudancasApi.concluir(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mudanca', id] });
      queryClient.invalidateQueries({ queryKey: ['mudancas'] });
      navigate('/');
    },
    onError: (err: any) => {
      setSubmitError(err.response?.data?.message || 'Erro ao concluir mudança');
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FichaForm>({
    resolver: zodResolver(fichaSchema),
    defaultValues: {
      horasRegistadas: 0,
      horasCobradas: 0,
      alimentacaoTeve: false,
    },
  });

  const alimentacaoTeve = watch('alimentacaoTeve');

  const buildPayload = (data: FichaForm) => {
    const payload: any = {
      horasRegistadas: data.horasRegistadas,
      horasCobradas: data.horasCobradas,
      ajudantesConfirmados: [],
      concluidoPor: user?.id || '',
    };

    if (data.combustivelValor || data.combustivelLitros) {
      payload.combustivel = {
        valor: data.combustivelValor || 0,
        litros: data.combustivelLitros || 0,
      };
    }

    if (data.alimentacaoTeve) {
      payload.alimentacao = {
        teve: true,
        valor: data.alimentacaoValor || 0,
      };
    }

    if (data.protecaoFilme || data.protecaoCartao || data.caixas || data.fitaCola) {
      payload.materiaisUtilizados = {};
      if (data.protecaoFilme) payload.materiaisUtilizados.protecaoFilme = data.protecaoFilme;
      if (data.protecaoCartao) payload.materiaisUtilizados.protecaoCartao = data.protecaoCartao;
      if (data.caixas) payload.materiaisUtilizados.caixas = data.caixas;
      if (data.fitaCola) payload.materiaisUtilizados.fitaCola = data.fitaCola;
    }

    if (data.observacoes) {
      payload.observacoes = data.observacoes;
    }

    return payload;
  };

  const onSubmit = (data: FichaForm) => {
    setSubmitError('');
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    const data = buildPayload({
      horasRegistadas: watch('horasRegistadas'),
      horasCobradas: watch('horasCobradas'),
      combustivelValor: watch('combustivelValor'),
      combustivelLitros: watch('combustivelLitros'),
      alimentacaoTeve: watch('alimentacaoTeve'),
      alimentacaoValor: watch('alimentacaoValor'),
      protecaoFilme: watch('protecaoFilme'),
      protecaoCartao: watch('protecaoCartao'),
      caixas: watch('caixas'),
      fitaCola: watch('fitaCola'),
      observacoes: watch('observacoes'),
    });
    concluirMutation.mutate(data);
    setShowConfirm(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Ficha de Conclusão</h1>
          </div>
        </header>
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg p-4 animate-pulse h-60" />
        </div>
      </div>
    );
  }

  if (!mudanca || mudanca.estado !== 'em_servico') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Ficha de Conclusão</h1>
          </div>
        </header>
        <div className="p-4 text-center text-gray-500 mt-8">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Mudança não disponível para conclusão</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Voltar</Button>
        </div>
      </div>
    );
  }

  const tempoEstimado = mudanca.tempoEstimadoHoras || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Ficha de Conclusão</h1>
            <p className="text-blue-100 text-sm">{mudanca.clienteNome}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-3">
        {submitError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Horas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Tempo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="horasRegistadas">Horas Registadas</Label>
                <Input
                  id="horasRegistadas"
                  type="number"
                  step="0.5"
                  {...register('horasRegistadas')}
                />
                {tempoEstimado > 0 && (
                  <p className="text-xs text-gray-400">Tempo estimado: {tempoEstimado}h</p>
                )}
                {errors.horasRegistadas && (
                  <p className="text-xs text-red-600">{errors.horasRegistadas.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="horasCobradas">Horas Cobradas *</Label>
                <Input
                  id="horasCobradas"
                  type="number"
                  step="0.5"
                  {...register('horasCobradas')}
                />
                {errors.horasCobradas && (
                  <p className="text-xs text-red-600">{errors.horasCobradas.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Combustível */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-1">
                <Fuel className="h-3 w-3" /> Combustível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="combustivelValor">Valor (€)</Label>
                  <Input
                    id="combustivelValor"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('combustivelValor')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="combustivelLitros">Litros</Label>
                  <Input
                    id="combustivelLitros"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...register('combustivelLitros')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alimentação */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-1">
                <UtensilsCrossed className="h-3 w-3" /> Alimentação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Label htmlFor="alimentacaoTeve" className="cursor-pointer">Teve alimentação?</Label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={alimentacaoTeve}
                  onClick={() => {
                    const val = !alimentacaoTeve;
                    register('alimentacaoTeve').onChange({
                      target: { value: val, name: 'alimentacaoTeve' },
                    } as any);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    alimentacaoTeve ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      alimentacaoTeve ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                  <input type="checkbox" className="sr-only" {...register('alimentacaoTeve')} />
                </button>
              </div>
              {alimentacaoTeve && (
                <div className="space-y-1.5">
                  <Label htmlFor="alimentacaoValor">Valor (€)</Label>
                  <Input
                    id="alimentacaoValor"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('alimentacaoValor')}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Materiais */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500 flex items-center gap-1">
                <Package className="h-3 w-3" /> Materiais Utilizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="protecaoFilme">Prot. Filme</Label>
                  <Input id="protecaoFilme" type="number" placeholder="0" {...register('protecaoFilme')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="protecaoCartao">Prot. Cartão</Label>
                  <Input id="protecaoCartao" type="number" placeholder="0" {...register('protecaoCartao')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="caixas">Caixas</Label>
                  <Input id="caixas" type="number" placeholder="0" {...register('caixas')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fitaCola">Fita Cola</Label>
                  <Input id="fitaCola" type="number" placeholder="0" {...register('fitaCola')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Notas sobre a mudança..."
                rows={3}
                {...register('observacoes')}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={concluirMutation.isPending}
          >
            {concluirMutation.isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> A submeter...</>
            ) : (
              <><CheckCircle2 className="mr-2 h-5 w-5" /> Concluir e Submeter</>
            )}
          </Button>
        </form>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Conclusão</DialogTitle>
            <DialogDescription>
              Tem a certeza que pretende concluir esta mudança? Esta ação não pode ser revertida.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancelar</Button>
            <Button onClick={handleConfirmSubmit} disabled={concluirMutation.isPending}>
              {concluirMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A confirmar...</>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
