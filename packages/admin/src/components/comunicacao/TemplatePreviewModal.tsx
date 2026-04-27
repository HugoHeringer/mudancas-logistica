import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Eye, X } from 'lucide-react';
import { comunicacaoApi } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface TemplatePreviewModalProps {
  template: {
    nome: string;
    assunto: string;
    variaveis: string[];
  };
  onClose: () => void;
}

export function TemplatePreviewModal({ template, onClose }: TemplatePreviewModalProps) {
  const [variaveis, setVariaveis] = useState<Record<string, string>>(
    Object.fromEntries(template.variaveis.map((v) => [v, '']))
  );
  const [preview, setPreview] = useState<{ assunto: string; corpo: string } | null>(null);

  const renderMutation = useMutation({
    mutationFn: async () => {
      const { data } = await comunicacaoApi.renderTemplate(template.nome, variaveis);
      return data;
    },
    onSuccess: (data) => {
      setPreview({ assunto: data.assunto, corpo: data.corpo });
    },
  });

  const handleVarChange = (key: string, value: string) => {
    setVariaveis((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-popover rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Pré-visualização — {template.nome.replace(/_/g, ' ')}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Variáveis */}
          {template.variaveis.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Preencha as variáveis</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {template.variaveis.map((v) => (
                  <div key={v} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{v}</Label>
                    <Input
                      value={variaveis[v]}
                      onChange={(e) => handleVarChange(v, e.target.value)}
                      placeholder={v}
                      className="bg-background border-border"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => renderMutation.mutate()}
            disabled={renderMutation.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Eye className="h-4 w-4 mr-2" />
            {renderMutation.isPending ? 'A renderizar...' : 'Renderizar Preview'}
          </Button>

          {/* Preview */}
          {preview && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Assunto</Label>
                <p className="text-sm bg-muted p-3 rounded-lg border border-border">{preview.assunto}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Corpo (HTML)</Label>
                <iframe
                  srcDoc={preview.corpo}
                  className="w-full h-80 bg-card rounded-lg border border-border"
                  sandbox=""
                  title="Email Preview"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
