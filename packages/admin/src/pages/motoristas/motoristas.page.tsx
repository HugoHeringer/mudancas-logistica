import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Car, TrendingUp } from 'lucide-react';
import { motoristasApi, veiculosApi } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { StatusBadge } from '../../components/status-badge';
import { EmptyState } from '../../components/empty-state';
import { DataTable } from '../../components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { GlassCard } from '../../components/luxury/GlassCard';
import { PageHeader } from '../../components/ui/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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

interface Motorista {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  estado: string;
  valorHora: number;
  veiculo?: { id: string; nome: string };
  mudancasRealizadas: number;
}

export function MotoristasPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedMotorista, setSelectedMotorista] = useState<Motorista | null>(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const [busca, setBusca] = useState('');

  // Form state
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formCarta, setFormCarta] = useState('');
  const [formValidade, setFormValidade] = useState('');
  const [formVeiculoId, setFormVeiculoId] = useState('');
  const [formValorHora, setFormValorHora] = useState('0');

  const { data: motoristas, isLoading } = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => motoristasApi.findAll().then((r) => r.data as Motorista[]),
  });

  const { data: veiculos } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => veiculosApi.findAll().then((r) => r.data),
  });

  const { data: performance } = useQuery({
    queryKey: ['motoristas', selectedMotorista?.id, 'performance'],
    queryFn: () => {
      const now = new Date();
      return motoristasApi.getPerformance(selectedMotorista!.id, now.getMonth() + 1, now.getFullYear()).then((r) => r.data);
    },
    enabled: !!selectedMotorista && showPerformance,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => motoristasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      toast({ title: 'Motorista criado com sucesso' });
      closeDialogs();
    },
    onError: () => toast({ title: 'Erro ao criar motorista', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; data: any }) => motoristasApi.update(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      toast({ title: 'Motorista atualizado com sucesso' });
      closeDialogs();
    },
    onError: () => toast({ title: 'Erro ao atualizar motorista', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => motoristasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      toast({ title: 'Motorista removido' });
      closeDialogs();
    },
    onError: () => toast({ title: 'Erro ao remover motorista', variant: 'destructive' }),
  });

  const closeDialogs = () => {
    setShowCreate(false);
    setShowEdit(false);
    setShowPerformance(false);
    setSelectedMotorista(null);
    setFormNome('');
    setFormEmail('');
    setFormTelefone('');
    setFormCarta('');
    setFormValidade('');
    setFormVeiculoId('');
    setFormValorHora('0');
  };

  const openEdit = (m: Motorista) => {
    setSelectedMotorista(m);
    setFormNome(m.nome);
    setFormEmail(m.email);
    setFormTelefone(m.telefone);
    setFormVeiculoId(m.veiculo?.id || '');
    setFormValorHora(String(m.valorHora || 0));
    setShowEdit(true);
  };

  const filteredData = (motoristas || []).filter((m) => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return m.nome?.toLowerCase().includes(termo) || m.email?.toLowerCase().includes(termo);
  });

  const columns: ColumnDef<Motorista>[] = [
    { accessorKey: 'nome', header: 'Nome' },
    { accessorKey: 'telefone', header: 'Telefone' },
    {
      accessorKey: 'veiculo',
      header: 'Veículo',
      cell: ({ row }) => row.original.veiculo?.nome || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'valorHora',
      header: 'Valor/Hora',
      cell: ({ row }) => `€${(row.original.valorHora || 0).toFixed(2)}`,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <StatusBadge status={row.original.estado} />,
    },
    {
      accessorKey: 'mudancasRealizadas',
      header: 'Mudanças',
      cell: ({ row }) => row.original.mudancasRealizadas || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Motoristas"
        subtitle="Gestão de motoristas e performance"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Motorista
          </Button>
        }
      />

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar motorista..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
        </div>
      </div>

      {!isLoading && filteredData.length === 0 ? (
        <EmptyState icon={Car} title="Nenhum motorista" description="Comece por adicionar o primeiro motorista." action={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" />Novo Motorista</Button>} />
      ) : (
        <DataTable columns={columns} data={filteredData} isLoading={isLoading} onRowClick={(row) => openEdit(row as Motorista)} />
      )}

      {/* Dialog Criar */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Motorista</DialogTitle>
            <DialogDescription>Preencha os dados do novo motorista.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome</Label><Input value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Nome completo" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@exemplo.pt" /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input value={formTelefone} onChange={(e) => setFormTelefone(e.target.value)} placeholder="912345678" /></div>
            <div className="space-y-2">
              <Label>Valor/Hora (€)</Label>
              <Input type="number" step="0.50" min="0" value={formValorHora} onChange={(e) => setFormValorHora(e.target.value)} placeholder="0.00" />
              <p className="text-xs text-muted-foreground">Valor pago ao motorista por hora trabalhada.</p>
            </div>
            <div className="space-y-2"><Label>Nº Carta de Condução</Label><Input value={formCarta} onChange={(e) => setFormCarta(e.target.value)} placeholder="P-12345678" /></div>
            <div className="space-y-2"><Label>Validade da Carta</Label><Input type="date" value={formValidade} onChange={(e) => setFormValidade(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Veículo Atribuído</Label>
              <Select value={formVeiculoId} onValueChange={setFormVeiculoId}>
                <SelectTrigger><SelectValue placeholder="Selecionar veículo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Sem veículo</SelectItem>
                  {(veiculos || []).map((v: any) => (
                    <SelectItem key={v.id} value={v.id}>{v.nome} — {v.matricula}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancelar</Button>
            <Button disabled={!formNome || createMutation.isPending} onClick={() => createMutation.mutate({ nome: formNome, email: formEmail, telefone: formTelefone, cartaConducao: formCarta, validadeCarta: formValidade, valorHora: parseFloat(formValorHora) || 0, veiculoId: formVeiculoId === '_none' ? undefined : formVeiculoId || undefined })}>
              {createMutation.isPending ? 'A criar...' : 'Criar Motorista'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar / Performance */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Motorista</DialogTitle>
          </DialogHeader>
          {selectedMotorista && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={formNome} onChange={(e) => setFormNome(e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={formTelefone} onChange={(e) => setFormTelefone(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Valor/Hora (€)</Label>
                <Input type="number" step="0.50" min="0" value={formValorHora} onChange={(e) => setFormValorHora(e.target.value)} />
                <p className="text-xs text-muted-foreground">Valor pago ao motorista por hora trabalhada.</p>
              </div>
              <div className="space-y-2">
                <Label>Veículo Atribuído</Label>
                <Select value={formVeiculoId} onValueChange={setFormVeiculoId}>
                  <SelectTrigger><SelectValue placeholder="Selecionar veículo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sem veículo</SelectItem>
                    {(veiculos || []).map((v: any) => (
                      <SelectItem key={v.id} value={v.id}>{v.nome} — {v.matricula}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { setShowPerformance(true); setShowEdit(false); }}>
                  <TrendingUp className="h-4 w-4 mr-1" /> Performance
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { if (confirm('Tem a certeza?')) deleteMutation.mutate(selectedMotorista.id); }}>
                  Remover
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Cancelar</Button>
            <Button disabled={!formNome || updateMutation.isPending} onClick={() => selectedMotorista && updateMutation.mutate({ id: selectedMotorista.id, data: { nome: formNome, email: formEmail, telefone: formTelefone, valorHora: parseFloat(formValorHora) || 0, veiculoId: formVeiculoId === '_none' ? null : formVeiculoId || undefined } })}>
              {updateMutation.isPending ? 'A guardar...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Performance */}
      <Dialog open={showPerformance} onOpenChange={setShowPerformance}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Performance — {selectedMotorista?.nome}</DialogTitle>
            <DialogDescription>Dados do mês atual</DialogDescription>
          </DialogHeader>
          {performance && (
            <div className="grid grid-cols-2 gap-3">
              <GlassCard className="p-4">
                <span className="ct-ledger-label">Mudanças</span>
                <p className="text-2xl font-light mt-1" style={{ fontFamily: 'var(--tenant-font-display)' }}>{performance.mudancasNoMes}</p>
              </GlassCard>
              <GlassCard className="p-4">
                <span className="ct-ledger-label">Horas</span>
                <p className="text-2xl font-light mt-1" style={{ fontFamily: 'var(--tenant-font-display)' }}>{performance.horasTrabalhadas}h</p>
              </GlassCard>
              <GlassCard className="p-4">
                <span className="ct-ledger-label">Receita Gerada</span>
                <p className="text-2xl font-light mt-1 text-emerald-600" style={{ fontFamily: 'var(--tenant-font-display)' }}>€{performance.receitaGerada?.toFixed(2)}</p>
              </GlassCard>
              <GlassCard className="p-4">
                <span className="ct-ledger-label">Margem</span>
                <p className={`text-2xl font-light mt-1 ${performance.margem >= 0 ? 'text-emerald-600' : 'text-destructive'}`} style={{ fontFamily: 'var(--tenant-font-display)' }}>€{performance.margem?.toFixed(2)}</p>
              </GlassCard>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
