import { formatDateOnly } from '@movefy/shared';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { superAdminApi } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../../components/ui/dialog';
import { Building2, Plus, Eye, Trash2, Key, AlertTriangle } from 'lucide-react';

export function SuperAdminEmpresasPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: tenants = [] } = useQuery({
    queryKey: ['super-admin', 'tenants'],
    queryFn: () => superAdminApi.getTenants().then(r => r.data),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetTenantId, setResetTenantId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [createForm, setCreateForm] = useState({
    subdomain: '',
    nome: '',
    adminNome: '',
    adminEmail: '',
    adminPassword: '',
    pais: 'Portugal',
    moeda: 'EUR',
    fuso: 'Europe/Lisbon',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin'] });
      setShowCreate(false);
      toast({ title: 'Empresa criada com sucesso' });
      setCreateForm({ subdomain: '', nome: '', adminNome: '', adminEmail: '', adminPassword: '', pais: 'Portugal', moeda: 'EUR', fuso: 'Europe/Lisbon' });
    },
    onError: () => toast({ title: 'Erro ao criar empresa', variant: 'destructive' }),
  });

  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) => superAdminApi.updateTenantEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin'] });
      toast({ title: 'Estado atualizado' });
    },
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => superAdminApi.resetAdminPassword(id, password),
    onSuccess: () => {
      setShowReset(false);
      setResetTenantId(null);
      setNewPassword('');
      toast({ title: 'Password redefinida' });
    },
    onError: () => toast({ title: 'Erro ao redefinir password', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => superAdminApi.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin'] });
      toast({ title: 'Empresa removida' });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cream">Empresas</h2>
          <p className="text-cream/50 text-sm">Gerir empresas da plataforma</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gold hover:bg-gold/90 text-night">
          <Plus className="w-4 h-4 mr-1" /> Nova Empresa
        </Button>
      </div>

      <div className="space-y-3">
        {(tenants as any[]).map((tenant: any) => (
          <Card key={tenant.id} className="bg-night-light border-gold/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-cream font-medium text-lg">{(tenant.configMarca as any)?.nome || tenant.subdomain}</p>
                    <p className="text-cream/40 text-sm">{tenant.subdomain} — Criada em {formatDateOnly(tenant.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm mr-4">
                    <p className="text-cream/60">{tenant._count?.users || 0} utilizadores</p>
                    <p className="text-cream/60">{tenant._count?.mudancas || 0} mudanças</p>
                    <p className="text-cream/60">{tenant._count?.clientes || 0} clientes</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    tenant.estado === 'ativa' ? 'bg-emerald-500/10 text-emerald-400' :
                    tenant.estado === 'em_setup' ? 'bg-gold/10 text-gold' :
                    tenant.estado === 'suspensa' ? 'bg-red-500/10 text-red-400' :
                    'bg-cream/10 text-cream/50'
                  }`}>
                    {tenant.estado}
                  </span>
                  <div className="flex gap-1">
                    {tenant.estado !== 'ativa' && (
                      <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        onClick={() => estadoMutation.mutate({ id: tenant.id, estado: 'ativa' })}>
                        Ativar
                      </Button>
                    )}
                    {tenant.estado === 'ativa' && (
                      <Button variant="ghost" size="sm" className="text-gold hover:text-gold/80 hover:bg-gold/10"
                        onClick={() => estadoMutation.mutate({ id: tenant.id, estado: 'suspensa' })}>
                        Suspender
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-cream/50 hover:text-cream hover:bg-white/[0.04]"
                      onClick={() => { setResetTenantId(tenant.id); setShowReset(true); }}>
                      <Key className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja eliminar a empresa "${(tenant.configMarca as any)?.nome || tenant.subdomain}"? Esta ação é irreversível.`)) {
                          deleteMutation.mutate(tenant.id);
                        }
                      }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {tenants.length === 0 && (
          <p className="text-cream/30 text-center py-8">Nenhuma empresa registada</p>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-night-light border-gold/20 text-cream max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-cream">Criar Nova Empresa</DialogTitle>
            <DialogDescription className="text-cream/50">Configure a nova empresa e o seu administrador</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-cream/70">Nome da Empresa</Label>
              <Input value={createForm.nome} onChange={e => setCreateForm({ ...createForm, nome: e.target.value })} className="bg-night border-gold/20 text-cream" />
            </div>
            <div className="space-y-2">
              <Label className="text-cream/70">Subdomínio</Label>
              <div className="flex items-center gap-1">
                <Input value={createForm.subdomain} onChange={e => setCreateForm({ ...createForm, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className="bg-night border-gold/20 text-cream" placeholder="empresa" />
                <span className="text-cream/40 text-sm whitespace-nowrap">.mudancas-logistica.pt</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-cream/70">País</Label>
                <Input value={createForm.pais} onChange={e => setCreateForm({ ...createForm, pais: e.target.value })} className="bg-night border-gold/20 text-cream" />
              </div>
              <div className="space-y-2">
                <Label className="text-cream/70">Moeda</Label>
                <Input value={createForm.moeda} onChange={e => setCreateForm({ ...createForm, moeda: e.target.value })} className="bg-night border-gold/20 text-cream" />
              </div>
              <div className="space-y-2">
                <Label className="text-cream/70">Fuso</Label>
                <Input value={createForm.fuso} onChange={e => setCreateForm({ ...createForm, fuso: e.target.value })} className="bg-night border-gold/20 text-cream" />
              </div>
            </div>
            <div className="border-t border-gold/10 pt-4">
              <p className="text-sm font-medium text-cream/70 mb-3">Administrador</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-cream/70">Nome</Label>
                  <Input value={createForm.adminNome} onChange={e => setCreateForm({ ...createForm, adminNome: e.target.value })} className="bg-night border-gold/20 text-cream" />
                </div>
                <div className="space-y-2">
                  <Label className="text-cream/70">Email</Label>
                  <Input type="email" value={createForm.adminEmail} onChange={e => setCreateForm({ ...createForm, adminEmail: e.target.value })} className="bg-night border-gold/20 text-cream" />
                </div>
              </div>
              <div className="space-y-2 mt-3">
                <Label className="text-cream/70">Password</Label>
                <Input type="password" value={createForm.adminPassword} onChange={e => setCreateForm({ ...createForm, adminPassword: e.target.value })} className="bg-night border-gold/20 text-cream" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)} className="border-gold/20 text-cream/70 hover:text-cream">Cancelar</Button>
            <Button onClick={() => createMutation.mutate({
              subdomain: createForm.subdomain,
              configMarca: { nome: createForm.nome, cores: { primaria: '#D4A853', secundaria: '#C4572A', acento: '#1E2640' } },
              configPreco: {},
              configAgenda: {},
              adminNome: createForm.adminNome,
              adminEmail: createForm.adminEmail,
              adminPassword: createForm.adminPassword,
            })} disabled={!createForm.subdomain || !createForm.adminEmail || !createForm.adminPassword || createMutation.isPending}
              className="bg-gold hover:bg-gold/90 text-night">
              {createMutation.isPending ? 'A criar...' : 'Criar Empresa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showReset} onOpenChange={setShowReset}>
        <DialogContent className="bg-night-light border-gold/20 text-cream">
          <DialogHeader>
            <DialogTitle className="text-cream flex items-center gap-2">
              <Key className="w-4 h-4" /> Redefinir Password do Admin
            </DialogTitle>
            <DialogDescription className="text-cream/50">Defina uma nova password para o administrador desta empresa</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-gold/5 border border-gold/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-gold shrink-0" />
              <p className="text-xs text-cream/60">O administrador atual será notificado da alteração</p>
            </div>
            <div className="space-y-2">
              <Label className="text-cream/70">Nova Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-night border-gold/20 text-cream" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReset(false)} className="border-gold/20 text-cream/70">Cancelar</Button>
            <Button onClick={() => resetTenantId && resetMutation.mutate({ id: resetTenantId, password: newPassword })}
              disabled={!newPassword || resetMutation.isPending} className="bg-gold hover:bg-gold/90 text-night">
              {resetMutation.isPending ? 'A redefinir...' : 'Redefinir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
