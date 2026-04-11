import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsApi, agendaApi } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export function ConfiguracoesPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', user?.tenantId],
    queryFn: () => tenantsApi.findOne(user!.tenantId).then((r) => r.data),
    enabled: !!user?.tenantId,
  });

  const { data: configAgenda } = useQuery({
    queryKey: ['agenda', 'config'],
    queryFn: () => agendaApi.getConfig().then((r) => r.data),
  });

  // Marca state
  const [marca, setMarca] = useState<any>(null);
  const [marcaLoaded, setMarcaLoaded] = useState(false);

  // Preços state
  const [precos, setPrecos] = useState<any>(null);

  // Agenda config state
  const [agendaConfig, setAgendaConfig] = useState<any>(null);
  const [agendaLoaded, setAgendaLoaded] = useState(false);

  // Initialize state from query data
  if (tenant && !marcaLoaded) {
    setMarca(tenant.configMarca || {});
    setPrecos(tenant.configPreco || {});
    setMarcaLoaded(true);
  }
  if (configAgenda && !agendaLoaded) {
    setAgendaConfig(configAgenda);
    setAgendaLoaded(true);
  }

  const updateTenantMutation = useMutation({
    mutationFn: (data: any) => tenantsApi.update(user!.tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast({ title: 'Configurações guardadas' });
    },
    onError: () => toast({ title: 'Erro ao guardar', variant: 'destructive' }),
  });

  const updateAgendaMutation = useMutation({
    mutationFn: (data: any) => agendaApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agenda', 'config'] });
      toast({ title: 'Configuração da agenda guardada' });
    },
    onError: () => toast({ title: 'Erro ao guardar agenda', variant: 'destructive' }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">Marca, preços, agenda e formulário</p>
      </div>

      <Tabs defaultValue="marca">
        <TabsList>
          <TabsTrigger value="marca">Marca</TabsTrigger>
          <TabsTrigger value="precos">Preços</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>

        {/* Marca */}
        <TabsContent value="marca" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Identidade Visual</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome da Empresa</Label><Input value={marca?.nome || ''} onChange={(e) => setMarca({ ...marca, nome: e.target.value })} /></div>
                <div className="space-y-2"><Label>Telefone</Label><Input value={marca?.telefone || ''} onChange={(e) => setMarca({ ...marca, telefone: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email de Contacto</Label><Input value={marca?.email || ''} onChange={(e) => setMarca({ ...marca, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Morada</Label><Input value={marca?.morada || ''} onChange={(e) => setMarca({ ...marca, morada: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cor Principal</Label>
                  <div className="flex gap-2">
                    <input type="color" value={marca?.corPrincipal || '#3b82f6'} onChange={(e) => setMarca({ ...marca, corPrincipal: e.target.value })} className="h-10 w-10 rounded border cursor-pointer" />
                    <Input value={marca?.corPrincipal || '#3b82f6'} onChange={(e) => setMarca({ ...marca, corPrincipal: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor Secundária</Label>
                  <div className="flex gap-2">
                    <input type="color" value={marca?.corSecundaria || '#1e40af'} onChange={(e) => setMarca({ ...marca, corSecundaria: e.target.value })} className="h-10 w-10 rounded border cursor-pointer" />
                    <Input value={marca?.corSecundaria || '#1e40af'} onChange={(e) => setMarca({ ...marca, corSecundaria: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor de Fundo</Label>
                  <div className="flex gap-2">
                    <input type="color" value={marca?.corFundo || '#ffffff'} onChange={(e) => setMarca({ ...marca, corFundo: e.target.value })} className="h-10 w-10 rounded border cursor-pointer" />
                    <Input value={marca?.corFundo || '#ffffff'} onChange={(e) => setMarca({ ...marca, corFundo: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Redes Sociais</Label>
                <Textarea value={marca?.redesSociais || ''} onChange={(e) => setMarca({ ...marca, redesSociais: e.target.value })} placeholder="Facebook: ...&#10;Instagram: ..." />
              </div>
              <Button onClick={() => updateTenantMutation.mutate({ configMarca: marca })} disabled={updateTenantMutation.isPending}>
                {updateTenantMutation.isPending ? 'A guardar...' : 'Guardar Marca'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preços */}
        <TabsContent value="precos" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Tabela de Preços</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Motorista (€/hora)</Label>
                  <Input type="number" step="0.5" value={precos?.motorista || ''} onChange={(e) => setPrecos({ ...precos, motorista: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Motorista + 1 Ajudante (€/hora)</Label>
                  <Input type="number" step="0.5" value={precos?.motorista1Ajudante || ''} onChange={(e) => setPrecos({ ...precos, motorista1Ajudante: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Motorista + 2 Ajudantes (€/hora)</Label>
                  <Input type="number" step="0.5" value={precos?.motorista2Ajudantes || ''} onChange={(e) => setPrecos({ ...precos, motorista2Ajudantes: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Valor Mínimo de Serviço (horas)</Label>
                <Input type="number" step="0.5" value={precos?.minimoHoras || ''} onChange={(e) => setPrecos({ ...precos, minimoHoras: parseFloat(e.target.value) })} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2"><Label>Proteção Filme (€/un)</Label><Input type="number" step="0.1" value={precos?.protecaoFilme || ''} onChange={(e) => setPrecos({ ...precos, protecaoFilme: parseFloat(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Proteção Cartão (€/un)</Label><Input type="number" step="0.1" value={precos?.protecaoCartao || ''} onChange={(e) => setPrecos({ ...precos, protecaoCartao: parseFloat(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Caixas (€/un)</Label><Input type="number" step="0.1" value={precos?.caixas || ''} onChange={(e) => setPrecos({ ...precos, caixas: parseFloat(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Fita Cola (€/un)</Label><Input type="number" step="0.1" value={precos?.fitaCola || ''} onChange={(e) => setPrecos({ ...precos, fitaCola: parseFloat(e.target.value) })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Acréscimo Urgência (%)</Label>
                <Input type="number" value={precos?.acrescimoUrgencia || ''} onChange={(e) => setPrecos({ ...precos, acrescimoUrgencia: parseFloat(e.target.value) })} placeholder="25" />
              </div>
              <Button onClick={() => updateTenantMutation.mutate({ configPreco: precos })} disabled={updateTenantMutation.isPending}>
                {updateTenantMutation.isPending ? 'A guardar...' : 'Guardar Preços'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agenda */}
        <TabsContent value="agenda" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Configuração da Agenda</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora de Abertura</Label>
                  <Input type="time" value={agendaConfig?.horaAbertura || '08:00'} onChange={(e) => setAgendaConfig({ ...agendaConfig, horaAbertura: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Hora de Fecho</Label>
                  <Input type="time" value={agendaConfig?.horaFecho || '18:00'} onChange={(e) => setAgendaConfig({ ...agendaConfig, horaFecho: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Capacidade por Slot (mudanças simultâneas)</Label>
                <Input type="number" min="1" value={agendaConfig?.capacidadeSlot || 1} onChange={(e) => setAgendaConfig({ ...agendaConfig, capacidadeSlot: parseInt(e.target.value) })} />
              </div>
              <div className="space-y-3">
                <Label className="text-base font-medium">Dias de Funcionamento</Label>
                <div className="grid grid-cols-4 gap-2">
                  {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map((dia) => (
                    <div key={dia} className="flex items-center gap-2">
                      <Switch
                        checked={agendaConfig?.diasFuncionamento?.[dia] ?? (dia !== 'sabado' && dia !== 'domingo')}
                        onCheckedChange={(v) => setAgendaConfig({
                          ...agendaConfig,
                          diasFuncionamento: { ...agendaConfig?.diasFuncionamento, [dia]: v }
                        })}
                      />
                      <span className="text-sm capitalize">{dia}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => updateAgendaMutation.mutate(agendaConfig)} disabled={updateAgendaMutation.isPending}>
                {updateAgendaMutation.isPending ? 'A guardar...' : 'Guardar Agenda'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
