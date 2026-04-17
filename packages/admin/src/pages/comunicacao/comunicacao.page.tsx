import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Eye, Save } from 'lucide-react';
import { comunicacaoApi } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import { EmptyState } from '../../components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { TemplatePreviewModal } from '../../components/comunicacao/TemplatePreviewModal';

interface Template {
  id: string;
  nome: string;
  assunto: string;
  corpo: string;
  eAtivo: boolean;
  variaveis: string[];
}

const TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  solicitacao_recebida: 'Enviado quando o cliente submete uma solicitação',
  solicitacao_aprovada: 'Enviado quando o admin aprova a mudança',
  solicitacao_recusada: 'Enviado quando o admin recusa a mudança',
  solicitacao_alterada: 'Enviado quando o admin altera detalhes da mudança',
  motorista_a_caminho: 'Enviado quando o motorista inicia o deslocamento',
  mudanca_concluida: 'Enviado quando a mudança é concluída',
};

export function ComunicacaoPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editAssunto, setEditAssunto] = useState('');
  const [editCorpo, setEditCorpo] = useState('');
  const [editAtivo, setEditAtivo] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['comunicacao', 'templates'],
    queryFn: () => comunicacaoApi.getTemplates().then((r) => r.data as Template[]),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { nome: string; data: any }) =>
      comunicacaoApi.updateTemplate(data.nome, data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comunicacao', 'templates'] });
      toast({ title: 'Template guardado com sucesso' });
    },
    onError: () => toast({ title: 'Erro ao guardar template', variant: 'destructive' }),
  });

  const initializeMutation = useMutation({
    mutationFn: () => comunicacaoApi.initializeTemplates(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comunicacao', 'templates'] });
      toast({ title: 'Templates inicializados' });
    },
    onError: () => toast({ title: 'Erro ao inicializar', variant: 'destructive' }),
  });

  const openTemplate = (t: Template) => {
    setSelectedTemplate(t);
    setEditAssunto(t.assunto);
    setEditCorpo(t.corpo);
    setEditAtivo(t.eAtivo);
  };

  const saveTemplate = () => {
    if (!selectedTemplate) return;
    updateMutation.mutate({
      nome: selectedTemplate.nome,
      data: { assunto: editAssunto, corpo: editCorpo, eAtivo: editAtivo },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Comunicação</h2>
          <p className="text-muted-foreground">Templates de email para cada momento da jornada</p>
        </div>
        <Button
          variant="outline"
          onClick={() => initializeMutation.mutate()}
          disabled={initializeMutation.isPending}
        >
          Inicializar Templates Padrão
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !templates || templates.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Sem templates"
          description="Inicialize os templates padrão para começar a personalizar a comunicação."
          action={
            <Button onClick={() => initializeMutation.mutate()} disabled={initializeMutation.isPending}>
              Inicializar Templates
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lista de templates */}
          <div className="space-y-3">
            {templates.map((t) => (
              <Card
                key={t.id}
                className={`cursor-pointer transition-all ${selectedTemplate?.id === t.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                onClick={() => openTemplate(t)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{t.nome.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</h3>
                    <Badge className={t.eAtivo ? 'bg-green-600 text-white' : 'bg-muted-foreground'}>
                      {t.eAtivo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{TEMPLATE_DESCRIPTIONS[t.nome] || 'Template de email'}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.assunto}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Editor */}
          {selectedTemplate ? (
            <Card className="h-fit sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Editar Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch checked={editAtivo} onCheckedChange={setEditAtivo} />
                  <Label>{editAtivo ? 'Template ativo' : 'Template inativo'}</Label>
                </div>

                <div className="space-y-2">
                  <Label>Assunto</Label>
                  <Input value={editAssunto} onChange={(e) => setEditAssunto(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Corpo do Email</Label>
                  <Textarea
                    value={editCorpo}
                    onChange={(e) => setEditCorpo(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                {selectedTemplate.variaveis?.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Variáveis Disponíveis</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.variaveis.map((v) => (
                        <Badge key={v} variant="outline" className="text-xs font-mono">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setPreviewTemplate(selectedTemplate); setShowPreview(true); }}>
                    <Eye className="h-4 w-4 mr-1" /> Pré-visualizar
                  </Button>
                  <Button onClick={saveTemplate} disabled={updateMutation.isPending}>
                    <Save className="h-4 w-4 mr-1" />
                    {updateMutation.isPending ? 'A guardar...' : 'Guardar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p>Selecione um template para editar</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Template Preview Modal */}
      {showPreview && previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => { setShowPreview(false); setPreviewTemplate(null); }}
        />
      )}
    </div>
  );
}
