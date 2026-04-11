import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, UserCog, Shield } from 'lucide-react';
import { authApi } from '../../lib/api';
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
  const [showCreate, setShowCreate] = useState(false);
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPerfil, setFormPerfil] = useState('operacional');

  // Nota: não existe endpoint de listagem de utilizadores no backend atual.
  // Este é um placeholder que usa os dados do tenant.
  // Quando o endpoint estiver disponível, substituir a query.
  const { data: utilizadores, isLoading } = useQuery({
    queryKey: ['utilizadores'],
    queryFn: async () => {
      // Placeholder - quando backend tiver endpoint de listagem
      return [] as UserRow[];
    },
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
      cell: ({ row }) => row.original.ultimaSessao || '—',
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
              {key === 'gerente' && 'Sem financeiro e configurações'}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button
              disabled={!formNome || !formEmail || !formPassword || createMutation.isPending}
              onClick={() => createMutation.mutate({
                nome: formNome, email: formEmail, password: formPassword,
                perfil: formPerfil, tenantId: currentUser?.tenantId,
              })}
            >
              {createMutation.isPending ? 'A criar...' : 'Criar Utilizador'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
