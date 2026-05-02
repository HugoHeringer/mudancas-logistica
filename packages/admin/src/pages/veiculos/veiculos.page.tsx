import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Building, Upload, X } from 'lucide-react';
import { veiculosApi, uploadApi } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { StatusBadge } from '../../components/status-badge';
import { EmptyState } from '../../components/empty-state';
import { DataTable } from '../../components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
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
} from '../../components/ui/select';

interface Veiculo {
  id: string;
  nome: string;
  marca: string;
  modelo?: string;
  matricula: string;
  metrosCubicos: number;
  precoHora: number;
  estado: string;
  eParaUrgencias: boolean;
  imagemUrl?: string;
}

export function VeiculosPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);
  const [busca, setBusca] = useState('');

  // Form state
  const [formNome, setFormNome] = useState('');
  const [formMarca, setFormMarca] = useState('');
  const [formModelo, setFormModelo] = useState('');
  const [formMatricula, setFormMatricula] = useState('');
  const [formM3, setFormM3] = useState('');
  const [formPrecoHora, setFormPrecoHora] = useState('');
  const [formUrgencias, setFormUrgencias] = useState(false);
  const [formImagemUrl, setFormImagemUrl] = useState('');
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImagem, setUploadingImagem] = useState(false);

  const { data: veiculos, isLoading } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => veiculosApi.findAll().then((r) => r.data as Veiculo[]),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => veiculosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      toast({ title: 'Veículo criado com sucesso' });
      closeDialogs();
    },
    onError: () => toast({ title: 'Erro ao criar veículo', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; data: any }) => veiculosApi.update(data.id, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      toast({ title: 'Veículo atualizado' });
      closeDialogs();
    },
    onError: () => toast({ title: 'Erro ao atualizar', variant: 'destructive' }),
  });

  const updateEstadoMutation = useMutation({
    mutationFn: (data: { id: string; estado: string }) => veiculosApi.updateEstado(data.id, data.estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      toast({ title: 'Estado atualizado' });
    },
    onError: () => toast({ title: 'Erro ao atualizar estado', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => veiculosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
      toast({ title: 'Veículo removido' });
      closeDialogs();
    },
    onError: () => toast({ title: 'Erro ao remover', variant: 'destructive' }),
  });

  const closeDialogs = () => {
    setShowCreate(false);
    setShowEdit(false);
    setSelectedVeiculo(null);
    setFormNome(''); setFormMarca(''); setFormModelo(''); setFormMatricula('');
    setFormM3(''); setFormPrecoHora(''); setFormUrgencias(false);
    setFormImagemUrl(''); setImagemPreview(null); setSelectedFile(null);
  };

  const openEdit = (v: Veiculo) => {
    setSelectedVeiculo(v);
    setFormNome(v.nome); setFormMarca(v.marca); setFormModelo(v.modelo || '');
    setFormMatricula(v.matricula); setFormM3(String(v.metrosCubicos));
    setFormPrecoHora(String(v.precoHora)); setFormUrgencias(v.eParaUrgencias);
    setFormImagemUrl(v.imagemUrl || '');
    setImagemPreview(v.imagemUrl || null);
    setSelectedFile(null);
    setShowEdit(true);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagemPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    let imagemUrl = formImagemUrl || undefined;

    // Upload image first if a new file was selected
    if (selectedFile) {
      setUploadingImagem(true);
      try {
        const res = await uploadApi.uploadVeiculoImagem(selectedFile);
        imagemUrl = res.data?.url;
      } catch {
        toast({ title: 'Erro ao carregar imagem', variant: 'destructive' });
        setUploadingImagem(false);
        return;
      }
      setUploadingImagem(false);
    }

    const payload = {
      nome: formNome, marca: formMarca, modelo: formModelo || undefined,
      matricula: formMatricula, metrosCubicos: parseFloat(formM3) || 0,
      precoHora: parseFloat(formPrecoHora) || 0, eParaUrgencias: formUrgencias,
      imagemUrl,
    };

    if (showCreate) createMutation.mutate(payload);
    else if (selectedVeiculo) updateMutation.mutate({ id: selectedVeiculo.id, data: payload });
  };

  const filteredData = (veiculos || []).filter((v) => {
    if (!busca) return true;
    const t = busca.toLowerCase();
    return v.nome?.toLowerCase().includes(t) || v.marca?.toLowerCase().includes(t) || v.matricula?.toLowerCase().includes(t);
  });

  const columns: ColumnDef<Veiculo>[] = [
    {
      accessorKey: 'imagemUrl',
      header: 'Imagem',
      cell: ({ row }) => (
        row.original.imagemUrl ? (
          <img src={row.original.imagemUrl} alt={row.original.nome} className="w-12 h-12 object-cover rounded" />
        ) : (
          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
            <Building className="w-6 h-6 text-muted-foreground" />
          </div>
        )
      ),
    },
    { accessorKey: 'nome', header: 'Nome' },
    { accessorKey: 'marca', header: 'Marca' },
    { accessorKey: 'matricula', header: 'Matrícula' },
    {
      accessorKey: 'metrosCubicos',
      header: 'm³',
      cell: ({ row }) => `${row.original.metrosCubicos}m³`,
    },
    {
      accessorKey: 'precoHora',
      header: 'Preço/h',
      cell: ({ row }) => `€${row.original.precoHora?.toFixed(2)}`,
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const v = row.original;
        // em_servico is system-managed — show read-only badge
        if (v.estado === 'em_servico') {
          return <StatusBadge status="em_servico" size="sm" />;
        }
        return (
          <Select
            value={v.estado}
            onValueChange={(val) => updateEstadoMutation.mutate({ id: v.id, estado: val })}
          >
            <SelectTrigger className="w-[140px] h-8">
              <StatusBadge status={v.estado} size="sm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="em_manutencao">Em Manutenção</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: 'eParaUrgencias',
      header: 'Urgências',
      cell: ({ row }) => row.original.eParaUrgencias ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Urgente
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Veículos</h2>
          <p className="text-muted-foreground">Gestão de frota e estado dos veículos</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" />Novo Veículo</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Pesquisar veículo..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
      </div>

      {!isLoading && filteredData.length === 0 ? (
        <EmptyState icon={Building} title="Nenhum veículo" description="Comece por adicionar o primeiro veículo." action={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" />Novo Veículo</Button>} />
      ) : (
        <DataTable columns={columns} data={filteredData} isLoading={isLoading} onRowClick={(row) => openEdit(row as Veiculo)} />
      )}

      {/* Dialog Criar/Editar */}
      <Dialog open={showCreate || showEdit} onOpenChange={(open) => { if (!open) closeDialogs(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showCreate ? 'Novo Veículo' : 'Editar Veículo'}</DialogTitle>
            <DialogDescription>{showCreate ? 'Preencha os dados do novo veículo.' : 'Atualize os dados do veículo.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Van Grande" /></div>
              <div className="space-y-2"><Label>Marca</Label><Input value={formMarca} onChange={(e) => setFormMarca(e.target.value)} placeholder="Mercedes" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Modelo</Label><Input value={formModelo} onChange={(e) => setFormModelo(e.target.value)} placeholder="Sprinter" /></div>
              <div className="space-y-2"><Label>Matrícula</Label><Input value={formMatricula} onChange={(e) => setFormMatricula(e.target.value)} placeholder="XX-XX-XX" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Metros Cúbicos</Label><Input type="number" value={formM3} onChange={(e) => setFormM3(e.target.value)} placeholder="15" /></div>
              <div className="space-y-2"><Label>Preço/Hora (€)</Label><Input type="number" step="0.5" value={formPrecoHora} onChange={(e) => setFormPrecoHora(e.target.value)} placeholder="35" /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formUrgencias} onCheckedChange={setFormUrgencias} />
              <Label>Disponível para urgências</Label>
            </div>

            <div className="space-y-2">
              <Label>Imagem do Veículo</Label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
              />
              {imagemPreview ? (
                <div className="relative inline-block">
                  <img src={imagemPreview} alt="Preview" className="w-32 h-24 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => { setFormImagemUrl(''); setImagemPreview(null); setSelectedFile(null); }}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar imagem
                </Button>
              )}
              <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP. Será redimensionado para 800×600px.</p>
            </div>
          </div>
          <DialogFooter>
            {showEdit && selectedVeiculo && (
              <Button variant="destructive" onClick={() => { if (confirm('Tem a certeza?')) deleteMutation.mutate(selectedVeiculo.id); }}>Remover</Button>
            )}
            <Button variant="outline" onClick={closeDialogs}>Cancelar</Button>
            <Button
              disabled={!formNome || !formMatricula || uploadingImagem || createMutation.isPending || updateMutation.isPending}
              onClick={handleSubmit}
            >
              {uploadingImagem ? 'A carregar imagem...' : showCreate ? (createMutation.isPending ? 'A criar...' : 'Criar') : (updateMutation.isPending ? 'A guardar...' : 'Guardar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
