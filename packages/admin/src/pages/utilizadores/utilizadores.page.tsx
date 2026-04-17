import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserCog, Shield, Pencil, ToggleLeft, ToggleRight, Car } from 'lucide-react';
import { authApi, utilizadoresApi, motoristasApi } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../hooks/use-toast';
import { EmptyState } from '../../components/empty-state';
import { DataTable } from '../../components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
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

interface UserRow {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  eAtivo: boolean;
  ultimaSessao?: string;
}

const PERFIS: Record<string, string> = {
  admin: 'Administrador',
  gerente: 'Gerente',
  financeiro: 'Financeiro',
  operacional: 'Operacional',
  motorista: 'Motorista (PWA)',
};

export function UtilizadoresPage() {
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create dialog
  const [showCreate, setShowCreate] = useState(false);
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPerfil, setFormPerfil] = useState('operacional');
  const [formMotoristasPermitidos, setFormMotoristasPermitidos] = useState<string[]>([]);
  const [formVerTodosMotoristas, setFormVerTodosMotoristas] = useState(true);

  // Edit dialog
  const [showEdit, setShowEdit] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPerfil, setEditPerfil] = useState('');
  const [editMotoristasPermitidos, setEditMotoristasPermitidos] = useState<string[]>([]);
  const [editVerTodosMotoristas, setEditVerTodosMotoristas] = useState(true);

  // Toggle estado dialog
  const [showToggle, setShowToggle] = useState(false);
  const [toggleUser, setToggleUser] = useState<UserRow | null>(null);

  const { data: utilizadores, isLoading } = useQuery({
    queryKey: ['utilizadores'],
    queryFn: async () => {
      const res = await utilizadoresApi.findAll();
      return res.data as UserRow[];
    },
  });

  const { data: motores } = useQuery({
    queryKey: ['motoristas'],
    queryFn: async () => {
      const res = await motoristasApi.findAll();
      return res.data as any[];
    },
    enabled: showCreate || showEdit,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => authApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
      toast({ title: 'Utilizador criado com sucesso' });
      setShowCreate(false);
      setFormNome(''); setFormEmail(''); setFormPassword(''); setFormPerfil('operacional');
    },
    onError: () => toast({ title: 'Erro ao criar utilizador', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nome?: string; email?: string } }) =>
      utilizadoresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
      toast({ title: 'Utilizador atualizado' });
      setShowEdit(false);
      setEditUser(null);
    },
    onError: () => toast({ title: 'Erro ao atualizar', variant: 'destructive' }),
  });

  const updatePerfilMutation = useMutation({
    mutationFn: ({ id, perfil }: { id: string; perfil: string }) =>
      utilizadoresApi.updatePerfil(id, perfil),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
      toast({ title: 'Perfil atualizado' });
    },
    onError: () => toast({ title: 'Erro ao alterar perfil', variant: 'destructive' }),
  });

  const updatePermissoesMutation = useMutation({
    mutationFn: ({ id, permissoes }: { id: string; permissoes: any }) =>
      utilizadoresApi.updatePermissoes(id, permissoes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
      toast({ title: 'Permissões atualizadas' });
    },
    onError: () => toast({ title: 'Erro ao atualizar permissões', variant: 'destructive' }),
  });

  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, eAtivo }: { id: string; eAtivo: boolean }) =>
      utilizadoresApi.updateEstado(id, eAtivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilizadores'] });
      toast({ title: 'Estado do utilizador atualizado' });
      setShowToggle(false);
      setToggleUser(null);
    },
    onError: () => toast({ title: 'Erro ao alterar estado', variant: 'destructive' }),
  });

  const handleOpenEdit = async (user: UserRow) => {
    setEditUser(user);
    setEditNome(user.nome);
    setEditEmail(user.email);
    setEditPerfil(user.perfil);
    try {
      const res = await utilizadoresApi.findOne(user.id);
      const perms = (res.data as any).permissoes || {};
      setEditVerTodosMotoristas(perms.verTodosMotoristas !== false);
      setEditMotoristasPermitidos(perms.motoristasPermitidos || []);
    } catch {
      setEditVerTodosMotoristas(true);
      setEditMotoristasPermitidos([]);
    }
    setShowEdit(true);
  };

  const handleOpenToggle = (user: UserRow) => {
    setToggleUser(user);
    setShowToggle(true);
  };

  const columns: ColumnDef<UserRow>[] = [
    { accessorKey: 'nome', header: 'Nome' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'perfil',
      header: 'Perfil',
      cell: ({ row }) => (
        <Badge variant={row.original.perfil === 'admin' ? 'default' : 'outline'}>
          {PERFIS[row.original.perfil] || row.original.perfil}
        </Badge>
      ),
    },
    {
      accessorKey: 'eAtivo',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge className={row.original.eAtivo ? 'bg-green-600' : 'bg-red-600'}>
          {row.original.eAtivo ? 'Ativo' : 'Bloqueado'}
        </Badge>
      ),
    },
    {
      accessorKey: 'ultimaSessao',
      header: 'Última Sessão',
      cell: ({ row }) => row.original.ultimaSessao
        ? new Date(row.original.ultimaSessao).toLocaleDateString('pt-PT')
        : '—',
    },
    {
      id: 'acoes',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(row.original)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleOpenToggle(row.original)}>
            {row.original.eAtivo
              ? <ToggleRight className="h-3.5 w-3.5 text-green-600" />
              : <ToggleLeft className="h-3.5 w-3.5 text-red-600" />
            }
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Utilizadores</h2>
          <p className="text-muted-foreground">Gestão de utilizadores e permissões</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Novo Utilizador
        </Button>
      </div>

      {/* Info sobre perfis */}
      <div className="grid gap-3 md:grid-cols-3">
        {Object.entries(PERFIS).map(([key, label]) => (
          <Card key={key} className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{label}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {key === 'admin' && 'Acesso total ao sistema'}
              {key === 'gerente' && 'Sem configurações'}
              {key === 'financeiro' && 'Apenas relatórios e financeiro'}
              {key === 'operacional' && 'Aprovações, agenda, mudanças, clientes'}
              {key === 'motorista' && 'Acesso apenas ao PWA'}
            </p>
          </Card>
        ))}
      </div>

      {utilizadores && utilizadores.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Sem utilizadores registados"
          description="Crie utilizadores para atribuir acessos ao sistema."
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1" />Novo Utilizador
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={utilizadores || []} isLoading={isLoading} />
      )}

      {/* Dialog Criar */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Utilizador</DialogTitle>
            <DialogDescription>Crie um novo utilizador com perfil de acesso.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome</Label><Input value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Nome completo" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@empresa.pt" /></div>
            <div className="space-y-2"><Label>Senha Inicial</Label><Input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Mínimo 8 caracteres" /></div>
            <div className="space-y-2">
              <Label>Perfil</Label>
              <Select value={formPerfil} onValueChange={setFormPerfil}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PERFIS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formPerfil === 'gerente' && (
              <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <Label className="font-medium">Permissões de Gerente</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="verTodos"
                    checked={formVerTodosMotoristas}
                    onChange={(e) => { setFormVerTodosMotoristas(e.target.checked); if (e.target.checked) setFormMotoristasPermitidos([]); }}
                    className="rounded"
                  />
                  <Label htmlFor="verTodos" className="text-sm">Ver todos os motoristas</Label>
                </div>
                {!formVerTodosMotoristas && (
                  <div className="space-y-2">
                    <Label className="text-sm">Selecionar Motoristas:</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {(motores || []).map((m: any) => (
                        <label key={m.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formMotoristasPermitidos.includes(m.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormMotoristasPermitidos([...formMotoristasPermitidos, m.id]);
                              } else {
                                setFormMotoristasPermitidos(formMotoristasPermitidos.filter(id => id !== m.id));
                              }
                            }}
                            className="rounded"
                          />
                          {m.nome}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button
              disabled={!formNome || !formEmail || !formPassword || createMutation.isPending}
              onClick={() => createMutation.mutate({
                nome: formNome, email: formEmail, password: formPassword,
                perfil: formPerfil, tenantId: currentUser?.tenantId,
                permissoes: formPerfil === 'gerente' ? {
                  verTodosMotoristas: formVerTodosMotoristas,
                  motoresPermitidos: formMotoristasPermitidos,
                } : undefined,
              })}
            >
              {createMutation.isPending ? 'A criar...' : 'Criar Utilizador'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Utilizador</DialogTitle>
            <DialogDescription>Altere o nome, email ou perfil do utilizador.</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={editNome} onChange={(e) => setEditNome(e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={editPerfil} onValueChange={setEditPerfil}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PERFIS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editPerfil === 'gerente' && (
                <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    <Label className="font-medium">Permissões de Gerente</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editVerTodos"
                      checked={editVerTodosMotoristas}
                      onChange={(e) => { setEditVerTodosMotoristas(e.target.checked); if (e.target.checked) setEditMotoristasPermitidos([]); }}
                      className="rounded"
                    />
                    <Label htmlFor="editVerTodos" className="text-sm">Ver todos os motorista</Label>
                  </div>
                  {!editVerTodosMotoristas && (
                    <div className="space-y-2">
                      <Label className="text-sm">Selecionar Motoristas:</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {(motores || []).map((m: any) => (
                          <label key={m.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={editMotoristasPermitidos.includes(m.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditMotoristasPermitidos([...editMotoristasPermitidos, m.id]);
                                } else {
                                  setEditMotoristasPermitidos(editMotoristasPermitidos.filter(id => id !== m.id));
                                }
                              }}
                              className="rounded"
                            />
                            {m.nome}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancelar</Button>
            <Button
              disabled={updateMutation.isPending || updatePerfilMutation.isPending || updatePermissoesMutation.isPending}
              onClick={() => {
                if (!editUser) return;
                if (editPerfil !== editUser.perfil) {
                  updatePerfilMutation.mutate({ id: editUser.id, perfil: editPerfil });
                }
                if (editNome !== editUser.nome || editEmail !== editUser.email) {
                  updateMutation.mutate({ id: editUser.id, data: { nome: editNome, email: editEmail } });
                }
                if (editPerfil === 'gerente') {
                  updatePermissoesMutation.mutate({
                    id: editUser.id,
                    permissoes: {
                      verTodosMotoristas: editVerTodosMotoristas,
                      motoresPermitidos: editMotoristasPermitidos,
                    },
                  });
                }
                setShowEdit(false);
              }}
            >
              {(updateMutation.isPending || updatePerfilMutation.isPending || updatePermissoesMutation.isPending) ? 'A guardar...' : 'Guardar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Toggle Estado */}
      <Dialog open={showToggle} onOpenChange={setShowToggle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{toggleUser?.eAtivo ? 'Bloquear' : 'Ativar'} Utilizador</DialogTitle>
            <DialogDescription>
              {toggleUser?.eAtivo
                ? `Tem certeza que deseja bloquear ${toggleUser?.nome}? O utilizador perderá acesso ao sistema.`
                : `Tem certeza que deseja reativar ${toggleUser?.nome}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowToggle(false)}>Cancelar</Button>
            <Button
              variant={toggleUser?.eAtivo ? 'destructive' : 'default'}
              disabled={toggleEstadoMutation.isPending}
              onClick={() => {
                if (!toggleUser) return;
                toggleEstadoMutation.mutate({ id: toggleUser.id, eAtivo: !toggleUser.eAtivo });
              }}
            >
              {toggleEstadoMutation.isPending ? 'A processar...' : toggleUser?.eAtivo ? 'Bloquear' : 'Ativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
