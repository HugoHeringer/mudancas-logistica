import { Badge } from './ui/badge';

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  a_caminho: 'A Caminho',
  em_servico: 'Em Serviço',
  concluida: 'Concluída',
  recusada: 'Recusada',
  cancelada: 'Cancelada',
  disponivel: 'Disponível',
  indisponivel: 'Indisponível',
  em_manutencao: 'Em Manutenção',
};

const STATUS_COLORS: Record<string, string> = {
  pendente: '#f59e0b',
  aprovada: '#3b82f6',
  a_caminho: '#8b5cf6',
  em_servico: '#06b6d4',
  concluida: '#10b981',
  recusada: '#ef4444',
  cancelada: '#6b7280',
  disponivel: '#10b981',
  indisponivel: '#ef4444',
  em_manutencao: '#f59e0b',
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'default';
}

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] || '#6b7280';
  const label = STATUS_LABELS[status] || status;

  return (
    <Badge
      style={{
        backgroundColor: color,
        color: 'white',
        fontSize: size === 'sm' ? '11px' : '12px',
      }}
      className={size === 'sm' ? 'px-1.5 py-0' : ''}
    >
      {label}
    </Badge>
  );
}
