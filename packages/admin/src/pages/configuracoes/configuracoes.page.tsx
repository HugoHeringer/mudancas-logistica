import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsApi, agendaApi, uploadApi, formularioApi, authApi, veiculosApi } from '../../lib/api';
import { CardSkeleton } from '../../components/ui/skeleton';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import { Upload, Image, Trash2, GripVertical, Eye, Plus, Shield, X } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const DEFAULT_CORES = {
  corPrincipal: '#D4A853',
  corSecundaria: '#C4572A',
  corDetalhe: '#1E2640',
};

// ─── Color Preview Mini-Site ────────────────────────────────────────────────

function MiniSitePreview({ cores }: { cores: { corPrincipal: string; corSecundaria: string; corDetalhe: string } }) {
  const c = { ...DEFAULT_CORES, ...cores };
  return (
    <div className="rounded-lg border overflow-hidden shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Mini header */}
      <div className="px-3 py-2 flex items-center gap-2" style={{ background: c.corPrincipal }}>
        <div className="w-5 h-5 rounded bg-white/30" />
        <span className="text-white text-xs font-bold">Minha Empresa</span>
        <div className="ml-auto flex gap-1">
          {['Serviços', 'Sobre', 'Contacto'].map(t => (
            <span key={t} className="text-white/80 text-[9px]">{t}</span>
          ))}
        </div>
      </div>
      {/* Mini hero */}
      <div className="px-3 py-4 text-center" style={{ background: `${c.corPrincipal}22` }}>
        <div className="text-[10px] font-bold mb-1" style={{ color: c.corPrincipal }}>MUDANÇAS & LOGÍSTICA</div>
        <div className="text-[8px] text-muted-foreground mb-2">A sua mudança sem stress</div>
        <div className="flex justify-center gap-1">
          <span className="text-[7px] text-white px-2 py-0.5 rounded" style={{ background: c.corPrincipal }}>Agendar</span>
          <span className="text-[7px] px-2 py-0.5 rounded border" style={{ borderColor: c.corSecundaria, color: c.corSecundaria }}>Urgente</span>
        </div>
      </div>
      {/* Mini cards */}
      <div className="grid grid-cols-2 gap-1 px-2 py-2">
        {[1, 2].map(i => (
          <div key={i} className="rounded p-1.5 text-center" style={{ background: `${c.corSecundaria}15`, border: `1px solid ${c.corSecundaria}40` }}>
            <div className="w-3 h-3 mx-auto rounded mb-0.5" style={{ background: `${c.corSecundaria}30` }} />
            <div className="text-[7px] font-medium" style={{ color: c.corSecundaria }}>Serviço {i}</div>
          </div>
        ))}
      </div>
      {/* Mini badge */}
      <div className="px-3 py-1.5 flex items-center gap-1" style={{ background: `${c.corDetalhe}10` }}>
        <span className="text-[7px] px-1.5 py-0.5 rounded-full text-white" style={{ background: c.corDetalhe }}>Urgente</span>
        <span className="text-[7px] text-muted-foreground">Tarifas diferenciadas</span>
      </div>
      {/* 60/30/10 legend */}
      <div className="px-3 py-1.5 flex gap-1 items-center border-t">
        <div className="flex items-center gap-0.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c.corPrincipal }} />
          <span className="text-[7px] text-muted-foreground">60%</span>
        </div>
        <div className="flex items-center gap-0.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c.corSecundaria }} />
          <span className="text-[7px] text-muted-foreground">30%</span>
        </div>
        <div className="flex items-center gap-0.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c.corDetalhe }} />
          <span className="text-[7px] text-muted-foreground">10%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Logo Upload Section ────────────────────────────────────────────────────

function LogoUpload({ logoUrl, onUpload }: { logoUrl?: string; onUpload: (file: File) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    onUpload(f);
  };

  return (
    <div className="space-y-2">
      <Label>Logo da Empresa</Label>
      <div className="flex items-center gap-4">
        <div
          className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {(preview || logoUrl) ? (
            <img src={preview || logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
          ) : (
            <div className="text-center text-muted-foreground">
              <Upload className="w-6 h-6 mx-auto mb-1" />
              <span className="text-[10px]">Upload</span>
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Clique para fazer upload do logo</p>
          <p>PNG, SVG ou JPG (máx. 5MB)</p>
          <p>O favicon será gerado automaticamente</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

// ─── Banners Section ────────────────────────────────────────────────────────

function BannersSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: banners = [] } = useQuery({
    queryKey: ['banners'],
    queryFn: () => uploadApi.getBanners().then(r => r.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadApi.uploadBanner(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({ title: 'Banner adicionado' });
    },
    onError: () => toast({ title: 'Erro ao fazer upload', variant: 'destructive' }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => uploadApi.toggleBanner(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => uploadApi.removeBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast({ title: 'Banner removido' });
    },
  });

  const moveBanner = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;
    const updated = [...banners];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((b: any, i: number) => { b.ordem = i; });
    uploadApi.reorderBanners(updated.map((b: any) => ({ id: b.id, ordem: b.ordem }))).then(() => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Banners do Site</CardTitle>
        <Button size="sm" onClick={() => fileRef.current?.click()}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {banners.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum banner. Clique em "Adicionar" para fazer upload.
          </p>
        )}
        {(banners as any[]).sort((a: any, b: any) => a.ordem - b.ordem).map((banner: any, idx: number) => (
          <div key={banner.id} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
            <div className="flex flex-col gap-0.5">
              <button className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={idx === 0} onClick={() => moveBanner(idx, 'up')}>
                <GripVertical className="w-4 h-4 rotate-180" />
              </button>
              <button className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={idx === banners.length - 1} onClick={() => moveBanner(idx, 'down')}>
                <GripVertical className="w-4 h-4" />
              </button>
            </div>
            <img src={banner.url} alt={banner.nomeOriginal} className="w-32 h-16 object-cover rounded" />
            <div className="flex-1 text-sm truncate">{banner.nomeOriginal}</div>
            <Switch checked={banner.eAtivo} onCheckedChange={() => toggleMutation.mutate(banner.id)} />
            <Button variant="ghost" size="icon" onClick={() => removeMutation.mutate(banner.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadMutation.mutate(f);
          e.target.value = '';
        }} />
      </CardContent>
    </Card>
  );
}

// ─── Formulário Builder ─────────────────────────────────────────────────────

function FormularioBuilder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCampo, setEditingCampo] = useState<any>(null);
  const [campoForm, setCampoForm] = useState({ nome: '', tipo: 'texto', obrigatorio: false, opcoes: '' });
  const [previewMode, setPreviewMode] = useState(false);

  const { data: campos = [] } = useQuery({
    queryKey: ['formulario', 'campos'],
    queryFn: () => formularioApi.getCampos().then(r => r.data),
  });

  const seedMutation = useMutation({
    mutationFn: () => formularioApi.seedBaseFields(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulario', 'campos'] });
      toast({ title: 'Campos base criados' });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => formularioApi.createCampo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulario', 'campos'] });
      setShowDialog(false);
      toast({ title: 'Campo criado' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => formularioApi.updateCampo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulario', 'campos'] });
      setEditingCampo(null);
      toast({ title: 'Campo atualizado' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => formularioApi.deleteCampo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulario', 'campos'] });
      toast({ title: 'Campo removido' });
    },
    onError: () => toast({ title: 'Campos base não podem ser removidos', variant: 'destructive' }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => formularioApi.toggleCampo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formulario', 'campos'] }),
  });

  const moveCampo = (index: number, direction: 'up' | 'down') => {
    const camposList = campos as any[];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= camposList.length) return;
    const updated = [...camposList];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    formularioApi.reorderCampos(updated.map((c: any, i: number) => ({ id: c.id, ordem: i }))).then(() => {
      queryClient.invalidateQueries({ queryKey: ['formulario', 'campos'] });
    });
  };

  const openEdit = (campo: any) => {
    setEditingCampo(campo);
    setCampoForm({
      nome: campo.nome,
      tipo: campo.tipo,
      obrigatorio: campo.obrigatorio,
      opcoes: (campo.opcoes || []).join(', '),
    });
  };

  const openCreate = () => {
    setEditingCampo(null);
    setCampoForm({ nome: '', tipo: 'texto', obrigatorio: false, opcoes: '' });
    setShowDialog(true);
  };

  const handleSaveCampo = () => {
    const data = {
      nome: campoForm.nome,
      tipo: campoForm.tipo,
      obrigatorio: campoForm.obrigatorio,
      opcoes: (campoForm.tipo === 'selector' || campoForm.tipo === 'checkbox') ? campoForm.opcoes.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    if (editingCampo) {
      updateMutation.mutate({ id: editingCampo.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Campos do Formulário</h3>
          <p className="text-sm text-muted-foreground">Configure os campos do formulário de agendamento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4 mr-1" /> {previewMode ? 'Editar' : 'Preview'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
            Campos Base
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Novo Campo
          </Button>
        </div>
      </div>

      {previewMode ? (
        <Card>
          <CardHeader><CardTitle>Pré-visualização do Formulário</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(campos as any[]).filter((c: any) => c.eAtivo).map((campo: any) => (
              <div key={campo.id} className="space-y-1">
                <Label className="text-sm">{campo.nome} {campo.obrigatorio && <span className="text-red-500">*</span>}</Label>
                {campo.tipo === 'texto' && <Input placeholder={campo.nome} />}
                {campo.tipo === 'numero' && <Input type="number" placeholder={campo.nome} />}
                {campo.tipo === 'checkbox' && (
                  campo.opcoes?.length > 0 ? (
                    <div className="space-y-1">
                      {campo.opcoes.map((op: string) => (
                        <div key={op} className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" /> <span className="text-sm">{op}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" /> <span className="text-sm">{campo.nome}</span>
                    </div>
                  )
                )}
                {campo.tipo === 'selector' && (
                  <Select>
                    <SelectTrigger><SelectValue placeholder={`Selecionar ${campo.nome}`} /></SelectTrigger>
                    <SelectContent>
                      {campo.opcoes?.map((op: string) => (
                        <SelectItem key={op} value={op}>{op}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {(campos as any[]).map((campo: any, idx: number) => (
            <div key={campo.id} className={`flex items-center gap-3 p-3 rounded-lg border ${!campo.eAtivo ? 'opacity-50' : ''}`}>
              <div className="flex flex-col gap-0.5">
                <button className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={idx === 0} onClick={() => moveCampo(idx, 'up')}>
                  <GripVertical className="w-4 h-4 rotate-180" />
                </button>
                <button className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={idx === (campos as any[]).length - 1} onClick={() => moveCampo(idx, 'down')}>
                  <GripVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{campo.nome}</span>
                  {campo.eBase && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">BASE</span>}
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{campo.tipo}</span>
                  {campo.obrigatorio && <span className="text-[10px] text-red-500">Obrigatório</span>}
                </div>
              </div>
              <Switch checked={campo.eAtivo} onCheckedChange={() => toggleMutation.mutate(campo.id)} />
              <Button variant="ghost" size="sm" onClick={() => openEdit(campo)}>Editar</Button>
              {!campo.eBase && (
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(campo.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
          {(campos as any[]).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum campo. Clique em "Campos Base" para criar os campos do sistema ou "Novo Campo" para adicionar.
            </p>
          )}
        </div>
      )}

      {/* Dialog criar/editar campo */}
      <Dialog open={showDialog || !!editingCampo} onOpenChange={(v) => { if (!v) { setShowDialog(false); setEditingCampo(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCampo ? 'Editar Campo' : 'Novo Campo'}</DialogTitle>
            <DialogDescription>{editingCampo ? 'Altere as propriedades do campo' : 'Adicione um novo campo ao formulário'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Campo</Label>
              <Input value={campoForm.nome} onChange={e => setCampoForm({ ...campoForm, nome: e.target.value })} placeholder="Ex: NIF" />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={campoForm.tipo} onValueChange={v => setCampoForm({ ...campoForm, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="texto">Texto Livre</SelectItem>
                  <SelectItem value="numero">Número</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="selector">Selector</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(campoForm.tipo === 'selector' || campoForm.tipo === 'checkbox') && (
              <div className="space-y-2">
                <Label>Opções (separadas por vírgula)</Label>
                <Input value={campoForm.opcoes} onChange={e => setCampoForm({ ...campoForm, opcoes: e.target.value })} placeholder="Opção 1, Opção 2, Opção 3" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch checked={campoForm.obrigatorio} onCheckedChange={v => setCampoForm({ ...campoForm, obrigatorio: v })} />
              <Label>Obrigatório</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); setEditingCampo(null); }}>Cancelar</Button>
            <Button onClick={handleSaveCampo} disabled={!campoForm.nome || createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'A guardar...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

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

  const { data: veiculos } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => veiculosApi.findAll().then(r => r.data),
  });

  // Marca state
  const [marca, setMarca] = useState<any>(null);
  const [marcaLoaded, setMarcaLoaded] = useState(false);

  // Preços state
  const [precos, setPrecos] = useState<any>(null);

  // Agenda config state
  const [agendaConfig, setAgendaConfig] = useState<any>(null);
  const [agendaLoaded, setAgendaLoaded] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({ current: '', nova: '', confirmar: '' });

  // Initialize state from query data
  if (tenant && !marcaLoaded) {
    const cm = tenant.configMarca || {};
    setMarca({
      nome: cm.nome || '',
      telefone: cm.contacto?.telefone || cm.telefone || '',
      email: cm.contacto?.email || cm.email || '',
      morada: cm.contacto?.morada || cm.morada || '',
      logoUrl: cm.logoUrl || '',
      faviconUrl: cm.faviconUrl || '',
      redesSociais: cm.contacto?.redesSociais
        ? `Facebook: ${cm.contacto.redesSociais.facebook || ''}\nInstagram: ${cm.contacto.redesSociais.instagram || ''}`
        : cm.redesSociais || '',
      corPrincipal: cm.cores?.primaria || cm.corPrincipal || DEFAULT_CORES.corPrincipal,
      corSecundaria: cm.cores?.secundaria || cm.corSecundaria || DEFAULT_CORES.corSecundaria,
      corDetalhe: cm.cores?.acento || cm.corDetalhe || DEFAULT_CORES.corDetalhe,
    });
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

  const logoUploadMutation = useMutation({
    mutationFn: (file: File) => uploadApi.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast({ title: 'Logo atualizado' });
    },
    onError: () => toast({ title: 'Erro ao fazer upload do logo', variant: 'destructive' }),
  });

  const faviconMutation = useMutation({
    mutationFn: () => uploadApi.gerarFavicon(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast({ title: 'Favicon gerado a partir do logo' });
    },
    onError: () => toast({ title: 'Erro ao gerar favicon. Faça upload do logo primeiro.', variant: 'destructive' }),
  });

  const passwordMutation = useMutation({
    mutationFn: () => authApi.updatePassword(user!.id, passwordForm.current, passwordForm.nova),
    onSuccess: () => {
      toast({ title: 'Password atualizada com sucesso' });
      setPasswordForm({ current: '', nova: '', confirmar: '' });
    },
    onError: () => toast({ title: 'Erro ao atualizar password. Verifique a senha atual.', variant: 'destructive' }),
  });

  const handleSaveMarca = () => {
    const redesLines = (marca.redesSociais || '').split('\n');
    const facebook = redesLines.find((l: string) => l.toLowerCase().includes('facebook'))?.split(':').slice(1).join(':').trim() || '';
    const instagram = redesLines.find((l: string) => l.toLowerCase().includes('instagram'))?.split(':').slice(1).join(':').trim() || '';

    updateTenantMutation.mutate({
      configMarca: {
        nome: marca.nome,
        logoUrl: marca.logoUrl,
        faviconUrl: marca.faviconUrl,
        cores: {
          primaria: marca.corPrincipal,
          secundaria: marca.corSecundaria,
          acento: marca.corDetalhe,
          fundo: '#F5EDE0',
          fundoEscuro: '#0A0F1E',
          texto: '#2C1810',
          textoClaro: '#F0E6D6',
        },
        contacto: {
          telefone: marca.telefone,
          email: marca.email,
          morada: marca.morada,
          redesSociais: { facebook, instagram },
        },
      },
    });
  };

  const handlePasswordSubmit = () => {
    if (passwordForm.nova !== passwordForm.confirmar) {
      toast({ title: 'As passwords não coincidem', variant: 'destructive' });
      return;
    }
    if (passwordForm.nova.length < 6) {
      toast({ title: 'A nova password deve ter pelo menos 6 caracteres', variant: 'destructive' });
      return;
    }
    passwordMutation.mutate();
  };

  if (isLoading) return (
    <div className="space-y-6">
      <div><CardSkeleton /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">Marca, preços, agenda, formulário e mais</p>
      </div>

      <Tabs defaultValue="marca">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="marca">Marca</TabsTrigger>
          <TabsTrigger value="precos">Preços</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="formulario">Formulário</TabsTrigger>
          <TabsTrigger value="urgencia">Urgência</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        {/* ──── Marca ──── */}
        <TabsContent value="marca" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Identidade Visual</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <LogoUpload logoUrl={marca?.logoUrl} onUpload={(f) => logoUploadMutation.mutate(f)} />

              {/* Favicon */}
              <div className="flex items-center gap-3">
                {marca?.faviconUrl && (
                  <img src={marca.faviconUrl} alt="Favicon" className="w-6 h-6 rounded" />
                )}
                <Button variant="outline" size="sm" onClick={() => faviconMutation.mutate()} disabled={faviconMutation.isPending}>
                  <Image className="w-4 h-4 mr-1" />
                  {faviconMutation.isPending ? 'A gerar...' : 'Gerar Favicon do Logo'}
                </Button>
              </div>

              {/* Dados da empresa */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome da Empresa</Label><Input value={marca?.nome || ''} onChange={(e) => setMarca({ ...marca, nome: e.target.value })} /></div>
                <div className="space-y-2"><Label>Telefone</Label><Input value={marca?.telefone || ''} onChange={(e) => setMarca({ ...marca, telefone: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email de Contacto</Label><Input value={marca?.email || ''} onChange={(e) => setMarca({ ...marca, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Morada</Label><Input value={marca?.morada || ''} onChange={(e) => setMarca({ ...marca, morada: e.target.value })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Redes Sociais</Label>
                <Textarea value={marca?.redesSociais || ''} onChange={(e) => setMarca({ ...marca, redesSociais: e.target.value })} placeholder="Facebook: ...&#10;Instagram: ..." />
              </div>

              {/* Cores 60/30/10 */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Esquema de Cores (60/30/10)</Label>
                <p className="text-xs text-muted-foreground">
                  Principal (60%): sidebar, botões, CTAs | Secundária (30%): cards, bordas | Detalhe (10%): alertas, badges
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Principal (60%)</Label>
                    <div className="flex gap-2">
                      <input type="color" value={marca?.corPrincipal || DEFAULT_CORES.corPrincipal} onChange={(e) => setMarca({ ...marca, corPrincipal: e.target.value })} className="h-10 w-10 rounded border cursor-pointer" />
                      <Input value={marca?.corPrincipal || DEFAULT_CORES.corPrincipal} onChange={(e) => setMarca({ ...marca, corPrincipal: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Secundária (30%)</Label>
                    <div className="flex gap-2">
                      <input type="color" value={marca?.corSecundaria || DEFAULT_CORES.corSecundaria} onChange={(e) => setMarca({ ...marca, corSecundaria: e.target.value })} className="h-10 w-10 rounded border cursor-pointer" />
                      <Input value={marca?.corSecundaria || DEFAULT_CORES.corSecundaria} onChange={(e) => setMarca({ ...marca, corSecundaria: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Detalhe (10%)</Label>
                    <div className="flex gap-2">
                      <input type="color" value={marca?.corDetalhe || DEFAULT_CORES.corDetalhe} onChange={(e) => setMarca({ ...marca, corDetalhe: e.target.value })} className="h-10 w-10 rounded border cursor-pointer" />
                      <Input value={marca?.corDetalhe || DEFAULT_CORES.corDetalhe} onChange={(e) => setMarca({ ...marca, corDetalhe: e.target.value })} />
                    </div>
                  </div>
                </div>
                {/* Preview mini-site */}
                <MiniSitePreview cores={{
                  corPrincipal: marca?.corPrincipal || DEFAULT_CORES.corPrincipal,
                  corSecundaria: marca?.corSecundaria || DEFAULT_CORES.corSecundaria,
                  corDetalhe: marca?.corDetalhe || DEFAULT_CORES.corDetalhe,
                }} />
              </div>

              <Button onClick={handleSaveMarca} disabled={updateTenantMutation.isPending}>
                {updateTenantMutation.isPending ? 'A guardar...' : 'Guardar Marca'}
              </Button>
            </CardContent>
          </Card>

          {/* Banners */}
          <BannersSection />
        </TabsContent>

        {/* ──── Preços ──── */}
        <TabsContent value="precos" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Tabela de Preços</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Preço Base por Hora (€)</Label>
                <Input type="number" step="0.5" value={precos?.precoHora || ''} onChange={(e) => setPrecos({ ...precos, precoHora: parseFloat(e.target.value) })} placeholder="35" />
                <p className="text-xs text-muted-foreground">Preço base por hora (sem ajudantes). Pode ser sobreposto pelo preço do veículo.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Acréscimo 1 Ajudante (€/hora)</Label>
                  <Input type="number" step="0.5" value={precos?.acrescimo1Ajudante || ''} onChange={(e) => setPrecos({ ...precos, acrescimo1Ajudante: parseFloat(e.target.value) })} placeholder="10" />
                  <p className="text-xs text-muted-foreground">Valor adicional por hora quando há 1 ajudante</p>
                </div>
                <div className="space-y-2">
                  <Label>Acréscimo 2 Ajudantes (€/hora)</Label>
                  <Input type="number" step="0.5" value={precos?.acrescimo2Ajudantes || ''} onChange={(e) => setPrecos({ ...precos, acrescimo2Ajudantes: parseFloat(e.target.value) })} placeholder="18" />
                  <p className="text-xs text-muted-foreground">Valor adicional por hora quando há 2 ajudantes</p>
                </div>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-sm font-medium mb-1">Cálculo do Preço</p>
                <p className="text-xs text-muted-foreground">
                  Preço/hora = Base + Acréscimo Ajudantes + Acréscimo Urgência (configurado no separador Urgência)
                </p>
                <div className="mt-2 text-xs space-y-1">
                  <p><strong>Só motorista:</strong> {precos?.precoHora || 0}€/h</p>
                  <p><strong>Motorista + 1 ajudante:</strong> {(precos?.precoHora || 0) + (precos?.acrescimo1Ajudante || 0)}€/h</p>
                  <p><strong>Motorista + 2 ajudantes:</strong> {(precos?.precoHora || 0) + (precos?.acrescimo2Ajudantes || 0)}€/h</p>
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
              <Button onClick={() => updateTenantMutation.mutate({ configPreco: precos })} disabled={updateTenantMutation.isPending}>
                {updateTenantMutation.isPending ? 'A guardar...' : 'Guardar Preços'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──── Agenda ──── */}
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

        {/* ──── Formulário ──── */}
        <TabsContent value="formulario" className="space-y-4">
          <FormularioBuilder />
        </TabsContent>

        {/* ──── Urgência ──── */}
        <TabsContent value="urgencia" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Configurações de Urgência</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Veículo de Urgência</Label>
                <Select
                  value={precos?.veiculoUrgenciaId || ''}
                  onValueChange={(v) => setPrecos({ ...precos, veiculoUrgenciaId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecionar veículo" /></SelectTrigger>
                  <SelectContent>
                    {(veiculos || []).map((v: any) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.nome} ({v.matricula}) — {v.metrosCubicos}m³
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Este veículo ficará reservado para pedidos urgentes</p>
              </div>
              <div className="space-y-2">
                <Label>Acréscimo de Urgência (%)</Label>
                <Input
                  type="number"
                  value={precos?.acrescimoUrgencia || ''}
                  onChange={(e) => setPrecos({ ...precos, acrescimoUrgencia: parseFloat(e.target.value) || 0 })}
                  placeholder="25"
                />
                <p className="text-xs text-muted-foreground">
                  Percentagem aplicada sobre o valor base quando o cliente seleciona "Mudança Urgente"
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-muted/30">
                <p className="text-sm font-medium">Indicação no Site Público</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Quando a urgência estiver configurada, o site público mostrará automaticamente um banner
                  "Urgente" com a indicação de tarifas diferenciadas no formulário de agendamento.
                </p>
              </div>
              <Button onClick={() => updateTenantMutation.mutate({ configPreco: precos })} disabled={updateTenantMutation.isPending}>
                {updateTenantMutation.isPending ? 'A guardar...' : 'Guardar Urgência'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──── Password ──── */}
        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" /> Alterar Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Password Atual</Label>
                <Input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nova Password</Label>
                <Input type="password" value={passwordForm.nova} onChange={(e) => setPasswordForm({ ...passwordForm, nova: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Confirmar Nova Password</Label>
                <Input type="password" value={passwordForm.confirmar} onChange={(e) => setPasswordForm({ ...passwordForm, confirmar: e.target.value })} />
              </div>
              {passwordForm.nova && passwordForm.confirmar && passwordForm.nova !== passwordForm.confirmar && (
                <p className="text-xs text-red-500">As passwords não coincidem</p>
              )}
              <Button
                onClick={handlePasswordSubmit}
                disabled={!passwordForm.current || !passwordForm.nova || passwordForm.nova !== passwordForm.confirmar || passwordMutation.isPending}
              >
                {passwordMutation.isPending ? 'A atualizar...' : 'Atualizar Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
