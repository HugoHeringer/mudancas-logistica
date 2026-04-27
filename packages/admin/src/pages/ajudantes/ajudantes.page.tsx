import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { ajudantesApi } from '../../lib/api';
import { usePermissao } from '../../hooks/use-permissao';
import { useToast } from '../../hooks/use-toast';
import { EmptyState } from '../../components/empty-state';
import { DataTable } from '../../components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';

interface AjudanteRow {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  valorHora: number;
  disponivel: boolean;
  mudancasParticipadas?: number;
  horasTrabalhadasMes?: number;
}

export function AjudantesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { podeVer: podeVerAcao } = usePermissao();

  // Create/Edit dialog
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formValorHora, setFormValorHora] = useState('0');
  const [formDisponivel, setFormDisponivel] = useState(true);

  // Delete dialog
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteNome, setDeleteNome] = useState('');

  // Performance dialog
  const [showPerformance, setShowPerformance] = useState(false);
  const [selectedAjudante, setSelectedAjudante] = useState<AjudanteRow | null>(null);

  const { data: ajudantes, isLoading } = useQuery({
    queryKey: ['ajudantes'],
    queryFn: async () => {
      const res = await ajudantesApi.findAll();
      return res.data as AjudanteRow[];
    },
  });

  const { data: performance } = useQuery({
    queryKey: ['ajudantes', selectedAjudante?.id, 'performance'],
    queryFn: async () => {
      const now = new Date();
      const res = await ajudantesApi.getPerformance(selectedAjudante!.id, now.getMonth() + 1, now.getFullYear());
      return res.data;
    },
    enabled: !!selectedAjudante && showPerformance,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => ajudantesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ajudantes'] });
      toast({ title: 'Ajudante criado com sucesso' });
      closeForm();
    },
    onError: () => toast({ title: 'Erro ao criar ajudante', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ajudantesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ajudantes'] });
      toast({ title: 'Ajudante atualizado' });
      closeForm();
    },
    onError: () => toast({ title: 'Erro ao atualizar', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ajudantesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ajudantes'] });
      toast({ title: 'Ajudante removido' });
      setShowDelete(false);
    },
    onError: () => toast({ title: 'Erro ao remover', variant: 'destructive' }),
  });

  const openCreate = () => {
    setEditId(null);
    setFormNome('');
    setFormEmail('');
    setFormTelefone('');
    setFormValorHora('0');
    setFormDisponivel(true);
    setShowForm(true);
  };

  const openEdit = (ajudante: AjudanteRow) => {
    setEditId(ajudante.id);
    setFormNome(ajudante.nome);
    setFormEmail(ajudante.email || '');
    setFormTelefone(ajudante.telefone);
    setFormValorHora(String(ajudante.valorHora || 0));
    setFormDisponivel(ajudante.disponivel);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setSelectedAjudante(null);
  };

  const handleSubmit = () => {
    const data = {
      nome: formNome,
      email: formEmail || undefined,
      telefone: formTelefone,
      valorHora: parseFloat(formValorHora) || 0,
      disponivel: formDisponivel,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns: ColumnDef<AjudanteRow>[] = [
    { accessorKey: 'nome', header: 'Nome' },
    { accessorKey: 'telefone', header: 'Telefone' },
    {
      accessorKey: 'valorHora',
      header: 'Valor/Hora',
      cell: ({ row }) => `€${(row.original.valorHora || 0).toFixed(2)}`,
    },
    {
      accessorKey: 'disponivel',
      header: 'Disponível',
      cell: ({ row }) => (
        <Badge className={row.original.disponivel ? 'bg-green-600' : 'bg-muted-foreground'}>
          {row.original.disponivel ? 'Sim' : 'Não'}
        </Badge>
      ),
    },
    {
      accessorKey: 'mudancasParticipadas',
      header: 'Mudanças',
      cell: ({ row }) => row.original.mudancasParticipadas || 0,
    },
    {
      accessorKey: 'horasTrabalhadasMes',
      header: 'Horas/Mês',
      cell: ({ row }) => `${(row.original.horasTrabalhadasMes || 0).toFixed(1)}h`,
    },
    {
      id: 'acoes',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {podeVerAcao('editar') && (
            <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {podeVerAcao('editar') && (
            <Button variant="ghost" size="sm" onClick={() => {
              setSelectedAjudante(row.original);
              setShowPerformance(true);
            }}>
              <TrendingUp className="h-3.5 w-3.5" />
            </Button>
          )}
          {podeVerAcao('eliminar') && (
            <Button variant="ghost" size="sm" onClick={() => {
              setDeleteId(row.original.id);
              setDeleteNome(row.original.nome);
              setShowDelete(true);
            }}>
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Ajudantes</h2>
          <p className="text-muted-foreground">Gestão de ajudantes da equipa</p>
        </div>
        {podeVerAcao('criar') && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Ajudante
          </Button>
        )}
      </div>

      {ajudantes && ajudantes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sem ajudantes registados"
          description="Adicione ajudantes para compor as equipas de mudança."
          action={
            podeVerAcao('criar') ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" />Novo Ajudante
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable columns={columns} data={ajudantes || []} isLoading={isLoading} />
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Ajudante' : 'Novo Ajudante'}</DialogTitle>
            <DialogDescription>
              {editId ? 'Altere os dados do ajudante.' : 'Preencha os dados do novo ajudante.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label>Email (opcional)</Label>
              <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@exemplo.pt" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={formTelefone} onChange={(e) => setFormTelefone(e.target.value)} placeholder="912 345 678" />
            </div>
            <div className="space-y-2">
              <Label>Valor/Hora (€)</Label>
              <Input type="number" step="0.50" min="0" value={formValorHora} onChange={(e) => setFormValorHora(e.target.value)} placeholder="0.00" />
              <p className="text-xs text-muted-foreground">Valor pago ao ajudante por hora trabalhada.</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formDisponivel} onCheckedChange={setFormDisponivel} />
              <Label>Disponível</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeForm}>Cancelar</Button>
            <Button
              disabled={!formNome || !formTelefone || createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmit}
            >
              {(createMutation.isPending || updateMutation.isPending) ? 'A guardar...' : editId ? 'Guardar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performance Dialog */}
      <Dialog open={showPerformance} onOpenChange={setShowPerformance}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Performance — {selectedAjudante?.nome}</DialogTitle>
            <DialogDescription>Dados do mês atual</DialogDescription>
          </DialogHeader>
          {performance && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Mudanças</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{performance.mudancasNoMes || 0}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Horas Trabalhadas</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">{performance.horasTrabalhadas || 0}h</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Pago</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">€{(performance.totalPago || 0).toFixed(2)}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Valor/Hora Atual</CardTitle></CardHeader>
                <CardContent><p className="text-2xl font-bold">€{(selectedAjudante?.valorHora || 0).toFixed(2)}</p></CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPerformance(false); setSelectedAjudante(null); }}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Ajudante</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover <strong>{deleteNome}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>Cancelar</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {deleteMutation.isPending ? 'A remover...' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
