import { Badge } from './ui/badge';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'destructive' | 'purple' | 'secondary' }> = {
  pendente: { label: 'Pendente', variant: 'warning' },
  aprovada: { label: 'Aprovada', variant: 'info' },
  a_caminho: { label: 'A caminho', variant: 'purple' },
  em_servico: { label: 'Em serviço', variant: 'info' },
  concluida: { label: 'Concluída', variant: 'success' },
  recusada: { label: 'Recusada', variant: 'destructive' },
  cancelada: { label: 'Cancelada', variant: 'destructive' },
  disponivel: { label: 'Disponível', variant: 'success' },
  indisponivel: { label: 'Indisponível', variant: 'destructive' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'default';
}

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, variant: 'secondary' as const };
  return (
    <Badge variant={config.variant} className={size === 'sm' ? 'text-[10px] px-1.5 py-0' : undefined}>
      {config.label}
    </Badge>
  );
}
