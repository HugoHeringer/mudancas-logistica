import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { clientesApi, veiculosApi, motoristasApi, mudancasApi, formularioApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export function NovaMudancaPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    clienteNome: '',
    clienteEmail: '',
    clienteTelefone: '',
    moradaRecolhaRua: '',
    moradaRecolhaNumero: '',
    moradaRecolhaCodigoPostal: '',
    moradaRecolhaLocalidade: '',
    moradaEntregaRua: '',
    moradaEntregaNumero: '',
    moradaEntregaCodigoPostal: '',
    moradaEntregaLocalidade: '',
    descricao: '',
    tipoServico: 'padrao',
    dataPretendida: '',
    horaPretendida: '',
    veiculoId: '',
    motoristId: '',
    equipas: 'motorista',
  });

  const [camposPersonalizados, setCamposPersonalizados] = useState<Record<string, any>>({});
  const [camposFormulario, setCamposFormulario] = useState<any[]>([]);

  const { data: clientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesApi.findAll().then((r) => r.data),
  });

  const { data: veiculos } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => veiculosApi.findAll().then((r) => r.data),
  });

  const { data: motoristas } = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => motoristasApi.findAll().then((r) => r.data),
  });

const handleMotoristaChange = (mid: string) => {
    if (mid === '_none') {
      setFormData({ ...formData, motoristId: '', veiculoId: '' });
    } else if (mid) {
      const selected = (motoristas as any[])?.find((m: any) => m.id === mid);
      if (selected?.veiculoId) {
        setFormData({ ...formData, motoristId: selected.id, veiculoId: selected.veiculoId });
      } else {
        setFormData({ ...formData, motoristId: selected.id, veiculoId: '' });
      }
    }
  };

  const handleVeiculoChange = (veiculoId: string) => {
    setFormData({ ...formData, veiculoId: veiculoId === '_none' ? '' : veiculoId });
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await mudancasApi.create(data);
      return res.data;
    },
    onSuccess: () => {
      toast({ title: 'Mudança criada com sucesso' });
      navigate('/mudancas');
    },
    onError: () => {
      toast({ title: 'Erro ao criar mudança', variant: 'destructive' });
    },
  });

const handleSubmit = () => {
    if (!formData.clienteNome || !formData.dataPretendida || !formData.moradaRecolhaRua || !formData.moradaEntregaRua) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    createMutation.mutate({
      clienteNome: formData.clienteNome,
      clienteEmail: formData.clienteEmail,
      clienteTelefone: formData.clienteTelefone,
      moradaRecolha: {
        rua: formData.moradaRecolhaRua,
        numero: formData.moradaRecolhaNumero || '',
        codigoPostal: formData.moradaRecolhaCodigoPostal,
        localidade: formData.moradaRecolhaLocalidade,
      },
      moradaEntrega: {
        rua: formData.moradaEntregaRua,
        numero: formData.moradaEntregaNumero || '',
        codigoPostal: formData.moradaEntregaCodigoPostal,
        localidade: formData.moradaEntregaLocalidade,
      },
      motoristaId: formData.motoristId || null,
      dataPretendida: formData.dataPretendida,
      horaPretendida: formData.horaPretendida,
      // [3.3] Map tipoServico correctly including 'parcial'
      tipoServico: formData.tipoServico === 'padrao' ? 'normal' : formData.tipoServico,
      veiculoId: formData.veiculoId || null,
      equipa: formData.equipas === 'motorista_ajudante' ? 'motorista_1_ajudante' :
              formData.equipas === 'motorista_2_ajudantes' ? 'motorista_2_ajudantes' : 'motorista',
      observacoes: formData.descricao,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/mudancas')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nova Mudança</h1>
          <p className="text-muted-foreground">Criar nova mudança manualmente</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Dados do Cliente</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Cliente *</Label>
              <Input
                value={formData.clienteNome}
                onChange={(e) => setFormData({ ...formData, clienteNome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.clienteEmail}
                onChange={(e) => setFormData({ ...formData, clienteEmail: e.target.value })}
                placeholder="email@exemplo.pt"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.clienteTelefone}
                onChange={(e) => setFormData({ ...formData, clienteTelefone: e.target.value })}
                placeholder="912345678"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Morada de Recolha *</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rua *</Label>
              <Input
                value={formData.moradaRecolhaRua}
                onChange={(e) => setFormData({ ...formData, moradaRecolhaRua: e.target.value })}
                placeholder="Nome da rua"
              />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input
                value={formData.moradaRecolhaNumero}
                onChange={(e) => setFormData({ ...formData, moradaRecolhaNumero: e.target.value })}
                placeholder="Nº"
              />
            </div>
            <div className="space-y-2">
              <Label>Código Postal</Label>
              <Input
                value={formData.moradaRecolhaCodigoPostal}
                onChange={(e) => setFormData({ ...formData, moradaRecolhaCodigoPostal: e.target.value })}
                placeholder="1000-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Localidade</Label>
              <Input
                value={formData.moradaRecolhaLocalidade}
                onChange={(e) => setFormData({ ...formData, moradaRecolhaLocalidade: e.target.value })}
                placeholder="Lisboa"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Morada de Entrega *</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rua *</Label>
              <Input
                value={formData.moradaEntregaRua}
                onChange={(e) => setFormData({ ...formData, moradaEntregaRua: e.target.value })}
                placeholder="Nome da rua"
              />
            </div>
            <div className="space-y-2">
              <Label>Número</Label>
              <Input
                value={formData.moradaEntregaNumero}
                onChange={(e) => setFormData({ ...formData, moradaEntregaNumero: e.target.value })}
                placeholder="Nº"
              />
            </div>
            <div className="space-y-2">
              <Label>Código Postal</Label>
              <Input
                value={formData.moradaEntregaCodigoPostal}
                onChange={(e) => setFormData({ ...formData, moradaEntregaCodigoPostal: e.target.value })}
                placeholder="1000-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Localidade</Label>
              <Input
                value={formData.moradaEntregaLocalidade}
                onChange={(e) => setFormData({ ...formData, moradaEntregaLocalidade: e.target.value })}
                placeholder="Lisboa"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Detalhes da Mudança</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Serviço</Label>
              <Select
                value={formData.tipoServico}
                onValueChange={(v) => setFormData({ ...formData, tipoServico: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="padrao">Mudança Padrão</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Equipa</Label>
              <Select
                value={formData.equipas}
                onValueChange={(v) => setFormData({ ...formData, equipas: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="motorista">Motorista</SelectItem>
                  <SelectItem value="motorista_ajudante">Motorista + 1 Ajudante</SelectItem>
                  <SelectItem value="motorista_2_ajudantes">Motorista + 2 Ajudantes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data Pretendida *</Label>
              <Input
                type="date"
                value={formData.dataPretendida}
                onChange={(e) => setFormData({ ...formData, dataPretendida: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hora Pretendida</Label>
              <Input
                type="time"
                value={formData.horaPretendida}
                onChange={(e) => setFormData({ ...formData, horaPretendida: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Recursos (Opcional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Motorista</Label>
              <Select
                value={formData.motoristId}
                onValueChange={handleMotoristaChange}
              >
                <SelectTrigger><SelectValue placeholder="Selecionar motorista" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Sem motorista</SelectItem>
                  {(motoristas || []).map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Veículo</Label>
              <Select
                value={formData.veiculoId}
                onValueChange={(v) => setFormData({ ...formData, veiculoId: v === '_none' ? '' : v })}
              >
                <SelectTrigger><SelectValue placeholder="Selecionar veículo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Sem veículo</SelectItem>
                  {(veiculos || []).map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>{v.nome} - {v.matricula}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Descrição</Label>
          <Input
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Notas adicionais..."
          />
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/mudancas')}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending ? 'A criar...' : 'Criar Mudança'}
          </Button>
        </div>
      </div>
    </div>
  );
}