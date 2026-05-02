import { formatDateOnly } from '@movefy/shared';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { superAdminApi, tenantsApi } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { CardSkeleton } from '../../components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../../components/ui/dialog';
import { ArrowLeft, Building2, Users, Truck, Calendar, Wallet, Mail, Key, AlertTriangle, Globe, CheckCircle2, Circle, Settings } from 'lucide-react';
import { useState } from 'react';

export function SuperAdminEmpresaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showSubdomain, setShowSubdomain] = useState(false);
  const [newSubdomain, setNewSubdomain] = useState('');

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['super-admin', 'tenant', id],
    queryFn: () => superAdminApi.getTenantDetail(id!).then(r => r.data),
    enabled: !!id,
  });

  const { data: setupProgress } = useQuery({
    queryKey: ['super-admin', 'tenant', id, 'setup-progress'],
    queryFn: () => tenantsApi.getSetupProgress(id!).then(r => r.data),
    enabled: !!id,
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
      setNewPassword('');
      toast({ title: 'Password redefinida' });
    },
  });

  const subdomainMutation = useMutation({
    mutationFn: (subdomain: string) => tenantsApi.update(id!, { subdomain } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin'] });
      setShowSubdomain(false);
      toast({ title: 'Subdomínio atualizado' });
    },
    onError: () => toast({ title: 'Erro ao atualizar subdomínio', variant: 'destructive' }),
  });

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <CardSkeleton />
    </div>
  );
  if (!tenant) return <div className="text-cream/50 text-center py-8">Empresa não encontrada</div>;

  const configMarca = (tenant.configMarca as Record<string, any>) || {};
  const adminUser = (tenant.users as any[])?.find((u: any) => u.perfil === 'admin');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/super-admin/empresas')} className="text-cream/50 hover:text-cream hover:bg-white/[0.04]">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-cream">{configMarca.nome || tenant.subdomain}</h2>
          <p className="text-cream/40 text-sm">{tenant.subdomain}</p>
        </div>
        <div className="ml-auto">
          <span className={`text-xs px-2.5 py-1 rounded-full ${
            tenant.estado === 'ativa' ? 'bg-emerald-500/10 text-emerald-400' :
            tenant.estado === 'em_setup' ? 'bg-gold/10 text-gold' :
            tenant.estado === 'suspensa' ? 'bg-red-500/10 text-red-400' :
            'bg-cream/10 text-cream/50'
          }`}>
            {tenant.estado}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="bg-night-light border-gold/10 lg:col-span-2">
          <CardHeader><CardTitle className="text-cream">Dados da Empresa</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-cream/40 text-xs uppercase tracking-wider mb-1">Subdomínio</p>
                <p className="text-cream flex items-center gap-2">
                  {tenant.subdomain}
                  <button onClick={() => { setNewSubdomain(tenant.subdomain); setShowSubdomain(true); }} className="text-gold/50 hover:text-gold">
                    <Globe className="w-3.5 h-3.5" />
                  </button>
                </p>
              </div>
              <div>
                <p className="text-cream/40 text-xs uppercase tracking-wider mb-1">Criada em</p>
                <p className="text-cream">{formatDateOnly(tenant.createdAt)}</p>
              </div>
              <div>
                <p className="text-cream/40 text-xs uppercase tracking-wider mb-1">Último acesso</p>
                <p className="text-cream">{tenant.dataUltimoAcesso ? formatDateOnly(tenant.dataUltimoAcesso) : 'Nunca'}</p>
              </div>
              <div>
                <p className="text-cream/40 text-xs uppercase tracking-wider mb-1">Admin</p>
                <p className="text-cream">{adminUser?.nome || 'N/A'} ({adminUser?.email || 'N/A'})</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gold/10">
              <div className="text-center p-3 bg-night rounded-lg">
                <Users className="w-5 h-5 text-gold mx-auto mb-1" />
                <p className="text-lg text-cream">{tenant._count?.users || 0}</p>
                <p className="text-xs text-cream/40">Utilizadores</p>
              </div>
              <div className="text-center p-3 bg-night rounded-lg">
                <Truck className="w-5 h-5 text-terracotta mx-auto mb-1" />
                <p className="text-lg text-cream">{tenant._count?.mudancas || 0}</p>
                <p className="text-xs text-cream/40">Mudanças</p>
              </div>
              <div className="text-center p-3 bg-night rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-lg text-cream">{tenant._count?.clientes || 0}</p>
                <p className="text-xs text-cream/40">Clientes</p>
              </div>
              <div className="text-center p-3 bg-night rounded-lg">
                <Wallet className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-lg text-cream">{tenant._count?.veiculos || 0}</p>
                <p className="text-xs text-cream/40">Veículos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card className="bg-night-light border-gold/10">
          <CardHeader><CardTitle className="text-cream">Ações</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {tenant.estado !== 'ativa' && (
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => estadoMutation.mutate({ id: tenant.id, estado: 'ativa' })}>
                Ativar Empresa
              </Button>
            )}
            {tenant.estado === 'ativa' && (
              <Button variant="outline" className="w-full border-gold/20 text-gold hover:bg-gold/10" onClick={() => estadoMutation.mutate({ id: tenant.id, estado: 'suspensa' })}>
                Suspender Empresa
              </Button>
            )}
            <Button variant="outline" className="w-full border-gold/20 text-cream/70 hover:bg-white/[0.04] hover:text-cream" onClick={() => setShowReset(true)}>
              <Key className="w-4 h-4 mr-2" /> Reset Password Admin
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Setup Progress */}
      {setupProgress && !setupProgress.isComplete && (
        <Card className="bg-night-light border-gold/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-cream flex items-center gap-2">
                <Settings className="w-5 h-5 text-gold" />
                Progresso do Setup
              </CardTitle>
              <span className="text-sm text-cream/40">{setupProgress.percentage}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-night rounded-full h-2 mb-4">
              <div
                className="bg-gold rounded-full h-2 transition-all duration-500"
                style={{ width: `${setupProgress.percentage}%` }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {setupProgress.steps?.map((step: any) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 ${
                    step.completed
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : 'border-gold/15 bg-gold/[0.03]'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-cream/30 shrink-0" />
                  )}
                  <span className={`text-xs ${step.completed ? 'text-emerald-400' : 'text-cream/50'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users list */}
      <Card className="bg-night-light border-gold/10">
        <CardHeader><CardTitle className="text-cream">Utilizadores</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(tenant.users || []).map((user: any) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-night">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-sm">
                    {user.nome?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-cream text-sm">{user.nome}</p>
                    <p className="text-cream/40 text-xs">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-cream/40 capitalize">{user.perfil}</span>
                  <span className={`w-2 h-2 rounded-full ${user.eAtivo ? 'bg-emerald-400' : 'bg-red-400'}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      <Dialog open={showReset} onOpenChange={setShowReset}>
        <DialogContent className="bg-night-light border-gold/20 text-cream">
          <DialogHeader>
            <DialogTitle className="text-cream">Redefinir Password do Admin</DialogTitle>
            <DialogDescription className="text-cream/50">Defina uma nova password para o administrador desta empresa</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-gold/5 border border-gold/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-gold shrink-0" />
              <p className="text-xs text-cream/60">O administrador será notificado da alteração</p>
            </div>
            <div className="space-y-2">
              <Label className="text-cream/70">Nova Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-night border-gold/20 text-cream" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReset(false)} className="border-gold/20 text-cream/70">Cancelar</Button>
            <Button onClick={() => resetMutation.mutate({ id: id!, password: newPassword })} disabled={!newPassword || resetMutation.isPending} className="bg-gold hover:bg-gold/90 text-night">
              {resetMutation.isPending ? 'A redefinir...' : 'Redefinir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subdomain Dialog */}
      <Dialog open={showSubdomain} onOpenChange={setShowSubdomain}>
        <DialogContent className="bg-night-light border-gold/20 text-cream">
          <DialogHeader>
            <DialogTitle className="text-cream">Alterar Subdomínio</DialogTitle>
            <DialogDescription className="text-cream/50">Atenção: isso pode afetar o acesso ao site público da empresa</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-cream/70">Novo Subdomínio</Label>
            <Input value={newSubdomain} onChange={e => setNewSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="bg-night border-gold/20 text-cream" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubdomain(false)} className="border-gold/20 text-cream/70">Cancelar</Button>
            <Button onClick={() => subdomainMutation.mutate(newSubdomain)} disabled={!newSubdomain || subdomainMutation.isPending} className="bg-gold hover:bg-gold/90 text-night">
              {subdomainMutation.isPending ? 'A atualizar...' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
