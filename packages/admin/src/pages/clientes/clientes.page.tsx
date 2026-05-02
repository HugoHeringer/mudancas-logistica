import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Merge, ArrowRight, Plus } from 'lucide-react';
import { clientesApi } from '../../lib/api';
import { formatDateOnly } from '@mudancas/shared';
import { useToast } from '../../hooks/use-toast';
import { EmptyState } from '../../components/empty-state';
import { DataTable } from '../../components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PageHeader } from '../../components/ui/page-header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';

interface Cliente {
  id: string;
  nome: string;
  apelido: string;
  email: string;
  telefone: string;
  nif?: string;
  numeroMudancas: number;
  eRecorrente: boolean;
  tipo: string;
  ultimaMudanca?: string;
  mudancas?: any[];
}

export function ClientesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showMerge, setShowMerge] = useState(false);
  const [mergeTargetEmail, setMergeTargetEmail] = useState('');

  // Create dialog state
  const [showCreate, setShowCreate] = useState(false);
  const [formNome, setFormNome] = useState('');
  const [formApelido, setFormApelido] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formNif, setFormNif] = useState('');

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clientesApi.findAll().then((r) => r.data as Cliente[]),
  });

  const { data: clienteDetalhe } = useQuery({
    queryKey: ['clientes', selectedCliente?.id],
    queryFn: () => clientesApi.findOne(selectedCliente!.id).then((r) => r.data),
    enabled: !!selectedCliente && showDetail,
  });

  const mergeMutation = useMutation({
    mutationFn: (data: { sourceId: string; targetId: string }) =>
      clientesApi.merge(data.sourceId, data.targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: 'Clientes mesclados com sucesso' });
      setShowMerge(false);
      setShowDetail(false);
      setMergeTargetEmail('');
    },
    onError: () => toast({ title: 'Erro ao mesclar', variant: 'destructive' }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => clientesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: 'Cliente criado com sucesso' });
      setShowCreate(false);
      setFormNome(''); setFormApelido(''); setFormEmail(''); setFormTelefone(''); setFormNif('');
    },
    onError: () => toast({ title: 'Erro ao criar cliente', variant: 'destructive' }),
  });

  const filteredData = (clientes || []).filter((c) => {
    if (!busca) return true;
    const t = busca.toLowerCase();
    return c.nome?.toLowerCase().includes(t) || c.email?.toLowerCase().includes(t) || c.telefone?.includes(busca);
  });

  const columns: ColumnDef<Cliente>[] = [
    {
      accessorKey: 'nome',
      header: 'Nome',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.nome} {row.original.apelido}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    { accessorKey: 'telefone', header: 'Telefone' },
    {
      accessorKey: 'numeroMudancas',
      header: 'Mudanças',
      cell: ({ row }) => row.original.numeroMudancas || 0,
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => {
        const tipo = row.original.tipo || (row.original.eRecorrente ? 'recorrente' : 'novo');
        if (tipo === 'vip') return <Badge className="bg-amber-500">VIP</Badge>;
        if (tipo === 'recorrente') return <Badge className="bg-purple-600">Recorrente</Badge>;
        return <Badge variant="outline">Novo</Badge>;
      },
    },
    {
      accessorKey: 'ultimaMudanca',
      header: 'Última Mudança',
      cell: ({ row }) => row.original.ultimaMudanca || '—',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        subtitle="Gestão de clientes e histórico"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Cliente
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Pesquisar por nome, email ou telefone..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
      </div>

      {!isLoading && filteredData.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum cliente" description="Adicione clientes manualmente ou aguarde por submissões do site público." action={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" />Novo Cliente</Button>} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          onRowClick={(row) => { setSelectedCliente(row as Cliente); setShowDetail(true); }}
        />
      )}

      {/* Dialog Detalhe */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCliente?.nome} {selectedCliente?.apelido}</DialogTitle>
            <DialogDescription>Perfil e histórico do cliente</DialogDescription>
          </DialogHeader>
          {clienteDetalhe && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4 space-y-1 text-sm">
                  <p><span className="font-medium">Email:</span> {clienteDetalhe.email}</p>
                  <p><span className="font-medium">Telefone:</span> {clienteDetalhe.telefone}</p>
                  {clienteDetalhe.nif && <p><span className="font-medium">NIF:</span> {clienteDetalhe.nif}</p>}
                  <p><span className="font-medium">Total de mudanças:</span> {clienteDetalhe.numeroMudancas || 0}</p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Tipo:</span>
                    {(() => {
                      const tipo = clienteDetalhe.tipo || (clienteDetalhe.eRecorrente ? 'recorrente' : 'novo');
                      if (tipo === 'vip') return <Badge className="bg-amber-500">VIP</Badge>;
                      if (tipo === 'recorrente') return <Badge className="bg-purple-600">Recorrente</Badge>;
                      return <Badge variant="outline">Novo</Badge>;
                    })()}
                  </p>
                </CardContent>
              </Card>

              {clienteDetalhe.mudancas?.length > 0 && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Histórico de Mudanças</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {clienteDetalhe.mudancas.slice(0, 5).map((m: any) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 p-2 rounded border cursor-pointer hover:bg-muted/50"
                        onClick={() => { setShowDetail(false); navigate(`/mudancas/${m.id}`); }}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{formatDateOnly(m.dataPretendida)}</p>
                          <p className="text-xs text-muted-foreground">{m.tipoServico} — {m.estado}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Button variant="outline" className="w-full" onClick={() => { setShowDetail(false); setShowMerge(true); }}>
                <Merge className="h-4 w-4 mr-1" />
                Mesclar com outro cliente
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetail(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Criar Cliente */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>Preencha os dados do novo cliente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Nome" />
              </div>
              <div className="space-y-2">
                <Label>Apelido</Label>
                <Input value={formApelido} onChange={(e) => setFormApelido(e.target.value)} placeholder="Apelido" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@exemplo.pt" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={formTelefone} onChange={(e) => setFormTelefone(e.target.value)} placeholder="912345678" />
            </div>
            <div className="space-y-2">
              <Label>NIF</Label>
              <Input value={formNif} onChange={(e) => setFormNif(e.target.value)} placeholder="123456789" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button
              disabled={!formNome || !formApelido || !formEmail || !formTelefone || createMutation.isPending}
              onClick={() => createMutation.mutate({
                nome: formNome, apelido: formApelido, email: formEmail, telefone: formTelefone,
                nif: formNif || undefined,
              })}
            >
              {createMutation.isPending ? 'A criar...' : 'Criar Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Mesclagem */}
      <Dialog open={showMerge} onOpenChange={setShowMerge}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mesclar Clientes</DialogTitle>
            <DialogDescription>Útil quando o mesmo cliente tem dois registos por engano. Os dados do registo selecionado serão transferidos para o registo destino.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-500/10 p-3 rounded-lg text-sm text-yellow-700">
              <p><strong>Origem:</strong> {selectedCliente?.nome} ({selectedCliente?.email})</p>
              <p>Este registo será removido após a mesclagem.</p>
            </div>
            <div className="space-y-2">
              <Label>Email do cliente destino</Label>
              <Input
                value={mergeTargetEmail}
                onChange={(e) => setMergeTargetEmail(e.target.value)}
                placeholder="email@destino.pt"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowMerge(false); setMergeTargetEmail(''); }}>Cancelar</Button>
            <Button
              disabled={!mergeTargetEmail.trim() || mergeMutation.isPending}
              onClick={() => {
                const target = clientes?.find((c) => c.email === mergeTargetEmail.trim());
                if (!target) { toast({ title: 'Cliente destino não encontrado', variant: 'destructive' }); return; }
                if (target.id === selectedCliente?.id) { toast({ title: 'Não pode mesclar um cliente consigo mesmo', variant: 'destructive' }); return; }
                mergeMutation.mutate({ sourceId: selectedCliente!.id, targetId: target.id });
              }}
            >
              {mergeMutation.isPending ? 'A mesclar...' : 'Confirmar Mesclagem'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
